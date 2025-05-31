<template>
  <div class="cashier-dashboard min-h-screen bg-gray-100 flex flex-col justify-center py-6 px-4">
    <div class="max-w-7xl mx-auto w-full">
      <!-- 헤더 -->
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 text-center">대시보드</h1>
      </header>
      
      <!-- 테이블 그리드 -->
      <section class="mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">🍽️ 테이블 현황</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TableCard 
            v-for="table in tables" 
            :key="table.table_id"
            :table-data="table"
            @table-clicked="handleTableClick"
            @table-cleared="handleTableClearNew"
          />
        </div>
      </section>
      
      <!-- 관리 버튼들 -->
      <section class="grid grid-cols-2 gap-4">
        <button 
          @click="goToInventory"
          class="bg-blue-500 text-white text-xl font-bold py-5 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-3 shadow-lg"
        >
          📦 재고 관리
        </button>
        
        <button 
          @click="goToOrders"
          class="bg-green-500 text-white text-xl font-bold py-5 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-3 shadow-lg"
        >
          📋 주문 관리
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTableStore } from '@/stores/tableStore'
import TableCard from '@/components/TableCard.vue'
import { cashierAPI } from '@/api/cashierService'

export default {
  name: 'CashierDashboard',
  
  components: {
    TableCard
  },
  
  setup() {
    // Store 사용
    const router = useRouter()
    const tableStore = useTableStore()
    
    // HTTP 폴링 관련 상태
    const pollingInterval = ref(null)
    const flaskTables = ref([]) // Flask에서 받은 테이블 데이터
    const isLoading = ref(false)
    
    // 페이지 제목 설정
    document.title = '대시보드 - POS 시스템'
    
    // 🔄 HTTP GET으로 테이블 데이터 가져오기
    const fetchTablesData = async () => {
      try {
        isLoading.value = true
        console.log('🔄 HTTP GET으로 테이블 데이터 조회 중...')
        
        const tablesData = await cashierAPI.fetchAllTables()
        
        console.log('📨 테이블 데이터 수신:', tablesData)
        flaskTables.value = tablesData
        
      } catch (error) {
        console.error('❌ 테이블 데이터 조회 실패:', error)
        // 에러 발생해도 로컬 데이터는 계속 사용
      } finally {
        isLoading.value = false
      }
    }
    
    // 🔄 정기적으로 데이터 업데이트 (5초마다)
    const startPolling = () => {
      // 즉시 한 번 호출
      fetchTablesData()
      
      // 5초마다 업데이트
      const interval = setInterval(fetchTablesData, 5000)
      return interval
    }
    
    // 🔌 폴링 정리
    const stopPolling = () => {
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value)
        pollingInterval.value = null
        console.log('🔌 HTTP 폴링 정리')
      }
    }
    
    // 🎯 API 연결된 테이블 클릭 이벤트 핸들러
    const handleTableClick = async (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 클릭됨`)
      
      try {
        // Flask HTTP 데이터에서 테이블 정보 확인
        const table = flaskTables.value.find(t => t.table_id === tableId)
        
        if (!table) {
          console.error(`테이블 ${tableId} 정보를 찾을 수 없습니다`)
          alert('테이블 정보를 찾을 수 없습니다')
          return
        }

        if (!table.is_occupied) {
          // ✅ 빈 테이블 → 새 주문 페이지로 이동
          console.log(`[Dashboard] 빈 테이블 ${tableId} - 새 주문 페이지로 이동`)
          
          try {
            // 테이블 메뉴 정보 미리 확인 (선택사항)
            console.log(`🔄 테이블 ${tableId} 메뉴 정보 확인 중...`)
            const menuData = await cashierAPI.fetchTableMenu(tableId)
            console.log(`✅ 테이블 ${tableId} 메뉴 데이터:`, menuData)
            
            // 새 주문 페이지로 이동
            router.push(`/order/new/${tableId}`)
            
          } catch (error) {
            console.error(`❌ 테이블 ${tableId} 메뉴 조회 실패:`, error)
            // 에러가 있어도 페이지는 이동
            router.push(`/order/new/${tableId}`)
          }
          
        } else {
          // ✅ 사용 중인 테이블 → 상세 페이지로 이동
          console.log(`[Dashboard] 테이블 ${tableId} - 상세 페이지로 이동`)
          
          try {
            // 테이블 주문 정보 미리 조회
            console.log(`🔄 테이블 ${tableId} 주문 정보 조회 중...`)
            const orderData = await cashierAPI.fetchTableOrders(tableId)
            console.log(`✅ 테이블 ${tableId} 주문 데이터:`, orderData)
            
            // 상세 페이지로 이동 (주문 데이터를 라우터 params로 전달 가능)
            router.push(`/table/${tableId}`)
            
          } catch (error) {
            console.error(`❌ 테이블 ${tableId} 주문 조회 실패:`, error)
            // 에러가 있어도 페이지는 이동
            router.push(`/table/${tableId}`)
          }
        }
        
      } catch (error) {
        console.error(`[Dashboard] 테이블 ${tableId} 클릭 처리 실패:`, error)
        alert(`테이블 ${tableId} 처리 중 오류가 발생했습니다`)
      }
    }
    
    // 🔄 테이블 정리 (Flask API 사용)
    const handleTableClearNew = async (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 정리 시작`)
      
      try {
        // 📝 확인 메시지
        if (!confirm(`정말로 테이블 ${tableId}번을 아웃하시겠습니까?`)) {
          console.log(`테이블 ${tableId} 아웃 취소됨`)
          return
        }
        
        console.log(`🔄 Flask API로 테이블 ${tableId} 정리 요청...`)
        
        // Flask API 호출
        const result = await cashierAPI.resetTable(tableId)
        
        console.log(`✅ 테이블 ${tableId} 정리 완료:`, result)
        
        // 성공 메시지 표시 (선택사항)
        if (result.message) {
          alert(result.message)
        }
        
        // 테이블 데이터 즉시 새로고침
        await fetchTablesData()
        
      } catch (error) {
        console.error(`❌ 테이블 ${tableId} 정리 실패:`, error)
        alert(`테이블 ${tableId}번 정리에 실패했습니다: ${error.message}`)
      }
    }
    
    // 재고 관리 페이지로 이동
    const goToInventory = () => {
      router.push('/inventory')
    }
    
    const goToOrders = () => {
      router.push('/orders')
    }
    
    // 생명주기
    onMounted(() => {
      console.log('🚀 Cashier Dashboard 로드됨')
      
      // 🔌 API Base URL 확인
      console.log('🔌 API Base URL:', process.env.VUE_APP_API_BASE_URL)
      console.log('✅ API Client 설정 완료!')
      
      // Store 초기화
      tableStore.initializeStore()
      
      // HTTP 폴링 시작
      console.log('📡 HTTP 폴링 시작... (5초마다)')
      pollingInterval.value = startPolling()
    })
    
    // 컴포넌트 언마운트 시 폴링 정리
    onUnmounted(() => {
      console.log('🔌 컴포넌트 언마운트 - HTTP 폴링 정리')
      stopPolling()
    })
    
    return {
      // Flask 데이터 변환해서 기존 TableCard와 호환되게 만들기
      tables: computed(() => {
        // Flask HTTP에서 데이터가 있으면 변환해서 사용
        if (flaskTables.value && flaskTables.value.length > 0) {
          console.log('📡 Flask HTTP 데이터 사용:', flaskTables.value.length, '개 테이블')
          
          // Flask 구조 → 기존 Vue 구조로 변환
          return flaskTables.value.map(flaskTable => ({
            table_id: flaskTable.table_id,                    // 테이블 번호
            is_occupied: flaskTable.is_occupied,              // 사용 여부
            current_session_id: null,                         // 세션 ID (Flask에서 안보내줌)
            current_order: flaskTable.is_occupied ? {
              order_id: null,                                 // 주문 ID (Flask에서 안보내줌)  
              session_id: null,                               // 세션 ID (Flask에서 안보내줌)
              order_status: flaskTable.latest_order_status,   // 상태
              total_amount: flaskTable.total_amount_sum,      // 가격
              order_time: flaskTable.latest_order_time,       // 시간
              depositor_name: '고객',                         // 고객명 (Flask에서 안보내줌)
              order_number: `T${flaskTable.table_id}`         // 주문번호 (임시)
            } : null
          }))
        }
        
        // Flask 데이터가 없으면 로컬 Store 데이터 사용
        console.log('💾 로컬 Store 데이터 사용')
        return tableStore.tables
      }),
      
      // 기존 Store 통계들 (로컬 개발용)
      totalRevenue: tableStore.totalRevenue,
      occupiedTableCount: tableStore.occupiedTableCount,
      TABLE_COUNT: tableStore.TABLE_COUNT,
      
      // 로딩 상태
      isLoading,
      
      // 기존 함수들
      handleTableClick,
      handleTableClearNew,
      goToInventory,
      goToOrders
    }
  }
}
</script>

<style scoped>
/* 호버 효과 강화 */
button:hover {
  transform: translateY(-2px);
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .md\:grid-cols-5 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>