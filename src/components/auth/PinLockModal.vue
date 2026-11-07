<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '@/services/firebase.client'
import { AUTH_CONFIG } from '@/config/constants'
import { useToastStore } from '@/stores/useToastStore'
import {
  PawPrint,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from '@lucide/vue'

const toastStore = useToastStore()
const pin = ref('')
const cargando = ref(false)
const errorMsg = ref('')
const showPin = ref(false)
const pinInputRef = ref<HTMLInputElement | null>(null)

function focusInput() {
  nextTick(() => {
    pinInputRef.value?.focus()
  })
}

onMounted(() => {
  focusInput()
})

async function handlePinSubmit() {
  errorMsg.value = ''
  const trimmedPin = pin.value.trim()

  if (!trimmedPin) {
    errorMsg.value = 'Por favor ingresa el PIN familiar.'
    focusInput()
    return
  }

  if (!auth) {
    errorMsg.value = 'Firebase no está configurado en el archivo .env.'
    return
  }

  cargando.value = true

  try {
    await signInWithEmailAndPassword(auth, AUTH_CONFIG.FAMILY_EMAIL, trimmedPin)
    toastStore.success('Sesión iniciada con éxito')
    // El cambio de sesión es detectado en tiempo real por onAuthStateChanged en App.vue
  } catch (err: unknown) {
    pin.value = ''
    focusInput()

    if (err instanceof FirebaseError) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          errorMsg.value = 'El PIN ingresado es incorrecto. Inténtalo nuevamente.'
          break
        case 'auth/user-not-found':
          errorMsg.value = 'La cuenta familiar no fue encontrada en Firebase Authentication.'
          break
        case 'auth/too-many-requests':
          errorMsg.value = 'Demasiados intentos fallidos. Espera unos momentos antes de reintentar.'
          break
        case 'auth/network-request-failed':
          errorMsg.value = 'Error de red: comprueba tu conexión a internet.'
          break
        default:
          errorMsg.value = `Error de autenticación: ${err.message}`
      }
    } else {
      errorMsg.value = 'Ocurrió un error inesperado al verificar el PIN.'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <div
      class="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Logo Brand -->
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
          <PawPrint class="w-9 h-9 text-white stroke-[2.2]" />
        </div>
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">
          eat<span class="text-emerald-600">ley</span>
        </h2>
      </div>

      <!-- Error feedback banner -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="errorMsg"
          class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 text-left shadow-sm"
          role="alert"
        >
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ errorMsg }}</span>
        </div>
      </transition>

      <!-- PIN Form -->
      <form @submit.prevent="handlePinSubmit" class="space-y-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock class="w-4 h-4" />
          </div>

          <input
            ref="pinInputRef"
            v-model="pin"
            :type="showPin ? 'text' : 'password'"
            inputmode="numeric"
            autocomplete="current-password"
            placeholder="Ingresa el PIN familiar"
            :disabled="cargando"
            class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl pl-10 pr-11 py-3 text-center text-lg font-mono font-bold tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60 shadow-inner"
          />

          <!-- Toggle Visibility Button -->
          <button
            type="button"
            @click="showPin = !showPin"
            tabindex="-1"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            title="Alternar visibilidad"
          >
            <EyeOff v-if="showPin" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="cargando || !pin.trim()"
          class="w-full py-3.5 px-5 rounded-2xl font-bold text-sm tracking-wide text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          <Loader2 v-if="cargando" class="w-4 h-4 animate-spin" />
          <span>{{ cargando ? 'Verificando PIN...' : 'Ingresar' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
