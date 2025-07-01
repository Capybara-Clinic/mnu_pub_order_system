<template>
  <div class="cashier-dashboard min-h-screen bg-gray-100 flex flex-col justify-center py-8 px-6">
    <div class="max-w-7xl mx-auto w-full">
      <!-- 헤더 -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 text-center">대시보드</h1>
      </header>
      
      <!-- 테이블 그리드 -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-6">🍽️ 테이블 현황</h2>
        <div class="grid grid-cols-5 sm:grid-cols-2 gap-6">
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
      <section class="grid grid-cols-2 gap-6">
        <button 
          @click="goToInventory"
          class="bg-blue-500 text-white text-xl font-bold py-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-3 shadow-lg"
        >
          📦 재고 관리
        </button>
        
        <button 
          @click="goToOrders"
          class="bg-green-500 text-white text-xl font-bold py-6 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-3 shadow-lg"
        >
          📋 주문 관리
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTableStore } from '@/stores/tableStore'
import TableCard from '@/components/cashier/TableCard.vue'

export default {
  name: 'CashierDashboard',
  
  components: {
    TableCard
  },
  
  setup() {
    // Store 사용
    const router = useRouter()
    const tableStore = useTableStore()
    
    // 페이지 제목 설정
    document.title = '대시보드 - POS 시스템'
    
    // 🎯 이벤트 핸들러들
    const handleTableClick = (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 클릭됨`)
      
      const table = tableStore.getTableById(tableId)
      
      if (!table.is_occupied) {
        // ✅ 빈 테이블 → 새 주문 페이지로 이동
        console.log(`[Dashboard] 빈 테이블 ${tableId} - 새 주문 페이지로 이동`)
        router.push(`/order/new/${tableId}`)
      } else {
        // ✅ 사용 중인 테이블 → 상세 페이지로 이동
        console.log(`[Dashboard] 테이블 ${tableId} - 상세 페이지로 이동`)
        router.push(`/table/${tableId}`)
      }
    }
    
    // 🔄 개선된 세션 기반 테이블 정리 로직 (단일 확인창)
    const handleTableClearNew = async (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 세션 기반 정리 시작`)
      
      try {
        const table = tableStore.getTableById(tableId)
        if (!table) return
        
        // 현재 세션 정보 가져오기
        const currentSession = tableStore.getCurrentSession(tableId)
        if (!currentSession) {
          console.log(`테이블 ${tableId}에 활성 세션이 없습니다. 직접 정리`)
          // 직접 테이블 정리
          table.is_occupied = false
          table.current_session_id = null
          table.current_order = null
          console.log(`✅ 빈 테이블 ${tableId} 정리 완료`)
          return
        }
        
        // 현재 세션의 주문들만 가져오기
        const sessionOrders = tableStore.getOrdersBySession(currentSession.session_id)
        
        if (sessionOrders.length === 0) {
          console.log(`세션 ${currentSession.session_id}에 주문이 없습니다. 직접 세션 종료`)
          // 직접 세션 종료 및 테이블 정리
          const session = tableStore.sessions[currentSession.session_id]
          if (session) {
            session.is_active = false
            session.end_time = new Date().toISOString()
          }
          table.is_occupied = false
          table.current_session_id = null
          table.current_order = null
          console.log(`✅ 빈 세션 테이블 ${tableId} 정리 완료`)
          return
        }
        
        // 주문들의 상태별 분류 (현재 세션만)
        const pendingOrders = sessionOrders.filter(order => order.order_status === '결제대기')
        const confirmedOrders = sessionOrders.filter(order => order.order_status === '결제확인')  
        const completedOrders = sessionOrders.filter(order => order.order_status === '완료')
        const canceledOrders = sessionOrders.filter(order => order.order_status === '취소')
        const otherOrders = sessionOrders.filter(order => !['결제대기', '결제확인', '완료', '취소'].includes(order.order_status))
        
        console.log(`테이블 ${tableId} 현재 세션 주문 분석:`, {
          세션ID: currentSession.session_id,
          결제대기: pendingOrders.length,
          결제확인: confirmedOrders.length,
          완료: completedOrders.length,
          취소: canceledOrders.length,
          기타: otherOrders.length
        })
        
        // 📝 초간단 확인 메시지
        if (!confirm(`정말로 테이블 ${tableId}번을 아웃하시겠습니까?`)) {
          console.log(`테이블 ${tableId} 아웃 취소됨`)
          return
        }
        
        // 🚀 확인 후 직접 처리 (Store 함수 우회)
        console.log(`🔄 테이블 ${tableId} 직접 처리 시작...`)
        
        let processedCount = 0
        let errorCount = 0
        
        // 1. 결제대기 주문들 - 직접 삭제
        for (const order of pendingOrders) {
          console.log(`🗑️ 결제대기 주문 ${order.order_id} 삭제 중...`)
          try {
            delete tableStore.orders[order.order_id]
            delete tableStore.payments[order.order_id]
            processedCount++
            console.log(`✅ 주문 ${order.order_id} 삭제 완료`)
          } catch (error) {
            errorCount++
            console.error(`❌ 주문 ${order.order_id} 삭제 실패:`, error)
          }
        }
        
        // 2. 결제확인 주문들 - 직접 취소 처리
        for (const order of confirmedOrders) {
          console.log(`❌ 결제확인 주문 ${order.order_id} 취소 처리 중...`)
          try {
            const orderData = tableStore.orders[order.order_id]
            if (orderData) {
              orderData.order_status = '취소'
            }
            processedCount++
            console.log(`✅ 주문 ${order.order_id} 취소 완료`)
          } catch (error) {
            errorCount++
            console.error(`❌ 주문 ${order.order_id} 취소 실패:`, error)
          }
        }
        
        // 3. 기타 주문들 - 직접 취소 처리
        for (const order of otherOrders) {
          console.log(`❌ 기타 주문 ${order.order_id} 취소 처리 중...`)
          try {
            const orderData = tableStore.orders[order.order_id]
            if (orderData) {
              orderData.order_status = '취소'
            }
            processedCount++
            console.log(`✅ 주문 ${order.order_id} 취소 완료`)
          } catch (error) {
            errorCount++
            console.error(`❌ 주문 ${order.order_id} 취소 실패:`, error)
          }
        }
        
        // 4. 세션 직접 종료 및 테이블 정리
        console.log(`🧹 테이블 ${tableId} 세션 직접 종료 중...`)
        try {
          // 세션 종료
          const session = tableStore.sessions[currentSession.session_id]
          if (session) {
            session.is_active = false
            session.end_time = new Date().toISOString()
          }
          
          // 테이블 정리
          table.is_occupied = false
          table.current_session_id = null
          table.current_order = null
          
          
          console.log(`✅ 테이블 ${tableId} 직접 정리 완료`)
          
        } catch (error) {
          console.error(`❌ 테이블 ${tableId} 직접 정리 실패:`, error)
          errorCount++
        }
        
        // 🎉 완료 알림 (간단하게)
        console.log(`✅ 테이블 ${tableId} 정리 완료! 세션 종료됨`)
        console.log(`📊 처리 결과: 성공 ${processedCount}개, 오류 ${errorCount}개`)
        
        // 간단한 완료 메시지 (성공 시에는 알림 없음)
        if (errorCount > 0) {
          alert(`⚠️ 테이블 ${tableId}번 정리 완료\n(일부 오류: ${errorCount}개)`)
        }
        // 성공적으로 처리된 경우에는 알림 없음 (콘솔에만 기록)
        
      } catch (error) {
        console.error(`❌ 테이블 ${tableId} 정리 중 예외 발생:`, error)
        alert('❌ 테이블 정리 중 오류가 발생했습니다.')
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
      tableStore.initializeStore()
    })
    
    return {
      // 데이터 (실시간 계산 적용 + 세션 필터링)
      tables: computed(() => {
        return tableStore.tables.map(table => {
          if (!table.current_order || !table.current_session_id) return table
          
          // 현재 세션의 유효한 주문들만 필터링 (취소된 주문 제외)
          const sessionOrders = Object.values(tableStore.orders).filter(order => 
            order.table_id === table.table_id && 
            order.session_id === table.current_session_id &&
            order.order_status !== '취소'  // 취소된 주문 제외
          )
          
          if (sessionOrders.length === 0) {
            // 세션이 있지만 유효한 주문이 없으면 "빈 세션" 상태로 표시
            // (여전히 사용 중인 테이블이지만 주문이 없는 상태)
            return {
              ...table,
              is_occupied: true,  // 세션이 활성화되어 있으므로 사용 중
              current_order: {
                order_id: null,
                session_id: table.current_session_id,
                order_status: '빈세션',
                total_amount: 0,
                order_time: new Date().toISOString(),
                depositor_name: '빈 세션',
                order_number: '세션대기'
              }
            }
          }
          
          // 세션의 총액 계산 (실시간)
          const sessionTotal = sessionOrders.reduce((sum, order) => {
            const calculatedTotal = order.order_details?.reduce((detailSum, detail) => detailSum + detail.subtotal, 0) || 0
            return sum + calculatedTotal
          }, 0)
          
          // 세션의 첫 번째 유효한 주문 정보 사용 (대표 정보)
          const firstValidOrder = sessionOrders.sort((a, b) => new Date(a.order_time) - new Date(b.order_time))[0]
          
          return {
            ...table,
            current_order: {
              ...table.current_order,
              total_amount: sessionTotal,
              depositor_name: firstValidOrder ? firstValidOrder.depositor_name : table.current_order.depositor_name,
              order_time: firstValidOrder ? firstValidOrder.order_time : table.current_order.order_time
            }
          }
        })
      }),
      totalRevenue: tableStore.totalRevenue,
      occupiedTableCount: tableStore.occupiedTableCount,
      TABLE_COUNT: tableStore.TABLE_COUNT,
      
      // 함수들
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