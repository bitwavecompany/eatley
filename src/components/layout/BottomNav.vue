<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import { APP_ROUTES } from '@/config/constants'
import { useMissedAlarms } from '@/composables/useMissedAlarms'

const route = useRoute()
const { alarmasPerdidas } = useMissedAlarms()

const navItems = computed(() => [
  {
    name: 'Control',
    path: APP_ROUTES.DASHBOARD,
    icon: 'lucide:layout-dashboard',
    badge: null,
  },
  {
    name: 'Alarmas',
    path: APP_ROUTES.ALARMS,
    icon: 'lucide:alarm-clock',
    badge: alarmasPerdidas.value.length > 0 ? alarmasPerdidas.value.length : null,
  },
  {
    name: 'Historial',
    path: APP_ROUTES.HISTORY,
    icon: 'lucide:history',
    badge: null,
  },
  {
    name: 'Ajustes',
    path: APP_ROUTES.ADMIN,
    icon: 'lucide:sliders-horizontal',
    badge: null,
  },
])

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<template>
  <nav
    class="fixed bottom-0 inset-x-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-safe sm:py-2"
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
            ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        ]"
      >
        <div class="relative">
          <Icon :icon="item.icon" class="w-5 h-5 sm:w-6 sm:h-6" />
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
