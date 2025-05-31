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
          <div class="text-sm text-gray-600" v-if="tableData && tableData.orders.length > 0">
            <span class="mr-4">총 {{ validOrders.length }}개 주문</span>
            <span v-if="tableData.orders.length > validOrders.length" class="mr-4 text-red-500">(취소 {{ tableData.orders.length - validOrders.length }}개)</span>
            <span>총액: {{ totalAmount.toLocaleString() }}원</span>
          </div>
        </div>
        
        <div class="w-16"></div> <!-- 중앙 정렬용 -->
      </div>
    </header>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-gray-600 mb-2">테이블 정보를 불러오는 중...</div>
        <div class="text-sm text-gray-500">{{ loadingMessage }}</div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-red-600 mb-2">❌ {{ error }}</div>
        <button @click="fetchTableData" class="bg-blue-500 text-white px-4 py-2 rounded">
          다시 시도
        </button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <main v-else class="max-w-7xl mx-auto p-4 pb-20">
      <!-- 빈 테이블인 경우 -->
      <div v-if="!tableData || tableData.orders.length === 0" class="text-center py-20">
        <div class="text-gray-500 text-lg mb-4">빈 테이블입니다</div>
        <button 
          @click="goToNewOrder"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          새 주문 추가하기
        </button>
      </div>

      <!-- 주문들이 있는 경우 - 그리드 레이아웃 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div class="font-bold text-lg">#{{ order.order_id }}</div>
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
                :disabled="actionLoading"
                class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                💰 결제확인
              </button>
            </div>
          </div>

          <!-- 메뉴 목록 (읽기 전용) -->
          <div class="p-4 space-y-3">
            <div 
              v-for="(detail, index) in order.details" 
              :key="index"
              class="flex items-start justify-between p-3 rounded-lg bg-gray-50"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm text-gray-800 truncate">
                  {{ detail.menu_name }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ detail.quantity }}개 × {{ detail.menu_account.toLocaleString() }}원
                </div>
                <div v-if="detail.is_served" class="text-xs text-green-600">
                  ✅ 서빙완료
                </div>
                <div v-else class="text-xs text-orange-600">
                  ⏳ 준비중
                </div>
              </div>
              
              <div class="text-right ml-2">
                <div class="font-medium text-sm text-gray-800">
                  {{ (detail.quantity * detail.menu_account).toLocaleString() }}원
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
              :disabled="actionLoading"
              class="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors disabled:opacity-50"
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
          :disabled="actionLoading"
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50"
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
import { cashierAPI } from '@/api/cashierService'

