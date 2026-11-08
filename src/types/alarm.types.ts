export type AlarmaRepeticionTipo = 'dias_semana' | 'una_vez' | 'fecha_especifica'

export interface Alarma {
  id: string
  hora: string // "HH:mm" e.g. "08:00"
  etiqueta: string // e.g. "Breakfast"
  activa: boolean
  tipo_repeticion: AlarmaRepeticionTipo
  dias_semana: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  fecha_especifica: string | null // "YYYY-MM-DD" when tipo_repeticion === 'fecha_especifica'
  ultima_ejecucion_fecha: string | null // "YYYY-MM-DD"
  omitida_hoy_fecha: string | null // "YYYY-MM-DD"
  creada_en: number // Unix timestamp (ms)
}

export type CrearAlarmaPayload = Omit<Alarma, 'id' | 'creada_en' | 'ultima_ejecucion_fecha' | 'omitida_hoy_fecha'> & {
  ultima_ejecucion_fecha?: string | null
  omitida_hoy_fecha?: string | null
}

export type ActualizarAlarmaPayload = Partial<Omit<Alarma, 'id' | 'creada_en'>>

export interface AlarmaPerdidaInfo {
  alarma: Alarma
  motivo: 'hora_vencida' | 'reportada_por_esp32'
  minutosAtraso: number
  horaProgramada: string
}
