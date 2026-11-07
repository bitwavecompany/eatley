<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  AlarmClockCheck,
  ChevronRight,
  History,
  ArrowRight,
} from '@lucide/vue'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { APP_ROUTES } from '@/config/constants'
import ManualFeedCard from '@/components/feeder/ManualFeedCard.vue'
import MissedAlarmBanner from '@/components/feeder/MissedAlarmBanner.vue'
import HistoryList from '@/components/history/HistoryList.vue'

const alarmsStore = useAlarmsStore()
const historyStore = useHistoryStore()
</script>

<template>
  <div class="space-y-6 pb-20 sm:pb-12">
    <!-- Critical Missed Alarm Banner (if any) -->
    <MissedAlarmBanner />

    <!-- Next Upcoming Alarm Card -->
    <div
      v-if="alarmsStore.proximaAlarma"
      class="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
    >
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
          <AlarmClockCheck class="w-7 h-7" />
        </div>
        <div>
          <span class="text-xs font-semibold text-emerald-700 block">
            Próxima comida programada
          </span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-3xl font-extrabold font-mono text-slate-900">
              {{ alarmsStore.proximaAlarma.alarma.hora }}
            </span>
            <span class="text-sm font-semibold text-slate-700">
              "{{ alarmsStore.proximaAlarma.alarma.etiqueta }}"
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            {{
              alarmsStore.proximaAlarma.esHoy
                ? `Programada para hoy (en aprox. ${Math.floor(alarmsStore.proximaAlarma.minutosRestantes / 60)}h ${alarmsStore.proximaAlarma.minutosRestantes % 60}m)`
                : `Programada para mañana (en aprox. ${Math.floor(alarmsStore.proximaAlarma.minutosRestantes / 60)}h ${alarmsStore.proximaAlarma.minutosRestantes % 60}m)`
            }}
          </p>
        </div>
      </div>

      <RouterLink
        :to="APP_ROUTES.ALARMS"
        class="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
      >
        <span>Gestionar horarios</span>
        <ChevronRight class="w-4 h-4" />
      </RouterLink>
    </div>

    <!-- Main Manual Feed Hero Card -->
    <ManualFeedCard />

    <!-- Recent 3 Events Section -->
    <div class="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div class="flex items-center gap-2.5">
          <History class="w-5 h-5 text-slate-500" />
          <h3 class="font-bold text-slate-900 text-base">Última comida</h3>
        </div>

        <RouterLink
          :to="APP_ROUTES.HISTORY"
          class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>Ver historial</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <HistoryList
        :eventos="historyStore.ultimosTresEventos"
        empty-message="Aún no se han registrado eventos de alimentación."
      />
    </div>
  </div>
</template>
