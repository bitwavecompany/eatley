<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  AlarmClockCheck,
  ChevronRight,
  Utensils,
  Bell,
  PauseCircle,
  PlayCircle,
  History,
  ArrowRight,
} from '@lucide/vue'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { APP_ROUTES } from '@/config/constants'
import ManualFeedCard from '@/components/feeder/ManualFeedCard.vue'
import MissedAlarmBanner from '@/components/feeder/MissedAlarmBanner.vue'
import HistoryList from '@/components/history/HistoryList.vue'

const alarmsStore = useAlarmsStore()
const historyStore = useHistoryStore()
const configStore = useConfigStore()
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
          <span class="text-xs font-semibold uppercase tracking-wider text-emerald-700 block">
            Próxima Comida Programada
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
        <span>Gestionar Horarios</span>
        <ChevronRight class="w-4 h-4" />
      </RouterLink>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <!-- Stat 1: Meals today -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
        <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <Utensils class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-medium text-slate-500 block">Raciones Hoy</span>
          <span class="text-xl font-bold font-mono text-slate-900">{{ historyStore.eventosHoy.length }}</span>
        </div>
      </div>

      <!-- Stat 2: Active Alarms -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
        <div class="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          <Bell class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-medium text-slate-500 block">Alarmas Activas</span>
          <span class="text-xl font-bold font-mono text-slate-900">{{ alarmsStore.alarmasActivas.length }}</span>
        </div>
      </div>

      <!-- Stat 3: System Mode -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200 col-span-2 sm:col-span-1 flex items-center gap-3 shadow-sm">
        <div
          class="p-2.5 rounded-xl shrink-0"
          :class="configStore.isSystemPaused ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'"
        >
          <PauseCircle v-if="configStore.isSystemPaused" class="w-5 h-5" />
          <PlayCircle v-else class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-medium text-slate-500 block">Modo Operativo</span>
          <span
            class="text-sm font-bold truncate block"
            :class="configStore.isSystemPaused ? 'text-amber-700' : 'text-emerald-700'"
          >
            {{ configStore.isSystemPaused ? 'Pausa Vacaciones' : 'Automático Normal' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Manual Feed Hero Card -->
    <ManualFeedCard />

    <!-- Recent 3 Events Section -->
    <div class="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div class="flex items-center gap-2.5">
          <History class="w-5 h-5 text-slate-500" />
          <h3 class="font-bold text-slate-900 text-base">Últimas Aperturas</h3>
        </div>

        <RouterLink
          :to="APP_ROUTES.HISTORY"
          class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>Ver historial completo</span>
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
