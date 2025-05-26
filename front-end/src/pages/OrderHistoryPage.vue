<template>
    <div class="min-h-screen bg-white p-4 max-w-lg mx-auto">
      <h2 class="text-xl font-bold text-center mb-4">주문내역</h2>
  
      <div v-if="orders.length === 0" class="text-center mt-10 text-gray-500">
        주문 내역이 없습니다.
        <button
          class="mt-4 block mx-auto px-4 py-2 bg-orange-500 text-white rounded"
          @click="goHome"
        >
          처음 화면으로 돌아가기
        </button>
      </div>
  
      <div v-else class="space-y-4">
        <div
          v-for="(order, idx) in orders"
          :key="order.order_id"
          class="border p-3 rounded shadow-sm"
        >
          <div class="text-sm font-medium mb-2 text-gray-600">#{{ order.order_id }}, idx : {{ idx }}</div>
  
          <ul class="mb-2">
            <li
              v-for="item in order.items"
              :key="item.menu_name"
              class="text-sm flex justify-between"
            >
              <span>{{ item.menu_name }}</span>
              <span>수량 {{ item.quantity }}</span>
            </li>
          </ul>
  
          <div class="text-right text-orange-600 font-semibold">
            {{ calculateTotal(order.items) }}원
          </div>
        </div>
  
        <button
          class="mt-6 block mx-auto px-4 py-2 bg-orange-500 text-white rounded"
          @click="goHome"
        >
          처음 화면으로 돌아가기
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { fetchOrderHistoryByTable } from '@/services/api';
  
  const route = useRoute();
  const router = useRouter();
  const tableId = route.params.tableId;
  const orders = ref([]);
  
  onMounted(async () => {
    const res = await fetchOrderHistoryByTable(tableId);
    orders.value = res.orders || [];
  });
  
  const goHome = () => {
    router.push(`/order/${tableId}`);
  };
  
  const calculateTotal = (items) =>
    items.reduce((sum, i) => sum + i.quantity * (i.price || 0), 0);
  </script>
  