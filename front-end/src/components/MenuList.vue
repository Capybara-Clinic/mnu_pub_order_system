<template>
    <div class="grid grid-cols-2 gap-4">
      <MenuCard
        v-for="menu in menus"
        :key="menu.menu_id"
        :menu="menu"
        @add="onAdd"
      />
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
  