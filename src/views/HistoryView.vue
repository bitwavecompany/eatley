<script setup lang="ts">
import { ref } from 'vue'
import { Trash2 } from '@lucide/vue'
import { useHistoryStore } from '@/stores/useHistoryStore'
import HistoryList from '@/components/history/HistoryList.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

const historyStore = useHistoryStore()
const showConfirmClear = ref(false)

async function handleClearHistory() {
  showConfirmClear.value = false
  await historyStore.limpiarHistorial()
}
</script>

<template>
  <div class="space-y-6 pb-20 sm:pb-12">
    <!-- Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Historial de alimentación</h2>
        </div>
      </div>

      <button
        v-if="historyStore.totalEventos > 0"
        type="button"
        @click="showConfirmClear = true"
        class="self-start sm:self-center px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 shadow-sm"
      >
        <Trash2 class="w-4 h-4" />
        <span>Limpiar</span>
      </button>
    </div>

    <!-- Event List -->
    <HistoryList :eventos="historyStore.historial" />

    <!-- Reusable Clear Confirmation Modal -->
    <ConfirmationModal
      :is-open="showConfirmClear"
      title="¿Limpiar historial?"
      subtitle="Esta acción no se puede deshacer"
      description="Se borrará todo el historial de alimentación"
      confirm-text="Aceptar"
      cancel-text="Cancelar"
      @close="showConfirmClear = false"
      @confirm="handleClearHistory"
    />
  </div>
</template>
