import { createRouter, createWebHistory } from 'vue-router';
import OrderPage from '@/pages/order/OrderPage.vue';
import PaymentPage from '@/pages/order/PaymentPage.vue';
import PaymentCompletePage from '@/pages/order/PaymentCompletePage.vue';
import OrderHistoryPage from '@/pages/order/OrderHistoryPage.vue';
// import CashierDashboard from '@/pages/cashier/CashierDashboard.vue';
// import TableDetailView from '@/pages/cashier/TableDetailView.vue';
// import OrderManagementView from '@/pages/cashier/OrderManagementView.vue';
// import OrderEditView from '@/pages/cashier/OrderEditView.vue';
// import InventoryManagement from '@/pages/cashier/InventoryManagementView.vue';
// import TableOrders from '@/pages/server/TableOrders.vue';

// API 연동 테스트용 axios 설정
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL,	// process.env로 접근하여 변수 사용
});

// TODO : directory refactoring

const routes = [
  {
    path: '/order/:tableId',
    name: 'OrderPage',
    component: OrderPage,
  },
  {
    path: '/payment/:tableId',
    name: 'PaymentPage',
    component: PaymentPage,
  },
  {
    path: '/payment/success/:orderId',
    name: 'PaymentCompletePage',
    component: PaymentCompletePage,
  },
  {
    path: '/history/:tableId',
    name: 'OrderHistoryPage',
    component: OrderHistoryPage,
  },

  // 404 페이지 (옵셔널)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 네비게이션 가드 (옵셔널 - 디버깅용)
router.beforeEach((to, from, next) => {
  console.log(`[Router] ${from.path} → ${to.path}`)
  next()
});

// API 인스턴스 export (다른 파일에서 사용할 수 있도록)
export { instance as apiClient };
export default router;