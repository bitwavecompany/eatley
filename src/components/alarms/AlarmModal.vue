<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  AlarmClock,
  X,
  AlertCircle,
  Repeat,
  BellRing,
  CalendarDays,
  Check,
  CloudOff,
} from '@lucide/vue'
import { DAYS_OF_WEEK, DEFAULT_ALARM_LABELS } from '@/config/constants'
import { useDeviceStore } from '@/stores/useDeviceStore'
import type {
  Alarma,
  AlarmaRepeticionTipo,
  CrearAlarmaPayload,
  ActualizarAlarmaPayload,
} from '@/types/alarm.types'

const props = defineProps<{
  isOpen: boolean
  initialAlarm: Alarma | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-create', payload: CrearAlarmaPayload): void
  (e: 'save-update', data: { id: string; payload: ActualizarAlarmaPayload }): void
}>()

const deviceStore = useDeviceStore()

const hora = ref('08:00')
const etiqueta = ref('')
const activa = ref(true)
const tipoRepeticion = ref<AlarmaRepeticionTipo>('dias_semana')
const diasSemana = ref<number[]>([1, 2, 3, 4, 5, 6, 0])
const fechaEspecifica = ref<string>('')
const errorMessage = ref('')

const isEditing = computed(() => props.initialAlarm !== null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = ''
      if (props.initialAlarm) {
        hora.value = props.initialAlarm.hora
        etiqueta.value = props.initialAlarm.etiqueta
        activa.value = props.initialAlarm.activa
        tipoRepeticion.value = props.initialAlarm.tipo_repeticion
        diasSemana.value = [...props.initialAlarm.dias_semana]
        fechaEspecifica.value = props.initialAlarm.fecha_especifica || ''
      } else {
        hora.value = '08:00'
        etiqueta.value = ''
        activa.value = true
        tipoRepeticion.value = 'dias_semana'
        diasSemana.value = [1, 2, 3, 4, 5, 6, 0]
        fechaEspecifica.value = new Date().toISOString().split('T')[0]
      }
    }
  }
)

function toggleDay(dayId: number) {
  if (diasSemana.value.includes(dayId)) {
    if (diasSemana.value.length > 1) {
      diasSemana.value = diasSemana.value.filter((d) => d !== dayId)
    }
  } else {
    diasSemana.value = [...diasSemana.value, dayId]
  }
}

function selectAllDays() {
  diasSemana.value = [1, 2, 3, 4, 5, 6, 0]
}

function selectWeekdays() {
  diasSemana.value = [1, 2, 3, 4, 5]
}

function selectLabelPreset(label: string) {
  etiqueta.value = label
}

