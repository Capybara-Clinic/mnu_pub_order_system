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
import TableOrders from '@/pages/server/TableOrders.vue';
import KitchenPage from '@/pages/server/KitchenPage';

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

  // Todo : 루트페이지 라우팅
  // {
  //   path: '/',
  //   redirect: '/order/1',
  // },
  
  // ✅ 수정된 부분 - component 속성 추가
  {
    path: '/orders',
    name: 'OrderManagement', 
    component: OrderManagementView  // 이 부분이 빠져있었음
  },

  // 새 주문 추가 페이지 (테이블ID 옵셔널)
  {
    path: '/order/new/:tableId?',
    name: 'NewOrder',
    component: OrderEditView,  // 이 부분도 빠져있었음
    props: true
  },

  // 기존 주문 수정 페이지
  {
    path: '/order/edit/:tableId/:orderId',
    name: 'EditOrder', 
    component: OrderEditView,  // 이 부분도 빠져있었음
    props: true
  },

  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement  // 이 부분도 빠져있었음
  },

  // 메인 대시보드 - 캐셔
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

  // 서버 페이지
  {
    path: '/server',
    name: 'TableOrders', 
    component: TableOrders
  },

  // 서버 페이지
  {
    path: '/kitchen',
    name: 'KitchenPage', 
    component: KitchenPage
  },

  // 404 페이지 (옵셔널)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
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