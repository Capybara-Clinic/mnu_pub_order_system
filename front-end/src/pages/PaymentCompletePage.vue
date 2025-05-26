<template>
    <div class="min-h-screen bg-white p-4 max-w-lg mx-auto">
      <h2 class="text-xl font-bold text-center mb-6 text-orange-500">
        주문이 완료되었습니다!
      </h2>
  
      <div class="bg-gray-100 p-4 rounded-md mb-6">
        <div class="text-sm text-gray-600 mb-2">주문 정보</div>
        <div class="flex justify-between py-1">
          <span class="font-medium">결제금액</span>
          <span class="text-orange-600 font-bold">{{ orderInfo.total_amount?.toLocaleString() }}원</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="font-medium">주문번호</span>
          <span>{{ orderId }}</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="font-medium">결제계좌</span>
          <span>홍길동 000-0000-0000</span>
        </div>
      </div>
  
      <button
        class="w-full bg-orange-500 text-white font-semibold py-2 rounded"
        @click="goHome"
      >
        처음 화면으로 돌아가기
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { fetchOrderHistoryByTable } from '@/services/api';
  
  const route = useRoute();
  const router = useRouter();
  const orderId = route.params.orderId;
  const orderInfo = ref({});
  
  onMounted(async () => {
    // 가장 최근 주문만 보여주는 간단한 구현
    const tableId = 1; // 예: 추후 로직 확장 가능
    const res = await fetchOrderHistoryByTable(tableId);
    orderInfo.value = res.orders.find(o => o.order_id == orderId) || {};
  });
  
  const goHome = () => {
    router.push(`/order/${orderInfo.value.table_id || 1}`);
  };
  </script>
  