<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '@/services/firebase.client'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useAlarmsStore } from '@/stores/useAlarmsStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import EnvWarningBanner from '@/components/layout/EnvWarningBanner.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import PinLockModal from '@/components/auth/PinLockModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { APP_ROUTES } from '@/config/constants'
import { PawPrint, Loader2, LogOut } from '@lucide/vue'

const deviceStore = useDeviceStore()
const alarmsStore = useAlarmsStore()
const configStore = useConfigStore()
const historyStore = useHistoryStore()

const currentUser = ref<User | null>(null)
const isAuthChecking = ref(true)
const showLogoutModal = ref(false)

function initializeStores() {
  deviceStore.init()
  alarmsStore.init()
  configStore.init()
  historyStore.init()
}

onMounted(() => {
  if (!auth) {
    // Si Firebase no está configurado (modo sin credenciales), saltar verificación
    isAuthChecking.value = false
    initializeStores()
    return
  }

  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    isAuthChecking.value = false

    if (user) {
      // Iniciar suscripciones a Realtime Database una vez autenticado con éxito
      initializeStores()
    }
  })
})

async function handleConfirmLogout() {
  showLogoutModal.value = false
  if (auth) {
    try {
      deviceStore.destroy()
      alarmsStore.destroy()
      configStore.destroy()
      historyStore.destroy()
      await signOut(auth)
      // Redirigir al home y recargar la ventana para reiniciar completamente el estado reactivo y sockets
      window.location.href = APP_ROUTES.DASHBOARD
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }
}
</script>

<template>
  <!-- 1. Pantalla de carga inicial (Evita parpadeos mientras Firebase verifica la sesión persistida) -->
  <div
    v-if="isAuthChecking"
    class="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-900"
  >
    <div class="flex flex-col items-center space-y-4 animate-pulse">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
        <PawPrint class="w-9 h-9 text-white stroke-[2.2]" />
      </div>
      <div class="flex items-center gap-1.5">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
          eat<span class="text-emerald-600">ley</span>
        </h1>
        <span class="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          IoT
        </span>
      </div>
      <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Loader2 class="w-4 h-4 animate-spin text-emerald-600" />
        <span>Comprobando acceso seguro...</span>
      </div>
    </div>
  </div>

  <!-- 2. Modal de Bloqueo por PIN si no hay sesión familiar activa -->
  <PinLockModal v-else-if="!currentUser" />

  <!-- 3. Interfaz Principal de la Aplicación si el usuario está autenticado -->
  <div v-else class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <!-- Unconfigured Firebase Warning Banner -->
    <EnvWarningBanner />

    <!-- Top App Header con botón de cierre de sesión -->
    <AppHeader
      :is-authenticated="true"
      @logout="showLogoutModal = true"
    />

    <!-- Main Content View Area -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6">
      <RouterView v-slot="{ Component }">
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Bottom Navigation Bar -->
    <BottomNav />

    <!-- Modal de Confirmación para Cerrar Sesión / Bloquear -->
    <ConfirmationModal
      :is-open="showLogoutModal"
      title="¿Cerrar Sesión?"
      description="Se cerrará la sesión actual"
      confirm-text="Acepar"
      cancel-text="Cancelar"
      variant="warning"
      :icon="LogOut"
      @confirm="handleConfirmLogout"
      @close="showLogoutModal = false"
    />
  </div>
</template>
