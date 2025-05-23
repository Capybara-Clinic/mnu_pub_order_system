<template>
    <div class="bg-white p-4 shadow-md rounded-xl">
      <div class="font-bold text-lg mb-2">주문 내역</div>
      <ul>
        <li
          v-for="item in order.items"
          :key="item.menu_id"
          class="flex justify-between text-sm py-1"
        >
          <span>{{ item.menu_name }} x {{ item.quantity }}</span>
          <button class="text-red-500" @click="order.removeItem(item.menu_id)">제거</button>
        </li>
      </ul>
  
      <input
        class="border w-full mt-4 p-2 rounded"
        v-model="order.depositorName"
        placeholder="이름 입력"
      />
      <input
        class="border w-full mt-2 p-2 rounded"
        v-model="order.phoneNumber"
        placeholder="전화번호 입력"
      />
  
      <button
        class="w-full mt-4 bg-green-500 text-white py-2 rounded"
        @click="submit"
      >
        주문하기
      </button>
    </div>
  </template>
  
  <script setup>
  import { useOrderStore } from '@/store/order';
  import { submitOrder } from '@/services/api';
  
  const order = useOrderStore();
  
  const submit = async () => {
    const payload = {
      tableId: order.tableId,
      depositorName: order.depositorName,
      items: order.items.map(i => ({
        menu_id: i.menu_id,
        quantity: i.quantity,
        option: '기본',
      }))
    };
    const res = await submitOrder(payload);
    alert(res.message);
    order.reset();
  };
  </script>
  