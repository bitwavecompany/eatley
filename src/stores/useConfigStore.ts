import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FeederRepository, DEFAULT_CONFIGURACION } from '@/services/feeder.repository'
import type {
  ConfiguracionDispositivo,
  ActualizarConfiguracionPayload,
} from '@/types/config.types'
import type { Unsubscribe } from 'firebase/database'

export const useConfigStore = defineStore('config', () => {
  const configuracion = ref<ConfiguracionDispositivo>({ ...DEFAULT_CONFIGURACION })
  const isInitialized = ref(false)
  const isSaving = ref(false)
  let unsub: Unsubscribe | null = null

  const isSystemPaused = computed<boolean>(() => configuracion.value.sistema_pausado)
  const cooldownDurationSec = computed<number>(() => configuracion.value.cooldown_manual_seg)
  const blackoutToleranceMin = computed<number>(() => configuracion.value.tolerancia_apagon_min)

  function init() {
    if (isInitialized.value) return
    unsub = FeederRepository.subscribeConfiguracion((data) => {
      configuracion.value = data
    })
    isInitialized.value = true
  }

  async function actualizarConfiguracion(payload: ActualizarConfiguracionPayload): Promise<void> {
    isSaving.value = true
    try {
      await FeederRepository.actualizarConfiguracion(payload)
    } finally {
      isSaving.value = false
    }
  }

  function destroy() {
    if (unsub) unsub()
    isInitialized.value = false
  }

  return {
    configuracion,
    isInitialized,
    isSaving,
    isSystemPaused,
    cooldownDurationSec,
    blackoutToleranceMin,
    init,
    destroy,
    actualizarConfiguracion,
  }
})
