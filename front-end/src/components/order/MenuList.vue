<template>
  <div class="px-4 py-2">
    <MenuCard
      v-for="menu in menus"
      :key="menu.menu_id"
      :menu="menu"
      @add="onAdd"
    />
    
    <!-- 메뉴가 없을 때 -->
    <div v-if="menus.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-sm">메뉴가 없습니다</div>
    </div>
  </div>
</template>

<script setup>
import MenuCard from './MenuCard.vue';
import { useOrderStore } from '@/store/order';

const { menus } = defineProps(['menus']);
const orderStore = useOrderStore();

const onAdd = (menu) => {
  orderStore.addItem(menu);
};
</script>