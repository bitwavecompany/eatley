<script setup lang="ts">
import {
  PawPrint,
  PauseCircle,
  Cloud,
  CloudOff,
  Cpu,
  Wifi,
  WifiLow,
  WifiZero,
  LogOut,
} from '@lucide/vue'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useConfigStore } from '@/stores/useConfigStore'

defineProps<{
  isAuthenticated?: boolean
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const deviceStore = useDeviceStore()
const configStore = useConfigStore()
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm">
    <div class="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
      <!-- Brand & Name -->
      <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
          <PawPrint class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
        </div>
        <div>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <h1 class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              eat<span class="text-emerald-600">ley</span>
            </h1>
            <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              IoT
            </span>
          </div>
          <p class="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">Dispensador Inteligente</p>
        </div>
      </div>

      <!-- State Badges Group & Sign Out -->
      <div class="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto justify-end py-1">
        <!-- Global Pause Pill (if active) -->
        <div
          v-if="configStore.isSystemPaused"
          class="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[11px] sm:text-xs font-semibold shrink-0"
          title="Modo Vacaciones activo: las alarmas están temporalmente congeladas"
        >
          <PauseCircle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span class="hidden md:inline">Pausa Activa</span>
          <span class="md:hidden">Pausa</span>
        </div>

        <!-- 1. BADGE NUBE (Firebase Realtime Database WebSocket) -->
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-semibold transition-all shadow-sm shrink-0"
          :class="[
            deviceStore.isFirebaseConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : deviceStore.firebaseConnectionStatus === 'reconectando'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
          ]"
          :title="
            deviceStore.isFirebaseConnected
              ? 'Enlace WebSocket activo con Firebase Realtime Database'
              : 'Sin comunicación WebSocket con los servidores de Firebase'
          "
        >
          <!-- Cloud Icon -->
          <Cloud v-if="deviceStore.isFirebaseConnected" class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <CloudOff v-else class="w-3.5 h-3.5 text-rose-600 shrink-0" />

          <!-- Indicator Dot -->
          <span class="relative flex h-1.5 w-1.5 shrink-0">
            <span
              v-if="deviceStore.isFirebaseConnected"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-1.5 w-1.5"
              :class="
                deviceStore.isFirebaseConnected
                  ? 'bg-emerald-600'
                  : deviceStore.firebaseConnectionStatus === 'reconectando'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
              "
            ></span>
          </span>

          <!-- Label -->
          <span class="hidden md:inline">
            {{
              deviceStore.isFirebaseConnected
                ? 'Nube activa'
                : deviceStore.firebaseConnectionStatus === 'reconectando'
                  ? 'Reconectando Nube...'
                  : 'Sin Nube'
            }}
          </span>
          <span class="md:hidden">
            {{ deviceStore.isFirebaseConnected ? 'Nube' : 'Sin Nube' }}
          </span>
        </div>

        <!-- 2. BADGE DISPOSITIVO (ESP32 Hardware Heartbeat) -->
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-semibold transition-all shadow-sm shrink-0"
          :class="[
            deviceStore.isOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-100 border-slate-200 text-slate-600'
          ]"
          :title="
            deviceStore.isOnline
              ? `ESP32 en línea (Heartbeat: hace ${deviceStore.secondsSinceHeartbeat}s, Wi-Fi: ${deviceStore.estadoEsp32?.rssi_dbm ?? 0} dBm)`
              : `ESP32 desconectado o sin energía (hace ${deviceStore.secondsSinceHeartbeat}s)`
          "
        >
          <!-- Hardware Icon -->
          <Cpu class="w-3.5 h-3.5 shrink-0" :class="deviceStore.isOnline ? 'text-emerald-600' : 'text-slate-400'" />

          <!-- Indicator Dot -->
          <span class="relative flex h-1.5 w-1.5 shrink-0">
            <span
              v-if="deviceStore.isOnline"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-1.5 w-1.5"
              :class="deviceStore.isOnline ? 'bg-emerald-600' : 'bg-slate-400'"
            ></span>
          </span>

          <!-- Label -->
          <span class="hidden md:inline">
            {{ deviceStore.isOnline ? 'ESP32 Conectado' : 'ESP32 Offline' }}
          </span>
          <span class="md:hidden">
            {{ deviceStore.isOnline ? 'ESP32' : 'ESP32 Off' }}
          </span>

          <!-- Wi-Fi signal indicator (if online) -->
          <div
            v-if="deviceStore.isOnline"
            class="flex items-center pl-1 border-l border-emerald-200 text-emerald-700"
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
          </div>
        </div>

        <!-- 3. BOTÓN DISCRETO CERRAR SESIÓN -->
        <button
          v-if="isAuthenticated"
          type="button"
          @click="emit('logout')"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-[11px] sm:text-xs font-semibold transition-all shadow-sm shrink-0"
          title="Cerrar sesión familiar y bloquear la aplicación"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Bloquear</span>
        </button>
      </div>
    </div>
  </header>
</template>
