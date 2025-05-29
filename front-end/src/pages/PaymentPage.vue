<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="px-4 py-3 flex items-center">
        <button @click="goBack" class="mr-3">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">결제를 하다</h1>
      </div>
    </div>

    <!-- 주문하기 섹션 -->
    <div class="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
      <h2 class="text-base font-semibold text-gray-900 mb-3">주문하기</h2>
      
      <!-- 주문 아이템들 -->
      <div class="space-y-3 mb-4">
        <div
          v-for="item in order.items"
          :key="item.menu_id"
          class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
        >
          <div class="flex-1">
            <span class="text-sm font-medium text-gray-900">{{ item.menu_name }}</span>
            <div class="text-xs text-gray-500 mt-1">기본 옵션</div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <button
                @click="decreaseQuantity(item)"
                class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <span class="text-sm">-</span>
              </button>
              <span class="w-6 text-center text-sm font-medium">{{ item.quantity }}</span>
              <button
                @click="increaseQuantity(item)"
                class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <span class="text-sm">+</span>
              </button>
            </div>
            <span class="text-sm font-medium text-gray-900 w-16 text-right">
              {{ (item.price * item.quantity).toLocaleString() }}원
            </span>
          </div>
        </div>
      </div>

      <!-- 합계 -->
      <div class="flex justify-between items-center pt-3 border-t border-gray-200">
        <span class="text-base font-semibold text-gray-900">합계</span>
        <span class="text-lg font-bold text-orange-600">{{ totalAmount.toLocaleString() }}원</span>
      </div>
    </div>

    <!-- 입력 필드들 -->
    <div class="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
      <div class="space-y-3">
        <div>
          <input
            v-model="order.depositorName"
            type="text"
            placeholder="이름을 입력해주세요"
            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            v-model="order.phoneNumber"
            type="tel"
            placeholder="전화번호를 입력해주세요"
            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- 개인정보 동의 -->
    <div class="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          v-model="consent"
          class="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
        />
        <div class="flex-1 text-sm text-gray-700 leading-relaxed">
          개인정보 수집에 동의합니다
        </div>
      </label>
    </div>
    
    <div class="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
      <div class="text-md text-gray-700 space-y-2 max-h-60 overflow-y-auto mb-3">
        개인정보 이용 약관
      </div>
      <div class="text-sm text-gray-700 space-y-2 max-h-60 overflow-y-auto">
        <p>1. 수집 항목: 이름, 전화번호</p>
        <p>2. 수집 목적: 주문 처리 및 고객 응대</p>
        <p>3. 보유 기간: 주문 완료 후 1개월간 보관 후 파기</p>
        <p>4. 이용자는 개인정보 수집에 동의하지 않을 권리가 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.</p>
      </div>
    </div>


    <!-- 하단 고정 결제 버튼 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <button
        class="w-full py-4 font-semibold rounded-lg transition-colors text-base"
        :class="[
          canSubmit 
            ? 'bg-orange-500 text-white hover:bg-orange-600' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        ]"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        결제하기
      </button>
    </div>

    <!-- 하단 여백 -->
    <div class="h-20"></div>
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
  order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

const canSubmit = computed(() =>
  order.items.length > 0 && 
  order.depositorName.trim() && 
  order.phoneNumber.trim() && 
  consent.value
);

const increaseQuantity = (item) => {
  order.addItem({
    menu_id: item.menu_id,
    menu_name: item.menu_name,
    price: item.price
  });
};

const decreaseQuantity = (item) => {
  order.removeItem(item.menu_id);
};

const goBack = () => {
  router.back();
};

const onSubmit = async () => {
  if (!canSubmit.value) return;
  
  try {
    const res = await submitOrder({
      tableId: order.tableId,
      depositor: order.depositorName,
      phoneNumber: order.phoneNumber,
      items: order.items.map(item => ({
        menu_id: item.menu_id,
        quantity: item.quantity,
        option: '기본',
      }))
    });
    console.log(order)
    alert(res.message);
    router.push(`/payment/success/${res.order_id}`);
  } catch (error) {
    alert('결제 처리 중 오류가 발생했습니다.');
  }
};
</script>