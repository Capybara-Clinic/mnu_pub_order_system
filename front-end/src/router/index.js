import { createRouter, createWebHistory } from 'vue-router';
import OrderPage from '@/pages/order/OrderPage.vue';
import PaymentPage from '@/pages/order/PaymentPage.vue';
import PaymentCompletePage from '@/pages/order/PaymentCompletePage.vue';
import OrderHistoryPage from '@/pages/order/OrderHistoryPage.vue';
import CashierDashboard from '@/pages/cashier/CashierDashboard.vue';
import TableDetailView from '@/pages/cashier/TableDetailView.vue';
import OrderManagementView from '@/pages/cashier/OrderManagementView.vue';
import OrderEditView from '@/pages/cashier/OrderEditView.vue';
import InventoryManagement from '@/pages/cashier/InventoryManagementView.vue';

const routes = [
  // 메인 대시보드 - 캐셔 (루트 경로)
  {
    path: '/',
    name: 'CashierDashboard',
    component: CashierDashboard
  },
  
  // 주문 관련 라우트
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

  // 캐셔 관련 라우트
  {
    path: '/table/:id',
    name: 'TableDetail',
    component: TableDetailView,
    props: true
  },
  {
    path: '/orders',
    name: 'OrderManagement', 
    component: OrderManagementView  // component 추가!
  },
  {
    path: '/order/new/:tableId?',
    name: 'NewOrder',
    component: OrderEditView,  // component 추가!
    props: true
  },
  {
    path: '/order/edit/:tableId/:orderId',
    name: 'EditOrder', 
    component: OrderEditView,  // component 추가!
    props: true
  },
  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement  // component 추가!
  },

  // 404 처리 - 맨 마지막에 위치해야 함
  {
    path: '/:pathMatch(.*)*',  // Vue 3 문법으로 수정
    name: 'NotFound',
    beforeEnter() {
      window.location.href = '/404.html';  // window 추가
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 네비게이션 가드 (옵셔널 - 디버깅용)
router.beforeEach((to, from, next) => {
  console.log(`[Router] ${from.path} → ${to.path}`);
  next();
});

export default router;