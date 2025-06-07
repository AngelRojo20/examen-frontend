import { createRouter, createWebHistory } from 'vue-router'
import SpecialistView from '@/views/SpecialistView.vue'
import SpecialistInactivesView from '@/views/SpecialistInactivesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Especialistas',
      component: SpecialistView,
    },
    {
      path: '/especialistas/inactivos',
      component: SpecialistInactivesView,
    },
  ],
})

export default router
