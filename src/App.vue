<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import EnvWarningBanner from '@/components/layout/EnvWarningBanner.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'

const deviceStore = useDeviceStore()
const alarmsStore = useAlarmsStore()
const configStore = useConfigStore()
const historyStore = useHistoryStore()

onMounted(() => {
  deviceStore.init()
  alarmsStore.init()
  configStore.init()
  historyStore.init()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <!-- Unconfigured Firebase Warning Banner -->
    <EnvWarningBanner />

    <!-- Top App Header -->
    <AppHeader />

    <!-- Main Content View Area -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6">
      <RouterView v-slot="{ Component }">
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Bottom Navigation Bar -->
    <BottomNav />
  </div>
</template>
