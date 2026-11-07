<script setup lang="ts">
import {
  CheckCircle2,
  Loader2,
  Info,
  AlertTriangle,
  AlertCircle,
  X,
} from '@lucide/vue'
import { useToastStore } from '@/stores/useToastStore'
import type { ToastType } from '@/types/toast.types'

const toastStore = useToastStore()

function getIconComponent(type: ToastType) {
  switch (type) {
    case 'loading':
      return Loader2
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'error':
      return AlertCircle
    case 'info':
    default:
      return Info
  }
}

function getIconColorClass(type: ToastType): string {
  switch (type) {
    case 'loading':
      return 'text-blue-600 animate-spin'
    case 'success':
      return 'text-emerald-600'
    case 'warning':
      return 'text-amber-600'
    case 'error':
      return 'text-rose-600'
    case 'info':
    default:
      return 'text-blue-600'
  }
}

function getBorderClass(type: ToastType): string {
  switch (type) {
    case 'loading':
      return 'border-blue-200 bg-white'
    case 'success':
      return 'border-emerald-200 bg-white'
    case 'warning':
      return 'border-amber-200 bg-white'
    case 'error':
      return 'border-rose-200 bg-white'
    case 'info':
    default:
      return 'border-slate-200 bg-white'
  }
}
</script>

<template>
  <div
    class="fixed z-50 bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2.5 w-[calc(100%-2rem)] max-w-sm"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto rounded-2xl border shadow-xl shadow-slate-900/10 px-4 py-3 flex items-center justify-between gap-3 w-full transition-all select-none"
        :class="getBorderClass(toast.type)"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <component
            :is="getIconComponent(toast.type)"
            class="w-5 h-5 shrink-0"
            :class="getIconColorClass(toast.type)"
          />
          <span class="text-xs sm:text-sm font-semibold text-slate-800 truncate">
            {{ toast.message }}
          </span>
        </div>

        <button
          type="button"
          @click="toastStore.remove(toast.id)"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          title="Cerrar notificación"
          aria-label="Cerrar notificación"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
