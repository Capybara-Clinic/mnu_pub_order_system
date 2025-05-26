<template>
  <div class="order-management min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <button 
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span class="text-lg">←</span>
          <span class="font-medium">뒤로</span>
        </button>
        
        <h1 class="text-xl font-bold text-gray-800">전체 주문 관리</h1>
        
        <div class="w-16"></div> <!-- 중앙 정렬용 -->
      </div>
    </header>

    <!-- 필터 및 검색 -->
    <div class="max-w-7xl mx-auto p-4">
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="flex flex-wrap gap-4 items-center">
          <!-- 상태 필터 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">필터:</label>
            <select v-model="statusFilter" class="border border-gray-300 rounded px-3 py-1 text-sm">
              <option value="">모든 상태</option>
              <option value="결제대기">결제대기</option>
              <option value="결제확인">결제확인</option>
              <option value="완료">완료</option>
              <option value="취소">취소</option>
            </select>
          </div>

          <!-- 테이블 필터 -->
          <div class="flex items-center gap-2">
            <select v-model="tableFilter" class="border border-gray-300 rounded px-3 py-1 text-sm">
              <option value="">테이블 번호</option>
              <option v-for="i in 10" :key="i" :value="i">{{ i }}번</option>
            </select>
          </div>

          <!-- 정렬 -->
          <div class="flex items-center gap-2">
            <select v-model="sortOrder" class="border border-gray-300 rounded px-3 py-1 text-sm">
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="table">테이블순</option>
            </select>
          </div>

          <!-- 검색 -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="주문번호, 입금자명 검색..."
                class="w-full border border-gray-300 rounded px-3 py-1 text-sm pr-8"
              >
              <button class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-blue-500 rounded px-2 py-0.5 text-xs">
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 주문 테이블 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문번호</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">테이블</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입금자명</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문시간</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메뉴</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총액</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in paginatedOrders" :key="order.order_id" class="hover:bg-gray-50">
                <!-- 주문번호 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ order.order_number }}
                </td>
                
                <!-- 테이블 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.table_id }}번
                </td>
                
                <!-- 입금자명 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.depositor_name }}
                </td>
                
                <!-- 주문시간 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatTime(order.order_time) }}
                </td>
                
                <!-- 메뉴 -->
                <td class="px-4 py-4 text-sm text-gray-900">
                  <div class="max-w-xs">
                    {{ getOrderMenuText(order) }}
                  </div>
                </td>
                
                <!-- 총액 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.total_amount.toLocaleString() }}원
                </td>
                
                <!-- 상태 -->
                <td class="px-4 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusBadgeClass(order.order_status)"
                  >
                    {{ getStatusText(order.order_status) }}
                  </span>
                </td>
                
                <!-- 관리 버튼 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button 
                      @click="goToOrderDetail(order.table_id, order.order_id)"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      수정
                    </button>
                    <button 
                      @click="handleCancelOrder(order.order_id)"
                      class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- 데이터 없을 때 -->
              <tr v-if="filteredOrders.length === 0">
                <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                  주문 내역이 없습니다
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 - 균형잡힌 3단 구조 -->
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <!-- 왼쪽: 총 주문 수 -->
            <div class="text-sm text-gray-700">
              총 {{ filteredOrders.length }}개 주문
            </div>
            
            <!-- 가운데: 페이지 버튼들 -->
            <div class="flex gap-1">
              <button 
                v-if="currentPage > 1"
                @click="currentPage--"
                class="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                &lt;
              </button>
              
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                class="px-3 py-1 text-sm rounded transition-colors"
                :class="page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                {{ page }}
              </button>
              
              <button 
                v-if="currentPage < totalPages"
                @click="currentPage++"
                class="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                &gt;
              </button>
            </div>
            
            <!-- 오른쪽: 현재 범위 -->
            <div class="text-sm text-gray-700">
              {{ startIndex + 1 }}-{{ endIndex }}번째
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTableStore } from '@/stores/tableStore'

