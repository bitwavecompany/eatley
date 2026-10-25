<script setup lang="ts">
import { ref, computed } from 'vue'
import { Trash2 } from '@lucide/vue'
import { useHistoryStore } from '@/stores/useHistoryStore'
import HistoryList from '@/components/history/HistoryList.vue'
import type { OrigenEvento } from '@/types/history.types'

const historyStore = useHistoryStore()

type FiltroOrigen = 'todos' | OrigenEvento
const filtroActual = ref<FiltroOrigen>('todos')
const showConfirmClear = ref(false)

const eventosFiltrados = computed(() => {
  if (filtroActual.value === 'todos') {
    return historyStore.historial
  }
  return historyStore.historial.filter((e) => e.origen === filtroActual.value)
})

const conteoManual = computed(() => {
  return historyStore.historial.filter((e) => e.origen === 'manual').length
})

const conteoAlarma = computed(() => {
  return historyStore.historial.filter((e) => e.origen === 'alarma').length
})

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
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Bitácora de Aperturas</h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {{ historyStore.totalEventos }} eventos
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Registro cronológico auditado de cada activación del servomotor por parte del ESP32.
        </p>
      </div>

      <button
        v-if="historyStore.totalEventos > 0"
        type="button"
        @click="showConfirmClear = true"
        class="self-start sm:self-center px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 shadow-sm"
      >
        <Trash2 class="w-4 h-4" />
        <span>Limpiar Historial</span>
      </button>
    </div>

    <!-- Quick Stat Chips -->
    <div class="grid grid-cols-3 gap-3">
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="text-[11px] font-medium text-slate-500 block">Total Eventos</span>
        <span class="text-lg font-bold font-mono text-slate-900 mt-0.5 block">{{ historyStore.totalEventos }}</span>
      </div>

      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="text-[11px] font-medium text-slate-500 block">Disparos Manuales</span>
        <span class="text-lg font-bold font-mono text-emerald-700 mt-0.5 block">{{ conteoManual }}</span>
      </div>

      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="text-[11px] font-medium text-slate-500 block">Por Alarma</span>
        <span class="text-lg font-bold font-mono text-blue-700 mt-0.5 block">{{ conteoAlarma }}</span>
      </div>
    </div>

    <!-- Filter Buttons Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        @click="filtroActual = 'todos'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-sm"
        :class="[
          filtroActual === 'todos'
            ? 'bg-emerald-600 text-white font-bold'
            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
        ]"
      >
        Todos ({{ historyStore.totalEventos }})
      </button>

      <button
        type="button"
        @click="filtroActual = 'manual'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-sm"
        :class="[
          filtroActual === 'manual'
            ? 'bg-emerald-600 text-white font-bold'
            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
        ]"
      >
        Manuales ({{ conteoManual }})
      </button>

      <button
        type="button"
        @click="filtroActual = 'alarma'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-sm"
        :class="[
          filtroActual === 'alarma'
            ? 'bg-emerald-600 text-white font-bold'
            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
        ]"
      >
        Por Horario ({{ conteoAlarma }})
      </button>

      <button
        type="button"
        @click="filtroActual = 'prueba_admin'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-sm"
        :class="[
          filtroActual === 'prueba_admin'
            ? 'bg-emerald-600 text-white font-bold'
            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
        ]"
      >
        Pruebas Técnicas
      </button>
    </div>

    <!-- Event List -->
    <HistoryList
      :eventos="eventosFiltrados"
      empty-message="No se encontraron eventos con el filtro seleccionado."
    />

    <!-- Clear Confirmation Modal -->
    <div
      v-if="showConfirmClear"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      @click.self="showConfirmClear = false"
    >
      <div class="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-rose-100 text-rose-600">
            <Trash2 class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-base">¿Limpiar Bitácora?</h4>
            <p class="text-xs text-slate-500">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p class="text-xs text-slate-600">
          Se borrarán todos los registros históricos guardados en Firebase. Los nuevos eventos que ocurran se registrarán normalmente.
        </p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showConfirmClear = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleClearHistory"
            class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
          >
            Sí, borrar todo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
