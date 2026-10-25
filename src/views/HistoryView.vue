<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
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
          <h2 class="text-2xl font-extrabold tracking-tight text-white">Bitácora de Aperturas</h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {{ historyStore.totalEventos }} eventos
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Registro cronológico auditado de cada activación del servomotor por parte del ESP32.
        </p>
      </div>

      <button
        v-if="historyStore.totalEventos > 0"
        type="button"
        @click="showConfirmClear = true"
        class="self-start sm:self-center px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
      >
        <Icon icon="lucide:trash-2" class="w-4 h-4" />
        <span>Limpiar Historial</span>
      </button>
    </div>

    <!-- Quick Stat Chips -->
    <div class="grid grid-cols-3 gap-3">
      <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span class="text-[11px] font-medium text-slate-400 block">Total Eventos</span>
        <span class="text-lg font-bold font-mono text-white mt-0.5 block">{{ historyStore.totalEventos }}</span>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span class="text-[11px] font-medium text-slate-400 block">Disparos Manuales</span>
        <span class="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{{ conteoManual }}</span>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span class="text-[11px] font-medium text-slate-400 block">Por Alarma</span>
        <span class="text-lg font-bold font-mono text-blue-400 mt-0.5 block">{{ conteoAlarma }}</span>
      </div>
    </div>

    <!-- Filter Buttons Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        @click="filtroActual = 'todos'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0"
        :class="[
          filtroActual === 'todos'
            ? 'bg-emerald-500 text-slate-950 font-bold'
            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
        ]"
      >
        Todos ({{ historyStore.totalEventos }})
      </button>

      <button
        type="button"
        @click="filtroActual = 'manual'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0"
        :class="[
          filtroActual === 'manual'
            ? 'bg-emerald-500 text-slate-950 font-bold'
            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
        ]"
      >
        Manuales ({{ conteoManual }})
      </button>

      <button
        type="button"
        @click="filtroActual = 'alarma'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0"
        :class="[
          filtroActual === 'alarma'
            ? 'bg-emerald-500 text-slate-950 font-bold'
            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
        ]"
      >
        Por Horario ({{ conteoAlarma }})
      </button>

      <button
        type="button"
        @click="filtroActual = 'prueba_admin'"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0"
        :class="[
          filtroActual === 'prueba_admin'
            ? 'bg-emerald-500 text-slate-950 font-bold'
            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      @click.self="showConfirmClear = false"
    >
      <div class="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400">
            <Icon icon="lucide:trash-2" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-white text-base">¿Limpiar Bitácora?</h4>
            <p class="text-xs text-slate-400">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p class="text-xs text-slate-300">
          Se borrarán todos los registros históricos guardados en Firebase. Los nuevos eventos que ocurran se registrarán normalmente.
        </p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showConfirmClear = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
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
