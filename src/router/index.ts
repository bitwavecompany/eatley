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
    // Catch-all route: redirect any unknown URL to Dashboard
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

// Global navigation guard: protects routes and prevents unauthorized deep linking
router.beforeEach(async (to) => {
  // If Firebase is not configured (local development or demo mode), allow access
  if (!env.isFirebaseConfigured) {
    return true
  }

  // Await Firebase auth state resolution
  const user = await getCurrentUser()

  // If user is unauthenticated and navigating beyond dashboard, redirect to home/dashboard
  if (!user && to.path !== APP_ROUTES.DASHBOARD) {
    return { path: APP_ROUTES.DASHBOARD, replace: true }
  }

  return true
})

// Dynamic document title updater
router.afterEach((to) => {
  const baseTitle = 'eatley'
  if (to.meta.title && typeof to.meta.title === 'string') {
    document.title = `${to.meta.title} | eatley`
  } else {
    document.title = baseTitle
  }
})
