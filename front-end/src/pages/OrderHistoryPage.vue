<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="px-4 py-3 flex items-center">
        <button @click="goHome" class="mr-3">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">주문내역</h1>
      </div>
    </div>

    <!-- 검색 영역 -->
    <div class="bg-white px-4 py-3 border-b">
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="주문 번호 검색"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
          검색
        </button>
      </div>
    </div>

    <!-- 주문 내역 리스트 -->
    <div class="flex-1 px-4 py-4">
      <!-- 주문이 없을 때 -->
      <div v-if="orders.length === 0" class="flex flex-col items-center justify-center py-16">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-center mb-6">주문 내역이<br>없습니다.</p>
        <button
          class="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          @click="goHome"
        >
          처음 화면으로 돌아가기
        </button>
      </div>

      <!-- 주문 내역 카드들 -->
      <div v-else class="space-y-3">
        <div
          v-for="(order, idx) in filteredOrders"
          :key="order.order_id"
          class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <!-- 주문 헤더 -->
          <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
            <div>
              <span class="text-sm font-medium text-gray-900">주문번호 #{{ order.order_id }}, {{ idx }} 번째 주문</span>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(order.created_at) }}</div>
            </div>
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusClass(order.order_status)"
            >
              {{ order.order_status }}
            </span>
          </div>

          <!-- 주문 아이템들 -->
          <div class="space-y-2 mb-3">
            <div
              v-for="item in order.items"
              :key="item.menu_name"
              class="flex justify-between items-center"
            >
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900">{{ item.menu_name }}</span>
                <div class="text-xs text-gray-500 mt-1">{{ item.option || '기본' }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ item.quantity }}개</div>
                <div class="text-xs text-gray-500">{{ (item.price * item.quantity).toLocaleString() }}원</div>
              </div>
            </div>
          </div>

          <!-- 총액 -->
          <div class="flex justify-between items-center pt-3 border-t border-gray-100">
            <span class="text-sm font-medium text-gray-700">총 결제금액</span>
            <span class="text-base font-bold text-orange-600">
              {{ order.total_amount?.toLocaleString() || calculateTotal(order.items) }}원
            </span>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="pt-4">
          <button
            class="w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
            @click="goHome"
          >
            처음 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchTableOrders } from '@/services/api';

const route = useRoute();
const router = useRouter();
const tableId = route.params.tableId;
const orders = ref([]);
const searchQuery = ref('');

// 검색 필터링
const filteredOrders = computed(() => {
  if (!searchQuery.value.trim()) return orders.value;
  
  const query = searchQuery.value.toLowerCase();
  return orders.value.filter(order => 
    order.order_id.toString().includes(query) ||
    order.items.some(item => item.menu_name.toLowerCase().includes(query))
  );
});

onMounted(async () => {
  const res = await fetchTableOrders(tableId);
  orders.value = res.orders || [];
});

const goHome = () => {
  router.push(`/order/${tableId}`);
};

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case '결제확인':
      return 'bg-blue-100 text-blue-800';
    case '조리중':
      return 'bg-yellow-100 text-yellow-800';
    case '완료':
      return 'bg-green-100 text-green-800';
    case '취소':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script>