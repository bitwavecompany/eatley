export type AlarmaRepeticionTipo = 'dias_semana' | 'una_vez' | 'fecha_especifica'

export interface Alarma {
  id: string
  hora: string // "HH:mm" ej: "08:00"
  etiqueta: string // ej: "Desayuno Michi"
  activa: boolean
  tipo_repeticion: AlarmaRepeticionTipo
  dias_semana: number[] // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  fecha_especifica: string | null // "YYYY-MM-DD" si tipo_repeticion === 'fecha_especifica'
  ultima_ejecucion_fecha: string | null // "YYYY-MM-DD"
  omitida_hoy_fecha: string | null // "YYYY-MM-DD"
  creada_en: number // Unix timestamp ms
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
