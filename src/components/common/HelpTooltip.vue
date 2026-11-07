<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { HelpCircle } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    text: string
    title?: string
    position?: 'top' | 'bottom'
    align?: 'left' | 'right' | 'center'
  }>(),
  {
    position: 'top',
    align: 'right',
  }
)

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const alignClass = computed(() => {
  if (props.align === 'left') return 'left-0'
  if (props.align === 'center') return 'left-1/2 -translate-x-1/2'
  return 'right-0'
})

const positionClass = computed(() => {
  return props.position === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative inline-flex items-center"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  >
    <button
      type="button"
      @click.stop="toggle"
      class="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
      :aria-label="title || 'Información de diagnóstico'"
    >
      <HelpCircle class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-30 w-64 sm:w-72 p-3.5 rounded-2xl bg-white text-slate-700 text-xs leading-relaxed shadow-xl shadow-slate-900/10 border border-slate-200 pointer-events-auto"
        :class="[positionClass, alignClass]"
        role="tooltip"
      >
        <div v-if="title" class="font-bold text-slate-900 mb-1">
          {{ title }}
        </div>
        <p class="text-slate-600 font-medium">
          {{ text }}
        </p>
      </div>
    </transition>
  </div>
</template>
