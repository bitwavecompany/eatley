import { env } from './env'

/**
 * Firebase Realtime Database Paths
 */
export const DB_PATHS = {
  ROOT: env.firebaseRootPath,
  DISPARO_MANUAL: `${env.firebaseRootPath}/disparo_manual`,
  ALARMAS: `${env.firebaseRootPath}/alarmas`,
  CONFIGURACION: `${env.firebaseRootPath}/configuracion`,
  ESTADO_ESP32: `${env.firebaseRootPath}/estado_esp32`,
  HISTORIAL: `${env.firebaseRootPath}/historial`,
} as const

/**
 * Hardware & MG996R Servo Specifications
 */
export const SERVO_CONSTRAINTS = {
  ANGULO_CERRADO: {
    MIN: 0,
    MAX: 15,
    DEFAULT: 0,
    STEP: 1,
  },
  ANGULO_ABIERTO: {
    MIN: 35,
    MAX: 90,
    DEFAULT: 50,
    STEP: 1,
  },
  TIEMPO_ABIERTO_MS: {
    MIN: 150,
    MAX: 1500,
    DEFAULT: 350,
    STEP: 50,
  },
  ACTIVAR_SACUDIDA_DEFAULT: false,
  DESACTIVAR_PULSO_DEFAULT: true,
} as const

/**
 * Clamp helper for physical Poka-Yoke boundaries
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

/**
 * Recommended Default Values for Servo Calibration
 */
export const SERVO_RECOMMENDED_DEFAULTS = {
  ANGULO_CERRADO: 0,
  ANGULO_ABIERTO: 50,
  TIEMPO_ABIERTO_MS: 350,
  ACTIVAR_SACUDIDA: false,
  DESACTIVAR_PULSO: true,
} as const

/**
 * Keyword required to unlock critical mechanical closure angle
 */
export const CLOSURE_UNLOCK_KEYWORD = 'DESBLOQUEAR'

/**
 * Operational Contingency Rules
 */
export const OPERATIONAL_CONSTRAINTS = {
  TOLERANCIA_APAGON_MIN: {
    MIN: 1,
    MAX: 120,
    DEFAULT: 15,
    STEP: 1,
  },
  COOLDOWN_MANUAL_SEG: {
    MIN: 3,
    MAX: 60,
    DEFAULT: 10,
    STEP: 1,
  },
  SISTEMA_PAUSADO_DEFAULT: false,
  USAR_MICROSWITCH_DEFAULT: false,
} as const

/**
 * Days of the week in standard JS Date indexing (0 = Sunday, 6 = Saturday)
 */
export interface DayOfWeekItem {
  id: number
  key: string
  shortLabel: string
  letter: string
  fullLabel: string
}

export const DAYS_OF_WEEK: readonly DayOfWeekItem[] = [
  { id: 1, key: 'mon', shortLabel: 'Lun', letter: 'L', fullLabel: 'Lunes' },
  { id: 2, key: 'tue', shortLabel: 'Mar', letter: 'M', fullLabel: 'Martes' },
  { id: 3, key: 'wed', shortLabel: 'Mié', letter: 'X', fullLabel: 'Miércoles' },
  { id: 4, key: 'thu', shortLabel: 'Jue', letter: 'J', fullLabel: 'Jueves' },
  { id: 5, key: 'fri', shortLabel: 'Vie', letter: 'V', fullLabel: 'Viernes' },
  { id: 6, key: 'sat', shortLabel: 'Sáb', letter: 'S', fullLabel: 'Sábado' },
  { id: 0, key: 'sun', shortLabel: 'Dom', letter: 'D', fullLabel: 'Domingo' },
] as const

/**
 * Family Authentication Configuration
 */
export const AUTH_CONFIG = {
  FAMILY_EMAIL: 'familiadiaz@gmail.com',
} as const

/**
 * Common quick alarm presets or labels
 */
export const DEFAULT_ALARM_LABELS = [
  'Desayuno',
  'Almuerzo',
  'Cena',
  'Snack de tarde',
] as const

/**
 * App Route Constants
 */
export const APP_ROUTES = {
  DASHBOARD: '/',
  ALARMS: '/alarmas',
  HISTORY: '/historial',
  ADMIN: '/ajustes',
} as const
