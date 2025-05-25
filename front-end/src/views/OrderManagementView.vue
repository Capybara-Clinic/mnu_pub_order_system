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
              <option value="cooking">조리 중</option>
              <option value="completed">완료</option>
              <option value="partial">부분 완료</option>
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
                placeholder="검색..."
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
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문 ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">테이블</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메뉴</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in paginatedOrders" :key="order.fullId" class="hover:bg-gray-50">
                <!-- 주문 ID -->
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ order.id }}
                </td>
                
                <!-- 테이블 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.tableId }}번
                </td>
                
                <!-- 시간 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.orderTime }}
                </td>
                
                <!-- 메뉴 -->
                <td class="px-4 py-4 text-sm text-gray-900">
                  <div class="max-w-xs">
                    {{ getOrderMenuText(order) }}
                  </div>
                </td>
                
                <!-- 금액 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getOrderTotal(order).toLocaleString() }}원
                </td>
                
                <!-- 상태 -->
                <td class="px-4 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusBadgeClass(order.status)"
                  >
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                
                <!-- 관리 버튼 -->
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button 
                      @click="goToOrderDetail(order.tableId, order.id)"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      수정
                    </button>
                    <button 
                      @click="handleCancelOrder(order.id, order.tableId)"
                      class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- 데이터 없을 때 -->
              <tr v-if="filteredOrders.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                  주문 내역이 없습니다
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              총 {{ filteredOrders.length }}개 주문 중 {{ startIndex + 1 }}-{{ endIndex }}번째
            </div>
            
            <div class="flex gap-1">
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
                class="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 새 주문 추가 버튼 -->
    <button 
      @click="showAddOrderModal = true"
      class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors flex items-center gap-2"
    >
      <span class="text-xl">+</span>
      <span>새 주문</span>
    </button>

    <!-- 새 주문 모달 -->
    <div v-if="showAddOrderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold mb-4">새 주문 추가</h3>
        <div class="text-center py-8">
          <div class="text-gray-500 mb-4">새 주문 기능은 준비 중입니다</div>
          <p class="text-sm text-gray-400">실제로는 메뉴 선택 화면이 나타납니다</p>
        </div>
        <button 
          @click="showAddOrderModal = false"
          class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
        >
          닫기
        </button>
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
    const showAddOrderModal = ref(false)
    
    // ===== Computed Properties =====
    
    // 모든 주문을 하나의 배열로 합치기
    const allOrders = computed(() => {
      const orders = []
      
      Object.entries(tableStore.tableOrders).forEach(([tableId, tableOrders]) => {
        tableOrders.forEach(order => {
          orders.push({
            ...order,
            tableId: parseInt(tableId),
            fullId: `${tableId}-${order.id}` // 고유 식별자
          })
        })
      })
      
      return orders
    })
    
    // 필터링된 주문들
    const filteredOrders = computed(() => {
      let filtered = [...allOrders.value]
      
      // 상태 필터
      if (statusFilter.value) {
        filtered = filtered.filter(order => order.status === statusFilter.value)
      }
      
      // 테이블 필터
      if (tableFilter.value) {
        filtered = filtered.filter(order => order.tableId === parseInt(tableFilter.value))
      }
      
      // 검색
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => {
          const menuText = getOrderMenuText(order).toLowerCase()
          return menuText.includes(query) || 
                 order.id.toLowerCase().includes(query) ||
                 order.tableId.toString().includes(query)
        })
      }
      
      // 정렬
      filtered.sort((a, b) => {
        switch (sortOrder.value) {
          case 'newest':
            return b.orderTime.localeCompare(a.orderTime)
          case 'oldest':
            return a.orderTime.localeCompare(b.orderTime)
          case 'table':
            return a.tableId - b.tableId
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
      router.push('/')
    }
    
    const getOrderMenuText = (order) => {
      if (!order.items || order.items.length === 0) return '메뉴 없음'
      
      const firstItem = order.items[0]
      const firstText = `${firstItem.name}(${firstItem.quantity})`
      
      if (order.items.length === 1) {
        return firstText
      } else {
        return `${firstText} 외 ${order.items.length - 1}개`
      }
    }
    
    const getOrderTotal = (order) => {
      return order.items.reduce((sum, item) => sum + item.price, 0)
    }
    
    const getStatusText = (status) => {
      switch (status) {
        case 'cooking': return '조리 중'
        case 'completed': return '완료'
        case 'partial': return '부분 완료'
        case 'payment': return '결제완료'
        default: return '대기'
      }
    }
    
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'cooking': return 'bg-red-100 text-red-800'
        case 'completed': return 'bg-green-100 text-green-800'
        case 'partial': return 'bg-orange-100 text-orange-800'
        case 'payment': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    const goToOrderDetail = (tableId, orderId) => {
      router.push(`/order/edit/${tableId}/${orderId}`)
    }
    
    // 🎯 주문 취소 함수 - 확실하게 정의!
    const handleCancelOrder = (orderId, tableId) => {
      const confirmMsg = `주문 ${orderId}를 취소하시겠습니까?\n(취소된 주문은 복구할 수 없습니다)`
      
      if (confirm(confirmMsg)) {
        // TODO: API 연결
        // await cancelOrderAPI(orderId)
        
        console.log(`주문 ${orderId} 취소 요청`)
        alert('주문이 취소되었습니다.')
        
        // 임시: 로컬에서 주문 제거
        tableStore.deleteOrder(tableId, orderId)
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
      showAddOrderModal,
      
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
      getOrderTotal,
      getStatusText,
      getStatusBadgeClass,
      goToOrderDetail,
      handleCancelOrder  // 🎯 확실히 포함!
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