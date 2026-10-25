<script setup lang="ts">
import { ref } from 'vue'
import { AlertCircle, X } from '@lucide/vue'
import { env } from '@/config/env'

const isDismissed = ref(false)
</script>

<template>
  <div
    v-if="!env.isFirebaseConfigured && !isDismissed"
    class="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-all"
    role="alert"
  >
    <div class="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
      <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
      <div class="flex-1">
        <span class="font-semibold text-amber-800">Modo sin conexión a Firebase:</span>
        <span class="ml-1 text-amber-900/90">
          Configura tus credenciales reales en el archivo <code class="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px] border border-amber-200">.env</code> para sincronizar con tu base de datos.
        </span>
      </div>
      <button
        type="button"
        @click="isDismissed = true"
        class="text-amber-600 hover:text-amber-900 hover:bg-amber-100 p-1 rounded-md transition-colors"
        title="Ocultar aviso"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
