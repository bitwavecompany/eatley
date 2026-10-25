<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useConfigStore } from '@/stores/useConfigStore'
import { OPERATIONAL_CONSTRAINTS } from '@/config/constants'

const configStore = useConfigStore()

const toleranciaApagon = ref(configStore.configuracion.tolerancia_apagon_min)
const cooldownSeg = ref(configStore.configuracion.cooldown_manual_seg)
const sistemaPausado = ref(configStore.configuracion.sistema_pausado)
const usarMicroswitch = ref(configStore.configuracion.usar_microswitch)

const saveSuccess = ref(false)

watch(
  () => configStore.configuracion,
  (cfg) => {
    toleranciaApagon.value = cfg.tolerancia_apagon_min
    cooldownSeg.value = cfg.cooldown_manual_seg
    sistemaPausado.value = cfg.sistema_pausado
    usarMicroswitch.value = cfg.usar_microswitch
  },
  { deep: true }
)

async function handleSave() {
  saveSuccess.value = false
  await configStore.actualizarConfiguracion({
    tolerancia_apagon_min: Number(toleranciaApagon.value),
    cooldown_manual_seg: Number(cooldownSeg.value),
    sistema_pausado: Boolean(sistemaPausado.value),
    usar_microswitch: Boolean(usarMicroswitch.value),
  })
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}
</script>

<template>
  <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 shadow-xl">
    <!-- Header -->
    <div class="flex items-center gap-3 pb-5 border-b border-slate-800">
      <div class="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
        <Icon icon="lucide:shield-alert" class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-white">Reglas Operativas y Contingencia</h3>
        <p class="text-xs text-slate-400">Comportamiento ante cortes de energía, seguridad manual y sensores</p>
      </div>
    </div>

    <div class="mt-6 space-y-6">
      <!-- Tolerancia Apagón (1 a 120 min) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-slate-200">
            Tolerancia tras Corte Eléctrico
          </label>
          <span class="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
            {{ toleranciaApagon }} min
          </span>
        </div>
        <p class="text-xs text-slate-400 mb-2">
          Ventana de gracia: si la luz regresa dentro de este tiempo después de una alarma, el ESP32 la dispensará de inmediato; si pasa más tiempo, generará alerta de alarma perdida.
        </p>
        <div class="flex items-center gap-4">
          <input
            type="range"
            v-model.number="toleranciaApagon"
            :min="OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.MIN"
            :max="OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.MAX"
            :step="OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.STEP"
            class="flex-1 accent-amber-500"
          />
          <span class="text-xs font-mono text-slate-500 w-16 text-right">1m - 120m</span>
        </div>
      </div>

      <!-- Cooldown Manual (3 a 60 seg) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-slate-200">
            Cooldown Anti-Doble Clic (Botón Manual)
          </label>
          <span class="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            {{ cooldownSeg }} seg
          </span>
        </div>
        <p class="text-xs text-slate-400 mb-2">
          Tiempo en segundos que se bloquea el botón en la interfaz tras dispensar para evitar sobrealimentar por error.
        </p>
        <div class="flex items-center gap-4">
          <input
            type="range"
            v-model.number="cooldownSeg"
            :min="OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.MIN"
            :max="OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.MAX"
            :step="OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.STEP"
            class="flex-1"
          />
          <span class="text-xs font-mono text-slate-500 w-16 text-right">3s - 60s</span>
        </div>
      </div>

      <!-- Switches -->
      <div class="pt-4 border-t border-slate-800 space-y-4">
        <!-- Modo Pausa Global -->
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <span class="text-sm font-semibold text-white block">Pausa Global del Sistema (Vacaciones)</span>
            <span class="text-xs text-slate-400">Congela la ejecución de todas las alarmas programadas sin borrarlas. El botón manual sigue disponible.</span>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="sistemaPausado"
            @click="sistemaPausado = !sistemaPausado"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="sistemaPausado ? 'bg-amber-500' : 'bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="sistemaPausado ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Soporte Microswitch -->
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <span class="text-sm font-semibold text-white block">Verificación Física por Microswitch (GPIO21)</span>
            <span class="text-xs text-slate-400">Activa la comprobación mecánica del recorrido de la compuerta para registrar atascos en el historial.</span>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="usarMicroswitch"
            @click="usarMicroswitch = !usarMicroswitch"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="usarMicroswitch ? 'bg-emerald-500' : 'bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="usarMicroswitch ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-4 flex items-center justify-between">
        <span v-if="saveSuccess" class="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <Icon icon="lucide:check-circle" class="w-4 h-4" />
          ¡Reglas operativas actualizadas en Firebase!
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
          <span>{{ configStore.isSaving ? 'Guardando...' : 'Guardar Reglas' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
