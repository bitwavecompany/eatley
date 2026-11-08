<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ShieldAlert, AlertTriangle, Unlock } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    keyword?: string
  }>(),
  {
    keyword: 'DESBLOQUEAR',
  }
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()

const typedWord = ref('')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      typedWord.value = ''
    }
  }
)

const isMatch = computed<boolean>(() => {
  return typedWord.value.trim().toUpperCase() === props.keyword.toUpperCase()
})

function handleConfirm() {
  if (!isMatch.value) return
  emit('confirm')
  typedWord.value = ''
}

function handleClose() {
  emit('close')
  typedWord.value = ''
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    @click.self="handleClose"
  >
    <div
      class="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-modal-title"
    >
      <!-- Header with Icon & Titles -->
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
          <ShieldAlert class="w-6 h-6" />
        </div>
        <div>
          <h4 id="unlock-modal-title" class="font-bold text-slate-900 text-base leading-tight">
            Desbloquear posición de cierre
          </h4>
          <p class="text-xs text-slate-500 mt-0.5">
            Protección de integridad mecánica del alimentador
          </p>
        </div>
      </div>

      <!-- Physical Risk Explanation (Jakob Nielsen #2 & #5) -->
      <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed space-y-2">
        <div class="flex items-start gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p class="font-medium text-amber-900">
            ¿Por qué está protegida esta configuración?
          </p>
        </div>
        <p class="text-xs text-amber-800 leading-normal pl-6">
          Actualmente el alimentador está calibrado en una posición precisa donde la compuerta y el tope mecánico cuadran con exactitud. Si se modifica accidentalmente o se gira en sentido contrario, el servomotor podría forzar el brazo contra el tope y romper la estructura física o los engranajes.
        </p>
      </div>

      <!-- Typed Confirmation Input -->
      <div class="space-y-2">
        <label for="unlock-input" class="block text-xs font-semibold text-slate-700">
          Para autorizar el ajuste manual, escribe
          <span class="font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
            {{ keyword }}
          </span>:
        </label>
        <input
          id="unlock-input"
          type="text"
          v-model="typedWord"
          :placeholder="keyword"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="characters"
          spellcheck="false"
          @keydown.enter="handleConfirm"
          class="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          @click="handleClose"
          class="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer touch-manipulation"
        >
          Mantener bloqueado
        </button>

        <button
          type="button"
          @click="handleConfirm"
          :disabled="!isMatch"
          class="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 touch-manipulation"
          :class="[
            isMatch
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 cursor-pointer active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
          ]"
        >
          <Unlock class="w-4 h-4" />
          <span>Desbloquear edición</span>
        </button>
      </div>
    </div>
  </div>
</template>
