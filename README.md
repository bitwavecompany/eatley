# eatley 🐾

> Sistema web de control, monitoreo y programación inteligente para dispensadores automáticos de comida para mascotas basado en **Vue 3**, **TypeScript**, **Firebase Realtime Database**, **ESP32 (NodeMCU 38 pines)** y servomotor **MG996R**.

---

## 🚀 1. Arquitectura del Sistema IoT

```
┌────────────────────────────────────────┐
│     eatley Web SPA (Vue 3 + TS)        │
│  - Control manual con cooldown         │
│  - Programación tipo alarma de celular │
│  - Calibración de servo MG996R         │
│  - Telemetría y detección de cortes    │
└──────────────────┬─────────────────────┘
                   │
                   │ WebSockets / SSL
                   ▼
┌────────────────────────────────────────┐
│     Firebase Realtime Database         │
│  - Nodo raíz: `eatley_v1/`             │
│  - Sincronización bidireccional <100ms │
└──────────────────▲─────────────────────┘
                   │
                   │ Wi-Fi 802.11 b/g/n (Firebase RTDB Client)
                   ▼
┌────────────────────────────────────────┐
│     ESP32 NodeMCU (38 Pines)           │
│  - GPIO 18 -> PWM Servomotor MG996R    │
│  - GPIO 21 -> Microswitch fin de carrera│
│  - Heartbeat continuo (cada 10s)       │
└────────────────────────────────────────┘
```

---

## 🛠️ 2. Requisitos Previos e Instalación

### Requisitos:
* **Node.js**: v18.x o superior (recomendado v20+ LTS).
* **NPM**: v9.x o superior.

### Pasos de Instalación:

1. **Clonar o abrir el repositorio**:
   ```bash
   cd eatley
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Copia el archivo `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```
   Rellena tus credenciales del proyecto Firebase en `.env`:
   ```env
   VITE_APP_NAME=eatley
   VITE_APP_TIMEZONE=America/Guayaquil

   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=mi-proyecto.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://mi-proyecto-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=mi-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=mi-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

   VITE_FIREBASE_ROOT_PATH=eatley_v1
   VITE_ESP32_OFFLINE_THRESHOLD_SEC=45
   ```
   > **Nota de Modo Demo:** Si dejas los placeholders por defecto (`REPLACE_WITH_...`), la aplicación arranca en un modo de prueba local seguro en memoria con aviso discreto superior, permitiendo testear toda la interfaz.

4. **Ejecutar en Entorno de Desarrollo**:
   ```bash
   npm run dev
   ```

5. **Compilación de Producción y Verificación de Tipos**:
   ```bash
   npm run build
   ```

---

## 📡 3. Estructura de Datos en Firebase Realtime Database

Todos los nodos cuelgan de la ruta raíz parametrizada `VITE_FIREBASE_ROOT_PATH` (por defecto `eatley_v1`):

### 1. `disparo_manual`
```json
{
  "pendiente": false,
  "solicitado_en": 1774395600000,
  "origen_solicitud": "boton_principal"
}
```
* `pendiente` (`boolean`): La web lo pasa a `true` al pulsar "Alimentar ahora". El ESP32 ejecuta el giro y lo regresa a `false`.
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
* `dias_semana`: Array con días (0 = Domingo a 6 = Sábado).

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
* `comando_admin`: `'ninguno' | 'probar_servo' | 'reiniciar_esp32'`.

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

## ⚡ 4. Mapa Seguro de Pines para ESP32 NodeMCU (38 Pines)

El microcontrolador **ESP32 NodeMCU de 38 pines (ESP-WROOM-32)** dispone de líneas de E/S dedicadas:

| Componente | Pin del ESP32 | Etiqueta en Placa | Notas Eléctricas |
|---|---|---|---|
| **PWM Servomotor MG996R** | `GPIO 18` | `G18` | Señal PWM de 50Hz (Cable naranja del servo). |
| **Alimentación Servo** | `5V / VIN` | `VIN` | El MG996R requiere fuente de al menos 5V/2A externa con GND común. |
| **GND Común** | `GND` | `GND` | Unir GND de fuente externa con GND del ESP32. |
| **Microswitch (Opcional)** | `GPIO 21` | `G21` | Configurado con `INPUT_PULLUP` interno hacia GND al presionar. |

⚠️ **ATENCIÓN - Pines Prohibidos:**
* **NO usar** `GPIO 6` a `GPIO 11` (`CLK`, `CMD`, `SD0`, `SD1`, `SD2`, `SD3`), ya que están conectados internamente a la memoria Flash SPI del ESP32. Usarlos provocará un reinicio cíclico en bucle (*Kernel Panic / Boot Loop*).
* **NO usar** `GPIO 34, 35, 36, 39` para el servomotor porque son pines de entrada exclusiva (sin driver de salida).

---

## 📄 5. Scripts Disponibles

* `npm run dev`: Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR).
* `npm run build`: Ejecuta chequeo estricto de tipos con `vue-tsc` y compila la SPA a `dist/`.
* `npm run type-check`: Ejecuta validación de TypeScript sin emitir archivos.
* `npm run preview`: Previsualiza localmente el build de producción en `dist/`.
