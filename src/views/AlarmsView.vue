<script setup lang="ts">
import { ref } from 'vue'
import { Plus, PauseCircle, AlarmClockPlus } from '@lucide/vue'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useConfigStore } from '@/stores/useConfigStore'
import AlarmCard from '@/components/alarms/AlarmCard.vue'
import AlarmModal from '@/components/alarms/AlarmModal.vue'
import MissedAlarmBanner from '@/components/feeder/MissedAlarmBanner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import type { Alarma, CrearAlarmaPayload, ActualizarAlarmaPayload } from '@/types/alarm.types'

const alarmsStore = useAlarmsStore()
const configStore = useConfigStore()

const isModalOpen = ref(false)
const selectedAlarm = ref<Alarma | null>(null)

// Delete Confirmation Modal State
const showConfirmDelete = ref(false)
const alarmToDelete = ref<Alarma | null>(null)

function openCreateModal() {
  selectedAlarm.value = null
  isModalOpen.value = true
}

function openEditModal(alarma: Alarma) {
  selectedAlarm.value = alarma
  isModalOpen.value = true
}

async function handleSaveCreate(payload: CrearAlarmaPayload) {
  await alarmsStore.crearAlarma(payload)
}

async function handleSaveUpdate(data: { id: string; payload: ActualizarAlarmaPayload }) {
  await alarmsStore.actualizarAlarma(data.id, data.payload)
}

async function handleToggle(id: string) {
  await alarmsStore.toggleAlarma(id)
}

function promptDelete(id: string) {
  const found = alarmsStore.alarmas.find((a) => a.id === id) || null
  alarmToDelete.value = found
  showConfirmDelete.value = true
}

async function handleConfirmDelete() {
  if (alarmToDelete.value) {
    await alarmsStore.eliminarAlarma(alarmToDelete.value.id)
  }
  showConfirmDelete.value = false
  alarmToDelete.value = null
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
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Horarios de Alimentación</h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {{ alarmsStore.alarmasActivas.length }} / {{ alarmsStore.alarmas.length }} activas
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Configura las horas exactas en las que el ESP32 abrirá el servomotor automáticamente.
        </p>
      </div>

      <button
        type="button"
        @click="openCreateModal"
        class="self-start sm:self-center px-4 py-2.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
      >
        <Plus class="w-5 h-5" />
        <span>Nueva Alarma</span>
      </button>
    </div>

    <!-- Global Pause Alert Warning (if paused) -->
    <div
      v-if="configStore.isSystemPaused"
      class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3"
    >
      <PauseCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span class="font-bold">El sistema se encuentra en Pausa Global (Modo Vacaciones).</span>
        <p class="text-amber-800/90 mt-0.5 text-xs">
          Ninguna de estas alarmas se ejecutará mientras la pausa esté activada. Puedes reactivar el cronograma normal desde la pestaña de <strong>Ajustes</strong>.
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="alarmsStore.alarmas.length === 0"
      class="rounded-3xl border border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center shadow-sm"
    >
      <div class="p-4 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
        <AlarmClockPlus class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-bold text-slate-900">No tienes alarmas programadas</h3>
      <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
        Crea tu primer horario para que tu mascota reciba su comida a la misma hora todos los días.
      </p>
      <button
        type="button"
        @click="openCreateModal"
        class="mt-6 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
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
        @delete="promptDelete"
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

    <!-- Modal Confirmación de Eliminación de Alarma -->
    <ConfirmationModal
      :is-open="showConfirmDelete"
      title="¿Eliminar Alarma?"
      subtitle="Esta acción no se puede deshacer"
      :description="
        alarmToDelete
          ? `¿Estás seguro de que deseas eliminar la alarma '${alarmToDelete.etiqueta}' programada a las ${alarmToDelete.hora}? El dispensador ya no se activará en ese horario.`
          : '¿Estás seguro de que deseas eliminar esta alarma?'
      "
      confirm-text="Sí, eliminar"
      cancel-text="Cancelar"
      @close="showConfirmDelete = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
