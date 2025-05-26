<template>
  <div class="min-h-screen bg-orange-50">
    <!-- 헤더 -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="px-4 py-3">
        <h1 class="text-lg font-semibold text-center text-gray-900">주문화면</h1>
      </div>
    </div>

    <!-- 검색 및 필터 섹션 -->
    <div class="bg-white px-4 py-3 border-b">
      <div class="flex gap-2 mb-3">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="부스 검 또는 로고"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button class="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium">
          검색
        </button>
      </div>
      
      <!-- 카테고리 필터 -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="category in categories"
          :key="category"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedCategory === category
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- 메뉴 리스트 -->
    <div class="flex-1 pb-32">
      <MenuList :menus="filteredMenus" />
    </div>

    <!-- 하단 고정 주문 요약 -->
    <OrderSummary />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MenuList from '@/components/order/MenuList.vue';
import OrderSummary from '@/components/order/OrderSummary.vue';
import { fetchMenuAndOrders, getStockSSEUrl } from '@/services/api';
import { useOrderStore } from '@/store/order';
import { useSSE } from '@/hooks/useSSE';

const menus = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('메인메뉴');
const categories = ref(['메인메뉴', '사이드메뉴', '음료', '기타']);

const route = useRoute();
const orderStore = useOrderStore();
const tableId = Number(route.params.tableId || 1);

// 필터링된 메뉴 계산
const filteredMenus = computed(() => {
  let filtered = menus.value;
  
  // 카테고리 필터
  if (selectedCategory.value !== '전체') {
    filtered = filtered.filter(menu => menu.category === selectedCategory.value);
  }
  
  // 검색 필터
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(menu => 
      menu.menu_name.toLowerCase().includes(query) ||
      menu.description.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

onMounted(async () => {
  orderStore.setTableId(tableId);

  const data = await fetchMenuAndOrders(tableId);
  menus.value = data.menus;
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