export default {
  name: 'TableDetailView',
  
  setup() {
    // ===== Composables =====
    const router = useRouter()
    const route = useRoute()
    
    // 페이지 제목 설정
    document.title = `테이블 상세 - 레스토랑 관리`
    
    // ===== Reactive State =====
    const loading = ref(true)
    const error = ref('')
    const loadingMessage = ref('테이블 정보 조회 중...')
    const actionLoading = ref(false)
    
    // API 데이터
    const tableData = ref(null) // { table_id, orders: [...] }
    
    // ===== Computed Properties =====
    const tableId = computed(() => parseInt(route.params.id))
    
    // 유효한 주문들 (취소 제외)
    const validOrders = computed(() => {
      if (!tableData.value || !tableData.value.orders) return []
      return tableData.value.orders.filter(order => order.order_status !== '취소')
    })
    
    // 시간순 정렬된 주문들 (최신순, 취소된 주문도 포함하여 표시)
    const sortedOrders = computed(() => {
      if (!tableData.value || !tableData.value.orders) return []
      return [...tableData.value.orders].sort((a, b) => {
        return new Date(b.order_time) - new Date(a.order_time)
      })
    })
    
    // 총 금액 (취소된 주문 제외)
    const totalAmount = computed(() => {
      return validOrders.value.reduce((total, order) => total + order.total_amount, 0)
    })
    
    // ===== API Methods =====
    
    // 테이블 주문 데이터 조회
    const fetchTableData = async () => {
      try {
        loading.value = true
        error.value = ''
        loadingMessage.value = `테이블 ${tableId.value} 주문 정보 조회 중...`
        
        const response = await cashierAPI.fetchTableOrders(tableId.value)
        tableData.value = response
        
        console.log('✅ 테이블 주문 정보 조회 성공:', response)
        
        // 페이지 제목 업데이트
        document.title = `테이블 ${tableId.value}번 - 레스토랑 관리`
        
      } catch (err) {
        error.value = '테이블 정보를 불러오는데 실패했습니다: ' + err.message
        console.error('❌ 테이블 조회 실패:', err)
      } finally {
        loading.value = false
      }
    }
    
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
      switch (status) {
        case '결제대기': return '결제 대기'
        case '결제확인': return '결제 확인'
        case '완료': return '완료'
        case '취소': return '취소'
        default: return status
      }
    }
    
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case '결제대기': return 'bg-orange-100 text-orange-800'
        case '결제확인': return 'bg-blue-100 text-blue-800'
        case '완료': return 'bg-green-100 text-green-800'
        case '취소': return 'bg-red-100 text-red-800'
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
      const order = tableData.value.orders.find(o => o.order_id === orderId)
      if (!order) return
      
      const confirmMsg = `결제를 확인하시겠습니까?\n\n주문: #${order.order_id}\n입금자: ${order.depositor_name}\n금액: ${order.total_amount.toLocaleString()}원`
      
      if (!confirm(confirmMsg)) return
      
      actionLoading.value = true
      
      try {
        const result = await cashierAPI.confirmOrder(orderId)
        console.log('✅ 결제 확인 완료:', result)
        alert('결제가 확인되었습니다!')
        
        // 데이터 새로고침
        await fetchTableData()
        
      } catch (error) {
        console.error('❌ 결제 확인 실패:', error)
        alert('결제 확인 중 오류가 발생했습니다: ' + error.message)
      } finally {
        actionLoading.value = false
      }
    }
    
    // 주문 취소
    const cancelOrder = async (orderId) => {
      const order = tableData.value.orders.find(o => o.order_id === orderId)
      if (!order) return
      
      const confirmMsg = `주문을 취소하시겠습니까?\n\n주문: #${order.order_id}\n금액: ${order.total_amount.toLocaleString()}원\n\n취소된 주문은 복구할 수 없습니다.`
      
      if (!confirm(confirmMsg)) return
      
      actionLoading.value = true
      
      try {
        const result = await cashierAPI.deleteOrder(orderId)
        console.log('✅ 주문 취소 완료:', result)
        alert('주문이 취소되었습니다!')
        
        // 데이터 새로고침
        await fetchTableData()
        
      } catch (error) {
        console.error('❌ 주문 취소 실패:', error)
        alert('주문 취소 중 오류가 발생했습니다: ' + error.message)
      } finally {
        actionLoading.value = false
      }
    }
    
    // 테이블 정리 (아웃)
    const clearTable = async () => {
      if (!confirm(`정말로 테이블 ${tableId.value}번을 아웃하시겠습니까?`)) {
        return
      }
      
      actionLoading.value = true
      
      try {
        const result = await cashierAPI.resetTable(tableId.value)
        console.log('✅ 테이블 아웃 완료:', result)
        alert('테이블이 아웃되었습니다!')
        
        // 대시보드로 이동
        goBack()
        
      } catch (error) {
        console.error('❌ 테이블 아웃 실패:', error)
        alert('테이블 아웃 중 오류가 발생했습니다: ' + error.message)
      } finally {
        actionLoading.value = false
      }
    }
    
    // ===== Lifecycle =====
    onMounted(() => {
      console.log(`테이블 ${tableId.value} 상세 페이지 로드됨`)
      fetchTableData()
    })
    
    // ===== Return =====
    return {
      // State
      loading,
      error,
      loadingMessage,
      actionLoading,
      tableData,
      
      // Computed
      tableId,
      validOrders,
      sortedOrders,
      totalAmount,
      
      // Methods
      fetchTableData,
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