export default {
  name: 'OrderManagementView',
  
  setup() {
    // ===== Composables =====
    const router = useRouter()
    const tableStore = useTableStore()
    
    // ===== Reactive State =====
    const statusFilter = ref('')
    const tableFilter = ref('')
    const sortOrder = ref('newest')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    
    // ===== Computed Properties =====
    
    // 모든 주문을 배열로 변환 (DB 스키마 기반, 실시간 계산)
    const allOrders = computed(() => {
      if (!tableStore.orders) return []
      
      return Object.values(tableStore.orders).map(order => {
        // total_amount를 order_details 기반으로 실시간 계산
        const calculatedTotal = order.order_details?.reduce((sum, detail) => sum + detail.subtotal, 0) || 0
        
        return {
          ...order,
          total_amount: calculatedTotal
        }
      })
    })
    
    // 필터링된 주문들
    const filteredOrders = computed(() => {
      let filtered = [...allOrders.value]
      
      // 상태 필터
      if (statusFilter.value) {
        filtered = filtered.filter(order => order.order_status === statusFilter.value)
      }
      
      // 테이블 필터
      if (tableFilter.value) {
        filtered = filtered.filter(order => order.table_id === parseInt(tableFilter.value))
      }
      
      // 검색 (주문번호, 입금자명)
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => {
          return order.order_number.toLowerCase().includes(query) ||
                 order.depositor_name.toLowerCase().includes(query) ||
                 order.table_id.toString().includes(query)
        })
      }
      
      // 정렬
      filtered.sort((a, b) => {
        switch (sortOrder.value) {
          case 'newest':
            return new Date(b.order_time) - new Date(a.order_time)
          case 'oldest':
            return new Date(a.order_time) - new Date(b.order_time)
          case 'table':
            return a.table_id - b.table_id
          default:
            return 0
        }
      })
      
      return filtered
    })
    
    // 페이지네이션
    const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage.value))
    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredOrders.value.length))
    
    const paginatedOrders = computed(() => {
      return filteredOrders.value.slice(startIndex.value, startIndex.value + itemsPerPage.value)
    })
    
    // ===== Methods =====
    
    const goBack = () => {
      router.push('/dashboard')
    }
    
    // 주문 메뉴 텍스트 생성 (order_details 기반)
    const getOrderMenuText = (order) => {
      if (!order.order_details || order.order_details.length === 0) return '메뉴 없음'
      
      const firstItem = order.order_details[0]
      const firstText = `${firstItem.menu_name}(${firstItem.quantity}개)`
      
      if (order.order_details.length === 1) {
        return firstText
      } else {
        return `${firstText} 외 ${order.order_details.length - 1}개`
      }
    }
    
    // 시간 포맷팅
    const formatTime = (timeString) => {
      try {
        const date = new Date(timeString)
        return date.toLocaleString('ko-KR', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return timeString
      }
    }
    
    // 상태 텍스트 (DB ENUM 기반)
    const getStatusText = (status) => {
      switch (status) {
        case '결제대기': return '결제 대기'
        case '결제확인': return '결제 확인'
        case '완료': return '완료'
        case '취소': return '취소'
        default: return status
      }
    }
    
    // 상태별 배지 색상
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case '결제대기': return 'bg-orange-100 text-orange-800'
        case '결제확인': return 'bg-blue-100 text-blue-800'
        case '완료': return 'bg-green-100 text-green-800'
        case '취소': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    // 주문 상세로 이동
    const goToOrderDetail = (tableId, orderId) => {
      router.push(`/order/edit/${tableId}/${orderId}`)
    }
    
    // 주문 취소
    const handleCancelOrder = async (orderId) => {
      const order = tableStore.getOrderById(orderId)
      if (!order) {
        alert('주문을 찾을 수 없습니다.')
        return
      }
      
      const confirmMsg = `주문 ${order.order_number}을(를) 취소하시겠습니까?\n입금자: ${order.depositor_name}\n금액: ${order.total_amount.toLocaleString()}원\n\n취소된 주문은 복구할 수 없습니다.`
      
      if (confirm(confirmMsg)) {
        try {
          const success = await tableStore.cancelOrder(orderId)
          if (success) {
            console.log(`✅ 주문 ${orderId} 취소 완료`)
            alert('주문이 취소되었습니다.')
          } else {
            alert('주문 취소에 실패했습니다.')
          }
        } catch (error) {
          console.error('주문 취소 중 오류:', error)
          alert('주문 취소 중 오류가 발생했습니다.')
        }
      }
    }
    
    // ===== Return =====
    return {
      // State
      statusFilter,
      tableFilter,
      sortOrder,
      searchQuery,
      currentPage,
      
      // Computed
      allOrders,
      filteredOrders,
      paginatedOrders,
      totalPages,
      startIndex,
      endIndex,
      
      // Methods
      goBack,
      getOrderMenuText,
      formatTime,
      getStatusText,
      getStatusBadgeClass,
      goToOrderDetail,
      handleCancelOrder
    }
  }
}
</script>

<style scoped>
/* 테이블 스타일 */
table {
  border-collapse: collapse;
}

/* 스크롤바 스타일 */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 호버 효과 */
tr:hover {
  background-color: #f9fafb;
}

/* 반응형 테이블 */
@media (max-width: 768px) {
  .overflow-x-auto {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px 12px;
  }
}
</style>