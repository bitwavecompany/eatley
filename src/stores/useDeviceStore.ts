import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { FeederRepository } from '@/services/feeder.repository'
import { env } from '@/config/env'
import type {
  DisparoManual,
  EstadoEsp32,
  ComandoAdmin,
  OrigenDisparoManual,
  NivelSenalWifi,
  FirebaseConnectionState,
} from '@/types/device.types'
import type { Unsubscribe } from 'firebase/database'

export const useDeviceStore = defineStore('device', () => {
  const disparoManual = ref<DisparoManual | null>(null)
  const estadoEsp32 = ref<EstadoEsp32 | null>(null)
  const isInitialized = ref(false)
  const currentTime = ref(Date.now())
  const isFirebaseConnected = ref<boolean>(false)

  // Internal unsubscribers
  let unsubDisparo: Unsubscribe | null = null
  let unsubEstado: Unsubscribe | null = null
  let unsubFirebaseConn: Unsubscribe | null = null
  let timerInterval: ReturnType<typeof setInterval> | null = null

  // Cloud / Firebase connection status
  const firebaseConnectionStatus = computed<FirebaseConnectionState>(() => {
    if (isFirebaseConnected.value) return 'conectado'
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'desconectado'
    return 'reconectando'
  })

  // Hardware / ESP32 Heartbeat tracking
  const isOnline = computed<boolean>(() => {
    if (!estadoEsp32.value?.ultima_conexion) return false
    const diffSec = (currentTime.value - estadoEsp32.value.ultima_conexion) / 1000
    return diffSec <= env.esp32OfflineThresholdSec
  })

  const secondsSinceHeartbeat = computed<number>(() => {
    if (!estadoEsp32.value?.ultima_conexion) return 9999
    return Math.max(0, Math.floor((currentTime.value - estadoEsp32.value.ultima_conexion) / 1000))
  })

  const wifiLevel = computed<NivelSenalWifi>(() => {
    if (!isOnline.value || !estadoEsp32.value) return 'desconocida'
    const rssi = estadoEsp32.value.rssi_dbm
    if (rssi >= -60) return 'excelente'
    if (rssi >= -72) return 'buena'
    if (rssi >= -82) return 'regular'
    return 'debil'
  })

  const isDispensing = computed<boolean>(() => {
    return Boolean(disparoManual.value?.pendiente)
  })

  const activeAdminCommand = computed<ComandoAdmin>(() => {
    return estadoEsp32.value?.comando_admin || 'ninguno'
  })

  const uptimeFormatted = computed<string>(() => {
    const totalSec = estadoEsp32.value?.uptime_seg || 0
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m ${seconds}s`
  })

  function init() {
    if (isInitialized.value) return

    // Live clock for heartbeat calculation
    timerInterval = setInterval(() => {
      currentTime.value = Date.now()
    }, 1000)

    unsubFirebaseConn = FeederRepository.subscribeToFirebaseConnection((connected) => {
      isFirebaseConnected.value = connected
    })

    unsubDisparo = FeederRepository.subscribeDisparoManual((data) => {
      disparoManual.value = data
    })

    unsubEstado = FeederRepository.subscribeEstadoEsp32((data) => {
      estadoEsp32.value = data
    })

    isInitialized.value = true
  }

  async function triggerManualFeed(origen: OrigenDisparoManual = 'boton_principal'): Promise<void> {
    await FeederRepository.setDisparoManual(true, origen)
  }

  async function sendAdminCommand(cmd: ComandoAdmin): Promise<void> {
    await FeederRepository.enviarComandoAdmin(cmd)
  }

  async function rebootEsp32(): Promise<void> {
    await sendAdminCommand('reiniciar_esp32')
  }

  async function testServoDryRun(): Promise<void> {
    await sendAdminCommand('probar_servo')
  }

  onUnmounted(() => {
    if (unsubFirebaseConn) unsubFirebaseConn()
    if (unsubDisparo) unsubDisparo()
    if (unsubEstado) unsubEstado()
    if (timerInterval) clearInterval(timerInterval)
  })

  return {
    disparoManual,
    estadoEsp32,
    isInitialized,
    isFirebaseConnected,
    firebaseConnectionStatus,
    isOnline,
    secondsSinceHeartbeat,
    wifiLevel,
    isDispensing,
    activeAdminCommand,
    uptimeFormatted,
    init,
    triggerManualFeed,
    sendAdminCommand,
    rebootEsp32,
    testServoDryRun,
  }
})
