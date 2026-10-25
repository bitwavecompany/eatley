<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { DAYS_OF_WEEK } from '@/config/constants'
import type { Alarma } from '@/types/alarm.types'

const props = defineProps<{
  alarma: Alarma
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'edit', alarma: Alarma): void
  (e: 'delete', id: string): void
}>()

const repetitionLabel = computed<string>(() => {
  if (props.alarma.tipo_repeticion === 'una_vez') {
    return 'Una sola vez'
  }
  if (props.alarma.tipo_repeticion === 'fecha_especifica') {
    return props.alarma.fecha_especifica ? `Fecha: ${props.alarma.fecha_especifica}` : 'Fecha específica'
  }
  if (props.alarma.dias_semana.length === 7) {
    return 'Todos los días'
  }
  if (
    props.alarma.dias_semana.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => props.alarma.dias_semana.includes(d))
  ) {
    return 'Lunes a Viernes'
  }
  if (
    props.alarma.dias_semana.length === 2 &&
    [0, 6].every((d) => props.alarma.dias_semana.includes(d))
  ) {
    return 'Fines de semana'
  }

  return 'Días personalizados'
})

function isDayActive(dayId: number): boolean {
  return props.alarma.tipo_repeticion === 'dias_semana' && props.alarma.dias_semana.includes(dayId)
}
</script>

<template>
  <div
    class="relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between overflow-hidden"
    :class="[
      alarma.activa
        ? 'bg-slate-900 border-slate-700/80 shadow-md shadow-emerald-500/5'
        : 'bg-slate-900/50 border-slate-800/80 opacity-70'
    ]"
  >
    <!-- Top row: Label & Switch Toggle -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 truncate">
        <span
          class="w-2 h-2 rounded-full"
          :class="alarma.activa ? 'bg-emerald-400' : 'bg-slate-600'"
        ></span>
        <h4
          class="font-semibold text-sm sm:text-base truncate"
          :class="alarma.activa ? 'text-slate-200' : 'text-slate-400'"
        >
          {{ alarma.etiqueta || 'Alarma sin nombre' }}
        </h4>
      </div>

      <!-- Cellphone-style Switch Toggle -->
      <button
        type="button"
        role="switch"
        :aria-checked="alarma.activa"
        @click.stop="emit('toggle', alarma.id)"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        :class="alarma.activa ? 'bg-emerald-500' : 'bg-slate-700'"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
          :class="alarma.activa ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <!-- Center: Large Digital Clock Hour -->
    <div class="my-3 flex items-baseline gap-2">
      <span
        class="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono"
        :class="alarma.activa ? 'text-white' : 'text-slate-500'"
      >
        {{ alarma.hora }}
      </span>
      <span class="text-xs font-medium text-slate-400">
        {{ repetitionLabel }}
      </span>
    </div>

    <!-- Bottom row: Days indicators & Actions -->
    <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
      <!-- Days of week indicator pills -->
      <div v-if="alarma.tipo_repeticion === 'dias_semana'" class="flex items-center gap-1">
        <span
          v-for="d in DAYS_OF_WEEK"
          :key="d.id"
          class="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors"
          :class="[
            isDayActive(d.id)
              ? alarma.activa
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400'
              : 'text-slate-600'
          ]"
        >
          {{ d.letter }}
        </span>
      </div>

      <div v-else class="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon
          :icon="alarma.tipo_repeticion === 'una_vez' ? 'lucide:bell' : 'lucide:calendar'"
          class="w-3.5 h-3.5 text-slate-400"
        />
        <span class="font-mono text-[11px]">
          {{ alarma.tipo_repeticion === 'una_vez' ? 'Próxima ocurrencia' : alarma.fecha_especifica }}
        </span>
      </div>

      <!-- Action buttons (Edit & Delete) -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click.stop="emit('edit', alarma)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Editar alarma"
        >
          <Icon icon="lucide:pencil" class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click.stop="emit('delete', alarma.id)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Eliminar alarma"
        >
          <Icon icon="lucide:trash-2" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
