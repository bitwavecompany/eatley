export type OrigenDisparoManual = 'boton_principal' | 'recuperacion_alarma_perdida'

export interface DisparoManual {
  pendiente: boolean
  solicitado_en: number
  origen_solicitud: OrigenDisparoManual
}

export type ComandoAdmin = 'ninguno' | 'probar_servo' | 'reiniciar_esp32'

export interface EstadoEsp32 {
  ultima_conexion: number // Timestamp Unix ms del heartbeat
  rssi_dbm: number // Calidad Wi-Fi dBm
  uptime_seg: number // Segundos transcurridos desde encendido
  memoria_libre_kb: number
  alarma_perdida_id: string | null
  comando_admin: ComandoAdmin
}

export type NivelSenalWifi = 'excelente' | 'buena' | 'regular' | 'debil' | 'desconocida'

export type FirebaseConnectionState = 'conectado' | 'reconectando' | 'desconectado'
