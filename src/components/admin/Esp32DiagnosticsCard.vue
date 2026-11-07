<script setup lang="ts">
import { ref, computed } from 'vue'
import { Cpu, Loader2, Power, AlertTriangle } from '@lucide/vue'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useToastStore } from '@/stores/useToastStore'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import HelpTooltip from '@/components/common/HelpTooltip.vue'

const deviceStore = useDeviceStore()
const toastStore = useToastStore()
const showConfirmReboot = ref(false)

const wifiQuality = computed<{ label: string; color: string }>(() => {
  if (!deviceStore.estadoEsp32) {
    return { label: 'Sin señal', color: 'text-slate-400' }
  }
  switch (deviceStore.wifiLevel) {
    case 'excelente':
      return { label: 'Excelente', color: 'text-emerald-700' }
    case 'buena':
      return { label: 'Buena', color: 'text-emerald-600' }
    case 'regular':
      return { label: 'Regular', color: 'text-amber-700' }
    case 'debil':
    default:
      return { label: 'Débil', color: 'text-rose-700' }
  }
})

async function confirmReboot() {
  showConfirmReboot.value = false
  try {
    await deviceStore.rebootEsp32()
    toastStore.warning('Comando de reinicio enviado')
  } catch {
    toastStore.error('Error al enviar comando de reinicio')
  }
}
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
    <!-- Header: Jakob Nielsen #1 (Visibility of system status) -->
    <div class="flex items-center justify-between pb-5 border-b border-slate-100 gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
          <Cpu class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900 leading-tight">
            Diagnóstico del controlador (ESP32)
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Estado de conexión y salud del hardware en tiempo real
          </p>
        </div>
      </div>
    </div>

    <!-- 3 Metrics Grid: Jakob Nielsen #8 (Minimalist design through progressive disclosure) -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <!-- Metric 1: Calidad Wi-Fi -->
      <div class="relative p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-slate-500">Calidad Wi-Fi</span>
          <HelpTooltip
            title="Calidad Wi-Fi"
            text="Potencia de señal recibida (RSSI). Entre -30 y -60 dBm es señal excelente; entre -61 y -75 dBm es estable; peor a -80 dBm puede causar desconexiones o retrasos al dispensar."
            position="bottom"
            align="right"
          />
        </div>
        <div class="my-1">
          <span class="text-xl sm:text-2xl font-extrabold block truncate" :class="wifiQuality.color">
            {{ wifiQuality.label }}
          </span>
        </div>
        <span class="text-[11px] font-mono font-semibold text-slate-500">
          {{ deviceStore.estadoEsp32?.rssi_dbm ? `${deviceStore.estadoEsp32.rssi_dbm} dBm` : '--' }}
        </span>
      </div>

      <!-- Metric 2: Tiempo activo (Uptime) -->
      <div class="relative p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-slate-500">Tiempo activo</span>
          <HelpTooltip
            title="Tiempo activo (Uptime)"
            text="Tiempo continuo sin apagarse. Si este contador se reinicia a 0m sin que haya habido un corte de luz en casa, indica que el ESP32 sufrió una caída de voltaje (Brownout) al mover el servomotor."
            position="bottom"
            align="right"
          />
        </div>
        <div class="my-1">
          <span class="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 block truncate">
            {{ deviceStore.estadoEsp32 ? deviceStore.uptimeFormatted : '--' }}
          </span>
        </div>
        <span class="text-[11px] text-slate-500">
          desde el último encendido
        </span>
      </div>

      <!-- Metric 3: Última respuesta (Sincronización) -->
      <div class="relative p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-slate-500">Última respuesta</span>
          <HelpTooltip
            title="Última respuesta"
            text="Tiempo desde la última vez que el ESP32 reportó su estado a Firebase. Si supera el tiempo límite configurado sin responder, el sistema se marcará como desconectado."
            position="bottom"
            align="right"
          />
        </div>
        <div class="my-1">
          <span class="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 block truncate">
            {{ deviceStore.estadoEsp32 ? `Hace ${deviceStore.secondsSinceHeartbeat} s` : '--' }}
          </span>
        </div>
        <span class="text-[11px] text-slate-500">
          Reporte del controlador
        </span>
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

    <!-- Actions Footer: Jakob Nielsen #5 (Error prevention) -->
    <div class="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-1.5 text-xs text-slate-500">
        <span>Reinicio remoto del microcontrolador</span>
        <HelpTooltip
          title="Reinicio remoto"
          text="Envía una orden a Firebase para que el ESP32 ejecute un reinicio limpio de software (ESP.restart) sin borrar tus alarmas ni configuraciones."
          position="top"
          align="left"
        />
      </div>

      <div>
        <button
          type="button"
          @click="showConfirmReboot = true"
          :disabled="deviceStore.activeAdminCommand === 'reiniciar_esp32'"
          class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Power class="w-4 h-4" />
          <span>Reiniciar ESP32</span>
        </button>
      </div>
    </div>

    <!-- Reusable Confirmation Modal: Jakob Nielsen #5 (Error prevention) -->
    <ConfirmationModal
      :is-open="showConfirmReboot"
      title="¿Reiniciar ESP32?"
      subtitle="Se reiniciará el microcontrolador remoto"
      description="Esta acción enviará la orden 'reiniciar_esp32' a Firebase. El microcontrolador ejecutará un reinicio suave (ESP.restart()) sin borrar tus alarmas ni configuraciones y volverá a conectarse a la red en unos segundos."
      confirm-text="Confirmar reinicio"
      cancel-text="Cancelar"
      :icon="AlertTriangle"
      @close="showConfirmReboot = false"
      @confirm="confirmReboot"
    />
  </div>
</template>
