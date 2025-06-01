<template>
  <div class="table-detail min-h-screen bg-gray-100">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <button 
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span class="text-lg">←</span>
          <span class="font-medium">뒤로</span>
        </button>
        
        <div class="text-center">
          <h1 class="text-xl font-bold text-gray-800">
            테이블 {{ tableId }}번
          </h1>
          <div class="text-sm text-gray-600" v-if="currentTable && currentTable.is_occupied">
            <span class="mr-4">총 {{ validOrders.length }}개 주문</span>
            <span v-if="tableOrders.length > validOrders.length" class="mr-4 text-red-500">(취소 {{ tableOrders.length - validOrders.length }}개)</span>
            <span>총액: {{ totalAmount.toLocaleString() }}원</span>
          </div>
        </div>
        
        <div class="w-16"></div> <!-- 중앙 정렬용 -->
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="max-w-7xl mx-auto p-4 pb-20">
      <!-- 빈 테이블인 경우 -->
      <div v-if="!currentTable || !currentTable.is_occupied" class="text-center py-20">
        <div class="text-gray-500 text-lg mb-4">빈 테이블입니다</div>
        <button 
          @click="goToNewOrder"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          새 주문 추가하기
        </button>
      </div>

      <!-- 빈 세션인 경우 (활성 세션이 있지만 주문이 없음) -->
      <div v-else-if="currentSession && tableOrders.length === 0" class="text-center py-20">
        <div class="text-purple-600 text-lg mb-2">🟣 빈 세션</div>
        <div class="text-gray-500 mb-4">
          세션 ID: {{ currentSession.session_id }}<br>
          시작 시간: {{ formatTime(currentSession.start_time) }}<br>
          모든 주문이 취소되었습니다
        </div>
        <div class="space-y-3">
          <button 
            @click="goToNewOrder"
            class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mr-3"
          >
            새 주문 추가하기
          </button>
          <button 
            @click="clearTable"
            class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            세션 종료 (아웃)
          </button>
        </div>
      </div>

      <!-- 주문들이 있는 경우 - 그리드 레이아웃 -->
      <div v-else-if="tableOrders.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- 각 주문별 카드 -->
        <div 
          v-for="order in sortedOrders" 
          :key="order.order_id"
          class="bg-white rounded-lg shadow-md overflow-hidden h-fit hover:shadow-lg transition-shadow"
          :class="{ 'opacity-60': order.order_status === '취소' }"
        >
          <!-- 주문 헤더 -->
          <div 
            class="p-4 flex items-center justify-between"
            :class="getOrderHeaderClass(order.order_status)"
          >
            <div class="text-white">
              <div class="font-bold text-lg">{{ order.order_number }}</div>
              <div class="text-sm opacity-90">{{ order.depositor_name }}</div>
            </div>
            <div class="text-white text-right">
              <div class="font-bold text-lg">{{ order.total_amount.toLocaleString() }}원</div>
              <div class="text-sm opacity-90">{{ formatTime(order.order_time) }}</div>
            </div>
          </div>

          <!-- 주문 상태 및 결제 정보 -->
          <div class="px-4 py-3 bg-gray-50 border-b">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700">상태:</span>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(order.order_status)"
                >
                  {{ getStatusDisplayText(order.order_status) }}
                </span>
              </div>
              
              <!-- 결제 확인 버튼 (결제대기 상태일 때만) -->
              <button 
                v-if="order.order_status === '결제대기'"
                @click="confirmPayment(order.order_id)"
                class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors"
              >
                💰 결제확인
              </button>
            </div>
          </div>

          <!-- 메뉴 목록 (읽기 전용) -->
          <div class="p-4 space-y-3">
            <div 
              v-for="detail in order.order_details" 
              :key="detail.order_detail_id"
              class="flex items-start justify-between p-3 rounded-lg bg-gray-50"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm text-gray-800 truncate">
                  {{ detail.menu_name }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ detail.quantity }}개 × {{ detail.unit_price.toLocaleString() }}원
                </div>
              </div>
              
              <div class="text-right ml-2">
                <div class="font-medium text-sm text-gray-800">
                  {{ detail.subtotal.toLocaleString() }}원
                </div>
              </div>
            </div>
          </div>
          
          <!-- 주문별 액션 버튼 -->
          <div class="p-4 bg-gray-50 grid grid-cols-3 gap-2">
            <button 
              @click="goToOrderEdit(order.order_id)"
              class="bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
              :class="(order.order_status === '완료' || order.order_status === '취소') ? 'col-span-3' : 'col-span-2'"
            >
              수정
            </button>
            
            <button 
              v-if="order.order_status !== '완료' && order.order_status !== '취소'"
              @click="cancelOrder(order.order_id)"
              class="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 하단 고정 버튼 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="max-w-7xl mx-auto grid grid-cols-3 gap-3">
        <!-- 새 주문 추가 (2/3 크기) -->
        <button 
          @click="goToNewOrder"
          class="col-span-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span class="text-xl">+</span>
          <span>새 주문</span>
        </button>
        
        <!-- 아웃 (1/3 크기) -->
        <button 
          @click="clearTable"
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          아웃
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTableStore } from '@/stores/tableStore'

