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
            <span class="mr-4">총 {{ tableOrders.length }}개 주문</span>
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

      <!-- 주문들이 있는 경우 - 그리드 레이아웃 -->
      <div v-else-if="tableOrders.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- 각 주문별 카드 -->
        <div 
          v-for="order in sortedOrders" 
          :key="order.order_id"
          class="bg-white rounded-lg shadow-md overflow-hidden h-fit hover:shadow-lg transition-shadow"
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
          <div class="p-4 bg-gray-50 flex gap-2">
            <button 
              @click="goToOrderEdit(order.order_id)"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
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
      <div class="max-w-7xl mx-auto flex gap-3">
        <!-- 새 주문 추가 -->
        <button 
          @click="goToNewOrder"
          class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span class="text-xl">+</span>
          <span>새 주문</span>
        </button>
        
        <!-- 아웃 (테이블 정리) -->
        <button 
          @click="clearTable"
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          아웃
        </button>
      </div>
    </div>

    <!-- 주문 수정 확인 모달 -->
    <div 
      v-if="showEditConfirmModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditConfirmModal"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">⚠️ 주문 확인</h3>
        <p class="text-gray-600 mb-6">
          모든 메뉴가 삭제되었습니다.<br>
          이 주문을 취소하시겠습니까?<br><br>
          <span class="text-sm text-gray-500">
            취소하지 않으려면 메뉴를 다시 추가해주세요.
          </span>
        </p>
        <div class="flex gap-3">
          <button 
            @click="confirmOrderCancellation"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            주문 취소
          </button>
          <button 
            @click="returnToEdit"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            수정 계속
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
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
    const showEditConfirmModal = ref(false)
    const pendingEditOrderId = ref(null)
    const pendingEditData = ref(null)
    
    // ===== Computed Properties =====
    const tableId = computed(() => parseInt(route.params.id))
    
    const currentTable = computed(() => {
      return tableStore.getTableById(tableId.value)
    })
    
    // 해당 테이블의 모든 주문들
    const tableOrders = computed(() => {
      if (!currentTable.value || !currentTable.value.is_occupied) return []
      
      // 실제로는 API에서 테이블별 모든 주문을 가져와야 함
      // 임시로 더미 데이터 사용
      return Object.values(tableStore.orders).filter(order => order.table_id === tableId.value)
    })
    
    // 시간순 정렬된 주문들 (최신순)
    const sortedOrders = computed(() => {
      return [...tableOrders.value].sort((a, b) => {
        return new Date(b.order_time) - new Date(a.order_time)
      })
    })
    
    // 총 금액
    const totalAmount = computed(() => {
      return tableOrders.value.reduce((total, order) => total + order.total_amount, 0)
    })
    
    // ===== Methods =====
    
    const goBack = () => {
      router.push('/')
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
        await tableStore.verifyPayment(orderId)
        console.log('결제 확인 완료')
      } catch (error) {
        console.error('결제 확인 실패:', error)
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
      } finally {
        loading.value = false
      }
    }
    
    // 테이블 정리 (아웃) - 상태별 처리
    const clearTable = async () => {
      if (tableOrders.value.length === 0) {
        goBack()
        return
      }
      
      // 주문들의 상태별 분류
      const pendingOrders = tableOrders.value.filter(order => order.order_status === '결제대기')
      const confirmedOrders = tableOrders.value.filter(order => order.order_status === '결제확인')  
      const completedOrders = tableOrders.value.filter(order => order.order_status === '완료')
      const otherOrders = tableOrders.value.filter(order => !['결제대기', '결제확인', '완료'].includes(order.order_status))
      
      // 확인 메시지 구성
      let confirmMsg = `테이블 ${tableId.value}번을 정리하시겠습니까?\n\n`
      
      if (pendingOrders.length > 0) {
        confirmMsg += `🔸 결제대기 ${pendingOrders.length}개 → DB에서 삭제됩니다\n`
      }
      if (confirmedOrders.length > 0) {
        confirmMsg += `🔸 결제확인 ${confirmedOrders.length}개 → 취소 처리됩니다\n`
      }
      if (completedOrders.length > 0) {
        confirmMsg += `🔸 완료 ${completedOrders.length}개 → 정상 아웃 처리됩니다\n`
      }
      if (otherOrders.length > 0) {
        confirmMsg += `🔸 기타 ${otherOrders.length}개 → 취소 처리됩니다\n`
      }
      
      confirmMsg += `\n총액: ${totalAmount.value.toLocaleString()}원`
      
      if (!confirm(confirmMsg)) return
      
      loading.value = true
      
      try {
        let allSuccess = true
        
        // 1. 결제대기 주문들 - DB에서 삭제
        for (const order of pendingOrders) {
          const success = await tableStore.deleteOrder(order.order_id)
          if (!success) {
            allSuccess = false
            console.error(`결제대기 주문 ${order.order_id} 삭제 실패`)
          }
        }
        
        // 2. 결제확인 주문들 - 취소 처리
        for (const order of confirmedOrders) {
          const success = await tableStore.cancelOrder(order.order_id)
          if (!success) {
            allSuccess = false
            console.error(`결제확인 주문 ${order.order_id} 취소 실패`)
          }
        }
        
        // 3. 기타 주문들 - 취소 처리
        for (const order of otherOrders) {
          const success = await tableStore.cancelOrder(order.order_id)
          if (!success) {
            allSuccess = false
            console.error(`주문 ${order.order_id} 취소 실패`)
          }
        }
        
        // 4. 완료된 주문들과 테이블 정리 - 정상 아웃
        if (completedOrders.length > 0 || allSuccess) {
          const success = await tableStore.clearTable(tableId.value)
          if (success) {
            console.log('테이블 정리 완료')
            alert('테이블이 정리되었습니다.')
            goBack()
          } else {
            alert('테이블 정리 중 오류가 발생했습니다.')
          }
        } else {
          alert('일부 주문 처리에 실패했습니다.')
        }
        
      } catch (error) {
        console.error('테이블 정리 실패:', error)
        alert('테이블 정리 중 오류가 발생했습니다.')
      } finally {
        loading.value = false
      }
    }
    
    // ===== 주문 수정 관련 메서드 =====
    
    // 주문 수정 완료 후 호출되는 메서드 (수정 페이지에서 전달받음)
    const handleOrderEditComplete = (editData) => {
      console.log('주문 수정 완료 데이터:', editData)
      
      // 모든 메뉴가 삭제된 경우 확인 모달 표시
      if (!editData.orderDetails || editData.orderDetails.length === 0) {
        pendingEditOrderId.value = editData.orderId
        pendingEditData.value = editData
        showEditConfirmModal.value = true
        return
      }
      
      // 정상적인 수정 완료 처리
      completeOrderEdit(editData)
    }
    
    // 실제 주문 수정 완료 처리
    const completeOrderEdit = async (editData) => {
      loading.value = true
      
      try {
        const success = await tableStore.updateOrder(editData.orderId, editData)
        if (success) {
          console.log('주문 수정 완료')
          // 테이블 정보 새로고침
          await tableStore.fetchTables()
        } else {
          alert('주문 수정 중 오류가 발생했습니다.')
        }
      } catch (error) {
        console.error('주문 수정 실패:', error)
        alert('주문 수정 중 오류가 발생했습니다.')
      } finally {
        loading.value = false
      }
    }
    
    // 모달에서 주문 취소 확인
    const confirmOrderCancellation = async () => {
      if (!pendingEditOrderId.value) return
      
      loading.value = true
      showEditConfirmModal.value = false
      
      try {
        const success = await tableStore.cancelOrder(pendingEditOrderId.value)
        if (success) {
          console.log('주문 취소 완료')
          alert('주문이 취소되었습니다.')
          // 테이블 정보 새로고침
          await tableStore.fetchTables()
        } else {
          alert('주문 취소 중 오류가 발생했습니다.')
        }
      } catch (error) {
        console.error('주문 취소 실패:', error)
        alert('주문 취소 중 오류가 발생했습니다.')
      } finally {
        loading.value = false
        pendingEditOrderId.value = null
        pendingEditData.value = null
      }
    }
    
    // 수정 페이지로 돌아가기
    const returnToEdit = () => {
      showEditConfirmModal.value = false
      
      if (pendingEditOrderId.value) {
        // 수정 페이지로 다시 이동 (메뉴 추가를 위해)
        router.push(`/order/edit/${tableId.value}/${pendingEditOrderId.value}`)
      }
      
      pendingEditOrderId.value = null
      pendingEditData.value = null
    }
    
    // 모달 닫기
    const closeEditConfirmModal = () => {
      showEditConfirmModal.value = false
      pendingEditOrderId.value = null
      pendingEditData.value = null
    }
    
    // ===== 전역 이벤트 리스너 =====
    
    // 주문 수정 완료 이벤트 리스너
    const handleOrderEditEvent = (event) => {
      if (event.detail && event.detail.type === 'orderEditComplete') {
        handleOrderEditComplete(event.detail.data)
      }
    }
    
    // ===== Lifecycle =====
    onMounted(async () => {
      console.log(`테이블 ${tableId.value} 상세 페이지 로드됨`)
      
      // 테이블 정보 로드
      await tableStore.fetchTables()
      
      // 주문 수정 완료 이벤트 리스너 추가
      window.addEventListener('orderEdit', handleOrderEditEvent)
      
      // 빈 테이블인 경우 안내
      const table = tableStore.getTableById(tableId.value)
      if (!table || !table.is_occupied) {
        console.log('빈 테이블입니다.')
      }
    })
    
    onBeforeUnmount(() => {
      // 이벤트 리스너 제거
      window.removeEventListener('orderEdit', handleOrderEditEvent)
    })
    
    // ===== Return =====
    return {
      // Computed
      tableId,
      currentTable,
      tableOrders,
      sortedOrders,
      totalAmount,
      loading,
      
      // Modal State
      showEditConfirmModal,
      
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
      clearTable,
      
      // Edit Methods
      handleOrderEditComplete,
      confirmOrderCancellation,
      returnToEdit,
      closeEditConfirmModal
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
  
  .fixed .flex {
    flex-direction: column;
  }
  
  .fixed .flex > * {
    flex: none;
  }
}

/* 모달 애니메이션 */
.fixed {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fixed > div {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>