<template>
  <div class="table-detail min-h-screen bg-gray-100">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <button 
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span class="text-lg">←</span>
          <span class="font-medium">뒤로</span>
        </button>
        
        <div class="text-center">
          <h1 class="text-xl font-bold text-gray-800">
            {{ tableName }} 주문 내역
          </h1>
          <div class="text-sm text-gray-600">
            <span :class="tableStatusClass" class="px-2 py-1 rounded-full text-xs font-medium">
              {{ currentTable?.statusText || '로딩 중' }}
            </span>
            <span class="ml-2">총 {{ totalAmount.toLocaleString() }}원</span>
          </div>
        </div>
        
        <div class="w-16"></div> <!-- 중앙 정렬용 -->
      </div>
    </header>

    <!-- 주문 목록 -->
    <main class="max-w-6xl mx-auto p-4 pb-20">
      <div v-if="orders.length === 0" class="text-center py-20">
        <div class="text-gray-500 text-lg mb-4">주문 내역이 없습니다</div>
        <button 
          @click="goToNewOrder"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          첫 주문 추가하기
        </button>
      </div>

      <!-- 🎯 그리드 레이아웃으로 변경! -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div 
          v-for="order in sortedOrders" 
          :key="order.id"
          class="bg-white rounded-lg shadow-md overflow-hidden h-fit hover:shadow-lg transition-shadow"
        >
          <!-- 주문 헤더 -->
          <div 
            class="p-3 flex items-center justify-between"
            :class="getOrderHeaderClass(order.status)"
          >
            <div class="flex items-center gap-2">
              <span class="text-white font-medium text-sm">{{ order.orderTime }}</span>
              <span class="text-white text-xs px-2 py-1 bg-white bg-opacity-20 rounded">
                {{ getOrderStatusText(order.status) }}
              </span>
            </div>
            <div class="text-white text-sm font-bold">
              {{ getOrderTotal(order).toLocaleString() }}원
            </div>
          </div>

          <!-- 주문 아이템들 -->
          <div class="p-3 space-y-2">
            <div 
              v-for="item in order.items" 
              :key="item.id"
              class="flex items-start justify-between p-2 rounded transition-colors"
              :class="item.completed ? 'bg-green-50 border-l-2 border-green-400' : 'bg-gray-50'"
            >
              <div class="flex items-start gap-2 flex-1">
                <!-- 완료 체크박스 -->
                <input 
                  type="checkbox"
                  v-model="item.completed"
                  @change="handleItemToggle(order.id, item.id)"
                  class="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5"
                >
                
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm text-gray-800 truncate" 
                       :class="{ 'line-through text-gray-500': item.completed }">
                    {{ item.name }}
                  </div>
                  <div class="text-xs text-gray-600">
                    {{ item.quantity }}개
                  </div>
                </div>
              </div>
              
              <div class="text-right ml-2">
                <div class="font-medium text-sm text-gray-800" 
                     :class="{ 'line-through text-gray-500': item.completed }">
                  {{ item.price.toLocaleString() }}원
                </div>
                <div v-if="item.completed" class="text-xs text-green-600">
                  ✓
                </div>
              </div>
            </div>
          </div>
          
          <!-- 주문별 진행률 및 액션 버튼 -->
          <div class="px-3 pb-3">
            <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>진행률</span>
              <span>{{ getCompletedCount(order) }}/{{ order.items.length }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                class="h-2 rounded-full transition-all"
                :class="getProgressBarClass(order)"
                :style="{ width: getProgressPercentage(order) + '%' }"
              ></div>
            </div>
            
            <!-- 액션 버튼들 -->
            <div class="flex gap-2">
              <button 
                @click="goToOrderDetail(order.id)"
                class="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
              >
                📋 상세
              </button>
              
              <button 
                v-if="!isOrderPaid(order)"
                @click="confirmPayment(order.id)"
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
              >
                💰 결제확인
              </button>
              
              <button 
                v-if="!isOrderPaid(order)"
                @click="cancelOrder(order.id)"
                class="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
              >
                ❌
              </button>
              
              <div v-else class="flex-1 bg-green-100 text-green-700 text-sm font-medium py-2 px-3 rounded text-center">
                ✅ 결제완료
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 하단 고정 버튼 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="max-w-6xl mx-auto flex gap-3">
        <button 
          @click="goToNewOrder"
          class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span class="text-xl">+</span>
          <span>새 주문</span>
        </button>
        
        <button 
          @click="markAllComplete"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          전체 완료
        </button>
        
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
import { computed, onMounted } from 'vue'
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
    // (더 이상 모달이 필요 없음)
    
    // ===== Computed Properties =====
    const tableId = computed(() => parseInt(route.params.id))
    const tableName = computed(() => `테이블 ${tableId.value}번`)
    
    const currentTable = computed(() => {
      return tableStore.tables.find(t => t.id === tableId.value)
    })
    
    const orders = computed(() => {
      return tableStore.getTableOrders(tableId.value)
    })
    
    const sortedOrders = computed(() => {
      return [...orders.value].sort((a, b) => {
        // 시간순 정렬 (최신순)
        return b.orderTime.localeCompare(a.orderTime)
      })
    })
    
    const totalAmount = computed(() => {
      return orders.value.reduce((total, order) => {
        return total + getOrderTotal(order)
      }, 0)
    })
    
    const tableStatusClass = computed(() => {
      const status = currentTable.value?.status
      switch (status) {
        case 'ready': return 'bg-green-500 text-white'
        case 'payment': return 'bg-blue-500 text-white'
        case 'cooking': return 'bg-red-500 text-white'
        case 'partial': return 'bg-orange-500 text-white'
        default: return 'bg-gray-500 text-white'
      }
    })
    
    // ===== Methods =====
    
    const goBack = () => {
      router.push('/')
    }
    
    const getOrderTotal = (order) => {
      return order.items.reduce((sum, item) => sum + item.price, 0)
    }
    
    const getOrderHeaderClass = (status) => {
      switch (status) {
        case 'completed': return 'bg-green-500'
        case 'partial': return 'bg-orange-500'
        case 'cooking': return 'bg-red-500'
        default: return 'bg-gray-500'
      }
    }
    
    const getOrderStatusText = (status) => {
      switch (status) {
        case 'completed': return '완료'
        case 'partial': return '부분 완료'
        case 'cooking': return '조리 중'
        default: return '대기'
      }
    }
    
    // 🎯 새로 추가된 진행률 관련 함수들
    const getCompletedCount = (order) => {
      return order.items.filter(item => item.completed).length
    }
    
    const getProgressPercentage = (order) => {
      const completed = getCompletedCount(order)
      const total = order.items.length
      return total > 0 ? (completed / total) * 100 : 0
    }
    
    const getProgressBarClass = (order) => {
      const percentage = getProgressPercentage(order)
      if (percentage === 100) return 'bg-green-500'
      if (percentage > 0) return 'bg-orange-500'
      return 'bg-red-500'
    }
    
    const handleItemToggle = (orderId, itemId) => {
      console.log(`메뉴 아이템 토글: 주문 ${orderId}, 아이템 ${itemId}`)
      tableStore.toggleItemComplete(tableId.value, orderId, itemId)
    }
    
    const markAllComplete = () => {
      const confirmMsg = `${tableName.value}의 모든 메뉴를 완료 처리하시겠습니까?`
      if (confirm(confirmMsg)) {
        orders.value.forEach(order => {
          order.items.forEach(item => {
            if (!item.completed) {
              tableStore.toggleItemComplete(tableId.value, order.id, item.id)
            }
          })
        })
      }
    }
    
    // 🎯 주문 수정 페이지로 이동  
    const goToOrderDetail = (orderId) => {
      router.push(`/order/edit/${tableId.value}/${orderId}`)
      console.log(`주문 ${orderId} 수정 페이지로 이동`)
    }
    
    // 🎯 주문 결제 상태 확인 (스마트 로직)
    const isOrderPaid = (order) => {
      // 1. 주문에 paid 플래그가 있으면 그것을 우선 사용
      if (order.paid !== undefined) {
        return order.paid
      }
      
      // 2. 테이블 상태가 '준비 완료'나 '결제 완료'면 결제 완료로 간주
      const tableStatus = currentTable.value?.status
      if (tableStatus === 'ready' || tableStatus === 'payment') {
        return true
      }
      
      // 3. 주문 상태가 '완료'면 결제 완료로 간주
      if (order.status === 'completed') {
        return true
      }
      
      // 4. 기본값은 미결제
      return false
    }
    
    // 🎯 새 주문 페이지로 이동
    const goToNewOrder = () => {
      router.push(`/order/new/${tableId.value}`)
      console.log(`테이블 ${tableId.value} 새 주문 페이지로 이동`)
    }
    
    // 🎯 주문 취소
    const cancelOrder = (orderId) => {
      const order = orders.value.find(o => o.id === orderId)
      if (!order) return
      
      const amount = getOrderTotal(order)
      const confirmMsg = `${amount.toLocaleString()}원 주문을 취소하시겠습니까?\n(취소된 주문은 복구할 수 없습니다)`
      
      if (confirm(confirmMsg)) {
        // TODO: API 연결
        // await cancelOrderAPI(orderId)
        
        console.log(`주문 ${orderId} 취소 요청`)
        alert('주문이 취소되었습니다.')
        
        // 임시: 로컬에서 주문 제거
        tableStore.deleteOrder(tableId.value, orderId)
      }
    }
    
    const confirmPayment = (orderId) => {
      const order = orders.value.find(o => o.id === orderId)
      const amount = getOrderTotal(order)
      const confirmMsg = `${amount.toLocaleString()}원 결제를 확인하시겠습니까?\n(계좌 입금을 확인하신 후 눌러주세요)`
      
      if (confirm(confirmMsg)) {
        // 주문에 결제 완료 표시
        if (order) {
          order.paid = true
          console.log(`주문 ${orderId} 결제 확인 완료`)
        }
      }
    }
    
    const clearTable = () => {
      const confirmMsg = `${tableName.value}을 정리하시겠습니까?\n(모든 주문이 삭제되고 빈 테이블이 됩니다)`
      if (confirm(confirmMsg)) {
        tableStore.clearTable(tableId.value)
        goBack()
      }
    }
    
    // ===== Lifecycle =====
    onMounted(() => {
      console.log(`테이블 ${tableId.value} 상세 페이지 로드됨`)
      
      // 빈 테이블인 경우 경고
      if (currentTable.value?.status === 'empty') {
        const goBackToMain = confirm('빈 테이블입니다. 메인 화면으로 돌아가시겠습니까?')
        if (goBackToMain) {
          goBack()
        }
      }
    })
    
    // ===== Return =====
    return {
      // Computed
      tableId,
      tableName,
      currentTable,
      orders,
      sortedOrders,
      totalAmount,
      tableStatusClass,
      
      // Methods
      goBack,
      getOrderTotal,
      getOrderHeaderClass,
      getOrderStatusText,
      getCompletedCount,
      getProgressPercentage,
      getProgressBarClass,
      goToOrderDetail,
      isOrderPaid,        // 🆕 결제 상태 확인
      goToNewOrder,       // 🆕 새 주문 페이지로 이동
      cancelOrder,        // 🆕 주문 취소
      confirmPayment,
      handleItemToggle,
      markAllComplete,
      clearTable
    }
  }
}
</script>

<style scoped>
.table-detail {
  padding-bottom: 100px; /* 하단 고정 버튼 공간 확보 */
}

/* 체크박스 커스텀 스타일 */
input[type="checkbox"]:checked {
  background-color: #22c55e;
  border-color: #22c55e;
}

/* 그리드 아이템 호버 효과 */
.grid > div {
  transition: all 0.2s ease;
}

.grid > div:hover {
  transform: translateY(-2px);
}

/* 반응형 그리드 조정 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1280px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>