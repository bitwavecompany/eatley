import {
  ref,
  onValue,
  set,
  update,
  push,
  remove,
  type Unsubscribe,
} from 'firebase/database'
import { getFirebaseDb } from './firebase.client'
import { DB_PATHS, SERVO_CONSTRAINTS, OPERATIONAL_CONSTRAINTS } from '@/config/constants'
import type {
  Alarma,
  CrearAlarmaPayload,
  ActualizarAlarmaPayload,
} from '@/types/alarm.types'
import type {
  ConfiguracionDispositivo,
  ActualizarConfiguracionPayload,
} from '@/types/config.types'
import type {
  DisparoManual,
  EstadoEsp32,
  ComandoAdmin,
  OrigenDisparoManual,
} from '@/types/device.types'
import type {
  EventoHistorial,
  RegistrarEventoHistorialPayload,
} from '@/types/history.types'

/**
 * Default fallback configuration
 */
export const DEFAULT_CONFIGURACION: ConfiguracionDispositivo = {
  angulo_cerrado: SERVO_CONSTRAINTS.ANGULO_CERRADO.DEFAULT,
  angulo_abierto: SERVO_CONSTRAINTS.ANGULO_ABIERTO.DEFAULT,
  tiempo_abierto_ms: SERVO_CONSTRAINTS.TIEMPO_ABIERTO_MS.DEFAULT,
  activar_sacudida: SERVO_CONSTRAINTS.ACTIVAR_SACUDIDA_DEFAULT,
  desactivar_pulso_en_reposo: SERVO_CONSTRAINTS.DESACTIVAR_PULSO_DEFAULT,
  tolerancia_apagon_min: OPERATIONAL_CONSTRAINTS.TOLERANCIA_APAGON_MIN.DEFAULT,
  cooldown_manual_seg: OPERATIONAL_CONSTRAINTS.COOLDOWN_MANUAL_SEG.DEFAULT,
  sistema_pausado: OPERATIONAL_CONSTRAINTS.SISTEMA_PAUSADO_DEFAULT,
  usar_microswitch: OPERATIONAL_CONSTRAINTS.USAR_MICROSWITCH_DEFAULT,
}

/**
 * Local in-memory state for unconfigured/local mode (Empty, zero mock data)
 */
class LocalMockStore {
  disparoManual: DisparoManual = {
    pendiente: false,
    solicitado_en: 0,
    origen_solicitud: 'boton_principal',
  }

  alarmas: Map<string, Alarma> = new Map()

  configuracion: ConfiguracionDispositivo = { ...DEFAULT_CONFIGURACION }

  estadoEsp32: EstadoEsp32 | null = null

  historial: EventoHistorial[] = []

  // Subscribers
  listeners = {
    disparoManual: new Set<(val: DisparoManual) => void>(),
    alarmas: new Set<(val: Alarma[]) => void>(),
    configuracion: new Set<(val: ConfiguracionDispositivo) => void>(),
    estadoEsp32: new Set<(val: EstadoEsp32 | null) => void>(),
    historial: new Set<(val: EventoHistorial[]) => void>(),
  }

  notifyDisparo() {
    this.listeners.disparoManual.forEach((cb) => cb({ ...this.disparoManual }))
  }

  notifyAlarmas() {
    this.listeners.alarmas.forEach((cb) => cb(Array.from(this.alarmas.values())))
  }

  notifyConfig() {
    this.listeners.configuracion.forEach((cb) => cb({ ...this.configuracion }))
  }

  notifyEstado() {
    this.listeners.estadoEsp32.forEach((cb) => cb(this.estadoEsp32 ? { ...this.estadoEsp32 } : null))
  }

  notifyHistorial() {
    this.listeners.historial.forEach((cb) => cb([...this.historial]))
  }
}

const localMock = new LocalMockStore()

/**
 * Feeder Repository: Central abstraction for Firebase Realtime Database
 */
