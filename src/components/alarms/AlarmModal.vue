<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { DAYS_OF_WEEK, DEFAULT_ALARM_LABELS } from '@/config/constants'
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
    // Avoid leaving empty if possible
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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Icon icon="lucide:alarm-clock" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">
              {{ isEditing ? 'Editar Alarma' : 'Nueva Alarma de Comida' }}
            </h3>
            <p class="text-xs text-slate-400">Configura la hora y repetición del dispensador</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Icon icon="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="mt-5 space-y-5">
        <!-- Error alert -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
        >
          <Icon icon="lucide:alert-circle" class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Big Hour Selector -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Hora Programada
          </label>
          <div class="relative">
            <input
              type="time"
              v-model="hora"
              required
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-5 py-4 text-3xl font-mono font-bold text-center text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            />
          </div>
        </div>

        <!-- Label & Presets -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Etiqueta / Nombre
          </label>
          <input
            type="text"
            v-model="etiqueta"
            placeholder="Ej. Desayuno Michi, Almuerzo..."
            maxlength="40"
            class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />

          <!-- Quick Presets -->
          <div class="mt-2 flex items-center gap-1.5 flex-wrap">
            <button
              v-for="preset in DEFAULT_ALARM_LABELS"
              :key="preset"
              type="button"
              @click="selectLabelPreset(preset)"
              class="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition-colors"
            >
              {{ preset }}
            </button>
          </div>
        </div>

        <!-- Repetition Mode Selector -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Frecuencia de Repetición
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="tipoRepeticion = 'dias_semana'"
              class="p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center"
              :class="[
                tipoRepeticion === 'dias_semana'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              ]"
            >
              <Icon icon="lucide:repeat" class="w-4 h-4" />
              <span>Días de Semana</span>
            </button>

            <button
              type="button"
              @click="tipoRepeticion = 'una_vez'"
              class="p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center"
              :class="[
                tipoRepeticion === 'una_vez'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              ]"
            >
              <Icon icon="lucide:bell-ring" class="w-4 h-4" />
              <span>Una Sola Vez</span>
            </button>

            <button
              type="button"
              @click="tipoRepeticion = 'fecha_especifica'"
              class="p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-center"
              :class="[
                tipoRepeticion === 'fecha_especifica'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              ]"
            >
              <Icon icon="lucide:calendar-days" class="w-4 h-4" />
              <span>Fecha Calendario</span>
            </button>
          </div>
        </div>

        <!-- Mode 1: Days of Week Circular Pills & Shortcuts -->
        <div v-if="tipoRepeticion === 'dias_semana'" class="space-y-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Selecciona los días:</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="selectAllDays"
                class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Todos
              </button>
              <span class="text-slate-700">|</span>
              <button
                type="button"
                @click="selectWeekdays"
                class="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
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
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              ]"
            >
              <span>{{ d.letter }}</span>
            </button>
          </div>
        </div>

        <!-- Mode 3: Calendar Date Picker -->
        <div v-else-if="tipoRepeticion === 'fecha_especifica'" class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <label class="block text-xs font-medium text-slate-400 mb-1.5">
            Fecha para la apertura
          </label>
          <input
            type="date"
            v-model="fechaEspecifica"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        <!-- Active Switch -->
        <div class="flex items-center justify-between py-2 px-1">
          <div>
            <span class="text-sm font-semibold text-white block">Estado inicial</span>
            <span class="text-xs text-slate-400">Habilitar alarma inmediatamente tras guardar</span>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="activa"
            @click="activa = !activa"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="activa ? 'bg-emerald-500' : 'bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="activa ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Icon icon="lucide:check" class="w-4 h-4" />
            <span>{{ isEditing ? 'Actualizar Alarma' : 'Guardar Alarma' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
