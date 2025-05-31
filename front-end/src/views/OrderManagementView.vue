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

    <!-- 로딩 상태 -->
    <div v-if="loading" class="max-w-7xl mx-auto p-4">
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="text-gray-600">주문 정보를 불러오는 중...</div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="max-w-7xl mx-auto p-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="text-red-800">{{ error }}</div>
        <button 
          @click="fetchOrders" 
          class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          다시 시도
        </button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div v-else class="max-w-7xl mx-auto p-4">
      <!-- 필터 및 검색 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="flex flex-wrap gap-4 items-center">
          <!-- 상태 필터 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">상태:</label>
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
              <option v-for="i in 12" :key="i" :value="i">{{ i }}번</option>
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

          <!-- 새로고침 버튼 -->
          <button 
            @click="fetchOrders"
            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      <!-- 주문 테이블 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full table-fixed">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">주문번호</th>
                <th class="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">테이블</th>
                <th class="w-28 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">입금자명</th>
                <th class="w-32 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">주문시간</th>
                <th class="w-40 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">메뉴</th>
                <th class="w-28 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">총액</th>
                <th class="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th class="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in paginatedOrders" :key="order.order_id" class="hover:bg-gray-50">
                <!-- 주문번호 -->
                <td class="px-2 py-4 text-center text-sm font-medium text-gray-900">
                  #{{ order.order_id }}
                </td>
                
                <!-- 테이블 -->
                <td class="px-2 py-4 text-center text-sm text-gray-900">
                  {{ order.table_id }}번
                </td>
                
                <!-- 입금자명 -->
                <td class="px-2 py-4 text-center text-sm text-gray-900">
                  <div class="truncate" :title="order.depositor_name">
                    {{ order.depositor_name }}
                  </div>
                </td>
                
                <!-- 주문시간 -->
                <td class="px-2 py-4 text-center text-sm text-gray-900">
                  {{ formatTime(order.order_time) }}
                </td>
                
                <!-- 메뉴 (첫 번째 메뉴만 표시) -->
                <td class="px-2 py-4 text-center text-sm text-gray-900">
                  <div class="truncate" :title="order.menu_summary">
                    {{ getFirstMenuOnly(order.menu_summary) }}
                  </div>
                </td>
                
                <!-- 총액 -->
                <td class="px-2 py-4 text-center text-sm text-gray-900">
                  {{ order.total_amount.toLocaleString() }}원
                </td>
                
                <!-- 상태 -->
                <td class="px-2 py-4 text-center">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusBadgeClass(order.order_status)"
                  >
                    {{ getStatusText(order.order_status) }}
                  </span>
                </td>
                
                <!-- 관리 버튼들 -->
                <td class="px-2 py-4 text-center text-sm">
                  <div class="flex gap-1 justify-center">
                    <button 
                      @click="showOrderDetail(order)"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                    >
                      상세
                    </button>
                    
                    <!-- 완료 처리 버튼 (결제확인 상태일 때만) -->
                    <button 
                      v-if="order.order_status === '결제확인'"
                      @click="completeOrder(order)"
                      class="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors"
                    >
                      완료
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

        <!-- 페이지네이션 -->
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cashierAPI } from '@/api/cashierService'

