export type OrigenDisparoManual = 'boton_principal' | 'recuperacion_alarma_perdida'

export interface DisparoManual {
  pendiente: boolean
  solicitado_en: number
  origen_solicitud: OrigenDisparoManual
}

export type ComandoAdmin =
  | 'ninguno'
  | 'probar_servo'
  | 'reiniciar_esp32'
  | 'abrir_mantenimiento'
  | 'cerrar_mantenimiento'
  | 'abierto_mantenimiento'

export interface EstadoEsp32 {
  ultima_conexion: number // Unix timestamp (ms) of the controller's last response
  rssi_dbm: number // Wi-Fi signal strength in dBm
  uptime_seg: number // Elapsed seconds since boot
  memoria_libre_kb: number
  alarma_perdida_id: string | null
  comando_admin: ComandoAdmin
}

export type NivelSenalWifi = 'excelente' | 'buena' | 'regular' | 'debil' | 'desconocida'

export type FirebaseConnectionState = 'conectado' | 'reconectando' | 'desconectado'
