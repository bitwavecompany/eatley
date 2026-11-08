export interface ConfiguracionDispositivo {
  // Mechanical Calibration (MG996R Servo)
  angulo_cerrado: number
  angulo_abierto: number
  tiempo_abierto_ms: number
  activar_sacudida: boolean
  desactivar_pulso_en_reposo: boolean

  // Operational Rules and Safety Constraints
  tolerancia_apagon_min: number
  cooldown_manual_seg: number
  sistema_pausado: boolean
  usar_microswitch: boolean
}

export type ActualizarConfiguracionPayload = Partial<ConfiguracionDispositivo>