export default {
  name: 'OrderManagementView',
  
  setup() {
    // ===== Composables =====
    const router = useRouter()
    
    // 페이지 제목 설정
    document.title = '전체 주문 관리 - 레스토랑 관리'
    
    // ===== Reactive State =====
    const orders = ref([])
    const loading = ref(false)
    const error = ref('')
    
    const statusFilter = ref('')
    const tableFilter = ref('')
    const sortOrder = ref('newest')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    
    // ===== API Methods =====
    
    // 주문 목록 조회
    const fetchOrders = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await cashierAPI.fetchAllOrders()
        orders.value = response.orders || []
      } catch (err) {
        error.value = '주문 정보를 불러오는데 실패했습니다: ' + err.message
        console.error('주문 조회 실패:', err)
      } finally {
        loading.value = false
      }
    }
    
    // 주문 완료
    const completeOrder = async (order) => {
      if (!confirm(`${order.depositor_name}님의 주문을 완료 처리하시겠습니까?`)) return
      
      try {
        await cashierAPI.updateOrderStatus(order.order_id, '완료')
        alert('주문이 완료 처리되었습니다!')
        await fetchOrders() // 목록 새로고침
      } catch (err) {
        alert('주문 완료 처리에 실패했습니다: ' + err.message)
        console.error('주문 완료 실패:', err)
      }
    }
    
    // ===== Computed Properties =====
    
    // 필터링된 주문들
    const filteredOrders = computed(() => {
      let filtered = [...orders.value]
      
      // 상태 필터
      if (statusFilter.value) {
        filtered = filtered.filter(order => order.order_status === statusFilter.value)
      }
      
      // 테이블 필터
      if (tableFilter.value) {
        filtered = filtered.filter(order => order.table_id === parseInt(tableFilter.value))
      }
      
      // 검색 (주문번호, 입금자명, 테이블)
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => {
          return order.order_id.toString().includes(query) ||
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
    
    // ===== Utility Methods =====
    
    const goBack = () => {
      router.push('/dashboard')
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
    
    // 첫 번째 메뉴만 표시 (목록용)
    const getFirstMenuOnly = (menuSummary) => {
      if (!menuSummary || menuSummary.trim() === '') {
        return '메뉴 정보 없음'
      }
      
      const trimmedMenu = menuSummary.trim()
      let firstMenu = ''
      let hasMultiple = false
      
      // "외 N개" 패턴 체크
      if (trimmedMenu.includes(' 외 ')) {
        const parts = trimmedMenu.split(' 외')
        const menuPart = parts[0].trim()
        const menuItems = menuPart.split(' ')
        firstMenu = menuItems[0]
        hasMultiple = true
      }
      // 공백으로 여러 메뉴가 구분된 경우
      else if (trimmedMenu.includes(' ')) {
        const menuItems = trimmedMenu.split(' ')
        firstMenu = menuItems[0]
        hasMultiple = menuItems.length > 1
      }
      // 단일 메뉴
      else {
        firstMenu = trimmedMenu
        hasMultiple = false
      }
      
      return hasMultiple ? `${firstMenu}...` : firstMenu
    }
    
    // 상태 텍스트
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
    
    // ✅ 주문 상세 정보 표시 (간결한 버전)
    const showOrderDetail = (order) => {
      try {
        console.log('🔍 주문 상세 표시:', order)
        
        // 이미 로드된 데이터에서 해당 주문 찾기
        const targetOrder = orders.value.find(o => o.order_id === order.order_id)
        
        if (!targetOrder) {
          throw new Error('주문 정보를 찾을 수 없습니다')
        }
        
        // 간결한 메뉴 목록 구성
        const menuListText = parseMenuSummarySimple(targetOrder.menu_summary || '')
        
        // 간결한 상세 정보 표시
        const detailInfo = `📋 주문 #${targetOrder.order_id}

🪑 테이블: ${targetOrder.table_id}번
👤 입금자: ${targetOrder.depositor_name}
📊 상태: ${getStatusText(targetOrder.order_status)}

🍜 주문 메뉴:
${menuListText}
💰 총액: ${targetOrder.total_amount.toLocaleString()}원`
        
        // 상세 정보 표시
        alert(detailInfo)
        
      } catch (error) {
        console.error('❌ 주문 상세 표시 실패:', error)
        
        // 간결한 fallback
        const fallbackInfo = `📋 주문 #${order.order_id}

🪑 ${order.table_id}번 테이블
👤 ${order.depositor_name}
📊 ${getStatusText(order.order_status)}

🍜 ${order.menu_summary || '메뉴 정보 없음'}
💰 ${order.total_amount.toLocaleString()}원`
        
        alert(fallbackInfo)
      }
    }
    
    // 📝 간결한 menu_summary 파싱 함수 (alert용)
    const parseMenuSummarySimple = (menuSummary) => {
      if (!menuSummary || menuSummary.trim() === '') {
        return '메뉴 정보 없음'
      }
      
      try {
        const trimmed = menuSummary.trim()
        
        // "외 N개" 부분 분리
        let mainPart = trimmed
        let extraInfo = ''
        
        if (trimmed.includes(' 외 ')) {
          const parts = trimmed.split(' 외 ')
          mainPart = parts[0].trim()
          extraInfo = parts[1].trim()
        }
        
        // 정규식으로 메뉴 추출
        const menuPattern = /(.+?)\((\d+)개\)/g
        const matches = [...mainPart.matchAll(menuPattern)]
        
        if (matches.length > 0) {
          let result = ''
          matches.forEach((match) => {
            const menuName = match[1].trim()
            const quantity = parseInt(match[2])
            result += `• ${menuName} x${quantity}\n`
          })
          
          // "외 N개" 정보 추가
          if (extraInfo) {
            const extraMatch = extraInfo.match(/(\d+)개/)
            if (extraMatch) {
              const extraCount = parseInt(extraMatch[1])
              result += `• 외 ${extraCount}개 더...\n`
            }
          }
          
          return result.trim()
        } else {
          // 파싱 실패 시 원본 표시
          return `• ${trimmed}`
        }
        
      } catch (error) {
        console.error('❌ 간단 파싱 실패:', error)
        return `• ${menuSummary}`
      }
    }
    
    // 📝 기존 상세 menu_summary 파싱 함수 (필요시 사용)
    const parseMenuSummary = (menuSummary) => {
      if (!menuSummary || menuSummary.trim() === '') {
        return '메뉴 정보가 없습니다.\n\n'
      }
      
      let result = ''
      let counter = 1
      
      try {
        const trimmed = menuSummary.trim()
        console.log('🔍 파싱 시작:', `"${trimmed}"`)
        
        // "외 N개" 부분 분리
        let mainPart = trimmed
        let extraInfo = ''
        
        if (trimmed.includes(' 외 ')) {
          const parts = trimmed.split(' 외 ')
          mainPart = parts[0].trim()
          extraInfo = parts[1].trim()
          console.log('📝 메인 부분:', `"${mainPart}"`)
          console.log('📝 외 부분:', `"${extraInfo}"`)
        }
        
        // 개선된 정규식: 메뉴명은 (숫자개) 앞의 모든 문자
        // 예: "토마토 파스타+콘치즈(1개)" → ["토마토 파스타+콘치즈", "1"]
        const menuPattern = /(.+?)\((\d+)개\)/g
        const matches = [...mainPart.matchAll(menuPattern)]
        
        console.log('🎯 매칭 결과:', matches)
        
        if (matches.length > 0) {
          // 매칭된 메뉴들 처리
          matches.forEach((match) => {
            const menuName = match[1].trim()
            const quantity = parseInt(match[2])
            
            result += `${counter}. ${menuName}\n`
            result += `   수량: ${quantity}개\n`
            result += `   (요약 정보 - 단가 정보 없음)\n\n`
            
            counter++
            console.log(`✅ 파싱 성공: ${menuName} x ${quantity}`)
          })
          
          // "외 N개" 정보 추가
          if (extraInfo) {
            const extraMatch = extraInfo.match(/(\d+)개/)
            if (extraMatch) {
              const extraCount = parseInt(extraMatch[1])
              result += `... 외 ${extraCount}개 메뉴가 더 있습니다.\n\n`
            }
          }
        } else {
          // 정규식 매칭 실패 시 fallback
          console.warn('⚠️ 정규식 매칭 실패, 원본 표시')
          result = `메뉴 요약:\n${trimmed}\n\n(파싱 실패 - 원본 정보 표시)\n\n`
        }
        
      } catch (parseError) {
        console.error('❌ 메뉴 요약 파싱 오류:', parseError)
        result = `메뉴 요약:\n${menuSummary}\n\n(파싱 오류 - 원본 정보 표시)\n\n`
      }
      
      return result || '메뉴 정보 파싱에 실패했습니다.\n\n'
    }
    
    // ===== Lifecycle =====
    onMounted(() => {
      fetchOrders()
    })
    
    // ===== Return =====
    return {
      // State
      orders,
      loading,
      error,
      statusFilter,
      tableFilter,
      sortOrder,
      searchQuery,
      currentPage,
      
      // Computed
      filteredOrders,
      paginatedOrders,
      totalPages,
      startIndex,
      endIndex,
      
      // Methods
      fetchOrders,
      completeOrder,
      goBack,
      formatTime,
      getFirstMenuOnly,
      getStatusText,
      getStatusBadgeClass,
      showOrderDetail,
      parseMenuSummarySimple,
      parseMenuSummary
    }
  }
}
</script>

<style scoped>
/* 테이블 스타일 */
table {
  border-collapse: collapse;
}

/* 테이블 컬럼 정렬 개선 */
.table-fixed {
  table-layout: fixed;
  width: 100%;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 테이블 셀 정렬 통일 */
td {
  vertical-align: middle;
}

th {
  vertical-align: middle;
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