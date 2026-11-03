# eatley 🐾

> Sistema web de control, monitoreo y programación inteligente para dispensadores automáticos de comida para mascotas basado en **Vue 3**, **TypeScript**, **Firebase Realtime Database**, **ESP32 (NodeMCU 38 pines)** y servomotor **MG996R**.

---

## 🚀 1. Arquitectura del Sistema IoT

```
┌────────────────────────────────────────────────────────┐
│             eatley Web SPA (Vue 3 + TS)                │
│  - Interfaz en Modo Claro (Tailwind CSS + Lucide)      │
│  - Monitoreo Dual: Nube (.info/connected) y ESP32      │
│  - Control manual con cooldown anti-doble clic         │
│  - Programación tipo alarma de celular (3 modos)       │
│  - Calibración en caliente del servo MG996R            │
│  - Detección y recuperación de alarmas perdidas        │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ WebSockets / SSL (RTDB Client)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Firebase Realtime Database                 │
│  - Proyecto: `<tu-proyecto-firebase>`                  │
│  - URL: `https://<tu-proyecto>-default-rtdb...`        │
│  - Nodo raíz: `eatley_v1/`                             │
│  - Latencia bidireccional <100ms                       │
└───────────────────────────▲────────────────────────────┘
                            │
                            │ Wi-Fi 802.11 b/g/n (Firebase ESP Client)
                            ▼
┌────────────────────────────────────────────────────────┐
│             ESP32 NodeMCU (38 Pines)                   │
│  - GPIO 18 -> PWM Servomotor MG996R (50 Hz)            │
│  - GPIO 21 -> Microswitch fin de carrera (Pull-up)     │
│  - Heartbeat continuo (cada 10 segundos)               │
│  - Detección de cortes eléctricos y recuperación       │
└────────────────────────────────────────────────────────┘
```

---

## 🌐 2. Monitoreo Dual de Conectividad

La aplicación separa de forma conceptual y visual el estado de la **Nube** frente al del **Hardware Físico**:

| Estado | Indicador | Fuente de Verdad | Comportamiento en la UI |
|---|---|---|---|
| **Nube (Firebase)** | Badge `Cloud` | Nodo nativo `/.info/connected` | Detecta en milisegundos si el navegador web tiene enlace activo con Firebase. Si se cae, bloquea temporalmente el disparo manual y creación de alarmas mostrando *"Reconectando con la nube..."*. |
| **Dispositivo (ESP32)** | Badge `Cpu` + señal Wi-Fi | `estado_esp32/ultima_conexion` | Evalúa si el microcontrolador físico está encendido y transmitiendo según el umbral de `VITE_ESP32_OFFLINE_THRESHOLD_SEC` (45s). |

---

## 🛠️ 3. Requisitos Previos e Instalación

### Requisitos:
* **Node.js**: v18.x o superior (recomendado v20+ LTS).
* **NPM**: v9.x o superior.
* **Git**: Para control de versiones.

### Pasos de Instalación:

1. **Clonar el repositorio**:
   ```bash
   git clone git@github.com:bitwavecompany/eatley.git
   cd eatley
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno (`.env`)**:
   Copia el archivo `.env.example` a un archivo local `.env` (el archivo `.env` está protegido en `.gitignore` para no exponer credenciales):
   ```bash
   cp .env.example .env
   ```
   Rellena tus credenciales obtenidas desde la Consola de Firebase (*Configuración del proyecto > General > Tus apps*):
   ```env
   # Configuración General de la Aplicación
   VITE_APP_NAME=eatley
   VITE_APP_TIMEZONE=America/Guayaquil

   # Credenciales de Firebase (Reemplaza con los valores de tu consola Firebase)
   VITE_FIREBASE_API_KEY=REPLACE_WITH_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_PROJECT_ID.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://REPLACE_WITH_PROJECT_ID-default-rtdb.firebaseio.com/
   VITE_FIREBASE_PROJECT_ID=REPLACE_WITH_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=REPLACE_WITH_PROJECT_ID.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_SENDER_ID
   VITE_FIREBASE_APP_ID=REPLACE_WITH_APP_ID
   VITE_FIREBASE_MEASUREMENT_ID=REPLACE_WITH_MEASUREMENT_ID

   # Nodo raíz en Firebase Realtime Database
   VITE_FIREBASE_ROOT_PATH=eatley_v1

   # Umbral de desconexión del ESP32 en segundos (heartbeat)
   VITE_ESP32_OFFLINE_THRESHOLD_SEC=45
   ```

4. **Ejecutar en Entorno de Desarrollo**:
   ```bash
   npm run dev
   ```

5. **Compilación de Producción y Verificación de Tipos**:
   ```bash
   npm run build
   ```

---

## 📡 4. Estructura de Datos en Firebase Realtime Database

Todos los datos se sincronizan bajo la ruta raíz definida en `VITE_FIREBASE_ROOT_PATH` (por defecto `eatley_v1`):

