# eatley 🐾

> Smart pet food dispenser web application for control, monitoring, and scheduling. Built with **Vue 3**, **TypeScript**, **Firebase Realtime Database**, **ESP32 (NodeMCU 38-pin)**, and the **MG996R** high-torque metal gear servo motor.

---

## 🚀 1. IoT System Architecture

```
┌────────────────────────────────────────────────────────┐
│             eatley Web SPA (Vue 3 + TS)                │
│  - Light Mode responsive UI (Tailwind CSS + Lucide)   │
│  - Dual Connectivity: Cloud (.info/connected) & ESP32  │
│  - Manual feed button with anti-double-click cooldown │
│  - Alarm scheduling (daily, weekdays, specific dates)  │
│  - Live servo calibration & physical Poka-Yoke safety  │
│  - Missed alarm detection and power recovery flow     │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ WebSockets / SSL (RTDB Client)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Firebase Realtime Database                 │
│  - Project: `<your-firebase-project>`                  │
│  - URL: `https://<your-project>-default-rtdb...`        │
│  - Root node: `eatley_v1/`                             │
│  - Low latency bidirectional sync (<100ms)             │
└───────────────────────────▲────────────────────────────┘
                            │
                            │ Wi-Fi 802.11 b/g/n (Firebase ESP Client)
                            ▼
┌────────────────────────────────────────────────────────┐
│             ESP32 NodeMCU (38-Pin)                     │
│  - GPIO 18 -> PWM Servomotor MG996R (50 Hz)            │
│  - Periodic telemetry report (every 10 seconds)        │
│  - Brownout and power outage recovery routine          │
│  - Independent hardware cooldown & safety clamping    │
└────────────────────────────────────────────────────────┘
```

---

## 🌐 2. Dual Connectivity State Architecture

The application conceptually and visually decouples **Cloud connection** from **Physical Controller health**:

| Entity | UI Indicator | Source of Truth | Application Behavior |
|---|---|---|---|
| **Cloud (Firebase)** | Status indicator & banners | Native RTDB node `/.info/connected` | Detects within milliseconds whether the browser client maintains an active WebSocket link with Firebase. If offline, write operations are temporarily guarded with *"Reconectando con la nube..."*. |
| **Controller (ESP32)** | `Cpu` badge & Wi-Fi signal metric | `estado_esp32/ultima_conexion` timestamp | Evaluates whether the physical controller is powered and communicating based on `VITE_ESP32_OFFLINE_THRESHOLD_SEC` (default: 45s). |

---

## 🛠️ 3. Prerequisites & Installation

### Requirements:
* **Node.js**: v18.x or higher (v20+ LTS recommended).
* **NPM**: v9.x or higher.
* **Git**: For version control.

### Installation Steps:

1. **Clone the repository**:
   ```bash
   git clone git@github.com:bitwavecompany/eatley.git
   cd eatley
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`)**:
   Copy the `.env.example` template into a local `.env` file (the `.env` file is git-ignored):
   ```bash
   cp .env.example .env
   ```
   Fill in your actual credentials obtained from the Firebase Console (*Project Settings > General > Your Apps*):
   ```env
   # Application Branding & Timezone
   VITE_APP_NAME=eatley
   VITE_APP_TIMEZONE=America/Guayaquil

   # Family Shared Authentication
   VITE_AUTH_FAMILY_EMAIL=REPLACE_WITH_FAMILY_EMAIL

   # Firebase Web Credentials
   VITE_FIREBASE_API_KEY=REPLACE_WITH_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_PROJECT_ID.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://REPLACE_WITH_PROJECT_ID-default-rtdb.firebaseio.com/
   VITE_FIREBASE_PROJECT_ID=REPLACE_WITH_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=REPLACE_WITH_PROJECT_ID.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_SENDER_ID
   VITE_FIREBASE_APP_ID=REPLACE_WITH_APP_ID
   VITE_FIREBASE_MEASUREMENT_ID=REPLACE_WITH_MEASUREMENT_ID

   # Root Node in Firebase Realtime Database
   VITE_FIREBASE_ROOT_PATH=eatley_v1

   # ESP32 Offline Telemetry Threshold (seconds)
   VITE_ESP32_OFFLINE_THRESHOLD_SEC=45
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Typecheck & Production Build**:
   ```bash
   npm run build
   ```