function handleSubmit() {
  errorMessage.value = ''

  if (!deviceStore.isFirebaseConnected) {
    errorMessage.value = 'No se puede guardar: la conexión con la nube de Firebase no está activa.'
    return
  }

  if (!hora.value) {
    errorMessage.value = 'Debes ingresar una hora válida.'
    return
  }

  if (tipoRepeticion.value === 'dias_semana' && diasSemana.value.length === 0) {
    errorMessage.value = 'Debes seleccionar al menos un día de la semana.'
    return
  }

  if (tipoRepeticion.value === 'fecha_especifica' && !fechaEspecifica.value) {
    errorMessage.value = 'Debes seleccionar una fecha en el calendario.'
    return
  }

  const finalEtiqueta = etiqueta.value.trim() || 'Ración programada'

  if (isEditing.value && props.initialAlarm) {
    emit('save-update', {
      id: props.initialAlarm.id,
      payload: {
        hora: hora.value,
        etiqueta: finalEtiqueta,
        activa: activa.value,
        tipo_repeticion: tipoRepeticion.value,
        dias_semana: tipoRepeticion.value === 'dias_semana' ? diasSemana.value : [],
        fecha_especifica: tipoRepeticion.value === 'fecha_especifica' ? fechaEspecifica.value : null,
      },
    })
  } else {
    emit('save-create', {
      hora: hora.value,
      etiqueta: finalEtiqueta,
      activa: activa.value,
      tipo_repeticion: tipoRepeticion.value,
      dias_semana: tipoRepeticion.value === 'dias_semana' ? diasSemana.value : [],
      fecha_especifica: tipoRepeticion.value === 'fecha_especifica' ? fechaEspecifica.value : null,
      ultima_ejecucion_fecha: null,
      omitida_hoy_fecha: null,
    })
  }

  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <AlarmClock class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ isEditing ? 'Editar Alarma' : 'Nueva Alarma de Comida' }}
            </h3>
            <p class="text-xs text-slate-500">Configura la hora y repetición del dispensador</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="mt-5 space-y-5">
        <!-- Error alert -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Cloud Offline Warning Notice -->
        <div
          v-if="!deviceStore.isFirebaseConnected"
          class="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center gap-2"
        >
          <CloudOff class="w-4 h-4 shrink-0 text-amber-600" />
          <span>Sin conexión con la nube. Espera a que se restablezca el enlace WebSocket para guardar cambios.</span>
        </div>

        <!-- Big Hour Selector -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Hora Programada
          </label>
          <div class="relative">
            <input
              type="time"
              v-model="hora"
              required
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl px-5 py-4 text-3xl font-mono font-bold text-center text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-inner"
            />
          </div>
        </div>

        <!-- Label & Presets -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Etiqueta / Nombre
          </label>
          <input
            type="text"
            v-model="etiqueta"
            placeholder="Ej. Desayuno Michi, Almuerzo..."
            maxlength="40"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />

          <!-- Quick Presets -->
          <div class="mt-2 flex items-center gap-1.5 flex-wrap">
            <button
              v-for="preset in DEFAULT_ALARM_LABELS"
              :key="preset"
              type="button"
              @click="selectLabelPreset(preset)"
              class="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-colors"
            >
              {{ preset }}
            </button>
          </div>
        </div>

        <!-- Repetition Mode Selector -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Frecuencia de Repetición
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="tipoRepeticion = 'dias_semana'"
              class="p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center"
              :class="[
                tipoRepeticion === 'dias_semana'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              ]"
            >
              <Repeat class="w-4 h-4" />
              <span>Días de Semana</span>
            </button>

            <button
              type="button"
              @click="tipoRepeticion = 'una_vez'"
              class="p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center"
              :class="[
                tipoRepeticion === 'una_vez'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              ]"
            >
              <BellRing class="w-4 h-4" />
              <span>Una Sola Vez</span>
            </button>

            <button
              type="button"
              @click="tipoRepeticion = 'fecha_especifica'"
              class="p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center"
              :class="[
                tipoRepeticion === 'fecha_especifica'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              ]"
            >
              <CalendarDays class="w-4 h-4" />
              <span>Fecha Calendario</span>
            </button>
          </div>
        </div>

        <!-- Mode 1: Days of Week Circular Pills & Shortcuts -->
        <div v-if="tipoRepeticion === 'dias_semana'" class="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-medium">Selecciona los días:</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="selectAllDays"
                class="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Todos
              </button>
              <span class="text-slate-300">|</span>
              <button
                type="button"
                @click="selectWeekdays"
                class="text-[11px] font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                L a V
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1.5">
            <button
              v-for="d in DAYS_OF_WEEK"
              :key="d.id"
              type="button"
              @click="toggleDay(d.id)"
              class="h-10 rounded-full text-xs font-bold transition-all flex flex-col items-center justify-center border"
              :class="[
                diasSemana.includes(d.id)
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              ]"
            >
              <span>{{ d.letter }}</span>
            </button>
          </div>
        </div>

        <!-- Mode 3: Calendar Date Picker -->
        <div v-else-if="tipoRepeticion === 'fecha_especifica'" class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            Fecha para la apertura
          </label>
          <input
            type="date"
            v-model="fechaEspecifica"
            class="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm"
          />
        </div>

        <!-- Active Switch -->
        <div class="flex items-center justify-between py-2 px-1">
          <div>
            <span class="text-sm font-semibold text-slate-900 block">Estado inicial</span>
            <span class="text-xs text-slate-500">Habilitar alarma inmediatamente tras guardar</span>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="activa"
            @click="activa = !activa"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="activa ? 'bg-emerald-600' : 'bg-slate-300'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="activa ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            :disabled="!deviceStore.isFirebaseConnected"
            class="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            :class="[
              deviceStore.isFirebaseConnected
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-slate-400'
            ]"
          >
            <Check class="w-4 h-4" />
            <span>{{ isEditing ? 'Actualizar Alarma' : 'Guardar Alarma' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