### 1. `disparo_manual`
```json
{
  "pendiente": false,
  "solicitado_en": 1774395600000,
  "origen_solicitud": "boton_principal"
}
```
* `pendiente` (`boolean`): El frontend lo pone en `true` al pulsar "Alimentar ahora". El ESP32 ejecuta el ciclo mecánico y lo restablece en `false`.
* `solicitado_en` (`number`): Timestamp Unix en milisegundos.
* `origen_solicitud` (`string`): `'boton_principal' | 'recuperacion_alarma_perdida'`.

### 2. `alarmas/{alarmaId}`
```json
{
  "id": "-O8Abc123xyz",
  "hora": "08:00",
  "etiqueta": "Desayuno",
  "activa": true,
  "tipo_repeticion": "dias_semana",
  "dias_semana": [1, 2, 3, 4, 5],
  "fecha_especifica": null,
  "ultima_ejecucion_fecha": "2026-10-24",
  "omitida_hoy_fecha": null,
  "creada_en": 1774390000000
}
```
* `tipo_repeticion`: `'dias_semana' | 'una_vez' | 'fecha_especifica'`.
* `dias_semana`: Array numérico (`0` = Domingo a `6` = Sábado).

### 3. `configuracion`
```json
{
  "angulo_cerrado": 0,
  "angulo_abierto": 45,
  "tiempo_abierto_ms": 250,
  "activar_sacudida": false,
  "desactivar_pulso_en_reposo": true,
  "tolerancia_apagon_min": 15,
  "cooldown_manual_seg": 10,
  "sistema_pausado": false,
  "usar_microswitch": false
}
```
* Modificable desde la vista de **Ajustes** en tiempo real sin reprogramar el microcontrolador.

### 4. `estado_esp32`
```json
{
  "ultima_conexion": 1774395610000,
  "rssi_dbm": -62,
  "uptime_seg": 4200,
  "memoria_libre_kb": 184,
  "alarma_perdida_id": null,
  "comando_admin": "ninguno"
}
```
* `comando_admin`: `'ninguno' | 'probar_servo' | 'reiniciar_esp32'`. El frontend escribe el comando y el ESP32 lo retorna a `'ninguno'` tras ejecutarlo.

### 5. `historial/{eventoId}`
```json
{
  "id": "-O8HistEvent99",
  "timestamp": 1774395615000,
  "origen": "manual",
  "alarma_etiqueta": null,
  "estado_esp32": "completado",
  "confirmacion_microswitch": "no_aplicable",
  "duracion_abierto_ms": 250
}
```

---

## ⚡ 5. Mapa Seguro de Pines para ESP32 NodeMCU (38 Pines)

Distribución de pines recomendada para la placa **ESP-WROOM-32 (38 pines)**:

| Componente | Pin ESP32 | Serigrafía | Notas de Cableado y Conexión |
|---|---|---|---|
| **PWM Servomotor MG996R** | `GPIO 18` | `G18` | Señal PWM de control (cable naranja/amarillo del servo). |
| **Alimentación Servomotor** | Fuente Externa | `5V / 2A` | **NO alimentar el MG996R directo del pin 3V3 o 5V del ESP32** (picos de corriente reinician la placa). Usar fuente externa de 5V y compartir GND. |
| **GND Común** | `GND` | `GND` | Conectar GND de la fuente externa con el pin GND del ESP32. |
| **Microswitch Fin de Carrera** | `GPIO 21` | `G21` | Configurado con `INPUT_PULLUP` interno al pin GPIO 21; el otro terminal va a GND. |

⚠️ **Pines Prohibidos / Reservados:**
* **`GPIO 6` a `GPIO 11` (`CLK`, `CMD`, `SD0`, `SD1`, `SD2`, `SD3`)**: Conectados a la memoria Flash SPI interna. Usarlos produce bloqueo inmediato (*Boot Loop*).
* **`GPIO 34, 35, 36, 39`**: Pines solo de entrada (sin etapa de salida PWM).

---

## 🎨 6. Diseño y Experiencia de Usuario (UI/UX)

* **Tema Claro:** Paleta limpia basada en `slate-50` (fondo), `white` (tarjetas elevadas con bordes `slate-200`), acentos funcionales en `emerald-600` (acciones principales y estado online), `amber-500` (pausa/advertencias) y `rose-600` (alarmas perdidas/eliminación).
* **Iconos Ligeros:** Migrado a `@lucide/vue` mediante importaciones tree-shakeable.
* **Modales Reutilizables:** Implementación de `ConfirmationModal.vue` para eliminación de alarmas, vaciado de bitácora y reinicio remoto del microcontrolador (eliminando alertas nativas intrusivas).

---

## 📄 7. Scripts Disponibles

```bash
# Servidor local de desarrollo Vite con Hot Reload
npm run dev

# Chequeo estricto de tipos TypeScript sin emitir archivos
npm run type-check

# Compilación de producción optimizada (vue-tsc + vite build)
npm run build

# Previsualización local del artefacto generado en dist/
npm run preview
```
