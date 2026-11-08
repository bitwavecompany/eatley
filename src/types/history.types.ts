export type OrigenEvento = 'manual' | 'alarma' | 'prueba_admin'
export type EstadoEjecucionEsp32 = 'completado' | 'error'
export type ConfirmacionMicroswitch = 'verificado' | 'no_aplicable' | 'atasco_detectado'

export interface EventoHistorial {
  id: string
  timestamp: number // Unix timestamp (ms)
  origen: OrigenEvento
  alarma_etiqueta: string | null
  estado_esp32: EstadoEjecucionEsp32
  confirmacion_microswitch: ConfirmacionMicroswitch
  duracion_abierto_ms: number
}