export default {
  name: 'TableDetailView',
  
  setup() {
    // ===== Composables =====
    const router = useRouter()
    const route = useRoute()
    const tableStore = useTableStore()
    
    // ===== Reactive State =====
    const loading = ref(false)
    
    // ===== Computed Properties =====
    const tableId = computed(() => parseInt(route.params.id))
    
    const currentTable = computed(() => {
      return tableStore.getTableById(tableId.value)
    })
    
    // 현재 세션 정보
    const currentSession = computed(() => {
      return tableStore.getCurrentSession(tableId.value)
    })
    
    // 현재 세션의 주문들만 (이전 세션 주문 제외)
    const tableOrders = computed(() => {
      if (!currentTable.value || !currentTable.value.is_occupied) return []
      
      // 현재 세션의 주문들만 필터링
      const currentSessionId = currentTable.value.current_session_id
      if (!currentSessionId) return []
      
      return Object.values(tableStore.orders).filter(order => 
        order.table_id === tableId.value && order.session_id === currentSessionId
      )
    })
    
    // 현재 세션의 유효한 주문들 (취소 제외)
    const validOrders = computed(() => {
      return tableOrders.value.filter(order => order.order_status !== '취소')
    })
    
    // 시간순 정렬된 주문들 (최신순, 취소된 주문도 포함하여 표시)
    const sortedOrders = computed(() => {
      return [...tableOrders.value].sort((a, b) => {
        return new Date(b.order_time) - new Date(a.order_time)
      })
    })
    
    // 현재 세션의 총 금액 (취소된 주문 제외)
    const totalAmount = computed(() => {
      return validOrders.value.reduce((total, order) => total + order.total_amount, 0)
    })
    
    // ===== Methods =====
    
    const goBack = () => {
      router.push('/dashboard')
    }
    
    const goToNewOrder = () => {
      router.push(`/order/new/${tableId.value}`)
    }
    
    const goToOrderEdit = (orderId) => {
      router.push(`/order/edit/${tableId.value}/${orderId}`)
    }
    
    const formatTime = (dateTimeString) => {
      try {
        const date = new Date(dateTimeString)
        return date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateTimeString
      }
    }
    
    const getStatusDisplayText = (status) => {
      return tableStore.getStatusDisplayText(status)
    }
    
    const getStatusBadgeClass = (status) => {
      const color = tableStore.getStatusColor(status)
      switch (color) {
        case 'orange': return 'bg-orange-100 text-orange-800'
        case 'blue': return 'bg-blue-100 text-blue-800'
        case 'green': return 'bg-green-100 text-green-800'
        case 'red': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    const getOrderHeaderClass = (status) => {
      switch (status) {
        case '결제대기': return 'bg-orange-500'
        case '결제확인': return 'bg-blue-500'
        case '완료': return 'bg-green-500'
        case '취소': return 'bg-red-500'
        default: return 'bg-gray-500'
      }
    }
    
    // 결제 확인
    const confirmPayment = async (orderId) => {
      const order = tableStore.getOrderById(orderId)
      if (!order) return
      
      const confirmMsg = `결제를 확인하시겠습니까?\n\n주문: ${order.order_number}\n입금자: ${order.depositor_name}\n금액: ${order.total_amount.toLocaleString()}원`
      
      if (!confirm(confirmMsg)) return
      
      loading.value = true
      
      try {
        const success = await tableStore.verifyPayment(orderId)
        if (success) {
          console.log('결제 확인 완료')
        }
      } catch (error) {
        console.error('결제 확인 실패:', error)
        alert('결제 확인 중 오류가 발생했습니다.')
      } finally {
        loading.value = false
      }
    }
    
    // 주문 취소
    const cancelOrder = async (orderId) => {
      const order = tableStore.getOrderById(orderId)
      if (!order) return
      
      const confirmMsg = `주문을 취소하시겠습니까?\n\n주문: ${order.order_number}\n금액: ${order.total_amount.toLocaleString()}원\n\n취소된 주문은 복구할 수 없습니다.`
      
      if (!confirm(confirmMsg)) return
      
      loading.value = true
      
      try {
        const success = await tableStore.cancelOrder(orderId)
        if (success) {
          console.log('주문 취소 완료')
        }
      } catch (error) {
        console.error('주문 취소 실패:', error)
        alert('주문 취소 중 오류가 발생했습니다.')
      } finally {
        loading.value = false
      }
    }
    
    // 테이블 정리 (세션 종료) - 간단한 확인창
    const clearTable = async () => {
      if (!confirm(`정말로 테이블 ${tableId.value}번을 아웃하시겠습니까?`)) {
        return
      }
      
      loading.value = true
      
      try {
        // 대시보드와 동일한 직접 처리 로직
        const table = tableStore.getTableById(tableId.value)
        const currentSessionData = tableStore.getCurrentSession(tableId.value)
        
        if (currentSessionData) {
          // 현재 세션의 주문들 가져오기
          const sessionOrders = tableStore.getOrdersBySession(currentSessionData.session_id)
          
          // 주문 상태별 분류 및 처리
          for (const order of sessionOrders) {
            if (order.order_status === '결제대기') {
              // 결제대기 주문 삭제
              delete tableStore.orders[order.order_id]
              delete tableStore.payments[order.order_id]
            } else if (order.order_status === '결제확인' || order.order_status === '기타') {
              // 결제확인/기타 주문 취소
              const orderData = tableStore.orders[order.order_id]
              if (orderData) {
                orderData.order_status = '취소'
              }
            }
          }
          
          // 세션 종료
          const session = tableStore.sessions[currentSessionData.session_id]
          if (session) {
            session.is_active = false
            session.end_time = new Date().toISOString()
          }
        }
        
        // 테이블 정리
        if (table) {
          table.is_occupied = false
          table.current_session_id = null
          table.current_order = null
        }
        
        console.log('테이블 아웃 완료')
        goBack()
        
      } catch (error) {
        console.error('테이블 아웃 실패:', error)
        alert('테이블 아웃 중 오류가 발생했습니다.')
      } finally {
        loading.value = false
      }
    }
    
    // ===== Lifecycle =====
    onMounted(async () => {
      console.log(`테이블 ${tableId.value} 상세 페이지 로드됨`)
      
      // 페이지 제목 설정
      document.title = `테이블 ${tableId.value}번 - 레스토랑 관리`
      
      // 테이블 정보 로드
      await tableStore.fetchTables()
      
      const table = tableStore.getTableById(tableId.value)
      if (!table || !table.is_occupied) {
        console.log('빈 테이블입니다.')
      } else {
        console.log(`활성 세션: ${table.current_session_id}`)
      }
    })
    
    // ===== Return =====
    return {
      // Computed
      tableId,
      currentTable,
      currentSession,
      tableOrders,
      validOrders,
      sortedOrders,
      totalAmount,
      loading,
      
      // Methods
      goBack,
      goToNewOrder,
      goToOrderEdit,
      formatTime,
      getStatusDisplayText,
      getStatusBadgeClass,
      getOrderHeaderClass,
      confirmPayment,
      cancelOrder,
      clearTable
    }
  }
}
</script>

<style scoped>
.table-detail {
  padding-bottom: 100px; /* 하단 고정 버튼 공간 확보 */
}

/* 그리드 아이템 호버 효과 */
.grid > div {
  transition: all 0.2s ease;
}

.grid > div:hover {
  transform: translateY(-2px);
}

/* 반응형 그리드 조정 */
@media (max-width: 1024px) {
  .xl\:grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .lg\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .fixed .grid {
    grid-template-columns: 1fr;
  }
  
  .fixed .grid > * {
    grid-column: span 1;
  }
}
</style>