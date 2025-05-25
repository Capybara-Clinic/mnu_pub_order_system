// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import CashierDashboard from '@/views/CashierDashboard.vue'
import TableDetailView from '@/views/TableDetailView.vue'

const routes = [
  // 메인 대시보드
  {
    path: '/',
    name: 'CashierDashboard',
    component: CashierDashboard
  },
  
  // 테이블 상세 페이지
  {
    path: '/table/:id',
    name: 'TableDetail',
    component: TableDetailView,
    props: true // URL 파라미터를 props로 전달
  },

  // 전체 주문 관리 페이지
  {
    path: '/orders',
    name: 'OrderManagement', 
    component: () => import('@/views/OrderManagementView.vue')
  },
  
  // 새 주문 추가 페이지 (테이블ID 옵셔널)
  {
    path: '/order/new/:tableId?',
    name: 'NewOrder',
    component: () => import('@/views/OrderEditView.vue'),
    props: true
  },
  
  // 기존 주문 수정 페이지
  {
    path: '/order/edit/:tableId/:orderId',
    name: 'EditOrder', 
    component: () => import('@/views/OrderEditView.vue'),
    props: true
  },

  // 404 페이지 (옵셔널)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 네비게이션 가드 (옵셔널 - 디버깅용)
router.beforeEach((to, from, next) => {
  console.log(`[Router] ${from.path} → ${to.path}`)
  next()
})

export default router