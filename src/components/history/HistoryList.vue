<script setup lang="ts">
import {
  Inbox,
  Hand,
  Bell,
  Wrench,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertOctagon,
} from '@lucide/vue'
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
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center flex flex-col items-center justify-center shadow-sm"
    >
      <div class="p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
        <Inbox class="w-8 h-8" />
      </div>
      <p class="text-sm font-semibold text-slate-700">{{ emptyMessage }}</p>
    </div>

    <!-- Event Rows -->
    <div
      v-for="ev in eventos"
      :key="ev.id"
      class="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/80 p-4 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
    >
      <!-- Left: Icon & Description -->
      <div class="flex items-start gap-3">
        <!-- Origin Icon -->
        <div
          class="p-2.5 rounded-xl shrink-0 mt-0.5"
          :class="[
            ev.origen === 'manual'
              ? 'bg-emerald-50 text-emerald-700'
              : ev.origen === 'alarma'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
          ]"
        >
          <Hand v-if="ev.origen === 'manual'" class="w-5 h-5" />
          <Bell v-else-if="ev.origen === 'alarma'" class="w-5 h-5" />
          <Wrench v-else class="w-5 h-5" />
        </div>

        <div>
          <!-- Title & Origin Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-sm text-slate-900">
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
                  ? 'bg-emerald-100 text-emerald-800'
                  : ev.origen === 'alarma'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
              ]"
            >
              {{ ev.origen }}
            </span>
          </div>

          <!-- Time & Date -->
          <div class="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
            <span class="text-slate-800 font-semibold">{{ formatTimestamp(ev.timestamp).time }}</span>
            <span>•</span>
            <span>{{ formatTimestamp(ev.timestamp).date }}</span>
            <span>•</span>
            <span class="text-slate-500">Duración: {{ ev.duracion_abierto_ms }}ms</span>
          </div>
        </div>
      </div>

      <!-- Right: Verification Badges -->
      <div class="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
        <!-- ESP32 Execution Status -->
        <span
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border"
          :class="[
            ev.estado_esp32 === 'completado'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          ]"
        >
          <CheckCircle v-if="ev.estado_esp32 === 'completado'" class="w-3.5 h-3.5 text-emerald-600" />
          <XCircle v-else class="w-3.5 h-3.5 text-rose-600" />
          <span class="capitalize">{{ ev.estado_esp32 }}</span>
        </span>

        <!-- Microswitch Physical Confirmation -->
        <span
          v-if="ev.confirmacion_microswitch !== 'no_aplicable'"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border"
          :class="[
            ev.confirmacion_microswitch === 'verificado'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse'
          ]"
        >
          <ShieldCheck v-if="ev.confirmacion_microswitch === 'verificado'" class="w-3.5 h-3.5 text-teal-600" />
          <AlertOctagon v-else class="w-3.5 h-3.5 text-rose-600" />
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
