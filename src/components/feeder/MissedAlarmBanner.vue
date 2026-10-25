<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useMissedAlarms } from '@/composables/useMissedAlarms'

const { alarmasPerdidas, atenderAlarmaPerdida, omitirAlarmaPerdida } = useMissedAlarms()
</script>

<template>
  <div v-if="alarmasPerdidas.length > 0" class="space-y-3">
    <div
      v-for="item in alarmasPerdidas"
      :key="item.alarma.id"
      class="relative overflow-hidden rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 p-4 sm:p-5 shadow-lg backdrop-blur-sm"
      role="alert"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Info text -->
        <div class="flex items-start gap-3.5">
          <div class="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <Icon icon="lucide:alert-triangle" class="w-6 h-6" />
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                Alarma Perdida
              </span>
              <span class="text-xs text-rose-300 font-mono">
                Programada: {{ item.horaProgramada }}
              </span>
              <span v-if="item.minutosAtraso > 0" class="text-xs text-slate-400">
                (hace ~{{ item.minutosAtraso }} min)
              </span>
            </div>

            <h3 class="text-base sm:text-lg font-bold text-white mt-1">
              "{{ item.alarma.etiqueta }}" no fue dispensada
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 mt-0.5">
              {{
                item.motivo === 'reportada_por_esp32'
                  ? 'El ESP32 detectó que se restauró la energía fuera de la ventana de tolerancia.'
                  : 'Se superó el tiempo límite de tolerancia sin confirmación de apertura.'
              }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto">
          <button
            type="button"
            @click="omitirAlarmaPerdida(item.alarma.id)"
            class="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Icon icon="lucide:check-check" class="w-4 h-4 text-slate-400" />
            <span>Omitir por hoy</span>
          </button>

          <button
            type="button"
            @click="atenderAlarmaPerdida(item.alarma.id)"
            class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Icon icon="lucide:utensils" class="w-4 h-4" />
            <span>Dispensar ahora</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
