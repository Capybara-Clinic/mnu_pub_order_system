import { createRouter, createWebHistory } from 'vue-router'
import KitchenView from '@/views/KitchenView.vue'

const routes = [
    { path: '/', name: 'Kitchen', component: KitchenView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router