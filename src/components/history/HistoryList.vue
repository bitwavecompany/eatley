<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { EventoHistorial } from '@/types/history.types'

withDefaults(
  defineProps<{
    eventos: EventoHistorial[]
    emptyMessage?: string
  }>(),
  {
    emptyMessage: 'No hay registros de apertura en la bitácora.',
  }
)

function formatTimestamp(ts: number): { time: string; date: string } {
  const d = new Date(ts)
  const time = d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const date = d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  return { time, date }
}
</script>

<template>
  <div class="space-y-3">
    <!-- Empty State -->
    <div
      v-if="eventos.length === 0"
      class="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center"
    >
      <div class="p-3 rounded-full bg-slate-800/80 text-slate-500 mb-3">
        <Icon icon="lucide:inbox" class="w-8 h-8" />
      </div>
      <p class="text-sm font-medium text-slate-400">{{ emptyMessage }}</p>
      <p class="text-xs text-slate-500 mt-1">Los eventos se registrarán automáticamente cuando el ESP32 accione el servomotor.</p>
    </div>

    <!-- Event Rows -->
    <div
      v-for="ev in eventos"
      :key="ev.id"
      class="rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 p-4 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <!-- Left: Icon & Description -->
      <div class="flex items-start gap-3">
        <!-- Origin Icon -->
        <div
          class="p-2.5 rounded-xl shrink-0 mt-0.5"
          :class="[
            ev.origen === 'manual'
              ? 'bg-emerald-500/15 text-emerald-400'
              : ev.origen === 'alarma'
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-amber-500/15 text-amber-400'
          ]"
        >
          <Icon
            :icon="
              ev.origen === 'manual'
                ? 'lucide:hand'
                : ev.origen === 'alarma'
                  ? 'lucide:bell'
                  : 'lucide:wrench'
            "
            class="w-5 h-5"
          />
        </div>

        <div>
          <!-- Title & Origin Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-sm text-white">
              {{
                ev.origen === 'alarma'
                  ? ev.alarma_etiqueta || 'Alarma Programada'
                  : ev.origen === 'manual'
                    ? 'Disparo Manual'
                    : 'Prueba Técnica de Servo'
              }}
            </span>

            <span
              class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              :class="[
                ev.origen === 'manual'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : ev.origen === 'alarma'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-amber-500/20 text-amber-300'
              ]"
            >
              {{ ev.origen }}
            </span>
          </div>

          <!-- Time & Date -->
          <div class="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
            <span class="text-slate-300 font-semibold">{{ formatTimestamp(ev.timestamp).time }}</span>
            <span>•</span>
            <span>{{ formatTimestamp(ev.timestamp).date }}</span>
            <span>•</span>
            <span class="text-slate-400">Pulso: {{ ev.duracion_abierto_ms }}ms</span>
          </div>
        </div>
      </div>

      <!-- Right: Verification Badges -->
      <div class="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
        <!-- ESP32 Execution Status -->
        <span
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
          :class="[
            ev.estado_esp32 === 'completado'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          ]"
        >
          <Icon
            :icon="ev.estado_esp32 === 'completado' ? 'lucide:check-circle' : 'lucide:x-circle'"
            class="w-3.5 h-3.5"
          />
          <span class="capitalize">{{ ev.estado_esp32 }}</span>
        </span>

        <!-- Microswitch Physical Confirmation -->
        <span
          v-if="ev.confirmacion_microswitch !== 'no_aplicable'"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
          :class="[
            ev.confirmacion_microswitch === 'verificado'
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
              : 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
          ]"
        >
          <Icon
            :icon="
              ev.confirmacion_microswitch === 'verificado'
                ? 'lucide:shield-check'
                : 'lucide:alert-octagon'
            "
            class="w-3.5 h-3.5"
          />
          <span>
            {{
              ev.confirmacion_microswitch === 'verificado'
                ? 'Físico OK'
                : 'Atasco Sensor'
            }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
