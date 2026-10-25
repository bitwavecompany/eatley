<script setup lang="ts">
import { PawPrint, PauseCircle, Wifi, WifiLow, WifiZero, WifiOff } from '@lucide/vue'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useConfigStore } from '@/stores/useConfigStore'

const deviceStore = useDeviceStore()
const configStore = useConfigStore()
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Brand & Name -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
          <PawPrint class="w-6 h-6 text-white stroke-[2.2]" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold tracking-tight text-slate-900">
              eat<span class="text-emerald-600">ley</span>
            </h1>
            <span class="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              ESP32
            </span>
          </div>
          <p class="text-[11px] text-slate-500 hidden sm:block">Dispensador Automático</p>
        </div>
      </div>

      <!-- Device State & Status Badges -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Global Pause Pill (if active) -->
        <div
          v-if="configStore.isSystemPaused"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold animate-pulse"
        >
          <PauseCircle class="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span class="hidden sm:inline">Sistema</span> Pausado
        </div>

        <!-- ESP32 Connection Badge -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm"
          :class="[
            deviceStore.isOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          ]"
        >
          <span class="relative flex h-2 w-2">
            <span
              v-if="deviceStore.isOnline"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2"
              :class="deviceStore.isOnline ? 'bg-emerald-600' : 'bg-rose-600'"
            ></span>
          </span>

          <span>
            {{ deviceStore.isOnline ? 'En línea' : 'Desconectado' }}
          </span>

          <!-- Wi-Fi Icon & Signal Info -->
          <div
            v-if="deviceStore.isOnline"
            class="flex items-center gap-1 pl-1 border-l border-emerald-200 text-emerald-700"
            :title="`Señal: ${deviceStore.estadoEsp32?.rssi_dbm ?? 0} dBm (${deviceStore.wifiLevel})`"
          >
            <Wifi
              v-if="deviceStore.wifiLevel === 'excelente' || deviceStore.wifiLevel === 'buena'"
              class="w-3.5 h-3.5"
            />
            <WifiLow
              v-else-if="deviceStore.wifiLevel === 'regular'"
              class="w-3.5 h-3.5"
            />
            <WifiZero
              v-else
              class="w-3.5 h-3.5 text-amber-600"
            />
            <span class="text-[10px] font-mono hidden md:inline">
              {{ deviceStore.estadoEsp32?.rssi_dbm }}dBm
            </span>
          </div>

          <WifiOff
            v-else
            class="w-3.5 h-3.5 text-rose-500"
          />
        </div>
      </div>
    </div>
  </header>
</template>
