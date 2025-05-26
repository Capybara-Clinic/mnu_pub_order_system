<template>
    <div class="min-h-screen bg-gray-100 p-4">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-center">모바일 주문</h1>
  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 왼쪽: 메뉴 리스트 (2/3 영역) -->
          <div class="md:col-span-2">
            <MenuList :menus="menus" />
          </div>
  
          <!-- 오른쪽: 주문 요약 (1/3 영역) -->
          <OrderSummary />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import MenuList from '@/components/order/MenuList.vue';
  import OrderSummary from '@/components/order/OrderSummary.vue';
  import { fetchMenuAndOrders, getStockSSEUrl } from '@/services/api';
  import { useOrderStore } from '@/store/order';
  import { useSSE } from '@/hooks/useSSE';
  
  const menus = ref([]);
  const route = useRoute();
  const orderStore = useOrderStore();
  const tableId = Number(route.params.tableId || 1); // QR 스캔 시 URL에서 테이블 id 추출
  
  onMounted(async () => {
    orderStore.setTableId(tableId);
  
    const data = await fetchMenuAndOrders(tableId);
    menus.value = data.menus;
    // orderStore에 order_history 반영은 필요 시 추가
  });
  
  // SSE를 통해 실시간 stock 변화 반영
  useSSE(getStockSSEUrl(), (updated) => {
    const index = menus.value.findIndex(m => m.menu_id === updated.menu_id);
    if (index !== -1) {
      menus.value[index].stock_quantity = updated.stock_quantity;
      menus.value[index].is_available = updated.is_available;
    }
  });
  </script>
  