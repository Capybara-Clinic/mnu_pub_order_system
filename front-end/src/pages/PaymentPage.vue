<template>
    <div class="p-4 max-w-lg mx-auto min-h-screen bg-white">
      <h2 class="text-xl font-bold mb-2">주문하기</h2>
  
      <ul>
        <li v-for="item in order.items" :key="item.menu_id" class="py-2 border-b">
          <div class="flex justify-between">
            <span>{{ item.menu_name }}</span>
            <span>{{ item.quantity }}개</span>
          </div>
        </li>
      </ul>
  
      <div class="mt-4 text-right font-semibold text-orange-500">
        총 결제 금액: {{ totalAmount.toLocaleString() }}원
      </div>
  
      <div class="mt-6 space-y-3">
        <input v-model="order.depositorName" class="w-full border p-2 rounded" placeholder="이름" />
        <input v-model="order.phoneNumber" class="w-full border p-2 rounded" placeholder="전화번호" />
        <label class="flex items-center space-x-2">
          <input type="checkbox" v-model="consent" />
          <span>개인정보 수집 동의</span>
        </label>
      </div>
  
      <button
        class="w-full mt-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        결제하기
      </button>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue';
  import { useOrderStore } from '@/store/order';
  import { submitOrder } from '@/services/api';
  import { useRouter } from 'vue-router';
  
  const order = useOrderStore();
  const consent = ref(false);
  const router = useRouter();
  
  const totalAmount = computed(() =>
    order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
  const canSubmit = computed(() =>
    order.depositorName && order.phoneNumber && consent.value
  );
  
  const onSubmit = async () => {
    const res = await submitOrder({
      tableId: order.tableId,
      depositorName: order.depositorName,
      items: order.items.map(i => ({
        menu_id: i.menu_id,
        quantity: i.quantity,
        option: '기본',
      }))
    });
    router.push(`/payment/success/${res.order_id}`);
  };
  </script>
  