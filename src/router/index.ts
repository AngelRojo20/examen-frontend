import { createRouter, createWebHistory } from 'vue-router'
import SpecialistView from '@/views/SpecialistView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Especialistas',
      component: SpecialistView,
    },
  ],
})

export default router
