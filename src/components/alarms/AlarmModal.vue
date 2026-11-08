<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Check,
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  AlertCircle,
} from '@lucide/vue'
import { DAYS_OF_WEEK } from '@/config/constants'
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
  if (dias.length === 5 && [1, 2, 3, 4, 5].every((d) => dias.includes(d))) return 'Lunes a viernes'
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

function selectPresetRepeat(type: 'once' | 'daily') {
  if (type === 'once') {
    tipoRepeticion.value = 'una_vez'
  } else if (type === 'daily') {
    tipoRepeticion.value = 'dias_semana'
    diasSemana.value = [1, 2, 3, 4, 5, 6, 0]
  }
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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-sm sm:max-w-md my-auto rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Error Alert Bar (if any) -->
      <div
        v-if="errorMessage"
        class="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- ======================================================== -->
      <!-- VIEW 1: MAIN ALARM EDITOR                                -->
      <!-- ======================================================== -->
      <div v-if="currentStep === 'main'" class="flex flex-col p-5 sm:p-6 space-y-5">
        <!-- Top App Bar -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <!-- Cancel / Close Button -->
          <button
            type="button"
            @click="emit('close')"
            class="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Cancelar"
            aria-label="Cancelar"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Centered Title & Dynamic Subtitle -->
          <div class="text-center px-2">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {{ isEditing ? 'Editar alarma' : 'Nueva alarma' }}
            </h3>
            <p class="text-[11px] font-semibold text-emerald-700 mt-0.5">
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
        <div class="py-2 flex flex-col items-center justify-center select-none">
          <div class="grid grid-cols-2 gap-8 w-full max-w-[260px]">
            <!-- Column 1: Hours (Hora) -->
            <div
              class="flex flex-col items-center justify-center cursor-ns-resize"
              @wheel="handleHourWheel"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleHourTouchMove"
            >
              <span class="text-xs font-bold text-slate-400 mb-1">Hora</span>

              <!-- Desktop Arrow Up Button -->
              <button
                type="button"
                @click="changeHour(-1)"
                class="hidden md:flex items-center justify-center w-12 h-8 mb-1 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-xs transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                title="Hora anterior (-1h)"
                aria-label="Hora anterior"
              >
                <ChevronUp class="w-4 h-4 stroke-[2.5]" />
              </button>

              <!-- Previous Hour (-1) -->
              <button
                type="button"
                @click="changeHour(-1)"
                class="h-7 text-xl font-light text-slate-300 hover:text-slate-600 transition-colors font-mono cursor-pointer"
              >
                {{ String((selectedHour - 1 + 24) % 24).padStart(2, '0') }}
              </button>

              <!-- Current Selected Hour (Center) -->
              <div class="my-1 px-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tracking-tight shadow-inner">
                {{ String(selectedHour).padStart(2, '0') }}
              </div>

              <!-- Next Hour (+1) -->
              <button
                type="button"
                @click="changeHour(1)"
                class="h-7 text-xl font-light text-slate-300 hover:text-slate-600 transition-colors font-mono cursor-pointer"
              >
                {{ String((selectedHour + 1) % 24).padStart(2, '0') }}
              </button>

              <!-- Desktop Arrow Down Button -->
              <button
                type="button"
                @click="changeHour(1)"
                class="hidden md:flex items-center justify-center w-12 h-8 mt-1 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-xs transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                title="Siguiente hora (+1h)"
                aria-label="Siguiente hora"
              >
                <ChevronDown class="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <!-- Column 2: Minutes (Min) -->
            <div
              class="flex flex-col items-center justify-center cursor-ns-resize"
              @wheel="handleMinuteWheel"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleMinuteTouchMove"
            >
              <span class="text-xs font-bold text-slate-400 mb-1">Min</span>

              <!-- Desktop Arrow Up Button -->
              <button
                type="button"
                @click="changeMinute(-1)"
                class="hidden md:flex items-center justify-center w-12 h-8 mb-1 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-xs transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                title="Minuto anterior (-1m)"
                aria-label="Minuto anterior"
              >
                <ChevronUp class="w-4 h-4 stroke-[2.5]" />
              </button>

              <!-- Previous Minute (-1) -->
              <button
                type="button"
                @click="changeMinute(-1)"
                class="h-7 text-xl font-light text-slate-300 hover:text-slate-600 transition-colors font-mono cursor-pointer"
              >
                {{ String((selectedMinute - 1 + 60) % 60).padStart(2, '0') }}
              </button>

              <!-- Current Selected Minute (Center) -->
              <div class="my-1 px-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tracking-tight shadow-inner">
                {{ String(selectedMinute).padStart(2, '0') }}
              </div>

              <!-- Next Minute (+1) -->
              <button
                type="button"
                @click="changeMinute(1)"
                class="h-7 text-xl font-light text-slate-300 hover:text-slate-600 transition-colors font-mono cursor-pointer"
              >
                {{ String((selectedMinute + 1) % 60).padStart(2, '0') }}
              </button>

              <!-- Desktop Arrow Down Button -->
              <button
                type="button"
                @click="changeMinute(1)"
                class="hidden md:flex items-center justify-center w-12 h-8 mt-1 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-xs transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                title="Siguiente minuto (+1m)"
                aria-label="Siguiente minuto"
              >
                <ChevronDown class="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-3 pt-1">
          <!-- Repeat Selector Card -->
          <div class="rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm overflow-hidden">
            <button
              type="button"
              @click="currentStep = 'repeat'"
              class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors group"
            >
              <div>
                <span class="text-xs font-semibold text-slate-500 block">Repetición</span>
                <span class="text-sm font-bold text-slate-900 mt-0.5 block">{{ repetitionSummary }}</span>
              </div>
              <div class="flex items-center gap-1 text-emerald-700 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                <span>Cambiar</span>
                <ChevronRight class="w-4 h-4 text-emerald-600" />
              </div>
            </button>
          </div>

          <!-- Dedicated Alarm Name Input Box -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">
              Nombre de la alarma
            </label>
            <input
              v-model="etiqueta"
              type="text"
              maxlength="35"
              placeholder="Ej: Desayuno, Almuerzo, Cena..."
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <!-- Delete Action (if editing) -->
          <button
            v-if="isEditing"
            type="button"
            @click="handleDeleteFromModal"
            class="w-full mt-2 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-rose-200/80 transition-colors shadow-sm"
          >
            <Trash2 class="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- VIEW 2: REPEAT SUB-MENU                                  -->
      <!-- ======================================================== -->
      <div v-else-if="currentStep === 'repeat'" class="flex flex-col p-5 sm:p-6 space-y-4 animate-in slide-in-from-right-4 duration-150">
        <!-- Top Bar with Back Arrow -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <button
            type="button"
            @click="currentStep = 'main'"
            class="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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

        <div class="space-y-3">
          <!-- Preset Options Group -->
          <div class="rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200/80 shadow-sm overflow-hidden">
            <!-- Once -->
            <button
              type="button"
              @click="selectPresetRepeat('once')"
              class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
            >
              <span class="text-sm font-semibold" :class="tipoRepeticion === 'una_vez' ? 'text-emerald-700' : 'text-slate-800'">
                Una sola vez
              </span>
              <Check v-if="tipoRepeticion === 'una_vez'" class="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            </button>

            <!-- Daily -->
            <button
              type="button"
              @click="selectPresetRepeat('daily')"
              class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
            >
              <span
                class="text-sm font-semibold"
                :class="tipoRepeticion === 'dias_semana' && diasSemana.length === 7 ? 'text-emerald-700' : 'text-slate-800'"
              >
                Diario (todos los días)
              </span>
              <Check
                v-if="tipoRepeticion === 'dias_semana' && diasSemana.length === 7"
                class="w-4 h-4 text-emerald-600 stroke-[2.5]"
              />
            </button>

            <!-- Personalizar -->
            <button
              type="button"
              @click="
                () => {
                  tipoRepeticion = 'dias_semana'
                  currentStep = 'customize'
                }
              "
              class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors group"
            >
              <div>
                <span
                  class="text-sm font-semibold block"
                  :class="tipoRepeticion === 'dias_semana' && diasSemana.length !== 7 ? 'text-emerald-700' : 'text-slate-800'"
                >
                  Personalizar
                </span>
                <span class="text-xs text-slate-500 block mt-0.5">
                  Elegir días específicos de la semana
                </span>
              </div>
              <div class="flex items-center gap-1.5">
                <span
                  v-if="tipoRepeticion === 'dias_semana' && diasSemana.length !== 7"
                  class="text-xs font-semibold text-emerald-700"
                >
                  {{ repetitionSummary }}
                </span>
                <ChevronRight class="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- VIEW 3: CUSTOMIZE DAYS SUB-MENU                          -->
      <!-- ======================================================== -->
      <div v-else-if="currentStep === 'customize'" class="flex flex-col p-5 sm:p-6 space-y-4 animate-in slide-in-from-right-4 duration-150">
        <!-- Top Bar with Back Arrow -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <button
            type="button"
            @click="currentStep = 'repeat'"
            class="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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

        <!-- Days of Week with Circular Checkboxes -->
        <div class="rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200/80 shadow-sm overflow-hidden max-h-[60vh] overflow-y-auto">
          <button
            v-for="day in DAYS_OF_WEEK"
            :key="day.id"
            type="button"
            @click="toggleDay(day.id)"
            class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
          >
            <span class="text-sm font-semibold text-slate-800">
              {{ day.fullLabel }}
            </span>

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
