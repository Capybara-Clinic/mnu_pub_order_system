<template>
  <!-- 하단 고정 주문 요약 -->
  <div class="fixed bottom-0 bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
    <!-- 주문 내역이 있을 때만 펼칠 수 있는 영역 -->
    <div v-if="order.items.length > 0" class="transition-all duration-300" :class="{ 'max-h-64 overflow-y-auto': isExpanded, 'max-h-0 overflow-hidden': !isExpanded }">
      <div class="px-4 py-3 border-b border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <span class="font-semibold text-gray-900">장바구니</span>
          <button 
            @click="isExpanded = !isExpanded"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        <!-- 주문 아이템 리스트 -->
        <div class="space-y-2">
          <div
            v-for="item in order.items"
            :key="item.menu_id"
            class="flex justify-between items-center py-2"
          >
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">{{ item.menu_name }}</span>
              <div class="flex items-center gap-2 mt-1">
                <button
                  @click="order.removeItem(item.menu_id)"
                  class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <span class="text-sm">-</span>
                </button>
                <span class="text-sm text-gray-600 w-4 text-center">{{ item.quantity }}</span>
                <button
                  @click="order.addItem({ menu_id: item.menu_id, menu_name: item.menu_name, price: item.price })"
                  class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <span class="text-sm">+</span>
                </button>
              </div>
            </div>
            <span class="text-sm font-medium text-gray-900">{{ (item.price * item.quantity).toLocaleString() }}원</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 항상 보이는 하단 영역 -->
    <div class="px-4 py-3">
      <!-- 주문이 있을 때 총액 표시 -->
      <div v-if="order.items.length > 0" class="flex justify-between items-center mb-3">
        <button 
          @click="isExpanded = !isExpanded"
          class="flex items-center gap-2 text-gray-700"
        >
          <div class="text-sm font-medium">
            <b>클릭해서 장바구니를 열 수 있어요!</b>
          </div>
          <span class="text-sm font-medium">총 {{ totalQuantity }}개</span>
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <span class="text-lg font-bold text-orange-600">{{ totalAmount.toLocaleString() }}원</span>
      </div>

      <!-- 입력 필드들 (주문이 있을 때만 표시) -->
      <div v-if="order.items.length > 0" class="space-y-2 mb-3">
        <input
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          v-model="order.depositorName"
          placeholder="이름 입력"
        />
        <input
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          v-model="order.phoneNumber"
          placeholder="전화번호 입력"
          inputmode="numeric"
          pattern="[0-9\-]*"
          @input="formatPhoneNumber"
        />
      </div>

      <!-- 주문 버튼 -->
      <div class="flex gap-2">
        <button
          class="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          @click="viewOrderHistory"
        >
          주문 내역 확인하기
        </button>
        <button
          v-if="order.items.length > 0"
          @click="clearOrder"
          class="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          초기화
        </button>
        <button
          class="py-3 font-medium rounded-lg transition-colors"
          :class="[
            order.items.length > 0 
              ? 'flex-1 bg-orange-500 text-white hover:bg-orange-600' 
              : 'flex-1 bg-gray-200 text-gray-500 cursor-not-allowed'
          ]"
          :disabled="order.items.length === 0"
          @click="submit"
        >
          {{ order.items.length > 0 ? '주문하기' : '메뉴를 선택해주세요' }}
        </button>
      </div>
    </div>

    <!-- 하단 안내 메시지 -->
    <div v-if="order.items.length === 0" class="px-4 pb-2">
      <p class="text-xs text-gray-500 text-center leading-relaxed">
        여기에 주문 목록이 표시되요!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '@/store/order';
// import { submitOrder } from '@/services/api';
import { useRouter } from 'vue-router';


const order = useOrderStore();
const isExpanded = ref(false);

const totalQuantity = computed(() => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
});

const totalAmount = computed(() => {
  return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const clearOrder = () => {
  if (confirm('주문을 초기화하시겠습니까?')) {
    order.reset();
    isExpanded.value = false;
  }
};

const formatPhoneNumber = (e) => {
  let num = e.target.value.replace(/\D/g, ''); // 숫자만 추출
  let formatted = '';

  if (num.startsWith('02')) {
    // 서울 번호 예외 처리
    if (num.length <= 2) formatted = num;
    else if (num.length <= 5) formatted = `${num.slice(0, 2)}-${num.slice(2)}`;
    else if (num.length <= 9) formatted = `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
    else formatted = `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6, 10)}`;
  } else {
    if (num.length <= 3) formatted = num;
    else if (num.length <= 7) formatted = `${num.slice(0, 3)}-${num.slice(3)}`;
    else if (num.length <= 11) formatted = `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`;
    else formatted = `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  }

  e.target.value = formatted;
  order.phoneNumber = formatted;
};
const router = useRouter();

const viewOrderHistory = () => {
  const tableId = order.table_id || 1;
  router.push(`/history/${tableId}`);
};

const submit = async () => {
  if (order.items.length === 0) return;
  
  if (!order.depositorName.trim()) {
    alert('이름을 입력해주세요.');
    return;
  }
  
  if (!order.phoneNumber.trim()) {
    alert('전화번호를 입력해주세요.');
    return;
  }

  // const payload = {
  //   tableId: order.tableId,
  //   depositorName: order.depositorName,
  //   phoneNumber: order.phoneNumber,
  //   items: order.items.map(i => ({
  //     menu_id: i.menu_id,
  //     quantity: i.quantity,
  //     option: '기본',
  //   }))
  // };


  try {
    // const res = await submitOrder(payload);
    // alert(res.message);
    router.push(`/payment/${order.tableId}`); // ✅ 이동 추가
  } catch (error) {
    alert('주문 처리 중 오류가 발생했습니다.' + error);
  }
  

};

</script>