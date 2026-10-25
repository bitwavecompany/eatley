<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { LayoutDashboard, AlarmClock, History, SlidersHorizontal } from '@lucide/vue'
import { APP_ROUTES } from '@/config/constants'
import { useMissedAlarms } from '@/composables/useMissedAlarms'

const route = useRoute()
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
  <nav
    class="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 pb-safe sm:py-2 shadow-lg"
    aria-label="Navegación principal"
  >
    <div class="max-w-md mx-auto grid grid-cols-4 gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200"
        :class="[
          isActive(item.path)
            ? 'text-emerald-700 bg-emerald-50 font-bold'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
        ]"
      >
        <div class="relative">
          <component :is="item.icon" class="w-5 h-5 sm:w-6 sm:h-6" />
          <span
            v-if="item.badge"
            class="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full min-w-[16px] text-center shadow"
          >
            {{ item.badge }}
          </span>
        </div>
        <span class="text-[11px] sm:text-xs mt-1">
          {{ item.name }}
        </span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
</style>
