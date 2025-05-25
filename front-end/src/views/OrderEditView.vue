<template>
  <div class="order-edit min-h-screen bg-gray-50 p-4">
    <!-- 헤더 -->
    <header class="mb-6 flex items-center justify-between">
      <button 
        @click="goBack"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span class="text-lg">←</span>
        <span class="font-medium">뒤로</span>
      </button>
      
      <button class="p-2 text-gray-600 hover:text-gray-800 transition-colors">
        🔍
      </button>
    </header>

    <!-- 주문 정보 카드 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-3 gap-4 text-center">
        <!-- 주문번호 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="text-sm text-gray-600 mb-1">주문번호</div>
          <div class="font-bold text-gray-800">{{ orderNumber }}</div>
        </div>
        
        <!-- 테이블 -->
        <div class="bg-blue-100 rounded-lg p-3">
          <div class="text-sm text-gray-600 mb-1">테이블</div>
          <div class="font-bold text-blue-800">
            <select v-if="isNewOrder" v-model="selectedTableId" class="bg-transparent font-bold text-center">
              <option value="">선택</option>
              <option v-for="i in 10" :key="i" :value="i">{{ i }}번 테이블</option>
            </select>
            <span v-else>{{ selectedTableId }}번 테이블</span>
          </div>
        </div>
        
        <!-- 주문 접수 시간 -->
        <div class="bg-green-100 rounded-lg p-3">
          <div class="text-sm text-gray-600 mb-1">주문 접수 시간</div>
          <div class="font-bold text-green-800">{{ orderDateTime }}</div>
        </div>
      </div>
    </div>

    <!-- 메뉴 목록 -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">이름</th>
            <th class="px-4 py-3 text-center text-sm font-medium text-gray-700">수량</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">가격</th>
            <th class="px-4 py-3 text-center text-sm font-medium text-gray-700">삭제</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(item, index) in orderItems" :key="item.tempId || item.id" class="hover:bg-gray-50">
            <!-- 메뉴명 -->
            <td class="px-4 py-4">
              <div class="font-medium text-gray-900">{{ item.name }}</div>
            </td>
            
            <!-- 수량 조절 -->
            <td class="px-4 py-4">
              <div class="flex items-center justify-center gap-2">
                <button 
                  @click="decreaseQuantity(index)"
                  class="w-8 h-8 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  -
                </button>
                <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                <button 
                  @click="increaseQuantity(index)"
                  class="w-8 h-8 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  +
                </button>
              </div>
            </td>
            
            <!-- 가격 -->
            <td class="px-4 py-4 text-right">
              <div class="font-medium text-gray-900">
                {{ (item.price * item.quantity).toLocaleString() }}원
              </div>
            </td>
            
            <!-- 삭제 버튼 -->
            <td class="px-4 py-4 text-center">
              <button 
                @click="removeItem(index)"
                class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </td>
          </tr>
          
          <!-- 메뉴가 없을 때 -->
          <tr v-if="orderItems.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-500">
              주문된 메뉴가 없습니다. 메뉴를 추가해주세요.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 새 메뉴 추가 버튼 -->
    <button 
      @click="showMenuModal = true"
      class="w-full bg-blue-500 text-white font-bold py-3 rounded-lg mb-6 hover:bg-blue-600 transition-colors"
    >
      + 새 메뉴 추가
    </button>

    <!-- 상태 및 총액 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex items-center justify-between">
        <!-- 상태 토글 -->
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-700">상태:</span>
          <div class="flex gap-2">
            <button 
              @click="orderStatus = 'cooking'"
              class="px-3 py-1 rounded text-sm font-medium transition-colors"
              :class="orderStatus === 'cooking' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'"
            >
              준비 중
            </button>
            <button 
              @click="orderStatus = 'completed'"
              class="px-3 py-1 rounded text-sm font-medium transition-colors"
              :class="orderStatus === 'completed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'"
            >
              완료
            </button>
          </div>
        </div>
        
        <!-- 총액 -->
        <div class="text-right">
          <span class="text-sm text-gray-600">총액: </span>
          <span class="text-lg font-bold text-gray-900">{{ totalAmount.toLocaleString() }}원</span>
        </div>
      </div>
    </div>

    <!-- 하단 버튼들 -->
    <div class="flex gap-3">
      <button 
        @click="cancelOrder"
        class="flex-1 bg-red-500 text-white font-bold py-4 rounded-lg hover:bg-red-600 transition-colors"
      >
        주문 취소
      </button>
      
      <button 
        @click="goBack"
        class="bg-gray-400 text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-500 transition-colors"
      >
        취소
      </button>
      
      <button 
        @click="saveOrder"
        class="bg-green-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-600 transition-colors"
      >
        완료
      </button>
    </div>

    <!-- 메뉴 선택 모달 -->
    <div v-if="showMenuModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-bold mb-4">메뉴 선택</h3>
        
        <!-- 메인 메뉴 -->
        <div class="mb-6">
          <h4 class="font-bold text-gray-800 mb-3">🍝 메인 메뉴</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="menu in mainMenus" 
              :key="menu.id"
              @click="addMenuItem(menu)"
              class="p-3 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              :class="menu.is_available ? 'hover:bg-blue-50 hover:border-blue-300' : 'opacity-50 bg-red-50 border-red-200 cursor-not-allowed'"
            >
              <div class="font-medium" :class="{ 'line-through text-gray-500': !menu.is_available }">
                {{ menu.name }}
                <span v-if="!menu.is_available" class="text-red-500 text-xs ml-2">품절</span>
              </div>
              <div class="text-sm text-gray-600">{{ menu.price.toLocaleString() }}원</div>
              <div class="text-xs text-gray-500">재고: {{ menu.currentStock }}{{ menu.unit }}</div>
            </div>
          </div>
        </div>

        <!-- 사이드 메뉴 -->
        <div class="mb-6">
          <h4 class="font-bold text-gray-800 mb-3">🍴 사이드 메뉴</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="menu in sideMenus" 
              :key="menu.id"
              @click="addMenuItem(menu)"
              class="p-3 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              :class="menu.is_available ? 'hover:bg-blue-50 hover:border-blue-300' : 'opacity-50 bg-red-50 border-red-200 cursor-not-allowed'"
            >
              <div class="font-medium" :class="{ 'line-through text-gray-500': !menu.is_available }">
                {{ menu.name }}
                <span v-if="!menu.is_available" class="text-red-500 text-xs ml-2">품절</span>
              </div>
              <div class="text-sm text-gray-600">{{ menu.price.toLocaleString() }}원</div>
              <div class="text-xs text-gray-500">재고: {{ menu.currentStock }}{{ menu.unit }}</div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button 
            @click="showMenuModal = false"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTableStore } from '@/stores/tableStore'
