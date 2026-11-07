<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Check,
  ArrowLeft,
  ChevronRight,
  Trash2,
  CalendarDays,
  AlertCircle,
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
  (e: 'delete', id: string): void
}>()

const deviceStore = useDeviceStore()

type NavigationStep = 'main' | 'repeat' | 'customize'
const currentStep = ref<NavigationStep>('main')

const hora = ref('08:00')
const selectedHour = ref(8)
const selectedMinute = ref(0)
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
      currentStep.value = 'main'
      errorMessage.value = ''
      if (props.initialAlarm) {
        hora.value = props.initialAlarm.hora
        const [h, m] = props.initialAlarm.hora.split(':').map(Number)
        selectedHour.value = isNaN(h) ? 8 : h
        selectedMinute.value = isNaN(m) ? 0 : m
        etiqueta.value = props.initialAlarm.etiqueta
        activa.value = props.initialAlarm.activa
        tipoRepeticion.value = props.initialAlarm.tipo_repeticion
        diasSemana.value =
          Array.isArray(props.initialAlarm.dias_semana) && props.initialAlarm.dias_semana.length > 0
            ? [...props.initialAlarm.dias_semana]
            : [1, 2, 3, 4, 5, 6, 0]
        fechaEspecifica.value = props.initialAlarm.fecha_especifica || ''
      } else {
        hora.value = '08:00'
        selectedHour.value = 8
        selectedMinute.value = 0
        etiqueta.value = ''
        activa.value = true
        tipoRepeticion.value = 'dias_semana'
        diasSemana.value = [1, 2, 3, 4, 5, 6, 0]
        fechaEspecifica.value = new Date().toISOString().split('T')[0]
      }
    }
  }
)

function updateTimeString() {
  const hStr = String(selectedHour.value).padStart(2, '0')
  const mStr = String(selectedMinute.value).padStart(2, '0')
  hora.value = `${hStr}:${mStr}`
}

function changeHour(delta: number) {
  selectedHour.value = (selectedHour.value + delta + 24) % 24
  updateTimeString()
}

function changeMinute(delta: number) {
  selectedMinute.value = (selectedMinute.value + delta + 60) % 60
  updateTimeString()
}

function handleHourWheel(e: WheelEvent) {
  e.preventDefault()
  changeHour(e.deltaY > 0 ? 1 : -1)
}

function handleMinuteWheel(e: WheelEvent) {
  e.preventDefault()
  changeMinute(e.deltaY > 0 ? 1 : -1)
}

let touchStartY = 0
function handleTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
}

function handleHourTouchMove(e: TouchEvent) {
  const currentY = e.touches[0].clientY
  const diff = touchStartY - currentY
  if (Math.abs(diff) > 28) {
    changeHour(diff > 0 ? 1 : -1)
    touchStartY = currentY
  }
}

function handleMinuteTouchMove(e: TouchEvent) {
  const currentY = e.touches[0].clientY
  const diff = touchStartY - currentY
  if (Math.abs(diff) > 28) {
    changeMinute(diff > 0 ? 1 : -1)
    touchStartY = currentY
  }
}

// Android-style dynamic countdown subtitle
const countdownSubtitle = computed(() => {
  const [targetH, targetM] = hora.value.split(':').map(Number)
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const targetMin = targetH * 60 + targetM
  let diff = targetMin - nowMin
  if (diff <= 0) diff += 24 * 60
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `Alarma en ${m} ${m === 1 ? 'minuto' : 'minutos'}`
  if (m === 0) return `Alarma en ${h} ${h === 1 ? 'hora' : 'horas'}`
  return `Alarma en ${h} ${h === 1 ? 'hora' : 'horas'} ${m} ${m === 1 ? 'minuto' : 'minutos'}`
})

const repetitionSummary = computed(() => {
  if (tipoRepeticion.value === 'una_vez') return 'Una sola vez'
  if (tipoRepeticion.value === 'fecha_especifica') {
    return fechaEspecifica.value ? `Fecha: ${fechaEspecifica.value}` : 'Fecha específica'
  }
  const dias = diasSemana.value || []
  if (dias.length === 7) return 'Diario'
  if (dias.length === 5 && [1, 2, 3, 4, 5].every((d) => dias.includes(d))) return 'Lunes a Viernes'
  if (dias.length === 2 && [0, 6].every((d) => dias.includes(d))) return 'Fines de semana'

  const shortMap: Record<number, string> = {
    1: 'Lun',
    2: 'Mar',
    3: 'Mié',
    4: 'Jue',
    5: 'Vie',
    6: 'Sáb',
    0: 'Dom',
  }
  const sorted = [...dias].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
  return sorted.map((d) => shortMap[d]).join(' ') || 'Sin días'
})