---

## 📡 4. Realtime Database Schema

All device telemetry, configuration, and scheduling sync under `VITE_FIREBASE_ROOT_PATH` (default: `eatley_v1`):

### 1. `disparo_manual` (Manual Trigger)
```json
{
  "pendiente": false,
  "solicitado_en": 1774395600000,
  "origen_solicitud": "boton_principal"
}
```
* `pendiente` (`boolean`): The web UI sets this to `true`. The ESP32 executes the servo stroke and resets it to `false`.
* `solicitado_en` (`number`): Unix timestamp in milliseconds.
* `origen_solicitud` (`string`): `'boton_principal' | 'recuperacion_alarma_perdida'`.

### 2. `alarmas/{alarmaId}` (Scheduled Alarms)
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

### 3. `configuracion` (Servo Calibration & Rules)
```json
{
  "angulo_cerrado": 0,
  "angulo_abierto": 50,
  "tiempo_abierto_ms": 350,
  "activar_sacudida": false,
  "desactivar_pulso_en_reposo": true,
  "tolerancia_apagon_min": 15,
  "cooldown_manual_seg": 10,
  "sistema_pausado": false,
  "usar_microswitch": false
}
```

### 4. `estado_esp32` (Controller Live Telemetry)
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
* `comando_admin`: `'ninguno' | 'probar_servo' | 'reiniciar_esp32'`. The frontend dispatches the command and the ESP32 resets it back to `'ninguno'` once handled.

### 5. `historial/{eventoId}` (Event Log)
```json
{
  "id": "-O8HistEvent99",
  "timestamp": 1774395615000,
  "origen": "manual",
  "alarma_etiqueta": null,
  "estado_esp32": "completado",
  "confirmacion_microswitch": "no_aplicable",
  "duracion_abierto_ms": 350
}
```

---

## ⚡ 5. Hardware Wiring (ESP32 NodeMCU 38-Pin)

Pin allocation for the **ESP-WROOM-32 (38-pin)** board:

| Component | ESP32 Pin | Label | Wiring Notes |
|---|---|---|---|
| **PWM MG996R Servo** | `GPIO 18` | `G18` | PWM control line (orange/yellow wire). |
| **Servo Power (VCC)** | External Supply | `5V / 2A` | **DO NOT power the MG996R servo directly from the ESP32 3.3V or VIN pin** (current spikes cause brownout reboot loops). Use an external 5V regulated power supply. |
| **Common Ground** | `GND` | `GND` | Connect external power supply GND with ESP32 GND. |

⚠️ **Reserved / Prohibited Pins:**
* **`GPIO 6` to `GPIO 11` (`CLK`, `CMD`, `SD0`, `SD1`, `SD2`, `SD3`)**: Connected directly to the internal SPI flash memory. Using them results in an immediate crash boot loop.
* **`GPIO 34, 35, 36, 39`**: Input-only pins (no PWM or output capability).

---

## 🎨 6. UI/UX Architecture

* **Light Mode Interface:** Crisp color scheme based on `slate-50` background, elevated `white` cards with subtle `border-slate-200`, and functional semantic accents (`emerald-600` for primary actions, `amber-500` for safety warnings, `rose-600` for missed events).
* **Responsive Layout:**
  - **Mobile:** Top brand header, touch-friendly picker controls, and bottom navigation bar.
  - **Desktop ($\ge 768\text{px}$):** Fixed vertical left sidebar with hardware telemetry status card and stepper arrow buttons for alarm time configuration.
* **Icon System:** Modular and tree-shakeable icons via `@lucide/vue`.
* **Accessible Modals:** Custom accessible confirmation dialogs (`ConfirmationModal.vue` and `UnlockClosureModal.vue`) preventing unintended destructive actions.

---

## 📄 7. Available Scripts

```bash
# Start local Vite development server with Hot Module Replacement (HMR)
npm run dev

# Run strict TypeScript type check without emitting build artifacts
npm run type-check

# Compile production-optimized bundle (vue-tsc + vite build)
npm run build

# Preview production build locally from dist/
npm run preview
```
