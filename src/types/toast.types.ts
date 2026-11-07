export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number // ms, 0 means persist until manual dismiss or update
}
