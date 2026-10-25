<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useConfigStore } from '@/stores/useConfigStore'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { SERVO_CONSTRAINTS } from '@/config/constants'

const configStore = useConfigStore()
const deviceStore = useDeviceStore()

// Local copy for editing
const anguloCerrado = ref(configStore.configuracion.angulo_cerrado)
const anguloAbierto = ref(configStore.configuracion.angulo_abierto)
const tiempoAbiertoMs = ref(configStore.configuracion.tiempo_abierto_ms)
const activarSacudida = ref(configStore.configuracion.activar_sacudida)
const desactivarPulso = ref(configStore.configuracion.desactivar_pulso_en_reposo)

const saveSuccess = ref(false)

// Sync when remote config arrives
watch(
  () => configStore.configuracion,
  (cfg) => {
    anguloCerrado.value = cfg.angulo_cerrado
    anguloAbierto.value = cfg.angulo_abierto
    tiempoAbiertoMs.value = cfg.tiempo_abierto_ms
    activarSacudida.value = cfg.activar_sacudida
    desactivarPulso.value = cfg.desactivar_pulso_en_reposo
  },
  { deep: true }
)

async function handleSave() {
  saveSuccess.value = false
  await configStore.actualizarConfiguracion({
    angulo_cerrado: Number(anguloCerrado.value),
    angulo_abierto: Number(anguloAbierto.value),
    tiempo_abierto_ms: Number(tiempoAbiertoMs.value),
    activar_sacudida: Boolean(activarSacudida.value),
    desactivar_pulso_en_reposo: Boolean(desactivarPulso.value),
  })
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

async function handleTestServo() {
  await deviceStore.testServoDryRun()
}
</script>

<template>
  <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 shadow-xl">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
          <Icon icon="lucide:gauge" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-white">Calibración Servomotor MG996R</h3>
          <p class="text-xs text-slate-400">Ajusta los ángulos mecánicos y tiempos sin reprogramar el microcontrolador</p>
        </div>
      </div>

      <!-- Dry Run Test Button -->
      <button
        type="button"
        @click="handleTestServo"
        :disabled="deviceStore.activeAdminCommand === 'probar_servo'"
        class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border"
        :class="[
          deviceStore.activeAdminCommand === 'probar_servo'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-wait'
            : 'bg-slate-800 hover:bg-slate-700/80 text-emerald-400 border-slate-700'
        ]"
      >
        <Icon
          :icon="deviceStore.activeAdminCommand === 'probar_servo' ? 'lucide:loader-2' : 'lucide:play'"
          class="w-4 h-4"
          :class="{ 'animate-spin': deviceStore.activeAdminCommand === 'probar_servo' }"
        />
        <span>
          {{ deviceStore.activeAdminCommand === 'probar_servo' ? 'Probando servo...' : 'Probar Servo en Seco' }}
        </span>
      </button>
    </div>

    <!-- Sliders and Inputs -->
    <div class="mt-6 space-y-6">
      <!-- Ángulo Cerrado (0° a 45°) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-slate-200">
            Ángulo de Cierre (Reposo)
          </label>
          <span class="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            {{ anguloCerrado }}°
          </span>
        </div>
        <p class="text-xs text-slate-400 mb-2">Posición hermética de la compuerta para retener las croquetas.</p>
        <div class="flex items-center gap-4">
          <input
            type="range"
            v-model.number="anguloCerrado"
            :min="SERVO_CONSTRAINTS.ANGULO_CERRADO.MIN"
            :max="SERVO_CONSTRAINTS.ANGULO_CERRADO.MAX"
            :step="SERVO_CONSTRAINTS.ANGULO_CERRADO.STEP"
            class="flex-1"
          />
          <span class="text-xs font-mono text-slate-500 w-16 text-right">0° - 45°</span>
        </div>
      </div>

      <!-- Ángulo Abierto (30° a 180°) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-slate-200">
            Ángulo de Apertura
          </label>
          <span class="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            {{ anguloAbierto }}°
          </span>
        </div>
        <p class="text-xs text-slate-400 mb-2">Giro máximo para permitir la caída del alimento.</p>
        <div class="flex items-center gap-4">
          <input
            type="range"
            v-model.number="anguloAbierto"
            :min="SERVO_CONSTRAINTS.ANGULO_ABIERTO.MIN"
            :max="SERVO_CONSTRAINTS.ANGULO_ABIERTO.MAX"
            :step="SERVO_CONSTRAINTS.ANGULO_ABIERTO.STEP"
            class="flex-1"
          />
          <span class="text-xs font-mono text-slate-500 w-16 text-right">30° - 180°</span>
        </div>
      </div>

      <!-- Tiempo Abierto (100ms a 3000ms) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-slate-200">
            Tiempo de Compuerta Abierta
          </label>
          <span class="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            {{ tiempoAbiertoMs }} ms
          </span>
        </div>
        <p class="text-xs text-slate-400 mb-2">Duración en milisegundos que permanece la compuerta abierta antes de retornar.</p>
        <div class="flex items-center gap-4">
          <input
            type="range"
            v-model.number="tiempoAbiertoMs"
            :min="SERVO_CONSTRAINTS.TIEMPO_ABIERTO_MS.MIN"
            :max="SERVO_CONSTRAINTS.TIEMPO_ABIERTO_MS.MAX"
            :step="SERVO_CONSTRAINTS.TIEMPO_ABIERTO_MS.STEP"
            class="flex-1"
          />
          <span class="text-xs font-mono text-slate-500 w-16 text-right">0.1s - 3s</span>
        </div>
      </div>

      <!-- Mechanical Switches -->
      <div class="pt-4 border-t border-slate-800 space-y-4">
        <!-- Anti-jamming Shake -->
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <span class="text-sm font-semibold text-white block">Maniobra de Sacudida Anti-Atasco</span>
            <span class="text-xs text-slate-400">Aplica micro-oscilaciones de ±5° en el pico de la botella para desatorar croquetas grandes.</span>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="activarSacudida"
            @click="activarSacudida = !activarSacudida"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="activarSacudida ? 'bg-emerald-500' : 'bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="activarSacudida ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- PWM Cutoff in Rest -->
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <span class="text-sm font-semibold text-white block">Corte de Pulso PWM en Reposo</span>
            <span class="text-xs text-slate-400">Desactiva el tren de pulsos tras cerrar para eliminar zumbido eléctrico y sobrecalentamiento del MG996R.</span>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="desactivarPulso"
            @click="desactivarPulso = !desactivarPulso"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="desactivarPulso ? 'bg-emerald-500' : 'bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="desactivarPulso ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-4 flex items-center justify-between">
        <span v-if="saveSuccess" class="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <Icon icon="lucide:check-circle" class="w-4 h-4" />
          ¡Parámetros de servo sincronizados con Firebase!
        </span>
        <span v-else></span>

        <button
          type="button"
          @click="handleSave"
          :disabled="configStore.isSaving"
          class="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Icon
            :icon="configStore.isSaving ? 'lucide:loader-2' : 'lucide:save'"
            class="w-4 h-4"
            :class="{ 'animate-spin': configStore.isSaving }"
          />
          <span>{{ configStore.isSaving ? 'Guardando...' : 'Guardar Calibración' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
