# Guía de Contexto y Reglas para Agentes de IA (`AGENTS.md`)

Este documento define el contexto arquitectónico, convenciones de ingeniería y **reglas inquebrantables** que cualquier agente de inteligencia artificial (o desarrollador humano) debe seguir estrictamente al mantener o ampliar el proyecto **eatley**.

---

## 🏛️ 1. Arquitectura y Principios de Diseño

El proyecto está diseñado bajo una arquitectura limpia y desacoplada de 4 capas:

```
[ Vista / Componente Vue ] 
         │
         ▼
[ Pinia Setup Store ]
         │
         ▼
[ FeederRepository (src/services/feeder.repository.ts) ]
         │
         ▼
[ Firebase Client (Singleton) / Local In-Memory Fallback ]
```

---

## ⛔ 2. Reglas Inquebrantables (Non-Negotiable Rules)

1. **Uso Obligatorio de `<script setup lang="ts">`:**
   * Todos los componentes Vue deben crearse utilizando la sintaxis de Vue 3 Composition API con `<script setup lang="ts">`.
   * Prohibido el uso de Options API (`export default { data(), methods: {} }`).

2. **Prohibición Total de `any` (TypeScript Estricto):**
   * El compilador opera bajo `"strict": true`.
   * No se permite `any`, ni casts inseguros como `as any`.
   * Toda entidad, payload, evento, o respuesta debe tener su tipo explícito en `src/types/`.

3. **Desacoplamiento Absoluto de Firebase (Patrón Repositorio):**
   * **JAMÁS** importar funciones del SDK de Firebase (`ref`, `set`, `onValue`, `update`, `getDatabase`, etc.) dentro de componentes `.vue` ni dentro de los stores de Pinia.
   * Toda interacción con la base de datos debe residir exclusivamente en `src/services/feeder.repository.ts`.
   * Esto permite que la aplicación funcione en modo demostración/local sin conexión a internet y facilita pruebas unitarias.

4. **Cero Datos Quemados (No Hardcoding):**
   * Prohibido colocar cadenas mágicas, nombres de nodos de Firebase, límites mecánicos del servo, segundos de cooldown o tiempos por defecto en la capa de presentación.
   * Todos estos valores deben provenir de `src/config/constants.ts` y estar alimentados por `src/config/env.ts`.

5. **Pinia Setup Stores como Single Source of Truth:**
   * El estado reactivo de la aplicación reside en los stores modulares (`useDeviceStore`, `useAlarmsStore`, `useConfigStore`, `useHistoryStore`).
   * Los stores se suscriben al repositorio y publican estado reactivo mediante `ref` y `computed`.

6. **Tolerancia a Credenciales Pendientes:**
   * La aplicación nunca debe romperse con pantalla en blanco si las credenciales de Firebase en `.env` son placeholders o están ausentes. El repositorio conmuta transparentemente al almacén simulado local (`LocalMockStore`).

---

## 🔄 3. Ciclo de Vida del Disparo Manual y ESP32

Para evitar condiciones de carrera o bucles infinitos:
1. El usuario pulsa **"Alimentar ahora"** en `ManualFeedCard.vue`.
2. Se activa inmediatamente el composable `useCooldown` bloqueando la interfaz por `cooldown_manual_seg`.
3. Se invoca `deviceStore.triggerManualFeed()`, que escribe en RTDB:
   ```json
   "disparo_manual": {
     "pendiente": true,
     "solicitado_en": <timestamp>,
     "origen_solicitud": "boton_principal"
   }
   ```
4. El ESP32 detecta `pendiente == true`, abre el servomotor al ángulo configurado por `tiempo_abierto_ms`, lo cierra, genera un nuevo registro en `/historial`, y finalmente restablece `pendiente = false`.
5. El store detecta la transición de `pendiente: true -> false` y notifica a la UI con éxito visual.

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

## 🧪 5. Comprobación y Calidad

Antes de finalizar cualquier tarea o commit:
```bash
# 1. Chequeo estricto de tipos con vue-tsc
npx vue-tsc --noEmit

# 2. Build completo de producción
npm run build
```
Ambos comandos deben terminar con **0 errores y 0 warnings**.
