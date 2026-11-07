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

    <!-- Top Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Programar alimentación</h2>
        <p
          v-if="alarmsStore.proximaAlarma"
          class="text-xs sm:text-sm font-semibold text-emerald-700 mt-1"
        >
          Próxima ración en {{ Math.floor(alarmsStore.proximaAlarma.minutosRestantes / 60) }}h {{ alarmsStore.proximaAlarma.minutosRestantes % 60 }}m
        </p>
      </div>

      <!-- Botón original para pantallas medianas/escritorio -->
      <button
        type="button"
        @click="openCreateModal"
        class="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
      >
        <Plus class="w-5 h-5" />
        <span>Nueva alarma</span>
      </button>
    </div>

    <!-- Global Pause Alert Warning (if paused) -->
    <div
      v-if="configStore.isSystemPaused"
      class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3"
    >
      <PauseCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span class="font-bold">El sistema se encuentra en pausa global (modo vacaciones).</span>
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
      <button
        type="button"
        @click="openCreateModal"
        class="mt-6 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        <span>Crear primera alarma</span>
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
      @delete="promptDelete"
    />

    <!-- Modal Confirmación de Eliminación de Alarma -->
    <ConfirmationModal
      :is-open="showConfirmDelete"
      title="¿Eliminar alarma?"
      subtitle="Esta acción no se puede deshacer"
      :description="
        alarmToDelete
          ? `¿Estás seguro de que deseas eliminar la alarma '${alarmToDelete.etiqueta}' programada a las ${alarmToDelete.hora}?`
          : '¿Estás seguro de que deseas eliminar esta alarma?'
      "
      confirm-text="Aceptar"
      cancel-text="Cancelar"
      @close="showConfirmDelete = false"
      @confirm="handleConfirmDelete"
    />

    <!-- Botón Flotante de Nueva Alarma (Solo móvil, estilo WhatsApp) -->
    <button
      type="button"
      @click="openCreateModal"
      class="sm:hidden fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xl shadow-emerald-600/35 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer"
      title="Nueva alarma"
      aria-label="Nueva alarma"
    >
      <Plus class="w-7 h-7 stroke-[2.5]" />
    </button>
  </div>
</template>
