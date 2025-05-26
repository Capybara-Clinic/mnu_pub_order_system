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

    <!-- 입금자명 입력 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">입금자명</label>
      <input 
        v-model="depositorName"
        type="text" 
        placeholder="입금자명을 입력하세요"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :disabled="!isNewOrder && orderStatus === '완료'"
      >
      <div v-if="!isNewOrder && orderStatus === '완료'" class="text-xs text-gray-500 mt-1">
        완료된 주문의 입금자명은 수정할 수 없습니다.
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
          <div class="flex gap-2 flex-wrap">
            <button 
              @click="orderStatus = '결제대기'"
              class="px-3 py-1 rounded text-sm font-medium transition-colors"
              :class="orderStatus === '결제대기' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'"
            >
              결제대기
            </button>
            <button 
              @click="orderStatus = '결제확인'"
              class="px-3 py-1 rounded text-sm font-medium transition-colors"
              :class="orderStatus === '결제확인' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'"
            >
              결제확인
            </button>
            <button 
              @click="orderStatus = '완료'"
              class="px-3 py-1 rounded text-sm font-medium transition-colors"
              :class="orderStatus === '완료' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'"
            >
              완료
            </button>
            <button 
              @click="orderStatus = '취소'"
              class="px-3 py-1 rounded text-sm font-medium transition-colors"
              :class="orderStatus === '취소' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'"
            >
              취소
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
        :disabled="isSaving"
        class="bg-green-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
      >
        {{ isSaving ? '저장 중...' : '완료' }}
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
              <div class="text-xs text-gray-500">재고: {{ menu.is_available ? menu.currentStock : 0 }}{{ menu.unit }}</div>
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
              <div class="text-xs text-gray-500">재고: {{ menu.is_available ? menu.currentStock : 0 }}{{ menu.unit }}</div>
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
    const orderStatus = ref('결제대기')
    const showMenuModal = ref(false)
    const orderNumber = ref('')
    const orderDateTime = ref('')
    const depositorName = ref('')
    const isSaving = ref(false)
    
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
      
      if (isNewOrder.value) {
        // 새 주문 생성
        selectedTableId.value = tableId || ''
        orderNumber.value = `ORD-${Date.now()}`
        orderDateTime.value = new Date().toLocaleString('ko-KR')
        orderItems.value = []
        orderStatus.value = '결제대기'
        depositorName.value = ''
        
        console.log('새 주문 생성 모드')
      } else {
        // 기존 주문 수정
        const order = tableStore.getOrderById(parseInt(route.params.orderId))
        
        if (order) {
          selectedTableId.value = order.table_id.toString()
          orderNumber.value = order.order_number
          orderDateTime.value = new Date(order.order_time).toLocaleString('ko-KR')
          depositorName.value = order.depositor_name
          orderItems.value = order.order_details.map(detail => ({
            id: detail.menu_id,
            tempId: detail.order_detail_id,
            name: detail.menu_name,
            price: detail.unit_price,
            quantity: detail.quantity,
            completed: detail.is_served
          }))
          orderStatus.value = order.order_status
          
          console.log('기존 주문 수정 모드:', order)
        } else {
          console.error('주문을 찾을 수 없습니다')
          alert('주문을 찾을 수 없습니다.')
          goBack()
        }
      }
    }
    
    const addMenuItem = (menu) => {
      // 품절 메뉴 체크
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
          tempId: Date.now(),
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
    
    const saveOrder = async () => {
      if (!selectedTableId.value) {
        alert('테이블을 선택해주세요.')
        return
      }
      
      if (orderItems.value.length === 0) {
        alert('최소 하나의 메뉴를 추가해주세요.')
        return
      }

      if (!depositorName.value.trim()) {
        alert('입금자명을 입력해주세요.')
        return
      }
      
      isSaving.value = true
      
      try {
        if (isNewOrder.value) {
          // 새 주문 저장
          const orderDetails = orderItems.value.map(item => ({
            menu_id: item.id,
            menu_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.price * item.quantity,
            is_served: false
          }))
          
          console.log('주문 저장 시도:', {
            tableId: parseInt(selectedTableId.value),
            depositorName: depositorName.value,
            orderDetails
          })
          
          const newOrderId = await tableStore.addNewOrder(
            parseInt(selectedTableId.value), 
            depositorName.value, 
            orderDetails
          )
          
          if (newOrderId) {
            console.log('새 주문 저장 성공:', newOrderId)
            alert('새 주문이 추가되었습니다.')
            router.push('/dashboard')
          } else {
            alert('주문 저장에 실패했습니다.')
          }
        } else {
          // 기존 주문 수정
          const orderDetails = orderItems.value.map(item => ({
            menu_id: item.id,
            menu_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.price * item.quantity,
            is_served: item.completed || false
          }))
          
          console.log('주문 수정 시도:', {
            orderId: route.params.orderId,
            depositorName: depositorName.value,
            orderDetails,
            orderStatus: orderStatus.value
          })
          
          const success = await tableStore.updateOrder(
            parseInt(route.params.orderId),
            depositorName.value,
            orderDetails,
            orderStatus.value
          )
          
          if (success) {
            console.log('주문 수정 성공')
            alert('주문이 수정되었습니다.')
            router.push('/dashboard')
          } else {
            alert('주문 수정에 실패했습니다.')
          }
        }
      } catch (error) {
        console.error('주문 저장 중 오류:', error)
        alert('주문 저장 중 오류가 발생했습니다.')
      } finally {
        isSaving.value = false
      }
    }
    
    const cancelOrder = async () => {
      if (isNewOrder.value) {
        if (confirm('주문 작성을 취소하시겠습니까?')) {
          goBack()
        }
      } else {
        const order = tableStore.getOrderById(parseInt(route.params.orderId))
        if (!order) {
          alert('주문을 찾을 수 없습니다.')
          return
        }
        
        const confirmMsg = `주문 ${order.order_number}을(를) 취소하시겠습니까?\n\n주문 정보:\n- 입금자: ${order.depositor_name}\n- 금액: ${order.total_amount.toLocaleString()}원\n- 상태: ${order.order_status}\n\n취소된 주문은 복구할 수 없습니다.`
        
        if (confirm(confirmMsg)) {
          try {
            const success = await tableStore.cancelOrder(parseInt(route.params.orderId))
            if (success) {
              console.log('주문 취소 성공')
              alert('주문이 취소되었습니다.')
              router.push('/dashboard')
            } else {
              alert('주문 취소에 실패했습니다.')
            }
          } catch (error) {
            console.error('주문 취소 중 오류:', error)
            alert('주문 취소 중 오류가 발생했습니다.')
          }
        }
      }
    }
    
    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/dashboard')
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
      depositorName,
      isSaving,
      
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
  
  /* 상태 버튼들을 세로로 배치 */
  .flex-wrap {
    flex-direction: column;
  }
  
  .flex-wrap button {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>