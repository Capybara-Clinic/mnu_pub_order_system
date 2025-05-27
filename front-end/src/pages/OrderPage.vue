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
            placeholder="메뉴 검색"
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
          :key="category.category_id"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedCategory === category.category_name
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="selectedCategory = category.category_name"
        >
          {{ category.category_name }}
        </button>
      </div>
    </div>

    <!-- 메뉴 리스트 -->
    <div class="flex-1 pb-32 space-y-6 px-4 py-4">
      <div
        v-for="category in categories"
        :key="category.category_id"
        v-show="selectedCategory === category.category_name"
      >
        <h2 class="text-md font-semibold text-gray-800 mb-2">{{ category.category_name }}</h2>
        <MenuList :menus="filteredMenus(category.menus)" />
      </div>
    </div>

    <!-- 하단 고정 주문 요약 -->
    <OrderSummary />
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

const categories = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const route = useRoute();
const orderStore = useOrderStore();
const tableId = Number(route.params.tableId || 1);

onMounted(async () => {
  orderStore.setTableId(tableId);
  const data = await fetchMenuAndOrders(tableId);
  categories.value = data.categories;
  selectedCategory.value = data.categories[0]?.category_name || '';
});

// 필터링 함수 정의
const filteredMenus = (menus) => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return menus;
  return menus.filter(menu =>
    menu.menu_name.toLowerCase().includes(query) ||
    menu.description.toLowerCase().includes(query)
  );
};

// SSE 반영 (선택 사항)
useSSE(getStockSSEUrl(), (updated) => {
  for (const category of categories.value) {
    const idx = category.menus.findIndex(m => m.menu_id === updated.menu_id);
    if (idx !== -1) {
      category.menus[idx].stock_quantity = updated.stock_quantity;
      category.menus[idx].is_available = updated.is_available;
      break;
    }
  }
});
</script>
