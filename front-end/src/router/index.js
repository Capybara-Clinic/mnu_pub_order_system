import { createRouter, createWebHistory } from 'vue-router';
import OrderPage from '@/pages/OrderPage.vue';

const routes = [
  {
    path: '/order/:tableId',
    name: 'Order',
    component: OrderPage,
  },
  // 필요한 경우 주문내역 확인, 결제 등 페이지 추가 가능
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