function toggleDay(dayId: number) {
  if (diasSemana.value.includes(dayId)) {
    if (diasSemana.value.length > 1) {
      diasSemana.value = diasSemana.value.filter((d) => d !== dayId)
    }
  } else {
    diasSemana.value = [...diasSemana.value, dayId]
  }
}

function selectPresetRepeat(type: 'once' | 'daily' | 'weekdays' | 'specific') {
  if (type === 'once') {
    tipoRepeticion.value = 'una_vez'
  } else if (type === 'daily') {
    tipoRepeticion.value = 'dias_semana'
    diasSemana.value = [1, 2, 3, 4, 5, 6, 0]
  } else if (type === 'weekdays') {
    tipoRepeticion.value = 'dias_semana'
    diasSemana.value = [1, 2, 3, 4, 5]
  } else if (type === 'specific') {
    tipoRepeticion.value = 'fecha_especifica'
    if (!fechaEspecifica.value) {
      fechaEspecifica.value = new Date().toISOString().split('T')[0]
    }
  }
}

function selectLabelPreset(label: string) {
  etiqueta.value = label
}

function handleDeleteFromModal() {
  if (props.initialAlarm) {
    emit('delete', props.initialAlarm.id)
    emit('close')
  }
}

function handleSubmit() {
  errorMessage.value = ''

  if (!deviceStore.isFirebaseConnected) {
    errorMessage.value = 'No se puede guardar: la conexión con Firebase no está activa.'
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
        ultima_ejecucion_fecha: null,
        omitida_hoy_fecha: null,
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
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-slate-50 sm:bg-white border-t sm:border border-slate-200/90 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
    >
      <!-- Mobile Notch Handle -->
      <div class="sm:hidden pt-3 pb-1 flex justify-center">
        <div class="w-10 h-1 rounded-full bg-slate-300"></div>
      </div>

      <!-- Error Toast Bar (if any) -->
      <div
        v-if="errorMessage"
        class="mx-4 mt-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- ======================================================== -->
      <!-- VIEW 1: MAIN ALARM EDITOR (Screenshots 3 & 4)            -->
      <!-- ======================================================== -->
      <div v-if="currentStep === 'main'" class="flex flex-col flex-1 overflow-y-auto px-5 sm:px-6 pt-2 pb-6">
        <!-- Top App Bar -->
        <div class="flex items-center justify-between py-2">
          <!-- Cancel / Close Button -->
          <button
            type="button"
            @click="emit('close')"
            class="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            title="Cancelar"
            aria-label="Cancelar"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Centered Title -->
          <div class="text-center">
            <h3 class="text-base sm:text-lg font-bold text-slate-900">
              {{ isEditing ? 'Editar alarma' : 'Nueva alarma' }}
            </h3>
            <p class="text-[11px] font-medium text-slate-500 mt-0.5">
              {{ countdownSubtitle }}
            </p>
          </div>

          <!-- Save Button (Checkmark) -->
          <button
            type="button"
            @click="handleSubmit"
            class="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 transition-all"
            title="Guardar alarma"
            aria-label="Guardar alarma"
          >
            <Check class="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <!-- Android Time Roller Wheel Picker (H & M) -->
        <div class="py-6 sm:py-8 flex flex-col items-center justify-center select-none">
          <div class="grid grid-cols-2 gap-8 sm:gap-10 w-full max-w-[280px]">
            <!-- Column 1: Hours (H) -->
            <div
              class="flex flex-col items-center justify-center cursor-ns-resize"
              @wheel="handleHourWheel"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleHourTouchMove"
            >
              <span class="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">H</span>

              <!-- Previous Hour (-1) -->
              <button
                type="button"
                @click="changeHour(-1)"
                class="h-8 text-2xl font-light text-slate-400 hover:text-slate-600 transition-colors font-mono"
              >
                {{ String((selectedHour - 1 + 24) % 24).padStart(2, '0') }}
              </button>

              <!-- Current Selected Hour (Center) -->
              <div class="my-2 px-3 py-1 rounded-2xl bg-slate-100 sm:bg-slate-50 border border-slate-200 text-5xl font-extrabold text-slate-900 font-mono tracking-tight shadow-inner">
                {{ String(selectedHour).padStart(2, '0') }}
              </div>

              <!-- Next Hour (+1) -->
              <button
                type="button"
                @click="changeHour(1)"
                class="h-8 text-2xl font-light text-slate-400 hover:text-slate-600 transition-colors font-mono"
              >
                {{ String((selectedHour + 1) % 24).padStart(2, '0') }}
              </button>
            </div>

            <!-- Column 2: Minutes (M) -->
            <div
              class="flex flex-col items-center justify-center cursor-ns-resize"
              @wheel="handleMinuteWheel"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleMinuteTouchMove"
            >
              <span class="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">M</span>

              <!-- Previous Minute (-1) -->
              <button
                type="button"
                @click="changeMinute(-1)"
                class="h-8 text-2xl font-light text-slate-400 hover:text-slate-600 transition-colors font-mono"
              >
                {{ String((selectedMinute - 1 + 60) % 60).padStart(2, '0') }}
              </button>

              <!-- Current Selected Minute (Center) -->
              <div class="my-2 px-3 py-1 rounded-2xl bg-slate-100 sm:bg-slate-50 border border-slate-200 text-5xl font-extrabold text-slate-900 font-mono tracking-tight shadow-inner">
                {{ String(selectedMinute).padStart(2, '0') }}
              </div>

              <!-- Next Minute (+1) -->
              <button
                type="button"
                @click="changeMinute(1)"
                class="h-8 text-2xl font-light text-slate-400 hover:text-slate-600 transition-colors font-mono"
              >
                {{ String((selectedMinute + 1) % 60).padStart(2, '0') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Android Grouped Settings Card (Screenshot 3) -->
        <div class="space-y-3">
          <div class="rounded-2xl bg-white sm:bg-slate-50 border border-slate-200 divide-y divide-slate-100 sm:divide-slate-200/80 shadow-sm overflow-hidden">
            <!-- Row 1: Repeat Configuration Button -->
            <button
              type="button"
              @click="currentStep = 'repeat'"
              class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors group"
            >
              <span class="text-sm font-semibold text-slate-800">Repetir</span>
              <div class="flex items-center gap-1.5 text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                <span>{{ repetitionSummary }}</span>
                <ChevronRight class="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            <!-- Row 2: Label Input -->
            <div class="px-4 py-3 flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-slate-800 shrink-0">Etiqueta</span>
              <input
                v-model="etiqueta"
                type="text"
                maxlength="30"
                placeholder="Ración programada"
                class="w-full text-right text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium truncate"
              />
            </div>
          </div>

          <!-- Quick Label Presets -->
          <div class="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              v-for="preset in DEFAULT_ALARM_LABELS"
              :key="preset"
              type="button"
              @click="selectLabelPreset(preset)"
              class="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors"
              :class="[
                etiqueta === preset
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white sm:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              ]"
            >
              {{ preset }}
            </button>
          </div>

          <!-- Delete Action (if editing existing alarm) -->
          <button
            v-if="isEditing"
            type="button"
            @click="handleDeleteFromModal"
            class="w-full mt-3 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-rose-200/80 transition-colors shadow-sm"
          >
            <Trash2 class="w-4 h-4" />
            <span>Eliminar esta alarma</span>
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- VIEW 2: REPEAT SUB-MENU (Screenshot 2)                   -->
      <!-- ======================================================== -->
      <div v-else-if="currentStep === 'repeat'" class="flex flex-col flex-1 overflow-y-auto px-5 sm:px-6 pt-2 pb-6 animate-in slide-in-from-right-4 duration-150">
        <!-- Top App Bar with Back Arrow -->
        <div class="flex items-center justify-between py-2 border-b border-slate-200/80 mb-4">
          <button
            type="button"
            @click="currentStep = 'main'"
            class="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Volver"
            aria-label="Volver"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>

          <h3 class="text-base sm:text-lg font-bold text-slate-900">
            Repetir
          </h3>

          <div class="w-9"></div>
        </div>

        <div class="space-y-4">
          <!-- Card Group 1: Standard Options -->
          <div class="rounded-2xl bg-white sm:bg-slate-50 border border-slate-200 divide-y divide-slate-100 sm:divide-slate-200/80 shadow-sm overflow-hidden">
            <!-- Option: Once -->
            <button
              type="button"
              @click="selectPresetRepeat('once')"
              class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
            >
              <span class="text-sm font-semibold" :class="tipoRepeticion === 'una_vez' ? 'text-emerald-700' : 'text-slate-800'">
                Una sola vez
              </span>
              <Check v-if="tipoRepeticion === 'una_vez'" class="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            </button>

            <!-- Option: Daily (Every day) -->
            <button
              type="button"
              @click="selectPresetRepeat('daily')"
              class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
            >
              <span
                class="text-sm font-semibold"
                :class="tipoRepeticion === 'dias_semana' && diasSemana.length === 7 ? 'text-emerald-700' : 'text-slate-800'"
              >
                Diario
              </span>
              <Check
                v-if="tipoRepeticion === 'dias_semana' && diasSemana.length === 7"
                class="w-4 h-4 text-emerald-600 stroke-[2.5]"
              />
            </button>

            <!-- Option: Monday to Friday -->
            <button
              type="button"
              @click="selectPresetRepeat('weekdays')"
              class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
            >
              <span
                class="text-sm font-semibold"
                :class="
                  tipoRepeticion === 'dias_semana' &&
                  diasSemana.length === 5 &&
                  [1, 2, 3, 4, 5].every((d) => diasSemana.includes(d))
                    ? 'text-emerald-700'
                    : 'text-slate-800'
                "
              >
                Lunes a Viernes
              </span>
              <Check
                v-if="
                  tipoRepeticion === 'dias_semana' &&
                  diasSemana.length === 5 &&
                  [1, 2, 3, 4, 5].every((d) => diasSemana.includes(d))
                "
                class="w-4 h-4 text-emerald-600 stroke-[2.5]"
              />
            </button>

            <!-- Option: Specific calendar date -->
            <div class="px-4 py-3.5 hover:bg-slate-100/70 transition-colors">
              <button
                type="button"
                @click="selectPresetRepeat('specific')"
                class="w-full flex items-center justify-between text-left"
              >
                <div class="flex items-center gap-2">
                  <CalendarDays class="w-4 h-4 text-slate-500" />
                  <span class="text-sm font-semibold" :class="tipoRepeticion === 'fecha_especifica' ? 'text-emerald-700' : 'text-slate-800'">
                    Fecha específica
                  </span>
                </div>
                <Check v-if="tipoRepeticion === 'fecha_especifica'" class="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              </button>

              <div v-if="tipoRepeticion === 'fecha_especifica'" class="mt-2.5">
                <input
                  v-model="fechaEspecifica"
                  type="date"
                  class="w-full px-3 py-2 rounded-xl bg-slate-50 sm:bg-white border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <!-- Card Group 2: Customize Button -->
          <div class="rounded-2xl bg-white sm:bg-slate-50 border border-slate-200 shadow-sm overflow-hidden">
            <button
              type="button"
              @click="
                () => {
                  tipoRepeticion = 'dias_semana'
                  currentStep = 'customize'
                }
              "
              class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors group"
            >
              <div>
                <span class="text-sm font-semibold text-slate-800 block">Personalizar</span>
                <span class="text-xs text-slate-500 block mt-0.5">Elegir días específicos de la semana</span>
              </div>
              <ChevronRight class="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- VIEW 3: CUSTOMIZE DAYS SUB-MENU (Screenshot 1)           -->
      <!-- ======================================================== -->
      <div v-else-if="currentStep === 'customize'" class="flex flex-col flex-1 overflow-y-auto px-5 sm:px-6 pt-2 pb-6 animate-in slide-in-from-right-4 duration-150">
        <!-- Top App Bar with Back Arrow -->
        <div class="flex items-center justify-between py-2 border-b border-slate-200/80 mb-4">
          <button
            type="button"
            @click="currentStep = 'repeat'"
            class="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Volver"
            aria-label="Volver"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>

          <h3 class="text-base sm:text-lg font-bold text-slate-900">
            Personalizar
          </h3>

          <div class="w-9"></div>
        </div>

        <!-- Android Days List with Circular Checkboxes (Screenshot 1) -->
        <div class="rounded-2xl bg-white sm:bg-slate-50 border border-slate-200 divide-y divide-slate-100 sm:divide-slate-200/80 shadow-sm overflow-hidden">
          <button
            v-for="day in DAYS_OF_WEEK"
            :key="day.id"
            type="button"
            @click="toggleDay(day.id)"
            class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
          >
            <span class="text-sm font-semibold text-slate-800">
              {{ day.fullLabel }}
            </span>

            <!-- Android Circular Checkbox -->
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150"
              :class="[
                diasSemana.includes(day.id)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border-2 border-slate-300 bg-white'
              ]"
            >
              <Check v-if="diasSemana.includes(day.id)" class="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
