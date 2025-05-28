import { createRouter, createWebHistory } from 'vue-router';
import OrderPage from '@/pages/order/OrderPage.vue';
import PaymentPage from '@/pages/order/PaymentPage.vue';
import PaymentCompletePage from '@/pages/order/PaymentCompletePage.vue';
import OrderHistoryPage from '@/pages/order/OrderHistoryPage.vue';
import CashierDashboard from '@/views/CashierDashboard.vue';
import TableDetailView from '@/views/TableDetailView.vue';

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
    },
  
    {
    path: '/inventory',
    name: 'InventoryManagement',
    component: () => import('@/views/InventoryManagementView.vue')
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

export default router