export const FeederRepository = {
  // ==========================================
  // CONEXIÓN NUBE / FIREBASE (.info/connected)
  // ==========================================
  subscribeToFirebaseConnection(callback: (isConnected: boolean) => void): Unsubscribe {
    const db = getFirebaseDb()
    if (!db) {
      callback(false)
      return () => {}
    }

    const connectedRef = ref(db, '.info/connected')
    return onValue(connectedRef, (snap) => {
      callback(snap.val() === true)
    })
  },

  // ==========================================
  // DISPARO MANUAL
  // ==========================================
  subscribeDisparoManual(callback: (data: DisparoManual | null) => void): Unsubscribe {
    const db = getFirebaseDb()
    if (!db) {
      callback({ ...localMock.disparoManual })
      localMock.listeners.disparoManual.add(callback)
      return () => localMock.listeners.disparoManual.delete(callback)
    }

    const nodeRef = ref(db, DB_PATHS.DISPARO_MANUAL)
    return onValue(nodeRef, (snapshot) => {
      const val = snapshot.val() as DisparoManual | null
      callback(val)
    })
  },

  async setDisparoManual(pendiente: boolean, origen: OrigenDisparoManual): Promise<void> {
    const db = getFirebaseDb()
    const payload: DisparoManual = {
      pendiente,
      solicitado_en: Date.now(),
      origen_solicitud: origen,
    }

    if (!db) {
      localMock.disparoManual = payload
      localMock.notifyDisparo()

      // In local mode, simulate immediate completion without hanging
      if (pendiente) {
        setTimeout(() => {
          localMock.disparoManual.pendiente = false
          localMock.notifyDisparo()

          const event: EventoHistorial = {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            origen: 'manual',
            alarma_etiqueta: null,
            estado_esp32: 'completado',
            confirmacion_microswitch: localMock.configuracion.usar_microswitch ? 'verificado' : 'no_aplicable',
            duracion_abierto_ms: localMock.configuracion.tiempo_abierto_ms,
          }
          localMock.historial.unshift(event)
          localMock.notifyHistorial()
        }, 1000)
      }
      return
    }

    const nodeRef = ref(db, DB_PATHS.DISPARO_MANUAL)
    await set(nodeRef, payload)
  },

  // ==========================================
  // ALARMAS
  // ==========================================
  subscribeAlarmas(callback: (alarmas: Alarma[]) => void): Unsubscribe {
    const db = getFirebaseDb()
    if (!db) {
      callback(Array.from(localMock.alarmas.values()))
      localMock.listeners.alarmas.add(callback)
      return () => localMock.listeners.alarmas.delete(callback)
    }

    const nodeRef = ref(db, DB_PATHS.ALARMAS)
    return onValue(nodeRef, (snapshot) => {
      const data = snapshot.val() as Record<string, Alarma> | null
      if (!data) {
        callback([])
        return
      }
      const list = Object.entries(data).map(([key, item]) => ({
        ...item,
        id: item.id || key,
        dias_semana: Array.isArray(item.dias_semana) ? item.dias_semana : [],
        fecha_especifica: item.fecha_especifica ?? null,
        ultima_ejecucion_fecha: item.ultima_ejecucion_fecha ?? null,
        omitida_hoy_fecha: item.omitida_hoy_fecha ?? null,
      }))
      callback(list)
    })
  },

  async crearAlarma(payload: CrearAlarmaPayload): Promise<string> {
    const db = getFirebaseDb()
    const now = Date.now()

    if (!db) {
      const newId = `alarm-${now}`
      const nuevaAlarma: Alarma = {
        ...payload,
        id: newId,
        creada_en: now,
        ultima_ejecucion_fecha: payload.ultima_ejecucion_fecha ?? null,
        omitida_hoy_fecha: payload.omitida_hoy_fecha ?? null,
      }
      localMock.alarmas.set(newId, nuevaAlarma)
      localMock.notifyAlarmas()
      return newId
    }

    const alarmasRef = ref(db, DB_PATHS.ALARMAS)
    const newAlarmRef = push(alarmasRef)
    const newId = newAlarmRef.key as string

    const nuevaAlarma: Alarma = {
      ...payload,
      id: newId,
      creada_en: now,
      ultima_ejecucion_fecha: payload.ultima_ejecucion_fecha ?? null,
      omitida_hoy_fecha: payload.omitida_hoy_fecha ?? null,
    }

    await set(newAlarmRef, nuevaAlarma)
    return newId
  },

  async actualizarAlarma(id: string, payload: ActualizarAlarmaPayload): Promise<void> {
    const db = getFirebaseDb()
    if (!db) {
      const current = localMock.alarmas.get(id)
      if (current) {
        localMock.alarmas.set(id, { ...current, ...payload })
        localMock.notifyAlarmas()
      }
      return
    }

    const itemRef = ref(db, `${DB_PATHS.ALARMAS}/${id}`)
    await update(itemRef, payload)
  },

  async eliminarAlarma(id: string): Promise<void> {
    const db = getFirebaseDb()
    if (!db) {
      localMock.alarmas.delete(id)
      localMock.notifyAlarmas()
      return
    }

    const itemRef = ref(db, `${DB_PATHS.ALARMAS}/${id}`)
    await remove(itemRef)
  },

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================
  subscribeConfiguracion(callback: (config: ConfiguracionDispositivo) => void): Unsubscribe {
    const db = getFirebaseDb()
    if (!db) {
      callback({ ...localMock.configuracion })
      localMock.listeners.configuracion.add(callback)
      return () => localMock.listeners.configuracion.delete(callback)
    }

    const nodeRef = ref(db, DB_PATHS.CONFIGURACION)
    return onValue(nodeRef, (snapshot) => {
      const data = snapshot.val() as ConfiguracionDispositivo | null
      if (data) {
        callback({ ...DEFAULT_CONFIGURACION, ...data })
      } else {
        void set(nodeRef, DEFAULT_CONFIGURACION)
        callback({ ...DEFAULT_CONFIGURACION })
      }
    })
  },

  async actualizarConfiguracion(payload: ActualizarConfiguracionPayload): Promise<void> {
    const db = getFirebaseDb()
    if (!db) {
      localMock.configuracion = { ...localMock.configuracion, ...payload }
      localMock.notifyConfig()
      return
    }

    const nodeRef = ref(db, DB_PATHS.CONFIGURACION)
    await update(nodeRef, payload)
  },

  // ==========================================
  // ESTADO ESP32
  // ==========================================
  subscribeEstadoEsp32(callback: (estado: EstadoEsp32 | null) => void): Unsubscribe {
    const db = getFirebaseDb()
    if (!db) {
      callback(localMock.estadoEsp32 ? { ...localMock.estadoEsp32 } : null)
      localMock.listeners.estadoEsp32.add(callback)
      return () => localMock.listeners.estadoEsp32.delete(callback)
    }

    const nodeRef = ref(db, DB_PATHS.ESTADO_ESP32)
    return onValue(nodeRef, (snapshot) => {
      const data = snapshot.val() as EstadoEsp32 | null
      callback(data)
    })
  },

  async enviarComandoAdmin(comando: ComandoAdmin): Promise<void> {
    const db = getFirebaseDb()
    if (!db) {
      if (localMock.estadoEsp32) {
        localMock.estadoEsp32.comando_admin = comando
        localMock.notifyEstado()
        if (comando !== 'ninguno') {
          setTimeout(() => {
            if (localMock.estadoEsp32) {
              localMock.estadoEsp32.comando_admin = 'ninguno'
              localMock.notifyEstado()
            }
          }, 2000)
        }
      }
      return
    }

    const nodeRef = ref(db, `${DB_PATHS.ESTADO_ESP32}/comando_admin`)
    await set(nodeRef, comando)
  },

  // ==========================================
  // HISTORIAL
  // ==========================================
  subscribeHistorial(callback: (eventos: EventoHistorial[]) => void): Unsubscribe {
    const db = getFirebaseDb()
    if (!db) {
      callback([...localMock.historial])
      localMock.listeners.historial.add(callback)
      return () => localMock.listeners.historial.delete(callback)
    }

    const nodeRef = ref(db, DB_PATHS.HISTORIAL)
    return onValue(nodeRef, (snapshot) => {
      const data = snapshot.val() as Record<string, EventoHistorial> | null
      if (!data) {
        callback([])
        return
      }

      const list = Object.entries(data)
        .map(([key, item]) => ({
          ...item,
          id: item.id || key,
        }))
        .sort((a, b) => b.timestamp - a.timestamp)

      callback(list)
    })
  },

  async registrarEventoHistorial(payload: RegistrarEventoHistorialPayload): Promise<string> {
    const db = getFirebaseDb()
    if (!db) {
      const newId = `evt-${Date.now()}`
      const newEvent: EventoHistorial = { ...payload, id: newId }
      localMock.historial.unshift(newEvent)
      localMock.notifyHistorial()
      return newId
    }

    const histRef = ref(db, DB_PATHS.HISTORIAL)
    const newRef = push(histRef)
    const id = newRef.key as string
    const newEvent: EventoHistorial = { ...payload, id }
    await set(newRef, newEvent)
    return id
  },

  async limpiarHistorial(): Promise<void> {
    const db = getFirebaseDb()
    if (!db) {
      localMock.historial = []
      localMock.notifyHistorial()
      return
    }

    const nodeRef = ref(db, DB_PATHS.HISTORIAL)
    await remove(nodeRef)
  },
}
