<script setup lang="ts">
import { type Component, computed } from 'vue'
import { Trash2, AlertTriangle, Info } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    description: string
    subtitle?: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    icon?: Component
  }>(),
  {
    subtitle: 'Esta acción no se puede deshacer',
    confirmText: 'Sí, eliminar',
    cancelText: 'Cancelar',
    variant: 'danger',
  }
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()

const activeIcon = computed(() => {
  if (props.icon) return props.icon
  if (props.variant === 'warning') return AlertTriangle
  if (props.variant === 'info') return Info
  return Trash2
})

const iconWrapperClass = computed(() => {
  if (props.variant === 'warning') return 'bg-amber-100 text-amber-600'
  if (props.variant === 'info') return 'bg-blue-100 text-blue-600'
  return 'bg-rose-100 text-rose-600'
})

const confirmButtonClass = computed(() => {
  if (props.variant === 'warning') {
    return 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
  }
  if (props.variant === 'info') {
    return 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
  }
  return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header with Icon & Titles -->
      <div class="flex items-center gap-3">
        <div :class="['p-2.5 rounded-2xl shrink-0', iconWrapperClass]">
          <component :is="activeIcon" class="w-6 h-6" />
        </div>
        <div>
          <h4 class="font-bold text-slate-900 text-base leading-tight">
            {{ title }}
          </h4>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Description Content -->
      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
        {{ description }}
      </p>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          {{ cancelText }}
        </button>

        <button
          type="button"
          @click="emit('confirm')"
          :class="[
            'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all',
            confirmButtonClass
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