import { useInventoryStore } from '@/stores/inventoryStore'

export default {
  name: 'OrderEditView',
  
  setup() {
    // ===== Composables =====
    const router = useRouter()
    const route = useRoute()
    const tableStore = useTableStore()
    const inventoryStore = useInventoryStore()
    
    // ===== Reactive State =====
    const selectedTableId = ref('')
    const orderItems = ref([])
    const orderStatus = ref('cooking')
    const showMenuModal = ref(false)
    const orderNumber = ref('')
    const orderDateTime = ref('')
    
    // ===== Computed Properties =====
    
    // 새 주문인지 기존 주문 수정인지 판단
    const isNewOrder = computed(() => {
      return route.params.orderId === 'new' || !route.params.orderId
    })
    
    // 총액 계산
    const totalAmount = computed(() => {
      return orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })
    
    // 메뉴 목록
    const mainMenus = computed(() => inventoryStore.mainMenus)
    const sideMenus = computed(() => inventoryStore.sideMenus)
    
    // ===== Methods =====
    
    const initializeOrder = () => {
      const tableId = route.params.tableId
      const orderId = route.params.orderId
      
      if (isNewOrder.value) {
        // 새 주문 생성
        selectedTableId.value = tableId || ''
        orderNumber.value = `ORD-${Date.now()}`
        orderDateTime.value = new Date().toLocaleString('ko-KR')
        orderItems.value = []
        orderStatus.value = 'cooking'
        
        console.log('새 주문 생성 모드')
      } else {
        // 기존 주문 수정
        const orders = tableStore.getTableOrders(parseInt(tableId))
        const order = orders.find(o => o.id === orderId)
        
        if (order) {
          selectedTableId.value = tableId
          orderNumber.value = order.id
          orderDateTime.value = order.orderTime
          orderItems.value = [...order.items] // 깊은 복사
          orderStatus.value = order.status
          
          console.log('기존 주문 수정 모드:', order)
        } else {
          console.error('주문을 찾을 수 없습니다')
          alert('주문을 찾을 수 없습니다.')
          goBack()
        }
      }
    }
    
    const addMenuItem = (menu) => {
      // 🆕 품절 메뉴 체크
      if (!menu.is_available) {
        alert(`${menu.name}은(는) 현재 품절된 메뉴입니다.`)
        return
      }
      
      // 이미 있는 메뉴인지 확인
      const existingIndex = orderItems.value.findIndex(item => item.name === menu.name)
      
      if (existingIndex !== -1) {
        // 기존 메뉴가 있으면 수량 증가
        orderItems.value[existingIndex].quantity += 1
      } else {
        // 새 메뉴 추가
        orderItems.value.push({
          id: menu.id,
          tempId: Date.now(), // 임시 ID
          name: menu.name,
          price: menu.price,
          quantity: 1,
          completed: false
        })
      }
      
      showMenuModal.value = false
      console.log(`${menu.name} 추가됨`)
    }
    
    const increaseQuantity = (index) => {
      orderItems.value[index].quantity += 1
    }
    
    const decreaseQuantity = (index) => {
      if (orderItems.value[index].quantity > 1) {
        orderItems.value[index].quantity -= 1
      }
    }
    
    const removeItem = (index) => {
      const itemName = orderItems.value[index].name
      if (confirm(`${itemName}을(를) 삭제하시겠습니까?`)) {
        orderItems.value.splice(index, 1)
        console.log(`${itemName} 삭제됨`)
      }
    }
    
    const saveOrder = () => {
      if (!selectedTableId.value) {
        alert('테이블을 선택해주세요.')
        return
      }
      
      if (orderItems.value.length === 0) {
        alert('최소 하나의 메뉴를 추가해주세요.')
        return
      }
      
      const orderData = {
        id: orderNumber.value,
        orderTime: orderDateTime.value,
        status: orderStatus.value,
        items: orderItems.value.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity,
          completed: item.completed || false
        }))
      }
      
      if (isNewOrder.value) {
        // 새 주문 저장
        tableStore.addNewOrder(parseInt(selectedTableId.value), orderData.items)
        console.log('새 주문 저장:', orderData)
        alert('새 주문이 추가되었습니다.')
      } else {
        // 기존 주문 업데이트
        console.log('주문 업데이트:', orderData)
        alert('주문이 수정되었습니다.')
        // TODO: tableStore에 updateOrder 함수 추가 필요
      }
      
      goBack()
    }
    
    const cancelOrder = () => {
      if (isNewOrder.value) {
        if (confirm('주문 작성을 취소하시겠습니까?')) {
          goBack()
        }
      } else {
        if (confirm('이 주문을 완전히 삭제하시겠습니까?')) {
          // TODO: tableStore에서 주문 삭제 기능 추가
          console.log('주문 삭제:', orderNumber.value)
          alert('주문이 삭제되었습니다.')
          goBack()
        }
      }
    }
    
    const goBack = () => {
      // 이전 페이지로 돌아가기 (히스토리 기반)
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }
    
    // ===== Lifecycle =====
    onMounted(() => {
      initializeOrder()
    })
    
    // ===== Return =====
    return {
      // State
      selectedTableId,
      orderItems,
      orderStatus,
      showMenuModal,
      orderNumber,
      orderDateTime,
      
      // Computed
      isNewOrder,
      totalAmount,
      mainMenus,
      sideMenus,
      
      // Methods
      addMenuItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      saveOrder,
      cancelOrder,
      goBack
    }
  }
}
</script>

<style scoped>
/* 테이블 스타일 */
table {
  border-collapse: collapse;
}

/* 모달 스크롤바 스타일 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 호버 효과 */
tr:hover {
  background-color: #f9fafb;
}

/* 반응형 */
@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px 12px;
  }
}
</style>