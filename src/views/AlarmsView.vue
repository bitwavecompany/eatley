<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useConfigStore } from '@/stores/useConfigStore'
import AlarmCard from '@/components/alarms/AlarmCard.vue'
import AlarmModal from '@/components/alarms/AlarmModal.vue'
import MissedAlarmBanner from '@/components/feeder/MissedAlarmBanner.vue'
import type { Alarma, CrearAlarmaPayload, ActualizarAlarmaPayload } from '@/types/alarm.types'

const alarmsStore = useAlarmsStore()
const configStore = useConfigStore()

const isModalOpen = ref(false)
const selectedAlarm = ref<Alarma | null>(null)

function openCreateModal() {
  selectedAlarm.value = null
  isModalOpen.value = true
}

function openEditModal(alarma: Alarma) {
  selectedAlarm.value = alarma
  isModalOpen.value = true
}

function handleSaveCreate(payload: CrearAlarmaPayload) {
  void alarmsStore.crearAlarma(payload)
}

function handleSaveUpdate(data: { id: string; payload: ActualizarAlarmaPayload }) {
  void alarmsStore.actualizarAlarma(data.id, data.payload)
}

function handleToggle(id: string) {
  void alarmsStore.toggleAlarma(id)
}

function handleDelete(id: string) {
  if (confirm('¿Estás seguro de eliminar esta alarma?')) {
    void alarmsStore.eliminarAlarma(id)
  }
}
</script>

<template>
  <div class="space-y-6 pb-20 sm:pb-12">
    <!-- Missed Alarms Banner (if any) -->
    <MissedAlarmBanner />

    <!-- Top Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <h2 class="text-2xl font-extrabold tracking-tight text-white">Horarios de Alimentación</h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {{ alarmsStore.alarmasActivas.length }} / {{ alarmsStore.alarmas.length }} activas
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Configura las horas exactas en las que el ESP32 abrirá el servomotor automáticamente.
        </p>
      </div>

      <button
        type="button"
        @click="openCreateModal"
        class="self-start sm:self-center px-4 py-2.5 rounded-2xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
      >
        <Icon icon="lucide:plus" class="w-5 h-5" />
        <span>Nueva Alarma</span>
      </button>
    </div>

    <!-- Global Pause Alert Warning (if paused) -->
    <div
      v-if="configStore.isSystemPaused"
      class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3"
    >
      <Icon icon="lucide:pause-circle" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span class="font-bold">El sistema se encuentra en Pausa Global (Modo Vacaciones).</span>
        <p class="text-amber-200/80 mt-0.5 text-xs">
          Ninguna de estas alarmas se ejecutará mientras la pausa esté activada. Puedes reactivar el cronograma normal desde la pestaña de <strong>Ajustes</strong>.
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="alarmsStore.alarmas.length === 0"
      class="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center"
    >
      <div class="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
        <Icon icon="lucide:alarm-clock-plus" class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-bold text-white">No tienes alarmas programadas</h3>
      <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
        Crea tu primer horario para que tu mascota reciba su comida a la misma hora todos los días.
      </p>
      <button
        type="button"
        @click="openCreateModal"
        class="mt-6 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-all flex items-center gap-2"
      >
        <Icon icon="lucide:plus" class="w-4 h-4" />
        <span>Crear Primera Alarma</span>
      </button>
    </div>

    <!-- Alarms Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AlarmCard
        v-for="alarma in alarmsStore.alarmasOrdenadas"
        :key="alarma.id"
        :alarma="alarma"
        @toggle="handleToggle"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </div>

    <!-- Modal Create / Edit -->
    <AlarmModal
      :is-open="isModalOpen"
      :initial-alarm="selectedAlarm"
      @close="isModalOpen = false"
      @save-create="handleSaveCreate"
      @save-update="handleSaveUpdate"
    />
  </div>
</template>
