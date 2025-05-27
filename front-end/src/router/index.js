import { createRouter, createWebHistory } from 'vue-router';
import OrderPage from '@/pages/OrderPage.vue';
import PaymentPage from '@/pages/PaymentPage.vue';
import PaymentCompletePage from '@/pages/PaymentCompletePage.vue';
import OrderHistoryPage from '@/pages/OrderHistoryPage.vue';

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
  {
    path: '/',
    redirect: '/order/1',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
