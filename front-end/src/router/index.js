import { createRouter, createWebHistory } from 'vue-router';
import OrderPage from '@/pages/order/OrderPage.vue';
import PaymentPage from '@/pages/order/PaymentPage.vue';
import PaymentCompletePage from '@/pages/order/PaymentCompletePage.vue';
import OrderHistoryPage from '@/pages/order/OrderHistoryPage.vue';
import CashierDashboard from '@/pages/cashier/CashierDashboard.vue'; // 주석 해제!
import TableDetailView from '@/pages/cashier/TableDetailView.vue';
import OrderManagementView from '@/pages/cashier/OrderManagementView.vue';
import OrderEditView from '@/pages/cashier/OrderEditView.vue';
import InventoryManagement from '@/pages/cashier/InventoryManagementView.vue';
import TableOrders from '@/pages/server/TableOrders.vue';

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
    component: OrderManagementView
  },
  {
    path: '/order/new/:tableId?',
    name: 'NewOrder',
    component: OrderEditView,
    props: true
  },
  {
    path: '/order/edit/:tableId/:orderId',
    name: 'EditOrder', 
    component: OrderEditView,
    props: true
  },
  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement
  },

  // 서버 관련 라우트
  {
    path: '/server',
    name: 'TableOrders', 
    component: TableOrders
  },

  // 404 처리 - 맨 마지막에 위치
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    beforeEnter() {
      window.location.href = '/404.html';
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 네비게이션 가드 (디버깅용)
router.beforeEach((to, from, next) => {
  console.log(`[Router] ${from.path} → ${to.path}`);
  next();
});

export default router;