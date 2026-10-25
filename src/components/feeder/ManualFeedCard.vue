<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Loader2,
  Timer,
  Utensils,
  RotateCw,
  Clock,
  Sparkles,
  CheckCircle2,
  CloudOff,
} from '@lucide/vue'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useCooldown } from '@/composables/useCooldown'

const deviceStore = useDeviceStore()
const configStore = useConfigStore()
const { isActive: isCoolingDown, remainingSeconds, progressPercent, startCooldown } = useCooldown()

const showSuccessMessage = ref(false)
let successTimer: ReturnType<typeof setTimeout> | null = null

// Watch when dispensing finishes (transitions from true to false)
watch(
  () => deviceStore.isDispensing,
  (isDispensing, wasDispensing) => {
    if (wasDispensing && !isDispensing) {
      showSuccessMessage.value = true
      if (successTimer) clearTimeout(successTimer)
      successTimer = setTimeout(() => {
        showSuccessMessage.value = false
      }, 4000)
    }
  }
)

async function handleFeedClick() {
  if (
    deviceStore.isDispensing ||
    isCoolingDown.value ||
    !deviceStore.isFirebaseConnected
  ) {
    return
  }

  // Start cooldown timer immediately for anti-double-click safety
  startCooldown(configStore.cooldownDurationSec)

  try {
    await deviceStore.triggerManualFeed('boton_principal')
  } catch (error) {
    console.error('Error al solicitar disparo manual:', error)
  }
}
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-100">
    <!-- Ambient Background Glow -->
    <div
      class="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl transition-opacity duration-700"
      :class="[
        !deviceStore.isFirebaseConnected
          ? 'bg-amber-400/15 opacity-70'
          : deviceStore.isDispensing
            ? 'bg-amber-400/20 opacity-100'
            : isCoolingDown
              ? 'bg-slate-200/50 opacity-70'
              : 'bg-emerald-400/15 opacity-80'
      ]"
    ></div>

    <div class="relative z-10 flex flex-col items-center text-center">
      <!-- Icon Indicator Circle -->
      <div class="mb-5 relative">
        <div
          class="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border transition-all duration-300"
          :class="[
            !deviceStore.isFirebaseConnected
              ? 'bg-amber-50 border-amber-300 text-amber-600'
              : deviceStore.isDispensing
                ? 'bg-amber-50 border-amber-300 text-amber-600 scale-105 shadow-md shadow-amber-500/10'
                : isCoolingDown
                  ? 'bg-slate-100 border-slate-200 text-slate-500'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:scale-105 shadow-lg shadow-emerald-500/10'
          ]"
        >
          <CloudOff
            v-if="!deviceStore.isFirebaseConnected"
            class="w-12 h-12 text-amber-600 animate-pulse"
          />
          <Loader2
            v-else-if="deviceStore.isDispensing"
            class="w-12 h-12 animate-spin text-amber-600"
          />
          <Timer
            v-else-if="isCoolingDown"
            class="w-12 h-12 text-slate-500"
          />
          <Utensils
            v-else
            class="w-12 h-12 text-emerald-600"
          />
        </div>

        <!-- Tiny Pulse Dot (only when fully ready and connected) -->
        <span
          v-if="deviceStore.isFirebaseConnected && !deviceStore.isDispensing && !isCoolingDown"
          class="absolute bottom-1 right-1 flex h-4 w-4"
        >
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>
      </div>

      <!-- Action Title & Subtitle -->
      <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {{
          !deviceStore.isFirebaseConnected
            ? 'Sin Conexión con la Nube'
            : deviceStore.isDispensing
              ? 'Dispensando Alimento...'
              : 'Disparo Manual'
        }}
      </h2>

      <p class="mt-2 text-sm text-slate-600 max-w-sm">
        {{
          !deviceStore.isFirebaseConnected
            ? 'Reconectando con Firebase Realtime Database. El botón se habilitará automáticamente al restablecer el enlace.'
            : deviceStore.isDispensing
              ? 'El servomotor MG996R está ejecutando el ciclo de apertura configurado.'
              : isCoolingDown
                ? `Bloqueo anti-doble clic activo. Podrás dispensar nuevamente en ${remainingSeconds}s.`
                : 'Presiona el botón para servir una ración instantánea de croquetas.'
        }}
      </p>

      <!-- Main Action Button -->
      <div class="mt-6 w-full max-w-xs">
        <button
          type="button"
          @click="handleFeedClick"
          :disabled="deviceStore.isDispensing || isCoolingDown || !deviceStore.isFirebaseConnected"
          class="w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg tracking-wide transition-all duration-200 flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed select-none"
          :class="[
            !deviceStore.isFirebaseConnected
              ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
              : deviceStore.isDispensing
                ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-wait'
                : isCoolingDown
                  ? 'bg-slate-100 text-slate-500 border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 hover:shadow-emerald-600/40'
          ]"
        >
          <RotateCw
            v-if="!deviceStore.isFirebaseConnected"
            class="w-6 h-6 animate-spin text-amber-700"
          />
          <RotateCw
            v-else-if="deviceStore.isDispensing"
            class="w-6 h-6 animate-spin text-amber-800"
          />
          <Clock
            v-else-if="isCoolingDown"
            class="w-6 h-6 text-slate-500"
          />
          <Sparkles
            v-else
            class="w-6 h-6 text-white"
          />

          <span>
            {{
              !deviceStore.isFirebaseConnected
                ? 'Reconectando con la nube...'
                : deviceStore.isDispensing
                  ? 'Abriendo Compuerta...'
                  : isCoolingDown
                    ? `Espera ${remainingSeconds}s`
                    : 'Alimentar Ahora'
            }}
          </span>
        </button>
      </div>

      <!-- Cooldown Progress Bar -->
      <div
        v-if="isCoolingDown"
        class="w-full max-w-xs mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200"
      >
        <div
          class="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-linear"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>

      <!-- Success Toast / Badge -->
      <transition
        enter-active-class="transition duration-300 ease-out transform"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in transform"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-if="showSuccessMessage"
          class="mt-4 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
          <span>¡Ración servida exitosamente por el ESP32!</span>
        </div>
      </transition>
    </div>
  </div>
</template>
