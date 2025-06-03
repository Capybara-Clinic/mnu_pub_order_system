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

    <!-- 🧪 디버깅 섹션 -->
    <div v-if="showDebugInfo" class="bg-yellow-100 border-2 border-yellow-300 p-4 mx-4 mt-4 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-yellow-800">🧪 디버깅 정보</h3>
        <button @click="showDebugInfo = false" class="text-yellow-600 hover:text-yellow-800">✕</button>
      </div>
      <div class="text-sm space-y-1">
        <div><strong>마지막 조회:</strong> {{ lastFetchTime }}</div>
        <div><strong>API 응답 주문 수:</strong> {{ debugInfo.apiOrderCount }}</div>
        <div><strong>전체 목록 주문 수:</strong> {{ debugInfo.allOrdersCount }}</div>
        <div><strong>누락된 주문:</strong> {{ debugInfo.missingOrders.length }}개</div>
        <div v-if="debugInfo.missingOrders.length > 0" class="text-red-600">
          누락: {{ debugInfo.missingOrders.map(o => `#${o.order_id}(${o.order_status})`).join(', ') }}
        </div>
        <div><strong>정렬 순서:</strong> {{ sortedOrders.map(o => `#${o.order_id}`).join(' → ') }}</div>
      </div>
      <div class="flex gap-2 mt-3">
        <button @click="compareWithAllOrders" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">
          전체 목록과 비교
        </button>
        <button @click="debugTableAPI" class="bg-purple-500 text-white px-3 py-1 rounded text-sm">
          API 직접 테스트
        </button>
      </div>
    </div>

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
        <div class="text-xs text-gray-400 mb-4">
          API 응답: {{ debugInfo.apiOrderCount }}개 주문 | 
          실제 존재: {{ debugInfo.allOrdersCount }}개 주문
          <button @click="showDebugInfo = true" class="ml-2 text-blue-500 underline">상세</button>
        </div>
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
      
      <!-- 디버깅 토글 버튼 -->
      <div class="text-center mt-2">
        <button 
          @click="showDebugInfo = !showDebugInfo"
          class="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {{ showDebugInfo ? '디버깅 숨기기' : '디버깅 정보 표시' }}
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
    
    // 디버깅 관련
    const showDebugInfo = ref(false)
    const lastFetchTime = ref('')
    const debugInfo = ref({
      apiOrderCount: 0,
      allOrdersCount: 0,
      missingOrders: []
    })
    
    // ===== Computed Properties =====
    const tableId = computed(() => parseInt(route.params.id))
    
    // 유효한 주문들 (취소 제외)
    const validOrders = computed(() => {
      if (!tableData.value || !tableData.value.orders) return []
      return tableData.value.orders.filter(order => order.order_status !== '취소')
    })
    
    // 시간순 정렬된 주문들 (최신순 - 가장 최근 주문이 상단에 표시)
    const sortedOrders = computed(() => {
      if (!tableData.value || !tableData.value.orders) return []
      
      const sorted = [...tableData.value.orders].sort((a, b) => {
        // order_time을 Date 객체로 변환
        const timeA = new Date(a.order_time)
        const timeB = new Date(b.order_time)
        
        // 디버깅 로그
        console.log(`정렬 비교: 주문 #${a.order_id}(${timeA.toLocaleString()}) vs 주문 #${b.order_id}(${timeB.toLocaleString()})`)
        
        // 최신순 정렬: 더 최근 시간(큰 값)이 앞으로 (내림차순)
        return timeB.getTime() - timeA.getTime()
      })
      
      // 정렬 결과 로그
      console.log('🔄 정렬된 주문 순서 (최신순):', sorted.map(o => `#${o.order_id}(${new Date(o.order_time).toLocaleString()})`))
      
      return sorted
    })
    
    // 총 금액 (취소된 주문 제외)
    const totalAmount = computed(() => {
      return validOrders.value.reduce((total, order) => total + order.total_amount, 0)
    })
    
    // ===== 🧪 디버깅 Methods =====
    
    // 전체 주문 목록과 비교
    const compareWithAllOrders = async () => {
      try {
        console.log('🔍 ======== 전체 주문 목록과 비교 시작 ========')
        
        // 1. 현재 테이블 API 응답
        const currentTableOrders = tableData.value?.orders || []
        console.log('📊 현재 테이블 API 응답:', currentTableOrders)
        
        // 2. 전체 주문 목록 조회
        const allOrdersResponse = await cashierAPI.fetchAllOrders()
        const allTableOrders = allOrdersResponse.orders.filter(o => o.table_id === tableId.value)
        console.log('📊 전체 목록에서 해당 테이블 주문들:', allTableOrders)
        
        // 3. 비교 분석
        const apiOrderIds = currentTableOrders.map(o => o.order_id)
        const allOrderIds = allTableOrders.map(o => o.order_id)
        
        const missingInAPI = allTableOrders.filter(o => !apiOrderIds.includes(o.order_id))
        const onlyInAPI = currentTableOrders.filter(o => !allOrderIds.includes(o.order_id))
        
        console.log('🔍 비교 결과:')
        console.log(`  - 테이블 API 주문 수: ${currentTableOrders.length}`)
        console.log(`  - 전체 목록 주문 수: ${allTableOrders.length}`)
        console.log(`  - API에서 누락된 주문: ${missingInAPI.length}개`, missingInAPI)
        console.log(`  - API에만 있는 주문: ${onlyInAPI.length}개`, onlyInAPI)
        
        // 4. 디버깅 정보 업데이트
        debugInfo.value = {
          apiOrderCount: currentTableOrders.length,
          allOrdersCount: allTableOrders.length,
          missingOrders: missingInAPI
        }
        
        // 5. Alert로 요약 표시
        const alertMsg = `📊 비교 결과:

테이블 API: ${currentTableOrders.length}개 주문
전체 목록: ${allTableOrders.length}개 주문
누락된 주문: ${missingInAPI.length}개

${missingInAPI.length > 0 ? 
  '❌ 누락된 주문들:\n' + missingInAPI.map(o => `#${o.order_id} (${o.order_status}, ${o.order_time})`).join('\n') :
  '✅ 모든 주문이 정상 조회됨'
}

자세한 로그는 브라우저 콘솔에서 확인하세요.`
        
        alert(alertMsg)
        
      } catch (error) {
        console.error('❌ 비교 중 오류:', error)
        alert(`❌ 비교 중 오류: ${error.message}`)
      }
    }
    
    // API 직접 테스트
    const debugTableAPI = async () => {
      try {
        console.log('🧪 ======== 테이블 API 직접 테스트 ========')
        
        // 1. 직접 fetch로 API 호출
        const url = `${process.env.VUE_APP_API_BASE_URL}/cashier/table/${tableId.value}`
        console.log('📡 API URL:', url)
        
        const response = await fetch(url)
        console.log('📡 Response Status:', response.status, response.statusText)
        
        const data = await response.json()
        console.log('📡 Response Data:', data)
        
        // 2. cashierAPI로 호출과 비교
        const apiResponse = await cashierAPI.fetchTableOrders(tableId.value)
        console.log('📡 CashierAPI Response:', apiResponse)
        
        // 3. 결과 비교
        const directOrders = data.orders || []
        const apiOrders = apiResponse.orders || []
        
        console.log('🔍 비교:')
        console.log(`  - 직접 fetch: ${directOrders.length}개`)
        console.log(`  - cashierAPI: ${apiOrders.length}개`)
        
        const alertMsg = `🧪 API 테스트 결과:

URL: ${url}
상태: ${response.status} ${response.statusText}
직접 fetch: ${directOrders.length}개 주문
cashierAPI: ${apiOrders.length}개 주문

${directOrders.length === apiOrders.length ? '✅ 일치' : '❌ 불일치'}

자세한 로그는 브라우저 콘솔에서 확인하세요.`
        
        alert(alertMsg)
        
      } catch (error) {
        console.error('❌ API 테스트 중 오류:', error)
        alert(`❌ API 테스트 중 오류: ${error.message}`)
      }
    }
    
    // ===== API Methods =====
    
    // 테이블 주문 데이터 조회 (서버 응답 완전 디버깅)
    const fetchTableData = async () => {
      try {
        loading.value = true
        error.value = ''
        loadingMessage.value = `테이블 ${tableId.value} 주문 정보 조회 중...`
        
        console.log('🔍 ======== fetchTableData 시작 ========')
        console.log(`🎯 테이블 ID: ${tableId.value}`)
        
        // API 호출 전 시간 기록
        const startTime = new Date()
        console.log('📅 API 호출 시작:', startTime.toLocaleString())
        
        // ===== 🔍 서버 응답 완전 분석 =====
        
        // 1. 직접 fetch로 원본 응답 확인
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/cashier/table/${tableId.value}`
        console.log('🌐 API URL:', apiUrl)
        
        console.log('📡 [1단계] 직접 fetch 호출...')
        const rawResponse = await fetch(apiUrl)
        console.log('📊 HTTP 상태:', rawResponse.status, rawResponse.statusText)
        console.log('📋 응답 헤더:', Object.fromEntries(rawResponse.headers.entries()))
        
        const rawText = await rawResponse.text()
        console.log('📄 원본 응답 텍스트:')
        console.log(rawText)
        
        let rawData = null
        try {
          rawData = JSON.parse(rawText)
          console.log('✅ JSON 파싱 성공')
        } catch (parseError) {
          console.error('❌ JSON 파싱 실패:', parseError)
          throw new Error('서버 응답을 파싱할 수 없습니다')
        }
        
        console.log('🗂️ [직접 fetch] 파싱된 데이터:')
        console.log(JSON.stringify(rawData, null, 2))
        console.log(`📊 [직접 fetch] 주문 수: ${rawData.orders?.length || 0}개`)
        
        if (rawData.orders && rawData.orders.length > 0) {
          console.log('📋 [직접 fetch] 주문 상세:')
          console.table(rawData.orders.map(order => ({
            주문ID: order.order_id,
            상태: order.order_status,
            입금자: order.depositor_name,
            금액: order.total_amount,
            시간: order.order_time,
            메뉴수: order.details?.length || 0
          })))
        }
        
        // 2. cashierAPI로 호출해서 비교
        console.log('📡 [2단계] cashierAPI 호출...')
        const response = await cashierAPI.fetchTableOrders(tableId.value)
        
        console.log('🗂️ [cashierAPI] 응답 데이터:')
        console.log(JSON.stringify(response, null, 2))
        console.log(`📊 [cashierAPI] 주문 수: ${response.orders?.length || 0}개`)
        
        if (response.orders && response.orders.length > 0) {
          console.log('📋 [cashierAPI] 주문 상세:')
          console.table(response.orders.map(order => ({
            주문ID: order.order_id,
            상태: order.order_status,
            입금자: order.depositor_name,
            금액: order.total_amount,
            시간: order.order_time,
            메뉴수: order.details?.length || 0
          })))
        }
        
        // 3. 두 응답 비교
        const rawOrderCount = rawData.orders?.length || 0
        const apiOrderCount = response.orders?.length || 0
        
        console.log('🔍 [비교 결과]')
        console.log(`  - 직접 fetch: ${rawOrderCount}개 주문`)
        console.log(`  - cashierAPI: ${apiOrderCount}개 주문`)
        console.log(`  - 일치 여부: ${rawOrderCount === apiOrderCount ? '✅ 일치' : '❌ 불일치'}`)
        
        if (rawOrderCount !== apiOrderCount) {
          console.error('🚨 중요: 직접 fetch와 cashierAPI 응답이 다릅니다!')
          console.error('이는 cashierAPI 또는 jsonFetch 함수에 문제가 있음을 의미합니다.')
        }
        
        // 4. 주문 ID 상세 비교
        if (rawData.orders && response.orders) {
          const rawOrderIds = rawData.orders.map(o => o.order_id).sort()
          const apiOrderIds = response.orders.map(o => o.order_id).sort()
          
          console.log('🆔 주문 ID 비교:')
          console.log('  - 직접 fetch IDs:', rawOrderIds)
          console.log('  - cashierAPI IDs:', apiOrderIds)
          
          const missingInAPI = rawOrderIds.filter(id => !apiOrderIds.includes(id))
          const extraInAPI = apiOrderIds.filter(id => !rawOrderIds.includes(id))
          
          if (missingInAPI.length > 0) {
            console.error('❌ cashierAPI에서 누락된 주문 IDs:', missingInAPI)
          }
          if (extraInAPI.length > 0) {
            console.warn('⚠️ cashierAPI에만 있는 주문 IDs:', extraInAPI)
          }
        }
        
        // 5. Vue 컴포넌트에 데이터 설정
        tableData.value = response
        lastFetchTime.value = new Date().toLocaleString()
        
        // 기본 디버깅 정보 설정
        debugInfo.value = {
          apiOrderCount: response.orders?.length || 0,
          allOrdersCount: 0, // 비교 시 업데이트
          missingOrders: []
        }
        
        console.log('✅ 테이블 주문 정보 조회 성공')
        console.log('🔍 ======== fetchTableData 종료 ========')
        
        // 페이지 제목 업데이트
        document.title = `테이블 ${tableId.value}번 - 레스토랑 관리`
        
      } catch (err) {
        error.value = '테이블 정보를 불러오는데 실패했습니다: ' + err.message
        console.error('❌ 테이블 조회 실패:', err)
        console.error('❌ 오류 스택:', err.stack)
      } finally {
        loading.value = false
      }
    }
    
    // ===== Methods =====
    
    const goBack = () => {
      router.push('/dashboard')
    }
    
    const goToNewOrder = () => {
      console.log(`🆕 새 주문 페이지로 이동: 테이블 ${tableId.value}`)
      router.push(`/order/new/${tableId.value}`)
    }
    
    const goToOrderEdit = (orderId) => {
      console.log(`✏️ 주문 수정 페이지로 이동: 주문 #${orderId}`)
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
      console.log(`🔧 테이블 ${tableId.value} 상세 페이지 마운트됨`)
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
      showDebugInfo,
      lastFetchTime,
      debugInfo,
      
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
      clearTable,
      compareWithAllOrders,
      debugTableAPI
    }
  }
}
</script>

<style scoped>
.table-detail {
  padding-bottom: 120px; /* 하단 고정 버튼 공간 확보 */
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