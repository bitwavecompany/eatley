<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { APP_ROUTES } from '@/config/constants'
import ManualFeedCard from '@/components/feeder/ManualFeedCard.vue'
import MissedAlarmBanner from '@/components/feeder/MissedAlarmBanner.vue'
import HistoryList from '@/components/history/HistoryList.vue'

const alarmsStore = useAlarmsStore()
const historyStore = useHistoryStore()
const configStore = useConfigStore()
const deviceStore = useDeviceStore()
</script>

<template>
  <div class="space-y-6 pb-20 sm:pb-12">
    <!-- Critical Missed Alarm Banner (if any) -->
    <MissedAlarmBanner />

    <!-- Next Upcoming Alarm Card -->
    <div
      v-if="alarmsStore.proximaAlarma"
      class="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
    >
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 shrink-0">
          <Icon icon="lucide:alarm-clock-check" class="w-7 h-7" />
        </div>
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400 block">
            Próxima Comida Programada
          </span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-3xl font-extrabold font-mono text-white">
              {{ alarmsStore.proximaAlarma.alarma.hora }}
            </span>
            <span class="text-sm font-semibold text-slate-300">
              "{{ alarmsStore.proximaAlarma.alarma.etiqueta }}"
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
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
        class="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors flex items-center gap-1.5"
      >
        <span>Gestionar Horarios</span>
        <Icon icon="lucide:chevron-right" class="w-4 h-4" />
      </RouterLink>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <!-- Stat 1: Meals today -->
      <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
          <Icon icon="lucide:utensils" class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-medium text-slate-400 block">Raciones Hoy</span>
          <span class="text-xl font-bold font-mono text-white">{{ historyStore.eventosHoy.length }}</span>
        </div>
      </div>

      <!-- Stat 2: Active Alarms -->
      <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
          <Icon icon="lucide:bell" class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-medium text-slate-400 block">Alarmas Activas</span>
          <span class="text-xl font-bold font-mono text-white">{{ alarmsStore.alarmasActivas.length }}</span>
        </div>
      </div>

      <!-- Stat 3: System Mode -->
      <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1 flex items-center gap-3">
        <div
          class="p-2.5 rounded-xl shrink-0"
          :class="configStore.isSystemPaused ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'"
        >
          <Icon :icon="configStore.isSystemPaused ? 'lucide:pause-circle' : 'lucide:play-circle'" class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-medium text-slate-400 block">Modo Operativo</span>
          <span
            class="text-sm font-bold truncate block"
            :class="configStore.isSystemPaused ? 'text-amber-400' : 'text-emerald-400'"
          >
            {{ configStore.isSystemPaused ? 'Pausa Vacaciones' : 'Automático Normal' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Manual Feed Hero Card -->
    <ManualFeedCard />

    <!-- Recent 3 Events Section -->
    <div class="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 shadow-xl">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div class="flex items-center gap-2.5">
          <Icon icon="lucide:history" class="w-5 h-5 text-slate-400" />
          <h3 class="font-bold text-white text-base">Últimas Aperturas</h3>
        </div>

        <RouterLink
          :to="APP_ROUTES.HISTORY"
          class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>Ver historial completo</span>
          <Icon icon="lucide:arrow-right" class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <HistoryList
        :eventos="historyStore.ultimosTresEventos"
        empty-message="Aún no se han registrado eventos de alimentación."
      />
    </div>
  </div>
</template>
