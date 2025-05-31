<template>
  <div class="order-edit min-h-screen bg-gray-50 p-4">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-gray-600 mb-2">데이터를 불러오는 중...</div>
        <div class="text-sm text-gray-500">{{ loadingMessage }}</div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-red-600 mb-2">❌ {{ error }}</div>
        <button @click="initializeOrder" class="bg-blue-500 text-white px-4 py-2 rounded">
          다시 시도
        </button>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div v-else>
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
          <!-- 주문번호 (새 주문일 때는 표시하지 않음) -->
          <div v-if="!isNewOrder" class="bg-gray-100 rounded-lg p-3">
            <div class="text-sm text-gray-600 mb-1">주문번호</div>
            <div class="font-bold text-gray-800">#{{ orderData.order_id }}</div>
          </div>
          
          <!-- 새 주문일 때는 상태 표시 -->
          <div v-else class="bg-blue-100 rounded-lg p-3">
            <div class="text-sm text-gray-600 mb-1">상태</div>
            <div class="font-bold text-blue-800">새 주문 작성중</div>
          </div>
          
          <!-- 테이블 -->
          <div class="bg-blue-100 rounded-lg p-3">
            <div class="text-sm text-gray-600 mb-1">테이블</div>
            <div class="font-bold text-blue-800">
              <select v-if="isNewOrder" v-model="selectedTableId" class="bg-transparent font-bold text-center">
                <option value="">선택</option>
                <option v-for="i in 12" :key="i" :value="i">{{ i }}번 테이블</option>
              </select>
              <span v-else>{{ selectedTableId }}번 테이블</span>
            </div>
          </div>
          
          <!-- 주문 접수 시간 (새 주문일 때는 현재 시간) -->
          <div class="bg-green-100 rounded-lg p-3">
            <div class="text-sm text-gray-600 mb-1">{{ isNewOrder ? '작성 시간' : '주문 접수 시간' }}</div>
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
            <tr v-for="(item, index) in orderItems" :key="item.tempId || item.menu_id" class="hover:bg-gray-50">
              <!-- 메뉴명 -->
              <td class="px-4 py-4">
                <div class="font-medium text-gray-900">{{ item.menu_name }}</div>
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
                  {{ (item.menu_account * item.quantity).toLocaleString() }}원
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

      <!-- 상태 및 총액 (기존 주문 수정일 때만 표시) -->
      <div v-if="!isNewOrder" class="bg-white rounded-lg shadow-sm p-4 mb-6">
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

      <!-- 새 주문일 때만 총액 표시 -->
      <div v-else class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="text-center">
          <span class="text-sm text-gray-600">총액: </span>
          <span class="text-xl font-bold text-gray-900">{{ totalAmount.toLocaleString() }}원</span>
        </div>
      </div>

      <!-- 하단 버튼들 -->
      <div class="flex gap-3">
        <button 
          @click="goBack"
          class="flex-1 bg-gray-400 text-white font-bold py-4 rounded-lg hover:bg-gray-500 transition-colors"
        >
          취소
        </button>
        
        <button 
          @click="saveOrder"
          :disabled="isSaving"
          class="flex-1 bg-green-500 text-white font-bold py-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {{ isSaving ? '저장 중...' : (isNewOrder ? '주문 생성' : '수정 완료') }}
        </button>
      </div>
    </div>

    <!-- 메뉴 선택 모달 -->
    <div v-if="showMenuModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-bold mb-4">메뉴 선택</h3>
        
        <!-- 전체 메뉴 목록 -->
        <div class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="menu in availableMenus" 
              :key="menu.menu_id"
              @click="addMenuItem(menu)"
              class="p-3 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              :class="menu.is_available ? 'hover:bg-blue-50 hover:border-blue-300' : 'opacity-50 bg-red-50 border-red-200 cursor-not-allowed'"
            >
              <div class="font-medium" :class="{ 'line-through text-gray-500': !menu.is_available }">
                {{ menu.menu_name }}
                <span v-if="!menu.is_available" class="text-red-500 text-xs ml-2">품절</span>
              </div>
              <div class="text-sm text-gray-600">{{ getMenuPrice(menu).toLocaleString() }}원</div>
              <div class="text-xs text-gray-500">재고: {{ menu.is_available ? menu.stock_quantity : 0 }}개</div>
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
import { cashierAPI } from '@/api/cashierService'

