import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FeederRepository } from '@/services/feeder.repository'
import { useDeviceStore } from './useDeviceStore'
import type {
  Alarma,
  CrearAlarmaPayload,
  ActualizarAlarmaPayload,
} from '@/types/alarm.types'
import type { Unsubscribe } from 'firebase/database'

export const useAlarmsStore = defineStore('alarms', () => {
  const alarmas = ref<Alarma[]>([])
  const isInitialized = ref(false)
  let unsub: Unsubscribe | null = null

  const alarmasOrdenadas = computed<Alarma[]>(() => {
    return [...alarmas.value].sort((a, b) => a.hora.localeCompare(b.hora))
  })

  const alarmasActivas = computed<Alarma[]>(() => {
    return alarmasOrdenadas.value.filter((a) => a.activa)
  })

  /**
   * Calculates the next active alarm relative to current time
   */
  const proximaAlarma = computed<{
    alarma: Alarma
    esHoy: boolean
    minutosRestantes: number
  } | null>(() => {
    if (alarmasActivas.value.length === 0) return null

    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    const currentTotalMin = currentHour * 60 + currentMin
    const todayStr = now.toISOString().split('T')[0]

    let candidate: { alarma: Alarma; esHoy: boolean; minutosRestantes: number } | null = null
    let minDiff = Infinity

    for (const a of alarmasActivas.value) {
      const [hStr, mStr] = a.hora.split(':')
      const h = Number(hStr)
      const m = Number(mStr)
      const aTotalMin = h * 60 + m

      // Check if applies today
      let appliesToday = false
      if (a.tipo_repeticion === 'dias_semana') {
        appliesToday = (a.dias_semana || []).includes(currentDay)
      } else if (a.tipo_repeticion === 'una_vez') {
        appliesToday = true
      } else if (a.tipo_repeticion === 'fecha_especifica') {
        appliesToday = a.fecha_especifica === todayStr
      }

      if (appliesToday && aTotalMin > currentTotalMin) {
        const diff = aTotalMin - currentTotalMin
        if (diff < minDiff) {
          minDiff = diff
          candidate = { alarma: a, esHoy: true, minutosRestantes: diff }
        }
      }
    }

    // If no alarm remaining for today, check the earliest one tomorrow
    if (!candidate) {
      const tomorrowDay = (currentDay + 1) % 7
      let earliestDiffTomorrow = Infinity
      let tomorrowCandidate: Alarma | null = null

      for (const a of alarmasActivas.value) {
        let appliesTomorrow = false
        if (a.tipo_repeticion === 'dias_semana') {
          appliesTomorrow = (a.dias_semana || []).includes(tomorrowDay)
        } else if (a.tipo_repeticion === 'una_vez') {
          appliesTomorrow = true
        }

        if (appliesTomorrow) {
          const [hStr, mStr] = a.hora.split(':')
          const totalMin = Number(hStr) * 60 + Number(mStr)
          if (totalMin < earliestDiffTomorrow) {
            earliestDiffTomorrow = totalMin
            tomorrowCandidate = a
          }
        }
      }

      if (tomorrowCandidate) {
        const diff = (24 * 60 - currentTotalMin) + earliestDiffTomorrow
        candidate = { alarma: tomorrowCandidate, esHoy: false, minutosRestantes: diff }
      }
    }

    return candidate
  })

  function init() {
    if (isInitialized.value) return
    unsub = FeederRepository.subscribeAlarmas((data) => {
      alarmas.value = data
    })
    isInitialized.value = true
  }

  async function crearAlarma(payload: CrearAlarmaPayload): Promise<string> {
    return await FeederRepository.crearAlarma(payload)
  }

  async function actualizarAlarma(id: string, payload: ActualizarAlarmaPayload): Promise<void> {
    await FeederRepository.actualizarAlarma(id, payload)
  }

  async function toggleAlarma(id: string): Promise<void> {
    const item = alarmas.value.find((a) => a.id === id)
    if (!item) return
    await FeederRepository.actualizarAlarma(id, { activa: !item.activa })
  }

  async function eliminarAlarma(id: string): Promise<void> {
    await FeederRepository.eliminarAlarma(id)
  }

  async function omitirAlarmaHoy(id: string): Promise<void> {
    const todayStr = new Date().toISOString().split('T')[0]
    await FeederRepository.actualizarAlarma(id, { omitida_hoy_fecha: todayStr })
  }

  async function dispensarAlarmaPerdida(id: string): Promise<void> {
    const deviceStore = useDeviceStore()
    const todayStr = new Date().toISOString().split('T')[0]
    await FeederRepository.actualizarAlarma(id, {
      ultima_ejecucion_fecha: todayStr,
      omitida_hoy_fecha: null,
    })
    await deviceStore.triggerManualFeed('recuperacion_alarma_perdida')
  }

  function destroy() {
    if (unsub) unsub()
    isInitialized.value = false
  }

  return {
    alarmas,
    alarmasOrdenadas,
    alarmasActivas,
    proximaAlarma,
    isInitialized,
    init,
    destroy,
    crearAlarma,
    actualizarAlarma,
    toggleAlarma,
    eliminarAlarma,
    omitirAlarmaHoy,
    dispensarAlarmaPerdida,
  }
})
