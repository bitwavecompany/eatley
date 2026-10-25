import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { FeederRepository } from '@/services/feeder.repository'
import type { EventoHistorial } from '@/types/history.types'
import type { Unsubscribe } from 'firebase/database'

export const useHistoryStore = defineStore('history', () => {
  const historial = ref<EventoHistorial[]>([])
  const isInitialized = ref(false)
  let unsub: Unsubscribe | null = null

  const ultimosTresEventos = computed<EventoHistorial[]>(() => {
    return historial.value.slice(0, 3)
  })

  const totalEventos = computed<number>(() => {
    return historial.value.length
  })

  const eventosHoy = computed<EventoHistorial[]>(() => {
    const today = new Date().toDateString()
    return historial.value.filter((e) => new Date(e.timestamp).toDateString() === today)
  })

  function init() {
    if (isInitialized.value) return
    unsub = FeederRepository.subscribeHistorial((data) => {
      historial.value = data
    })
    isInitialized.value = true
  }

  async function limpiarHistorial(): Promise<void> {
    await FeederRepository.limpiarHistorial()
  }

  onUnmounted(() => {
    if (unsub) unsub()
  })

  return {
    historial,
    isInitialized,
    ultimosTresEventos,
    totalEventos,
    eventosHoy,
    init,
    limpiarHistorial,
  }
})
