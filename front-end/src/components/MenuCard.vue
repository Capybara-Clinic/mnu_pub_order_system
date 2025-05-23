<template>
    <div class="p-4 border rounded-xl shadow-md" :class="{ 'opacity-50': !menu.is_available }">
      <div class="font-semibold text-lg">{{ menu.menu_name }}</div>
      <div class="text-sm text-gray-600">{{ menu.description }}</div>
      <div class="mt-2 text-right text-base font-bold">{{ menu.price.toLocaleString() }}원</div>
  
      <div class="flex justify-between items-center mt-3">
        <div class="text-sm text-gray-500">재고: {{ menu.stock_quantity }}</div>
        <button
          class="bg-blue-500 text-white text-sm px-3 py-1 rounded disabled:opacity-40"
          :disabled="!menu.is_available || menu.stock_quantity === 0"
          @click="$emit('add', menu)"
        >
          추가
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['menu']);
  defineEmits(['add']);
  </script>
  