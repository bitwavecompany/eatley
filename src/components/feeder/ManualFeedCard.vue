<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
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
  if (deviceStore.isDispensing || isCoolingDown.value) return

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
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl">
    <!-- Ambient Background Glow -->
    <div
      class="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl transition-opacity duration-700"
      :class="[
        deviceStore.isDispensing
          ? 'bg-amber-500/20 opacity-100'
          : isCoolingDown
            ? 'bg-blue-500/10 opacity-70'
            : 'bg-emerald-500/15 opacity-80'
      ]"
    ></div>

    <div class="relative z-10 flex flex-col items-center text-center">
      <!-- Icon Indicator Circle -->
      <div class="mb-5 relative">
        <div
          class="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border transition-all duration-300"
          :class="[
            deviceStore.isDispensing
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 scale-105 shadow-lg shadow-amber-500/20'
              : isCoolingDown
                ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:scale-105 shadow-xl shadow-emerald-500/10'
          ]"
        >
          <Icon
            v-if="deviceStore.isDispensing"
            icon="lucide:loader-2"
            class="w-12 h-12 animate-spin text-amber-400"
          />
          <Icon
            v-else-if="isCoolingDown"
            icon="lucide:timer"
            class="w-12 h-12 text-slate-400"
          />
          <Icon
            v-else
            icon="lucide:utensils"
            class="w-12 h-12 text-emerald-400"
          />
        </div>

        <!-- Tiny Pulse Dot -->
        <span
          v-if="!deviceStore.isDispensing && !isCoolingDown"
          class="absolute bottom-1 right-1 flex h-4 w-4"
        >
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
        </span>
      </div>

      <!-- Action Title & Subtitle -->
      <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        {{ deviceStore.isDispensing ? 'Dispensando Alimento...' : 'Disparo Manual' }}
      </h2>

      <p class="mt-2 text-sm text-slate-400 max-w-sm">
        {{
          deviceStore.isDispensing
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
          :disabled="deviceStore.isDispensing || isCoolingDown"
          class="w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg tracking-wide transition-all duration-200 flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed select-none"
          :class="[
            deviceStore.isDispensing
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
              : isCoolingDown
                ? 'bg-slate-800 text-slate-400 border border-slate-700/60'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40'
          ]"
        >
          <Icon
            v-if="deviceStore.isDispensing"
            icon="lucide:rotate-cw"
            class="w-6 h-6 animate-spin text-amber-300"
          />
          <Icon
            v-else-if="isCoolingDown"
            icon="lucide:clock"
            class="w-6 h-6 text-slate-400"
          />
          <Icon
            v-else
            icon="lucide:sparkles"
            class="w-6 h-6 text-slate-950"
          />

          <span>
            {{
              deviceStore.isDispensing
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
        class="w-full max-w-xs mt-3 bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/60"
      >
        <div
          class="bg-emerald-400 h-full rounded-full transition-all duration-300 ease-linear"
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
          class="mt-4 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-sm"
        >
          <Icon icon="lucide:check-circle-2" class="w-4 h-4 text-emerald-400" />
          <span>¡Ración servida exitosamente por el ESP32!</span>
        </div>
      </transition>
    </div>
  </div>
</template>
