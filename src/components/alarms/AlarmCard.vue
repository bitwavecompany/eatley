<script setup lang="ts">
import { computed } from 'vue'
import { Bell, Calendar, Pencil, Trash2 } from '@lucide/vue'
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
  const dias = props.alarma.dias_semana || []
  if (dias.length === 7) {
    return 'Todos los días'
  }
  if (
    dias.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => dias.includes(d))
  ) {
    return 'Lunes a Viernes'
  }
  if (
    dias.length === 2 &&
    [0, 6].every((d) => dias.includes(d))
  ) {
    return 'Fines de semana'
  }

  return 'Días personalizados'
})

function isDayActive(dayId: number): boolean {
  return props.alarma.tipo_repeticion === 'dias_semana' && (props.alarma.dias_semana || []).includes(dayId)
}
</script>

<template>
  <div
    class="relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between overflow-hidden"
    :class="[
      alarma.activa
        ? 'bg-white border-slate-200 shadow-md shadow-slate-100'
        : 'bg-slate-50 border-slate-200/80 opacity-70'
    ]"
  >
    <!-- Top row: Label & Switch Toggle -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 truncate">
        <span
          class="w-2.5 h-2.5 rounded-full"
          :class="alarma.activa ? 'bg-emerald-500' : 'bg-slate-300'"
        ></span>
        <h4
          class="font-semibold text-sm sm:text-base truncate"
          :class="alarma.activa ? 'text-slate-900' : 'text-slate-500'"
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
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white"
        :class="alarma.activa ? 'bg-emerald-600' : 'bg-slate-300'"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
          :class="alarma.activa ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <!-- Center: Large Digital Clock Hour -->
    <div class="my-3 flex items-baseline gap-2">
      <span
        class="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono"
        :class="alarma.activa ? 'text-slate-900' : 'text-slate-400'"
      >
        {{ alarma.hora }}
      </span>
      <span class="text-xs font-medium text-slate-500">
        {{ repetitionLabel }}
      </span>
    </div>

    <!-- Bottom row: Days indicators & Actions -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
      <!-- Days of week indicator pills -->
      <div v-if="alarma.tipo_repeticion === 'dias_semana'" class="flex items-center gap-1">
        <span
          v-for="d in DAYS_OF_WEEK"
          :key="d.id"
          class="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors"
          :class="[
            isDayActive(d.id)
              ? alarma.activa
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-200 text-slate-600'
              : 'text-slate-300'
          ]"
        >
          {{ d.letter }}
        </span>
      </div>

      <div v-else class="flex items-center gap-1.5 text-xs text-slate-500">
        <component
          :is="alarma.tipo_repeticion === 'una_vez' ? Bell : Calendar"
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
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Editar alarma"
        >
          <Pencil class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click.stop="emit('delete', alarma.id)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Eliminar alarma"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
