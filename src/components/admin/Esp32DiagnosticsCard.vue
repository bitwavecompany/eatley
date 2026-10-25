<script setup lang="ts">
import { ref } from 'vue'
import { Cpu, Info, Loader2, Power, AlertTriangle } from '@lucide/vue'
import { useDeviceStore } from '@/stores/useDeviceStore'

const deviceStore = useDeviceStore()
const showConfirmReboot = ref(false)

async function confirmReboot() {
  showConfirmReboot.value = false
  await deviceStore.rebootEsp32()
}
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between pb-5 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
          <Cpu class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900">Telemetría ESP32 NodeMCU (38 Pines)</h3>
          <p class="text-xs text-slate-500">Diagnóstico en tiempo real y comandos remotos para ESP-WROOM-32</p>
        </div>
      </div>

      <!-- Online Status Badge -->
      <div
        class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
        :class="[
          deviceStore.isOnline
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        ]"
      >
        <span
          class="w-2 h-2 rounded-full"
          :class="deviceStore.isOnline ? 'bg-emerald-600' : 'bg-rose-600'"
        ></span>
        <span>{{ deviceStore.isOnline ? 'ESP32 Conectado' : 'Sin Comunicación' }}</span>
      </div>
    </div>

    <!-- 4 Metrics Grid -->
    <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Metric 1: Heartbeat -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <span class="text-xs font-medium text-slate-500 block">Último Latido</span>
        <span class="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1 block">
          {{ deviceStore.estadoEsp32 ? `${deviceStore.secondsSinceHeartbeat}s` : '--' }}
        </span>
        <span class="text-[10px] text-slate-400">segundos transcurridos</span>
      </div>

      <!-- Metric 2: RSSI Wi-Fi -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <span class="text-xs font-medium text-slate-500 block">Calidad Wi-Fi</span>
        <span class="text-lg sm:text-xl font-bold font-mono text-emerald-700 mt-1 block">
          {{ deviceStore.estadoEsp32?.rssi_dbm ? `${deviceStore.estadoEsp32.rssi_dbm} dBm` : '--' }}
        </span>
        <span class="text-[10px] text-slate-500 capitalize">
          Señal {{ deviceStore.wifiLevel }}
        </span>
      </div>

      <!-- Metric 3: Uptime -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <span class="text-xs font-medium text-slate-500 block">Tiempo Activo</span>
        <span class="text-sm sm:text-base font-bold font-mono text-slate-900 mt-1.5 block truncate">
          {{ deviceStore.estadoEsp32 ? deviceStore.uptimeFormatted : '--' }}
        </span>
        <span class="text-[10px] text-slate-400">desde último encendido</span>
      </div>

      <!-- Metric 4: Free Memory -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <span class="text-xs font-medium text-slate-500 block">RAM Libre</span>
        <span class="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1 block">
          {{ deviceStore.estadoEsp32?.memoria_libre_kb ? `${deviceStore.estadoEsp32.memoria_libre_kb} KB` : '--' }}
        </span>
        <span class="text-[10px] text-slate-400">memoria de ejecución</span>
      </div>
    </div>

    <!-- Safe Pinout Reference Box -->
    <div class="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
      <div class="flex items-center gap-2 font-bold text-slate-800 mb-2">
        <Info class="w-4 h-4 text-blue-600" />
        <span>Distribución Segura de Pines (ESP32 38 Pines):</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        <div class="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
          <span class="text-emerald-700 font-bold block">GPIO 18 (G18):</span>
          <span class="text-slate-600">PWM MG996R (Naranja)</span>
        </div>
        <div class="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
          <span class="text-teal-700 font-bold block">GPIO 21 (G21):</span>
          <span class="text-slate-600">Microswitch (Pull-up)</span>
        </div>
        <div class="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
          <span class="text-rose-700 font-bold block">Pines Prohibidos:</span>
          <span class="text-slate-600">SD0-SD3, CMD, CLK</span>
        </div>
      </div>
    </div>

    <!-- Active Command Banner (if any) -->
    <div
      v-if="deviceStore.activeAdminCommand !== 'ninguno'"
      class="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <Loader2 class="w-4 h-4 animate-spin text-amber-600" />
        <span>Comando enviado al ESP32: <strong class="font-mono">{{ deviceStore.activeAdminCommand }}</strong></span>
      </div>
      <span class="text-[11px] text-amber-700">Esperando ejecución...</span>
    </div>

    <!-- Actions Footer -->
    <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
      <div class="text-xs text-slate-500">
        Reinicio por software mediante comando en RTDB
      </div>

      <div>
        <button
          type="button"
          @click="showConfirmReboot = true"
          :disabled="deviceStore.activeAdminCommand === 'reiniciar_esp32'"
          class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-2 shadow-sm"
        >
          <Power class="w-4 h-4" />
          <span>Reiniciar ESP32</span>
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmReboot"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      @click.self="showConfirmReboot = false"
    >
      <div class="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-base">¿Reiniciar ESP32?</h4>
            <p class="text-xs text-slate-500">Se reiniciará el microcontrolador remoto</p>
          </div>
        </div>

        <p class="text-xs text-slate-600">
          Esta acción enviará la orden <code class="bg-slate-100 px-1 py-0.5 rounded text-amber-800 font-mono">reiniciar_esp32</code>. El microcontrolador ejecutará un reinicio suave (ESP.restart()) y volverá a conectarse a la red en unos segundos.
        </p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showConfirmReboot = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmReboot"
            class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
          >
            Confirmar Reinicio
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
