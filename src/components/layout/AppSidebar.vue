<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  PawPrint,
  LayoutDashboard,
  AlarmClock,
  History,
  SlidersHorizontal,
  LogOut,
  Cpu,
  Wifi,
  WifiLow,
  WifiZero,
} from '@lucide/vue'
import { APP_ROUTES } from '@/config/constants'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useMissedAlarms } from '@/composables/useMissedAlarms'

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const route = useRoute()
const deviceStore = useDeviceStore()
const { alarmasPerdidas } = useMissedAlarms()

const navItems = computed(() => [
  {
    name: 'Control',
    path: APP_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Alarmas',
    path: APP_ROUTES.ALARMS,
    icon: AlarmClock,
    badge: alarmasPerdidas.value.length > 0 ? alarmasPerdidas.value.length : null,
  },
  {
    name: 'Historial',
    path: APP_ROUTES.HISTORY,
    icon: History,
    badge: null,
  },
  {
    name: 'Ajustes',
    path: APP_ROUTES.ADMIN,
    icon: SlidersHorizontal,
    badge: null,
  },
])

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<template>
  <aside
    class="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-sm"
    aria-label="Barra lateral de navegación"
  >
    <!-- Brand / Logo Header -->
    <div class="h-16 flex items-center px-6 gap-3 border-b border-slate-100 shrink-0">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
        <PawPrint class="w-5 h-5 text-white stroke-[2.2]" />
      </div>
      <div>
        <h1 class="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
          eat<span class="text-emerald-600">ley</span>
        </h1>
        <p class="text-[11px] font-medium text-slate-400 mt-0.5">
          Comedero inteligente
        </p>
      </div>
    </div>

    <!-- Navigation Menu Items -->
    <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Menú principal">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 select-none min-h-[44px]"
        :class="[
          isActive(item.path)
            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 shrink-0 transition-colors"
          :class="isActive(item.path) ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'"
        />
        <span class="flex-1 truncate">
          {{ item.name }}
        </span>
        <span
          v-if="item.badge"
          class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm"
        >
          {{ item.badge }}
        </span>
      </RouterLink>
    </nav>

    <!-- Sidebar Footer / Hardware Status & Logout -->
    <div class="p-4 border-t border-slate-100 space-y-3 shrink-0 bg-slate-50/50">
      <!-- Hardware Health Card -->
      <div
        class="p-3 rounded-2xl border text-xs font-medium transition-all"
        :class="[
          deviceStore.isOnline
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        ]"
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1.5 font-bold">
            <Cpu class="w-4 h-4 shrink-0" :class="deviceStore.isOnline ? 'text-emerald-700' : 'text-slate-400'" />
            <span>ESP32</span>
          </div>
          <span class="relative flex h-2 w-2 shrink-0">
            <span
              v-if="deviceStore.isOnline"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2"
              :class="deviceStore.isOnline ? 'bg-emerald-600' : 'bg-slate-400'"
            ></span>
          </span>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-500">
          <span>{{ deviceStore.isOnline ? 'En línea' : 'Desconectado' }}</span>
          <div v-if="deviceStore.isOnline && deviceStore.estadoEsp32?.rssi_dbm" class="flex items-center gap-1 font-mono">
            <Wifi
              v-if="deviceStore.wifiLevel === 'excelente' || deviceStore.wifiLevel === 'buena'"
              class="w-3 h-3 text-emerald-600"
            />
            <WifiLow
              v-else-if="deviceStore.wifiLevel === 'regular'"
              class="w-3 h-3 text-amber-600"
            />
            <WifiZero
              v-else
              class="w-3 h-3 text-rose-600"
            />
            <span>{{ deviceStore.estadoEsp32.rssi_dbm }} dBm</span>
          </div>
        </div>
      </div>

      <!-- Logout Button -->
      <button
        type="button"
        @click="emit('logout')"
        class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-all shadow-sm cursor-pointer min-h-[44px]"
      >
        <LogOut class="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>