export default {
  name: 'OrderEditView',
  
  setup() {
    // ===== Composables =====
    const router = useRouter()
    const route = useRoute()
    
    // 페이지 제목 설정
    document.title = '주문 편집 - 레스토랑 관리'
    
    // ===== Reactive State =====
    const loading = ref(true)
    const error = ref('')
    const loadingMessage = ref('초기화 중...')
    
    const selectedTableId = ref('')
    const orderItems = ref([])
    const orderStatus = ref('결제대기')
    const showMenuModal = ref(false)
    const orderDateTime = ref('')
    const depositorName = ref('')
    const isSaving = ref(false)
    
    // API 데이터
    const orderData = ref(null)
    const availableMenus = ref([])
    
    // ===== Computed Properties =====
    
    // 새 주문인지 기존 주문 수정인지 판단
    const isNewOrder = computed(() => {
      return route.params.orderId === 'new' || !route.params.orderId
    })
    
    // 총액 계산
    const totalAmount = computed(() => {
      return orderItems.value.reduce((sum, item) => sum + (item.menu_account * item.quantity), 0)
    })
    
    // ===== Helper Methods =====
    
    // 메뉴 가격을 안전하게 가져오는 함수
    const getMenuPrice = (menu) => {
      return parseInt(menu.price || menu.meun_price || menu.menu_price || 0)
    }
    
    // ===== API Methods =====
    
    // 메뉴 목록 조회
    const fetchMenus = async () => {
      try {
        loadingMessage.value = '메뉴 정보 조회 중...'
        const response = await cashierAPI.fetchMenuStocks()
        availableMenus.value = response || []
      } catch (err) {
        console.error('❌ 메뉴 조회 실패:', err)
        throw new Error('메뉴 정보를 불러올 수 없습니다: ' + err.message)
      }
    }
    
    // 기존 주문 조회
    const fetchExistingOrder = async (tableId) => {
      try {
        loadingMessage.value = '주문 정보 조회 중...'
        const response = await cashierAPI.fetchTableOrders(tableId)
        
        if (!response.orders || response.orders.length === 0) {
          throw new Error('주문 정보를 찾을 수 없습니다')
        }
        
        // 가장 최근 주문 또는 특정 주문 ID로 필터링
        const targetOrder = route.params.orderId !== 'new' 
          ? response.orders.find(o => o.order_id === parseInt(route.params.orderId))
          : response.orders[0]
        
        if (!targetOrder) {
          throw new Error('해당 주문을 찾을 수 없습니다')
        }
        
        orderData.value = targetOrder
        return targetOrder
      } catch (err) {
        console.error('❌ 주문 조회 실패:', err)
        throw err
      }
    }
    
    // ===== Main Methods =====
    
    const initializeOrder = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const tableId = route.params.tableId
        
        // 메뉴 목록을 먼저 조회 (menu_id 매핑을 위해 필수)
        await fetchMenus()
        
        if (isNewOrder.value) {
          // 새 주문 생성
          selectedTableId.value = tableId || ''
          orderDateTime.value = new Date().toLocaleString('ko-KR')
          orderItems.value = []
          orderStatus.value = '결제대기'
          depositorName.value = ''
        } else {
          // 기존 주문 수정
          const order = await fetchExistingOrder(tableId)
          
          selectedTableId.value = order.table_id?.toString() || tableId
          orderDateTime.value = new Date(order.order_time).toLocaleString('ko-KR')
          depositorName.value = order.depositor_name || ''
          orderStatus.value = order.order_status || '결제대기'
          
          // 주문 상세 항목들 변환 - 백엔드 응답에 menu_id가 없으므로 menu_name으로 찾기
          orderItems.value = (order.details || []).map((detail, index) => {
            const menuName = detail.menu_name
            
            // 메뉴 목록에서 같은 이름의 메뉴 찾기
            const foundMenu = availableMenus.value.find(menu => 
              menu.menu_name === menuName || menu.name === menuName
            )
            
            if (!foundMenu) {
              console.error(`❌ 메뉴를 찾을 수 없음: ${menuName}`)
              throw new Error(`메뉴를 찾을 수 없습니다: ${menuName}`)
            }
            
            return {
              menu_id: foundMenu.menu_id,
              tempId: Date.now() + Math.random() + index,
              menu_name: detail.menu_name,
              menu_account: detail.menu_account,
              quantity: detail.quantity,
              is_served: detail.is_served || false
            }
          })
        }
        
      } catch (err) {
        error.value = err.message || '데이터를 불러오는데 실패했습니다'
        console.error('❌ 초기화 실패:', err)
      } finally {
        loading.value = false
      }
    }
    
    const addMenuItem = (menu) => {
      // 품절 메뉴 체크
      if (!menu.is_available) {
        alert(`🚨 ${menu.menu_name}은(는) 현재 품절된 메뉴입니다!`)
        return
      }

      // 재고 부족 체크
      if (menu.stock_quantity <= 0) {
        alert(`🚨 ${menu.menu_name} 재고가 부족합니다!`)
        return
      }
      
      // 이미 있는 메뉴인지 확인
      const existingIndex = orderItems.value.findIndex(item => item.menu_name === menu.menu_name)
      
      if (existingIndex !== -1) {
        // 기존 메뉴 수량 증가 시 재고 한도 체크
        const currentOrderQuantity = orderItems.value[existingIndex].quantity
        const newQuantity = currentOrderQuantity + 1
        
        if (newQuantity > menu.stock_quantity) {
          alert(`🚨 재고 초과! ${menu.menu_name} 최대 주문 가능: ${menu.stock_quantity}개`)
          return
        }
        
        orderItems.value[existingIndex].quantity = newQuantity
      } else {
        // 새 메뉴 추가
        const menuPrice = getMenuPrice(menu)
        
        orderItems.value.push({
          menu_id: menu.menu_id,
          tempId: Date.now() + Math.random(),
          menu_name: menu.menu_name,
          menu_account: menuPrice,
          quantity: 1,
          is_served: false,
          maxStock: menu.stock_quantity
        })
      }
      
      showMenuModal.value = false
    }
    
    const increaseQuantity = (index) => {
      const item = orderItems.value[index]
      const currentMenu = availableMenus.value.find(menu => menu.menu_name === item.menu_name)
      const maxStock = currentMenu?.stock_quantity || item.maxStock || 0
      
      if (item.quantity >= maxStock) {
        alert(`🚨 재고 초과! ${item.menu_name} 최대 주문 가능: ${maxStock}개`)
        return
      }
      
      orderItems.value[index].quantity += 1
    }
    
    const decreaseQuantity = (index) => {
      if (orderItems.value[index].quantity > 1) {
        orderItems.value[index].quantity -= 1
      }
    }
    
    const removeItem = (index) => {
      const itemName = orderItems.value[index].menu_name
      if (confirm(`${itemName}을(를) 삭제하시겠습니까?`)) {
        orderItems.value.splice(index, 1)
      }
    }
    
    const saveOrder = async () => {
      // 기본 검증
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
      
      // 기존 주문 수정 시 추가 검증
      if (!isNewOrder.value) {
        if (!orderData.value || !orderData.value.order_id) {
          alert('❌ 주문 데이터가 없습니다. 페이지를 새로고침 후 다시 시도해주세요.')
          return
        }
      }
      
      isSaving.value = true
      
      try {
        if (isNewOrder.value) {
          // 새 주문 생성
          const items = orderItems.value.map(item => ({
            menu_id: item.menu_id,
            quantity: item.quantity
          }))
          
          await cashierAPI.createManualOrder(
            parseInt(selectedTableId.value),
            depositorName.value.trim(),
            items
          )
          
          alert('✅ 새 주문이 추가되었습니다!')
          router.push('/dashboard')
          
        } else {
          // 기존 주문 수정
          const items = orderItems.value.map(item => {
            if (!item.menu_id) {
              throw new Error(`메뉴 ID가 없습니다: ${item.menu_name}`)
            }
            
            if (!item.quantity || item.quantity <= 0) {
              throw new Error(`수량이 올바르지 않습니다: ${item.menu_name}`)
            }
            
            return {
              menu_id: item.menu_id,
              quantity: item.quantity
            }
          })
          
          // 주문 수정 API 호출
          await cashierAPI.updateOrder(orderData.value.order_id, items)
          
          // 주문 상태 변경 처리
          if (orderStatus.value !== orderData.value.order_status) {
            try {
              await cashierAPI.updateOrderStatus(orderData.value.order_id, orderStatus.value)
            } catch (statusError) {
              console.warn('⚠️ 주문 상태 변경 실패 (아이템 수정은 성공):', statusError)
            }
          }
          
          alert('✅ 주문이 수정되었습니다!')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('❌ 주문 저장 중 오류:', error)
        
        // 구체적인 오류 메시지 표시
        let errorMessage = '알 수 없는 오류가 발생했습니다.'
        
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '서버에 연결할 수 없습니다.\n네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('API 요청 실패')) {
          errorMessage = '서버 오류: ' + error.message
        } else if (error.message.includes('메뉴 ID가 없습니다')) {
          errorMessage = '메뉴 정보에 오류가 있습니다.\n페이지를 새로고침 후 다시 시도해주세요.'
        } else {
          errorMessage = error.message
        }
        
        alert(`❌ 주문 저장 실패:\n${errorMessage}`)
      } finally {
        isSaving.value = false
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
      loading,
      error,
      loadingMessage,
      selectedTableId,
      orderItems,
      orderStatus,
      showMenuModal,
      orderDateTime,
      depositorName,
      isSaving,
      orderData,
      availableMenus,
      
      // Computed
      isNewOrder,
      totalAmount,
      
      // Methods
      initializeOrder,
      addMenuItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      saveOrder,
      goBack,
      getMenuPrice
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