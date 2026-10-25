import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useDeviceStore } from '@/stores/useDeviceStore'
import type { AlarmaPerdidaInfo } from '@/types/alarm.types'

export function useMissedAlarms() {
  const alarmsStore = useAlarmsStore()
  const configStore = useConfigStore()
  const deviceStore = useDeviceStore()

  const nowTick = ref(new Date())
  let intervalId: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    intervalId = setInterval(() => {
      nowTick.value = new Date()
    }, 15000) // check every 15s
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  const alarmasPerdidas = computed<AlarmaPerdidaInfo[]>(() => {
    // If system is globally paused, alarms are frozen
    if (configStore.isSystemPaused) {
      return []
    }

    const todayDate = nowTick.value
    const todayStr = todayDate.toISOString().split('T')[0]
    const currentDay = todayDate.getDay() // 0 = Sunday
    const currentTotalMin = todayDate.getHours() * 60 + todayDate.getMinutes()
    const tolerance = configStore.blackoutToleranceMin
    const esp32MissedId = deviceStore.estadoEsp32?.alarma_perdida_id

    const result: AlarmaPerdidaInfo[] = []

    for (const alarma of alarmsStore.alarmasActivas) {
      // Check if already handled today
      if (alarma.ultima_ejecucion_fecha === todayStr || alarma.omitida_hoy_fecha === todayStr) {
        continue
      }

      // Check if applies today
      let appliesToday = false
      if (alarma.tipo_repeticion === 'dias_semana') {
        appliesToday = alarma.dias_semana.includes(currentDay)
      } else if (alarma.tipo_repeticion === 'una_vez') {
        appliesToday = true
      } else if (alarma.tipo_repeticion === 'fecha_especifica') {
        appliesToday = alarma.fecha_especifica === todayStr
      }

      if (!appliesToday) {
        continue
      }

      const [hStr, mStr] = alarma.hora.split(':')
      const scheduledTotalMin = Number(hStr) * 60 + Number(mStr)
      const diffMin = currentTotalMin - scheduledTotalMin

      const isReportedByEsp32 = esp32MissedId === alarma.id
      const isOverdueWithTolerance = diffMin >= tolerance

      if (isReportedByEsp32 || isOverdueWithTolerance) {
        result.push({
          alarma,
          motivo: isReportedByEsp32 ? 'reportada_por_esp32' : 'hora_vencida',
          minutosAtraso: Math.max(0, diffMin),
          horaProgramada: alarma.hora,
        })
      }
    }

    return result
  })

  const primeraAlarmaPerdida = computed<AlarmaPerdidaInfo | null>(() => {
    return alarmasPerdidas.value.length > 0 ? alarmasPerdidas.value[0] : null
  })

  async function atenderAlarmaPerdida(id: string): Promise<void> {
    await alarmsStore.dispensarAlarmaPerdida(id)
  }

  async function omitirAlarmaPerdida(id: string): Promise<void> {
    await alarmsStore.omitirAlarmaHoy(id)
  }

  return {
    alarmasPerdidas,
    primeraAlarmaPerdida,
    atenderAlarmaPerdida,
    omitirAlarmaPerdida,
  }
}
