<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Gauge, Loader2, Play, Save, Check, RotateCcw } from '@lucide/vue'
import { useConfigStore } from '@/stores/useConfigStore'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useToastStore } from '@/stores/useToastStore'
import HelpTooltip from '@/components/common/HelpTooltip.vue'
import { SERVO_CONSTRAINTS, SERVO_RECOMMENDED_DEFAULTS } from '@/config/constants'

const configStore = useConfigStore()
const deviceStore = useDeviceStore()
const toastStore = useToastStore()

// Local copy for form manipulation
const anguloCerrado = ref(configStore.configuracion.angulo_cerrado)
const anguloAbierto = ref(configStore.configuracion.angulo_abierto)
const tiempoAbiertoMs = ref(configStore.configuracion.tiempo_abierto_ms)
const activarSacudida = ref(configStore.configuracion.activar_sacudida)
const desactivarPulso = ref(configStore.configuracion.desactivar_pulso_en_reposo)

const saveSuccess = ref(false)
const isTesting = ref(false)

// Keep local state in sync when external configuration updates in Firebase
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

// Dirty state tracking against active configuration
const hayCambiosPendientes = computed<boolean>(() => {
  const currentCfg = configStore.configuracion
  return (
    Number(anguloCerrado.value) !== currentCfg.angulo_cerrado ||
    Number(anguloAbierto.value) !== currentCfg.angulo_abierto ||
    Number(tiempoAbiertoMs.value) !== currentCfg.tiempo_abierto_ms ||
    Boolean(activarSacudida.value) !== currentCfg.activar_sacudida ||
    Boolean(desactivarPulso.value) !== currentCfg.desactivar_pulso_en_reposo
  )
})

async function handleSave(showToast = true): Promise<boolean> {
  saveSuccess.value = false
  try {
    await configStore.actualizarConfiguracion({
      angulo_cerrado: Number(anguloCerrado.value),
      angulo_abierto: Number(anguloAbierto.value),
      tiempo_abierto_ms: Number(tiempoAbiertoMs.value),
      activar_sacudida: Boolean(activarSacudida.value),
      desactivar_pulso_en_reposo: Boolean(desactivarPulso.value),
    })
    saveSuccess.value = true
    if (showToast) {
      toastStore.success('Calibración guardada')
    }
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
    return true
  } catch {
    toastStore.error('Error al guardar calibración')
    return false
  }
}

async function handleTestMovement() {
  if (deviceStore.activeAdminCommand === 'probar_servo' || isTesting.value) return
  isTesting.value = true
  try {
    if (hayCambiosPendientes.value) {
      const saved = await handleSave(false)
      if (!saved) return
    }
    await deviceStore.testServoDryRun()
    toastStore.info('Comando de prueba enviado al ESP32')
  } catch {
    toastStore.error('Error al enviar prueba de movimiento')
  } finally {
    isTesting.value = false
  }
}

