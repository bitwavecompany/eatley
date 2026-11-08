<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ShieldAlert, Loader2, Save, Check } from '@lucide/vue'
import { useConfigStore } from '@/stores/useConfigStore'
import { useToastStore } from '@/stores/useToastStore'
import HelpTooltip from '@/components/common/HelpTooltip.vue'
import { OPERATIONAL_CONSTRAINTS, clamp } from '@/config/constants'

const configStore = useConfigStore()
const toastStore = useToastStore()

// Local editable copies
const toleranciaApagon = ref(configStore.configuracion.tolerancia_apagon_min)
const cooldownSeg = ref(configStore.configuracion.cooldown_manual_seg)
const saveSuccess = ref(false)

// Sync from Firebase
watch(
  () => configStore.configuracion,
  (cfg) => {
    toleranciaApagon.value = cfg.tolerancia_apagon_min
    cooldownSeg.value = cfg.cooldown_manual_seg
  },
  { deep: true }
)

// Dirty state: checks if any value differs from Firebase snapshot
const hayCambiosReglas = computed<boolean>(() => {
  return (
    Number(toleranciaApagon.value) !== configStore.configuracion.tolerancia_apagon_min ||
    Number(cooldownSeg.value) !== configStore.configuracion.cooldown_manual_seg
  )
})

async function handleSave() {
  if (!hayCambiosReglas.value || configStore.isSaving) return
  saveSuccess.value = false
  try {
    const validatedTolerancia = clamp(
      Number(toleranciaApagon.value),
      OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.MIN,
      OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.MAX
    )
    const validatedCooldown = clamp(
      Number(cooldownSeg.value),
      OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.MIN,
      OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.MAX
    )

    toleranciaApagon.value = validatedTolerancia
    cooldownSeg.value = validatedCooldown

    await configStore.actualizarConfiguracion({
      tolerancia_apagon_min: validatedTolerancia,
      cooldown_manual_seg: validatedCooldown,
      usar_microswitch: false, // Fijo en false por defecto (sin sensor físico)
    })
    saveSuccess.value = true
    toastStore.success('Reglas operativas guardadas')
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch {
    toastStore.error('Error al guardar las reglas')
  }
}
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
    <!-- Header: Jakob Nielsen #2 (Match between system and real world) -->
    <div class="flex items-center gap-3 pb-5 border-b border-slate-100">
      <div class="p-2.5 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
        <ShieldAlert class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-slate-900 leading-tight">
          Seguridad y reglas operativas
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Margen de recuperación ante apagones y espera entre servidas
        </p>
      </div>
    </div>

    <!-- Sliders Section -->
    <div class="mt-6 space-y-6">
      <!-- Slider 1: Recuperación tras corte de luz -->
      <div>
        <div class="flex items-start justify-between gap-3 mb-1">
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <label class="text-sm font-semibold text-slate-800">
                Recuperación tras corte de luz
              </label>
              <HelpTooltip
                title="Recuperación tras corte de luz"
                text="Ventana de gracia: si ocurre un corte eléctrico a la hora de una alarma y la luz vuelve dentro de este tiempo, el ESP32 dispensará la porción de inmediato. Si el corte dura más tiempo, omitirá esa comida para evitar desfases y registrará un aviso."
                position="top"
                align="left"
              />
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Margen de tiempo para servir una comida atrasada cuando regresa la energía.
            </p>
          </div>
          <span class="font-mono text-sm font-bold px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
            {{ toleranciaApagon }} min
          </span>
        </div>

        <div class="flex items-center gap-3 sm:gap-4 mt-2">
          <input
            type="range"
            v-model.number="toleranciaApagon"
            :min="OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.MIN"
            :max="OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.MAX"
            :step="OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.STEP"
            class="w-full h-11 py-3 cursor-pointer accent-amber-500 bg-transparent flex-1 touch-manipulation"
          />
          <span class="text-xs font-mono font-medium text-slate-400 w-24 text-right shrink-0 whitespace-nowrap">
            1 - 120 min
          </span>
        </div>
      </div>

      <!-- Slider 2: Tiempo de espera del botón manual (Cooldown) -->
      <div>
        <div class="flex items-start justify-between gap-3 mb-1">
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <label class="text-sm font-semibold text-slate-800">
                Tiempo de espera del botón manual
              </label>
              <HelpTooltip
                title="Tiempo de espera del botón manual"
                text="Protección anti-doble clic: segundos que el botón de dispensación manual permanece inactivo tras ser presionado, evitando sobrealimentar a la mascota por accidentes o impaciencia."
                position="top"
                align="left"
              />
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Bloqueo temporal del botón tras dispensar para evitar pulsaciones repetidas por error.
            </p>
          </div>
          <span class="font-mono text-sm font-bold px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-emerald-700 shrink-0">
            {{ cooldownSeg }} s
          </span>
        </div>

        <div class="flex items-center gap-3 sm:gap-4 mt-2">
          <input
            type="range"
            v-model.number="cooldownSeg"
            :min="OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.MIN"
            :max="OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.MAX"
            :step="OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.STEP"
            class="w-full h-11 py-3 cursor-pointer accent-emerald-600 bg-transparent flex-1 touch-manipulation"
          />
          <span class="text-xs font-mono font-medium text-slate-400 w-24 text-right shrink-0 whitespace-nowrap">
            3 - 60 s
          </span>
        </div>
      </div>

      <!-- Action Footer: Dirty State & Mobile-First -->
      <div class="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <button
          type="button"
          @click="handleSave"
          :disabled="!hayCambiosReglas || configStore.isSaving"
          class="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 touch-manipulation"
          :class="[
            hayCambiosReglas
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
          ]"
        >
          <Loader2
            v-if="configStore.isSaving"
            class="w-4 h-4 animate-spin"
          />
          <Check
            v-else-if="!hayCambiosReglas"
            class="w-4 h-4 text-slate-400"
          />
          <Save
            v-else
            class="w-4 h-4 text-white"
          />
          <span>
            {{ configStore.isSaving ? 'Guardando...' : (hayCambiosReglas ? 'Guardar reglas' : 'Sin cambios pendientes') }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
