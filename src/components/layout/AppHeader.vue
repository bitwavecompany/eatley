<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useConfigStore } from '@/stores/useConfigStore'

const deviceStore = useDeviceStore()
const configStore = useConfigStore()
</script>

<template>
  <header class="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Brand & Name -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Icon icon="lucide:paw-print" class="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold tracking-tight text-white">
              eat<span class="text-emerald-400">ley</span>
            </h1>
            <span class="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              ESP32
            </span>
          </div>
          <p class="text-[11px] text-slate-400 hidden sm:block">Dispensador Automático</p>
        </div>
      </div>

      <!-- Device State & Status Badges -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Global Pause Pill (if active) -->
        <div
          v-if="configStore.isSystemPaused"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse"
        >
          <Icon icon="lucide:pause-circle" class="w-3.5 h-3.5 shrink-0" />
          <span class="hidden sm:inline">Sistema</span> Pausado
        </div>

        <!-- ESP32 Connection Badge -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
          :class="[
            deviceStore.isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          ]"
        >
          <span class="relative flex h-2 w-2">
            <span
              v-if="deviceStore.isOnline"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2"
              :class="deviceStore.isOnline ? 'bg-emerald-500' : 'bg-rose-500'"
            ></span>
          </span>

          <span class="font-medium">
            {{ deviceStore.isOnline ? 'En línea' : 'Desconectado' }}
          </span>

          <!-- Wi-Fi Icon & Signal Info -->
          <div
            v-if="deviceStore.isOnline"
            class="flex items-center gap-1 pl-1 border-l border-emerald-500/20 text-emerald-300"
            :title="`Señal: ${deviceStore.estadoEsp32?.rssi_dbm ?? 0} dBm (${deviceStore.wifiLevel})`"
          >
            <Icon
              v-if="deviceStore.wifiLevel === 'excelente' || deviceStore.wifiLevel === 'buena'"
              icon="lucide:wifi"
              class="w-3.5 h-3.5"
            />
            <Icon
              v-else-if="deviceStore.wifiLevel === 'regular'"
              icon="lucide:wifi-low"
              class="w-3.5 h-3.5"
            />
            <Icon
              v-else
              icon="lucide:wifi-zero"
              class="w-3.5 h-3.5 text-amber-400"
            />
            <span class="text-[10px] font-mono hidden md:inline">
              {{ deviceStore.estadoEsp32?.rssi_dbm }}dBm
            </span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