function resetToDefaults() {
  anguloCerrado.value = SERVO_RECOMMENDED_DEFAULTS.ANGULO_CERRADO
  anguloAbierto.value = SERVO_RECOMMENDED_DEFAULTS.ANGULO_ABIERTO
  tiempoAbiertoMs.value = SERVO_RECOMMENDED_DEFAULTS.TIEMPO_ABIERTO_MS
  activarSacudida.value = SERVO_RECOMMENDED_DEFAULTS.ACTIVAR_SACUDIDA
  desactivarPulso.value = SERVO_RECOMMENDED_DEFAULTS.DESACTIVAR_PULSO
  toastStore.info('Valores recomendados restablecidos en el formulario')
}
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
    <!-- Header: Jakob Nielsen #2 (Match between system and real world) -->
    <div class="pb-5 border-b border-slate-100 flex items-center gap-3">
      <div class="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
        <Gauge class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-slate-900 leading-tight">
          Calibración de compuerta y porción
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Ajusta el giro del brazo y la cantidad de comida por servida
        </p>
      </div>
    </div>

    <!-- Sliders and Inputs Section -->
    <div class="mt-6 space-y-6">
      <!-- Slider 1: Posición de cierre (reposo) -->
      <div>
        <div class="flex items-start justify-between gap-3 mb-1">
          <div>
            <div class="flex items-center gap-1.5">
              <label class="text-sm font-semibold text-slate-800">
                Posición de cierre (reposo)
              </label>
              <HelpTooltip
                title="Posición de cierre (reposo)"
                text="Ángulo en el que la tapa cierra la boca de la botella. Si queda una rendija abierta, súbelo de 2° en 2° cuidando que el motor no quede forzado."
                position="top"
                align="left"
              />
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Punto donde el brazo bloquea la salida.
            </p>
          </div>
          <span class="font-mono text-sm font-bold px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-emerald-700 shrink-0">
            {{ anguloCerrado }}°
          </span>
        </div>
        <div class="flex items-center gap-3 sm:gap-4 mt-2">
          <input
            type="range"
            v-model.number="anguloCerrado"
            :min="SERVO_CONSTRAINTS.ANGULO_CERRADO.MIN"
            :max="SERVO_CONSTRAINTS.ANGULO_CERRADO.MAX"
            :step="SERVO_CONSTRAINTS.ANGULO_CERRADO.STEP"
            class="w-full h-11 py-3 cursor-pointer accent-emerald-600 bg-transparent flex-1 touch-manipulation"
          />
          <span class="text-xs font-mono font-medium text-slate-400 w-20 sm:w-24 text-right shrink-0 whitespace-nowrap">
            0° - 45°
          </span>
        </div>
      </div>

      <!-- Slider 2: Posición de apertura -->
      <div>
        <div class="flex items-start justify-between gap-3 mb-1">
          <div>
            <div class="flex items-center gap-1.5">
              <label class="text-sm font-semibold text-slate-800">
                Posición de apertura
              </label>
              <HelpTooltip
                title="Posición de apertura"
                text="Ángulo al que se levanta el brazo. Entre 45° y 75° suele bastar para que las croquetas caigan libremente."
                position="top"
                align="left"
              />
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Amplitud del giro para dejar caer el alimento.
            </p>
          </div>
          <span class="font-mono text-sm font-bold px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-emerald-700 shrink-0">
            {{ anguloAbierto }}°
          </span>
        </div>
        <div class="flex items-center gap-3 sm:gap-4 mt-2">
          <input
            type="range"
            v-model.number="anguloAbierto"
            :min="SERVO_CONSTRAINTS.ANGULO_ABIERTO.MIN"
            :max="SERVO_CONSTRAINTS.ANGULO_ABIERTO.MAX"
            :step="SERVO_CONSTRAINTS.ANGULO_ABIERTO.STEP"
            class="w-full h-11 py-3 cursor-pointer accent-emerald-600 bg-transparent flex-1 touch-manipulation"
          />
          <span class="text-xs font-mono font-medium text-slate-400 w-20 sm:w-24 text-right shrink-0 whitespace-nowrap">
            30° - 180°
          </span>
        </div>
      </div>

      <!-- Slider 3: Tiempo de apertura (porción) -->
      <div>
        <div class="flex items-start justify-between gap-3 mb-1">
          <div>
            <div class="flex items-center gap-1.5">
              <label class="text-sm font-semibold text-slate-800">
                Tiempo de apertura (porción)
              </label>
              <HelpTooltip
                title="Tiempo de apertura (porción)"
                text="Duración que la compuerta permanece abierta antes de cerrarse. Aumenta este valor para servir porciones más grandes."
                position="top"
                align="left"
              />
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Controla cuánta comida cae en cada servida.
            </p>
          </div>
          <span class="font-mono text-xs sm:text-sm font-bold px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-emerald-700 shrink-0">
            {{ tiempoAbiertoMs }} ms ({{ (tiempoAbiertoMs / 1000).toFixed(2) }}s)
          </span>
        </div>
        <div class="flex items-center gap-3 sm:gap-4 mt-2">
          <input
            type="range"
            v-model.number="tiempoAbiertoMs"
            :min="SERVO_CONSTRAINTS.TIEMPO_ABIERTO_MS.MIN"
            :max="SERVO_CONSTRAINTS.TIEMPO_ABIERTO_MS.MAX"
            :step="SERVO_CONSTRAINTS.TIEMPO_ABIERTO_MS.STEP"
            class="w-full h-11 py-3 cursor-pointer accent-emerald-600 bg-transparent flex-1 touch-manipulation"
          />
          <span class="text-xs font-mono font-medium text-slate-400 w-28 text-right shrink-0 whitespace-nowrap">
            100 - 3000 ms
          </span>
        </div>
      </div>

      <!-- Mechanical Switches -->
      <div class="pt-4 border-t border-slate-100 space-y-3.5">
        <!-- Switch 1: Sacudida anti-atasco -->
        <div
          @click="activarSacudida = !activarSacudida"
          class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
        >
          <div class="pr-3">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-semibold text-slate-900 block">
                Sacudida anti-atasco
              </span>
              <HelpTooltip
                title="Sacudida anti-atasco"
                text="Aplica micro-oscilaciones de ±5° en el brazo para desatorar croquetas grandes en el cuello de la botella."
                position="top"
                align="left"
              />
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Vibración rápida al abrir para destrabar croquetas.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="activarSacudida"
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            :class="activarSacudida ? 'bg-emerald-600' : 'bg-slate-300'"
          >
            <span
              class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="activarSacudida ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Switch 2: Modo reposo del motor (recomendado) -->
        <div
          @click="desactivarPulso = !desactivarPulso"
          class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
        >
          <div class="pr-3">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-semibold text-slate-900 block">
                Modo reposo del motor (recomendado)
              </span>
              <HelpTooltip
                title="Modo reposo del motor"
                text="Desenergiza el servomotor al terminar de cerrar. Mantenlo activo para proteger el motor; desactívalo solo si el peso de la comida abre la tapa por sí solo."
                position="top"
                align="left"
              />
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Apaga la fuerza del motor tras cerrar para evitar zumbidos y calentamiento.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="desactivarPulso"
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            :class="desactivarPulso ? 'bg-emerald-600' : 'bg-slate-300'"
          >
            <span
              class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="desactivarPulso ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- Action Footer: Jakob Nielsen #3 (User control and freedom) & #5 (Error prevention) -->
      <div class="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <!-- Reset Button -->
        <button
          type="button"
          @click="resetToDefaults"
          class="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto self-start sm:self-auto border border-transparent hover:border-slate-200 touch-manipulation"
        >
          <RotateCcw class="w-3.5 h-3.5 text-slate-400" />
          <span>Restablecer recomendados</span>
        </button>

        <!-- Primary Action Group -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <!-- Test Movement Button -->
          <div class="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              @click="handleTestMovement"
              :disabled="deviceStore.activeAdminCommand === 'probar_servo' || isTesting"
              class="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border shadow-sm touch-manipulation"
              :class="[
                deviceStore.activeAdminCommand === 'probar_servo' || isTesting
                  ? 'bg-amber-100 text-amber-800 border-amber-300 cursor-wait'
                  : 'bg-slate-50 hover:bg-slate-100 text-emerald-800 border-slate-200 cursor-pointer active:scale-[0.98]'
              ]"
            >
              <Loader2
                v-if="deviceStore.activeAdminCommand === 'probar_servo' || isTesting"
                class="w-4 h-4 animate-spin text-amber-600"
              />
              <Play
                v-else
                class="w-4 h-4 text-emerald-600 fill-emerald-600"
              />
              <span>
                {{ deviceStore.activeAdminCommand === 'probar_servo' || isTesting ? 'Probando...' : '▷ Probar movimiento' }}
              </span>
            </button>
            <HelpTooltip
              title="Probar movimiento"
              text="Aplica los valores actuales y abre la compuerta una vez (si hay croquetas en la botella, caerá alimento)."
              position="top"
              align="right"
            />
          </div>

          <!-- Save Button (Disabled when no changes pending) -->
          <button
            type="button"
            @click="() => handleSave(true)"
            :disabled="!hayCambiosPendientes || configStore.isSaving"
            class="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 touch-manipulation"
            :class="[
              hayCambiosPendientes
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
            ]"
          >
            <Loader2
              v-if="configStore.isSaving"
              class="w-4 h-4 animate-spin"
            />
            <Check
              v-else-if="!hayCambiosPendientes"
              class="w-4 h-4 text-slate-400"
            />
            <Save
              v-else
              class="w-4 h-4 text-white"
            />
            <span>
              {{ configStore.isSaving ? 'Guardando...' : (hayCambiosPendientes ? 'Guardar calibración' : 'Sin cambios pendientes') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
