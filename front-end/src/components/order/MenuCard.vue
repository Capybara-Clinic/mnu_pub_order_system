<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3" :class="{ 'opacity-50': !menu.is_available }">
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1">
        <h3 class="font-semibold text-base text-gray-900 mb-1">{{ menu.menu_name }}</h3>
        <p class="text-sm text-gray-600 leading-relaxed">{{ menu.description }}</p>
      </div>
      
    <!-- 메뉴 이미지 (반응형 크기, 둥근 모서리, 이미지 커버) -->
    <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg ml-3 flex-shrink-0 overflow-hidden">
      <img
        :src="getImageUrl(menu.menu_name)"
        alt="메뉴 이미지"
        class="w-full h-full object-cover"
      />
    </div>

    </div>

    <div class="flex justify-between items-center mt-3">
      <div class="flex flex-col">
        <span class="text-base font-bold text-gray-900">{{ menu.price.toLocaleString() }}원</span>
        <span class="text-xs text-gray-500 mt-1">재고: {{ menu.stock_quantity }}</span>
      </div>
      
      <!-- 수량 조절 및 추가 버튼 -->
      <div class="flex items-center gap-2">
        <div v-if="getItemQuantity(menu.menu_id) > 0" class="flex items-center gap-2">
          <button
            @click="decreaseQuantity(menu)"
            class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            <span class="text-lg font-medium">-</span>
          </button>
          <span class="w-8 text-center text-sm font-medium">{{ getItemQuantity(menu.menu_id) }}</span>
          <button
            @click="increaseQuantity(menu)"
            :disabled="!menu.is_available || menu.stock_quantity <= getItemQuantity(menu.menu_id)"
            class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span class="text-lg font-medium">+</span>
          </button>
        </div>
        
        <button
          v-else
          class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          :disabled="!menu.is_available || menu.stock_quantity === 0"
          @click="$emit('add', menu)"
        >
          담기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrderStore } from '@/store/order';

defineProps(['menu']);
defineEmits(['add']);

const orderStore = useOrderStore();

const getItemQuantity = (menuId) => {
  const item = orderStore.items.find(item => item.menu_id === menuId);
  return item ? item.quantity : 0;
};

const increaseQuantity = (menu) => {
  orderStore.addItem(menu);
};

const decreaseQuantity = (menu) => {
  orderStore.removeItem(menu.menu_id);
};

const getImageUrl = (name) => {
  try {
    return require(`@/assets/${name}.png`);
  } catch (e) {
    return require('@/assets/placeholder.png');
  }
};
</script>