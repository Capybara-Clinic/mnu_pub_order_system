<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">주방 주문 목록</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <OrderCard
  v-for="order in orderStore.orders"
  :key="order.table"
  :order="order"
  @complete="orderStore.completeOrder"
/>
    </div>
  </div>
</template>

<script setup>
import OrderCard from '@/components/OrderCard.vue'
import { useOrderStore } from '@/store/orderStore'

const orderStore = useOrderStore()
</script>
