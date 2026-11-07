import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { APP_ROUTES } from '@/config/constants'
import { env } from '@/config/env'
import { getCurrentUser } from '@/services/firebase.client'

const routes: RouteRecordRaw[] = [
  {
    path: APP_ROUTES.DASHBOARD,
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Panel de Control', requiresAuth: true },
  },
  {
    path: APP_ROUTES.ALARMS,
    name: 'alarms',
    component: () => import('@/views/AlarmsView.vue'),
    meta: { title: 'Programación de Alarmas', requiresAuth: true },
  },
  {
    path: APP_ROUTES.HISTORY,
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: 'Bitácora de Eventos', requiresAuth: true },
  },
  {
    path: APP_ROUTES.ADMIN,
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Calibración y Hardware', requiresAuth: true },
  },
  {
    // Redireccionamiento de cualquier ruta inexistente al Home
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: APP_ROUTES.DASHBOARD,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Guardia de navegación global: protege rutas y evita acceso directo por URL sin credenciales
router.beforeEach(async (to) => {
  // Si Firebase no está configurado (modo desarrollo local/demo), permitir acceso
  if (!env.isFirebaseConfigured) {
    return true
  }

  // Espera a que Firebase determine el estado de la sesión persistida
  const user = await getCurrentUser()

  // Si el usuario no está autenticado y no está en la raíz, redirige inmediatamente al Home
  if (!user && to.path !== APP_ROUTES.DASHBOARD) {
    return { path: APP_ROUTES.DASHBOARD, replace: true }
  }

  return true
})

// Actualización dinámica del título de la pestaña
router.afterEach((to) => {
  const baseTitle = 'eatley - Dispensador Inteligente'
  if (to.meta.title && typeof to.meta.title === 'string') {
    document.title = `${to.meta.title} | eatley`
  } else {
    document.title = baseTitle
  }
})
