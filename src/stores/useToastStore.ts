import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ToastItem, ToastType } from '@/types/toast.types'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function remove(id: string) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(message: string, type: ToastType = 'success', duration = 3000): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    // Limit visible toasts to 3 maximum
    if (toasts.value.length >= 3) {
      const oldest = toasts.value[0]
      remove(oldest.id)
    }

    const item: ToastItem = {
      id,
      message,
      type,
      duration,
    }

    toasts.value.push(item)

    if (duration > 0) {
      const timer = setTimeout(() => {
        remove(id)
      }, duration)
      timers.set(id, timer)
    }

    return id
  }

  function success(message: string, duration = 3000): string {
    return show(message, 'success', duration)
  }

  function info(message: string, duration = 3000): string {
    return show(message, 'info', duration)
  }

  function warning(message: string, duration = 3500): string {
    return show(message, 'warning', duration)
  }

  function error(message: string, duration = 4000): string {
    return show(message, 'error', duration)
  }

  function loading(message: string): string {
    return show(message, 'loading', 0)
  }

  function update(id: string, updates: Partial<Omit<ToastItem, 'id'>>): void {
    const existing = toasts.value.find((t) => t.id === id)
    if (!existing) return

    const existingTimer = timers.get(id)
    if (existingTimer) {
      clearTimeout(existingTimer)
      timers.delete(id)
    }

    if (updates.message !== undefined) existing.message = updates.message
    if (updates.type !== undefined) existing.type = updates.type
    if (updates.duration !== undefined) existing.duration = updates.duration

    const duration = updates.duration !== undefined ? updates.duration : 3000
    if (duration > 0) {
      const timer = setTimeout(() => {
        remove(id)
      }, duration)
      timers.set(id, timer)
    }
  }

  function clear() {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    toasts.value = []
  }

  return {
    toasts,
    show,
    success,
    info,
    warning,
    error,
    loading,
    update,
    remove,
    clear,
  }
})
