<script setup lang="ts">
import { ref, watch } from 'vue'
import { AlertTriangle, CheckCheck, Utensils } from '@lucide/vue'
import { useMissedAlarms } from '@/composables/useMissedAlarms'
import { useToastStore } from '@/stores/useToastStore'
import { useDeviceStore } from '@/stores/useDeviceStore'

const { alarmasPerdidas, atenderAlarmaPerdida, omitirAlarmaPerdida } = useMissedAlarms()
const toastStore = useToastStore()
const deviceStore = useDeviceStore()

const activeProcessingToastId = ref<string | null>(null)
const isWaitingForExecution = ref(false)
let timeoutHandle: ReturnType<typeof setTimeout> | null = null

// Watch when dispensing finishes (transitions from true to false)
watch(
  () => deviceStore.isDispensing,
  (isDispensing, wasDispensing) => {
    if (isWaitingForExecution.value && wasDispensing && !isDispensing) {
      isWaitingForExecution.value = false
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
        timeoutHandle = null
      }
      if (activeProcessingToastId.value) {
        toastStore.update(activeProcessingToastId.value, {
          message: 'Se ha alimentado con éxito',
          type: 'success',
          duration: 3500,
        })
        activeProcessingToastId.value = null
      }
    }
  }
)

async function handleAlimentarAhora(id: string) {
  if (isWaitingForExecution.value) return

  isWaitingForExecution.value = true
  activeProcessingToastId.value = toastStore.loading('Procesando...')

  // Fallback timeout in case ESP32 is offline or disconnected
  if (timeoutHandle) clearTimeout(timeoutHandle)
  timeoutHandle = setTimeout(() => {
    if (isWaitingForExecution.value && activeProcessingToastId.value) {
      isWaitingForExecution.value = false
      toastStore.update(activeProcessingToastId.value, {
        message: 'Tiempo de espera agotado al comunicar con el dispensador',
        type: 'warning',
        duration: 4000,
      })
      activeProcessingToastId.value = null
    }
  }, 15000)

  try {
    await atenderAlarmaPerdida(id)
  } catch {
    if (timeoutHandle) clearTimeout(timeoutHandle)
    isWaitingForExecution.value = false
    if (activeProcessingToastId.value) {
      toastStore.update(activeProcessingToastId.value, {
        message: 'Error al dispensar alimento',
        type: 'error',
        duration: 3500,
      })
      activeProcessingToastId.value = null
    }
  }
}

async function handleOmitir(id: string) {
  try {
    await omitirAlarmaPerdida(id)
    toastStore.success('Alarma omitida por hoy')
  } catch {
    toastStore.error('Error al omitir alarma')
  }
}
</script>

<template>
  <div v-if="alarmasPerdidas.length > 0" class="space-y-3">
    <div
      v-for="item in alarmasPerdidas"
      :key="item.alarma.id"
      class="relative overflow-hidden rounded-2xl bg-rose-50 border-2 border-rose-200 p-4 sm:p-5 shadow-sm"
      role="alert"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Info text -->
        <div class="flex items-start gap-3.5">
          <div class="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
            <AlertTriangle class="w-6 h-6" />
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold text-rose-800 px-2 py-0.5 rounded bg-rose-100 border border-rose-200">
                Alarma perdida
              </span>
              <span class="text-xs text-rose-900 font-mono font-semibold">
                Programada: {{ item.horaProgramada }}
              </span>
              <span v-if="item.minutosAtraso > 0" class="text-xs text-slate-500">
                (hace ~{{ item.minutosAtraso }} min)
              </span>
            </div>

            <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-1">
              "{{ item.alarma.etiqueta }}" no fue dispensada
            </h3>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto">
          <button
            type="button"
            @click="handleOmitir(item.alarma.id)"
            class="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCheck class="w-4 h-4 text-slate-500" />
            <span>Omitir por hoy</span>
          </button>

          <button
            type="button"
            @click="handleAlimentarAhora(item.alarma.id)"
            class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
          >
            <Utensils class="w-4 h-4" />
            <span>Alimentar ahora</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
