<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="px-4 py-3">
        <h1 class="text-lg font-semibold text-center text-gray-900">주문 완료 확인</h1>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 px-4 py-6">
      <!-- 완료 메시지 -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-center">
        <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-orange-600 mb-2">아래 계좌로 송금해주시기 바랍니다.</h2>
        <p class="text-sm text-gray-600">
          <b>아래 송금 계좌로 주문해주셔야 요리가 시작됩니다.</b>
        </p>
      </div>

      <!-- 주문 정보 -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">주문 정보</h3>
        
        <div class="space-y-3">
          <div class="flex justify-between py-2">
            <span class="text-sm text-gray-600">총 결제금액</span>
            <span class="text-base font-bold text-orange-600">
              {{ orderInfo.total_amount?.toLocaleString() || '0' }}원
            </span>
          </div>
          
          <div class="flex justify-between py-2 border-t border-gray-100">
            <span class="text-sm text-gray-600">주문번호</span>
            <span class="text-sm font-medium text-gray-900">#{{ orderId }}</span>
          </div>
          
          <div class="flex justify-between py-2 border-t border-gray-100">
            <span class="text-sm text-gray-600">송금계좌</span>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">정O태</div>
              <div class="text-xs text-gray-500">농협 101-1001-1000010-01</div>
            </div>
          </div>
          
          <div class="flex justify-between py-2 border-t border-gray-100">
            <span class="text-sm text-gray-600">주문시간</span>
            <span class="text-sm font-medium text-gray-900">{{ formatCurrentTime() }}</span>
          </div>
        </div>
      </div>

      <!-- 주문 상세 내역 -->
      <div v-if="orderInfo.items?.length > 0" class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">주문 내역</h3>
        
        <div class="space-y-3">
          <div
            v-for="item in orderInfo.items"
            :key="item.menu_name"
            class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">{{ item.menu_name }}</span>
              <div class="text-xs text-gray-500 mt-1">{{ item.option || '기본' }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">{{ item.quantity }}개</div>
              <div class="text-xs text-gray-500">{{ (item.price * item.quantity).toLocaleString() }}원</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 안내 메시지 -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="text-sm text-blue-800 leading-relaxed">
            송금을 완료해주세요😎<br>
            조리 시간은 약 15-20분 소요됩니다.
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="space-y-3">
        <button
          class="w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          @click="goHome"
        >
          처음 화면으로 돌아가기
        </button>
        
        <button
          class="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          @click="viewOrderHistory"
        >
          주문 내역 확인하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchOrderById } from '@/services/api'; // ← 변경된 함수 임포트
import { useOrderStore } from '@/store/order';

const route = useRoute();
const router = useRouter();

const order = useOrderStore();
const tableId = order.tableId;

const orderId = route.params.orderId;
console.log(orderId)
const orderInfo = ref({});

onMounted(async () => {
  try {
    const res = await fetchOrderById(orderId);
    orderInfo.value = {
      order_id: res.order_id,
      depositor_name: res.depositor_name,
      total_amount: res.total_amount,
      items: res.items.map(item => ({
        menu_name: item.menu_name,
        quantity: item.quantity,
        price: item.subtotal / item.quantity, // 개당 가격 추정
        option: '기본' // 옵션이 없으므로 기본값 처리
      }))
    };
  } catch (error) {
    console.error('주문 정보 조회 실패:', error);
    orderInfo.value = {
      order_id: orderId,
      total_amount: 0,
      items: []
    };
  }
});

const formatCurrentTime = () => {
  return new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const goHome = () => {
  order.reset(); // 장바구니 초기화
  router.push(`/order/${tableId}`);
};

const viewOrderHistory = () => {
  order.reset(); // 장바구니 초기화
  router.push(`/history/${tableId}`);
};
</script>