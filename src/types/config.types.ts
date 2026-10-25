export interface ConfiguracionDispositivo {
  // Calibración Mecánica (Servo MG996R)
  angulo_cerrado: number
  angulo_abierto: number
  tiempo_abierto_ms: number
  activar_sacudida: boolean
  desactivar_pulso_en_reposo: boolean

  // Reglas Operativas y Hardware
  tolerancia_apagon_min: number
  cooldown_manual_seg: number
  sistema_pausado: boolean
  usar_microswitch: boolean
}

export type ActualizarConfiguracionPayload = Partial<ConfiguracionDispositivo>
