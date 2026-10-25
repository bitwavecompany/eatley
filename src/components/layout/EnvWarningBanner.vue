<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { env } from '@/config/env'

const isDismissed = ref(false)
</script>

<template>
  <div
    v-if="!env.isFirebaseConfigured && !isDismissed"
    class="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-all"
    role="alert"
  >
    <div class="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
      <Icon icon="lucide:alert-circle" class="w-4 h-4 text-amber-400 shrink-0" />
      <div class="flex-1">
        <span class="font-semibold text-amber-300">Modo Demo Local:</span>
        <span class="ml-1 text-amber-200/90">
          Credenciales de Firebase pendientes en el archivo <code class="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">.env</code>. La aplicación funciona con datos seguros en memoria.
        </span>
      </div>
      <button
        type="button"
        @click="isDismissed = true"
        class="text-amber-400 hover:text-amber-200 p-1 rounded-md transition-colors"
        title="Ocultar aviso"
      >
        <Icon icon="lucide:x" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
