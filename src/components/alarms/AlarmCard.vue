<script setup lang="ts">
import { computed } from 'vue'
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
    return 'Diario'
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

  const shortMap: Record<number, string> = {
    1: 'Lun',
    2: 'Mar',
    3: 'Mié',
    4: 'Jue',
    5: 'Vie',
    6: 'Sáb',
    0: 'Dom',
  }
  const sorted = [...dias].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
  return sorted.map((d) => shortMap[d]).join(' ') || 'Sin días'
})
</script>

<template>
  <div
    @click="emit('edit', alarma)"
    class="relative rounded-2xl sm:rounded-3xl border transition-all duration-200 p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none group"
    :class="[
      alarma.activa
        ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
        : 'bg-slate-50 border-slate-200/80 opacity-70 hover:opacity-90'
    ]"
  >
    <!-- Left: Large Digital Time + Subtitle (Screenshot 5) -->
    <div class="flex flex-col min-w-0 pr-3">
      <!-- Time -->
      <span
        class="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono transition-colors"
        :class="alarma.activa ? 'text-slate-900' : 'text-slate-400'"
      >
        {{ alarma.hora }}
      </span>

      <!-- Subtitle: Repetition & Label -->
      <div class="flex items-center gap-1.5 mt-1 text-xs sm:text-sm font-medium text-slate-500 truncate">
        <span>{{ repetitionLabel }}</span>
        <span v-if="alarma.etiqueta && alarma.etiqueta !== 'Ración programada'">•</span>
        <span
          v-if="alarma.etiqueta && alarma.etiqueta !== 'Ración programada'"
          class="truncate text-slate-600 font-semibold"
        >
          {{ alarma.etiqueta }}
        </span>
      </div>
    </div>

    <!-- Right: Android-Style Pill Switch Toggle -->
    <div class="flex items-center shrink-0">
      <button
        type="button"
        role="switch"
        :aria-checked="alarma.activa"
        @click.stop="emit('toggle', alarma.id)"
        class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        :class="alarma.activa ? 'bg-emerald-600' : 'bg-slate-300'"
      >
        <span
          class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
          :class="alarma.activa ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>
  </div>
</template>
