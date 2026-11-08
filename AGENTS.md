# Guía de Contexto y Reglas para Agentes de IA (`AGENTS.md`)

Este documento define el contexto arquitectónico, convenciones de ingeniería y **reglas inquebrantables** que cualquier agente de inteligencia artificial (o desarrollador humano) debe seguir estrictamente al mantener o ampliar el proyecto **eatley**.

---

## 🏛️ 1. Arquitectura y Principios de Diseño

El proyecto está diseñado bajo una arquitectura limpia y desacoplada de 4 capas:

```
[ Vista / Componente Vue (Modo Claro + @lucide/vue) ] 
                         │
                         ▼
             [ Pinia Setup Stores ]
     (useDeviceStore, useAlarmsStore, useConfigStore, useHistoryStore)
                         │
                         ▼
  [ FeederRepository (src/services/feeder.repository.ts) ]
                         │
                         ▼
[ Firebase Client (Singleton) / Fallback Local In-Memory Limpio ]
```

---

## ⛔ 2. Reglas Inquebrantables (Non-Negotiable Rules)

1. **Uso Obligatorio de `<script setup lang="ts">`:**
   * Todos los componentes Vue deben crearse utilizando la sintaxis de Vue 3 Composition API con `<script setup lang="ts">`.
   * Prohibido terminantemente el uso de Options API (`export default { data(), methods: {} }`).

2. **Prohibición Total de `any` (TypeScript Estricto):**
   * El compilador opera bajo `"strict": true`.
   * Prohibido el uso de `any`, o casts inseguros como `as any`.
   * Toda entidad, payload, evento, o respuesta debe tener su tipo explícito en `src/types/`.

3. **Desacoplamiento Absoluto de Firebase (Patrón Repositorio):**
   * **JAMÁS** importar funciones del SDK de Firebase (`ref`, `set`, `onValue`, `update`, `getDatabase`, etc.) dentro de componentes `.vue` ni dentro de los stores de Pinia.
   * Toda interacción con Firebase Realtime Database reside exclusivamente en `src/services/feeder.repository.ts`.
   * Esto permite aislar la persistencia, testear composables y garantizar resiliencia.

4. **Monitoreo Dual de Conexión Obligatorio:**
   * **Nube / Firebase:** Suscripción al nodo de sistema `/.info/connected` en `FeederRepository.subscribeToFirebaseConnection()`. Refleja si el navegador web mantiene el WebSocket activo con Firebase.
   * **Dispositivo / ESP32:** Se evalúa mediante la marca de tiempo de su última respuesta (`estado_esp32.ultima_conexion`) contra `VITE_ESP32_OFFLINE_THRESHOLD_SEC`.
   * **Ambos estados son independientes** y jamás deben mezclarse o unificarse en una sola bandera booleana.

5. **Cero Datos Quemados (No Hardcoding):**
   * Prohibido colocar cadenas mágicas, rutas de nodos de Firebase, límites mecánicos del servomotor, segundos de cooldown o tiempos por defecto en la capa de presentación.
   * Todos estos valores deben provenir de `src/config/constants.ts` y estar alimentados por `src/config/env.ts`.

6. **Pinia Setup Stores como Single Source of Truth:**
   * El estado reactivo de la aplicación reside en los stores modulares (`useDeviceStore`, `useAlarmsStore`, `useConfigStore`, `useHistoryStore`).
   * Los stores se suscriben al repositorio y publican estado reactivo mediante `ref` y `computed`.

7. **Cero Información Mokeada / Estado Inicial Limpio:**
   * No incluir datos de ejemplo precargados (alarmas falsas o historiales inventados).
   * El estado inicial de listas es un contenedor vacío y el de telemetría es `null` hasta que el microcontrolador o la base de datos sincronicen datos genuinos.

8. **Diseño Visual en Modo Claro y Lucide Icons:**
   * La interfaz es exclusivamente en **Modo Claro** (`bg-slate-50`, tarjetas en `bg-white`, bordes `border-slate-200`, textos oscuros `text-slate-900` / `text-slate-600`).
   * Los iconos deben importarse como componentes directos de `@lucide/vue` (ej. `import { Cloud, Cpu, Utensils } from '@lucide/vue'`). Prohibido usar `@iconify/vue` o SVGs en crudo.

9. **Modales de Confirmación Reutilizables:**
   * Prohibido usar `window.confirm()` o `window.alert()`.
   * Cualquier confirmación destructiva (eliminar alarmas, limpiar historial, reiniciar ESP32) debe utilizar `ConfirmationModal.vue` (`src/components/common/ConfirmationModal.vue`).

10. **Protección Estricta de Secretos en Repositorio Público:**
   * Prohibido terminantemente quemar o documentar credenciales reales, tokens, claves de API (`AIza...`), IDs de proyecto específicos o secretos dentro de archivos versionados (`README.md`, `AGENTS.md`, código fuente, o `.env.example`).
   * Las credenciales reales deben residir **única y exclusivamente en el archivo local `.env`** (ignorado por `.gitignore`).
   * En archivos públicos y documentación se deben emplear únicamente placeholders descriptivos (`REPLACE_WITH_...`, `tu-proyecto.firebaseapp.com`).

---

## 🔄 3. Ciclo de Vida del Disparo Manual y ESP32

Para evitar condiciones de carrera o bucles infinitos:
1. El usuario pulsa **"Alimentar ahora"** en `ManualFeedCard.vue`.
2. Si `isFirebaseConnected === false`, el botón se deshabilita con *"Reconectando con la nube..."*.
3. Si está conectado, se activa inmediatamente el composable `useCooldown` bloqueando la interfaz por `cooldown_manual_seg`.
4. Se invoca `deviceStore.triggerManualFeed()`, que escribe en RTDB:
   ```json
   "disparo_manual": {
     "pendiente": true,
     "solicitado_en": <timestamp>,
     "origen_solicitud": "boton_principal"
   }
   ```
5. El ESP32 detecta `pendiente == true`, abre el servomotor al ángulo configurado por `tiempo_abierto_ms`, lo cierra, genera un nuevo registro en `/historial`, y finalmente restablece `pendiente = false`.
6. El store detecta la transición de `pendiente: true -> false` y notifica a la UI con éxito visual.

---

## 🚨 4. Lógica de Alarmas Perdidas (`useMissedAlarms.ts`)

Una alarma activa se considera **perdida** si:
* El sistema NO está en `sistema_pausado`.
* La alarma correspondía al día de hoy según su `tipo_repeticion`.
* No ha sido ejecutada hoy (`ultima_ejecucion_fecha !== todayStr`).
* No ha sido omitida por el usuario hoy (`omitida_hoy_fecha !== todayStr`).
* Y se cumple una de las siguientes dos condiciones:
  1. La hora programada más `tolerancia_apagon_min` ya transcurrió.
  2. El ESP32 reportó su ID en `estado_esp32.alarma_perdida_id` tras reconectarse a la red eléctrica.

El usuario puede:
* **"Dispensar ahora"**: ejecuta un disparo manual con origen `'recuperacion_alarma_perdida'` y marca `ultima_ejecucion_fecha = todayStr`.
* **"Omitir por hoy"**: registra `omitida_hoy_fecha = todayStr` sin mover el servomotor físico.

---

## 🧪 5. Comprobación y Calidad Obligatoria

Antes de dar por concluida cualquier tarea o realizar un commit:
```bash
# 1. Chequeo estricto de tipos con vue-tsc
npx vue-tsc --noEmit

# 2. Build completo de producción
npm run build
```
Ambos comandos deben terminar con **0 errores y 0 warnings**.
