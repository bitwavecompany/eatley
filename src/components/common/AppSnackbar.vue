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

function getToastStyle(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        card: 'bg-emerald-50 border-emerald-300 shadow-emerald-900/10 text-emerald-950',
        badge: 'bg-emerald-100/90 text-emerald-700',
        icon: CheckCircle2,
        iconSpin: false,
        close: 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/70',
      }
    case 'error':
      return {
        card: 'bg-rose-50 border-rose-300 shadow-rose-900/10 text-rose-950',
        badge: 'bg-rose-100/90 text-rose-700',
        icon: AlertCircle,
        iconSpin: false,
        close: 'text-rose-700 hover:text-rose-950 hover:bg-rose-100/70',
      }
    case 'warning':
      return {
        card: 'bg-amber-50 border-amber-300 shadow-amber-900/10 text-amber-950',
        badge: 'bg-amber-100/90 text-amber-700',
        icon: AlertTriangle,
        iconSpin: false,
        close: 'text-amber-700 hover:text-amber-950 hover:bg-amber-100/70',
      }
    case 'loading':
      return {
        card: 'bg-blue-50 border-blue-300 shadow-blue-900/10 text-blue-950',
        badge: 'bg-blue-100/90 text-blue-700',
        icon: Loader2,
        iconSpin: true,
        close: 'text-blue-700 hover:text-blue-950 hover:bg-blue-100/70',
      }
    case 'info':
    default:
      return {
        card: 'bg-sky-50 border-sky-300 shadow-sky-900/10 text-sky-950',
        badge: 'bg-sky-100/90 text-sky-700',
        icon: Info,
        iconSpin: false,
        close: 'text-sky-700 hover:text-sky-950 hover:bg-sky-100/70',
      }
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
        class="pointer-events-auto rounded-2xl border-2 shadow-xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 w-full transition-all select-none"
        :class="getToastStyle(toast.type).card"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0"
            :class="getToastStyle(toast.type).badge"
          >
            <component
              :is="getToastStyle(toast.type).icon"
              class="w-4 h-4 sm:w-5 sm:h-5"
              :class="{ 'animate-spin': getToastStyle(toast.type).iconSpin }"
            />
          </div>
          <span class="text-xs sm:text-sm font-bold truncate">
            {{ toast.message }}
          </span>
        </div>

        <button
          type="button"
          @click="toastStore.remove(toast.id)"
          class="p-1 rounded-lg transition-colors shrink-0"
          :class="getToastStyle(toast.type).close"
          title="Cerrar notificación"
          aria-label="Cerrar notificación"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
