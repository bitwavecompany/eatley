import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { APP_ROUTES } from '@/config/constants'

const routes: RouteRecordRaw[] = [
  {
    path: APP_ROUTES.DASHBOARD,
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Panel de Control' },
  },
  {
    path: APP_ROUTES.ALARMS,
    name: 'alarms',
    component: () => import('@/views/AlarmsView.vue'),
    meta: { title: 'Programación de Alarmas' },
  },
  {
    path: APP_ROUTES.HISTORY,
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: 'Bitácora de Eventos' },
  },
  {
    path: APP_ROUTES.ADMIN,
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Calibración y Hardware' },
  },
  {
    path: '/:pathMatch(.*)*',
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
