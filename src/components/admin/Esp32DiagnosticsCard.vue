<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useDeviceStore } from '@/stores/useDeviceStore'

const deviceStore = useDeviceStore()
const showConfirmReboot = ref(false)

async function confirmReboot() {
  showConfirmReboot.value = false
  await deviceStore.rebootEsp32()
}
</script>

<template>
  <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 shadow-xl">
    <!-- Header -->
    <div class="flex items-center justify-between pb-5 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
          <Icon icon="lucide:cpu" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-white">Telemetría ESP32 NodeMCU (38 Pines)</h3>
          <p class="text-xs text-slate-400">Diagnóstico en tiempo real y comandos remotos para ESP-WROOM-32</p>
        </div>
      </div>

      <!-- Online Status Badge -->
      <div
        class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
        :class="[
          deviceStore.isOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        ]"
      >
        <span
          class="w-2 h-2 rounded-full"
          :class="deviceStore.isOnline ? 'bg-emerald-400' : 'bg-rose-400'"
        ></span>
        <span>{{ deviceStore.isOnline ? 'ESP32 Conectado' : 'Sin Comunicación' }}</span>
      </div>
    </div>

    <!-- 4 Metrics Grid -->
    <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Metric 1: Heartbeat -->
      <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400 block">Último Latido</span>
        <span class="text-lg sm:text-xl font-bold font-mono text-white mt-1 block">
          {{ deviceStore.secondsSinceHeartbeat }}s
        </span>
        <span class="text-[10px] text-slate-500">segundos transcurridos</span>
      </div>

      <!-- Metric 2: RSSI Wi-Fi -->
      <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400 block">Calidad Wi-Fi</span>
        <span class="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1 block">
          {{ deviceStore.estadoEsp32?.rssi_dbm ?? '--' }} dBm
        </span>
        <span class="text-[10px] text-slate-400 capitalize">
          Señal {{ deviceStore.wifiLevel }}
        </span>
      </div>

      <!-- Metric 3: Uptime -->
      <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400 block">Tiempo Activo</span>
        <span class="text-sm sm:text-base font-bold font-mono text-white mt-1.5 block truncate">
          {{ deviceStore.uptimeFormatted }}
        </span>
        <span class="text-[10px] text-slate-500">desde último encendido</span>
      </div>

      <!-- Metric 4: Free Memory -->
      <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400 block">RAM Libre</span>
        <span class="text-lg sm:text-xl font-bold font-mono text-white mt-1 block">
          {{ deviceStore.estadoEsp32?.memoria_libre_kb ?? '--' }} KB
        </span>
        <span class="text-[10px] text-slate-500">memoria de ejecución</span>
      </div>
    </div>

    <!-- Safe Pinout Reference Box -->
    <div class="mt-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
      <div class="flex items-center gap-2 font-bold text-slate-200 mb-2">
        <Icon icon="lucide:info" class="w-4 h-4 text-blue-400" />
        <span>Distribución Segura de Pines (ESP32 38 Pines):</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        <div class="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <span class="text-emerald-400 font-bold block">GPIO 18 (G18):</span>
          <span class="text-slate-400">PWM MG996R (Naranja)</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <span class="text-cyan-400 font-bold block">GPIO 21 (G21):</span>
          <span class="text-slate-400">Microswitch (Pull-up)</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <span class="text-rose-400 font-bold block">Pines Prohibidos:</span>
          <span class="text-slate-400">SD0-SD3, CMD, CLK</span>
        </div>
      </div>
    </div>

    <!-- Active Command Banner (if any) -->
    <div
      v-if="deviceStore.activeAdminCommand !== 'ninguno'"
      class="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <Icon icon="lucide:loader-2" class="w-4 h-4 animate-spin text-amber-400" />
        <span>Comando enviado al ESP32: <strong class="font-mono">{{ deviceStore.activeAdminCommand }}</strong></span>
      </div>
      <span class="text-[11px] text-amber-400/80">Esperando ejecución...</span>
    </div>

    <!-- Actions Footer -->
    <div class="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
      <div class="text-xs text-slate-400">
        Reinicio por software mediante comando en RTDB
      </div>

      <div>
        <button
          type="button"
          @click="showConfirmReboot = true"
          :disabled="deviceStore.activeAdminCommand === 'reiniciar_esp32'"
          class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-2"
        >
          <Icon icon="lucide:power" class="w-4 h-4" />
          <span>Reiniciar ESP32</span>
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmReboot"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      @click.self="showConfirmReboot = false"
    >
      <div class="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400">
            <Icon icon="lucide:alert-triangle" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-white text-base">¿Reiniciar ESP32?</h4>
            <p class="text-xs text-slate-400">Se reiniciará el microcontrolador remoto</p>
          </div>
        </div>

        <p class="text-xs text-slate-300">
          Esta acción enviará la orden <code class="bg-slate-800 px-1 py-0.5 rounded text-amber-300">reiniciar_esp32</code>. El microcontrolador ejecutará un reinicio suave (ESP.restart()) y volverá a conectarse a la red en unos segundos.
        </p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showConfirmReboot = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
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
