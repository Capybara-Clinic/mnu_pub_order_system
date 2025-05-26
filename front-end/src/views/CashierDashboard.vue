<template>
  <div class="cashier-dashboard min-h-screen bg-gray-100 p-4">
    <!-- 헤더 -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">대시보드</h1>
    </header>
    
    <!-- 테이블 그리드 -->
    <section class="mb-8">
      <h2 class="text-lg font-bold text-gray-800 mb-4">🍽️ 테이블 현황</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
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
    <section class="grid grid-cols-2 gap-4 mb-6">
      <button 
        @click="goToInventory"
        class="bg-blue-500 text-white text-lg font-bold py-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        📦 재고 관리
      </button>
      
      <button 
        @click="goToOrders"
        class="bg-green-500 text-white text-lg font-bold py-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        📋 주문 관리
      </button>
    </section>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTableStore } from '@/stores/tableStore'
import TableCard from '@/components/TableCard.vue'

export default {
  name: 'CashierDashboard',
  
  components: {
    TableCard
  },
  
  setup() {
    // Store 사용
    const router = useRouter()
    const tableStore = useTableStore()
    
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
    
    // 🔄 새로운 테이블 정리 로직 (상태별 처리)
    const handleTableClearNew = async (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 새로운 정리 로직 시작`)
      
      try {
        // 해당 테이블의 모든 주문들 가져오기
        const tableOrders = Object.values(tableStore.orders).filter(order => order.table_id === tableId)
        
        if (tableOrders.length === 0) {
          console.log(`테이블 ${tableId}에 주문이 없습니다. 단순 정리`)
          const success = await tableStore.clearTable(tableId)
          if (success) {
            console.log(`✅ 빈 테이블 ${tableId} 정리 완료`)
          }
          return
        }
        
        // 주문들의 상태별 분류
        const pendingOrders = tableOrders.filter(order => order.order_status === '결제대기')
        const confirmedOrders = tableOrders.filter(order => order.order_status === '결제확인')  
        const completedOrders = tableOrders.filter(order => order.order_status === '완료')
        const canceledOrders = tableOrders.filter(order => order.order_status === '취소')
        const otherOrders = tableOrders.filter(order => !['결제대기', '결제확인', '완료', '취소'].includes(order.order_status))
        
        console.log(`테이블 ${tableId} 주문 상태 분석:`, {
          결제대기: pendingOrders.length,
          결제확인: confirmedOrders.length,
          완료: completedOrders.length,
          취소: canceledOrders.length,
          기타: otherOrders.length
        })
        
        // 확인 메시지 구성
        let confirmMsg = `🧹 테이블 ${tableId}번을 정리하시겠습니까?\n\n`
        
        if (pendingOrders.length > 0) {
          confirmMsg += `🔸 결제대기 ${pendingOrders.length}개 → DB에서 삭제\n`
        }
        if (confirmedOrders.length > 0) {
          confirmMsg += `🔸 결제확인 ${confirmedOrders.length}개 → 취소 처리\n`
        }
        if (completedOrders.length > 0) {
          confirmMsg += `🔸 완료 ${completedOrders.length}개 → 정상 아웃\n`
        }
        if (canceledOrders.length > 0) {
          confirmMsg += `🔸 취소 ${canceledOrders.length}개 → 이미 처리됨\n`
        }
        if (otherOrders.length > 0) {
          confirmMsg += `🔸 기타 ${otherOrders.length}개 → 취소 처리\n`
        }
        
        const totalAmount = tableOrders.reduce((sum, order) => sum + order.total_amount, 0)
        confirmMsg += `\n💰 총액: ${totalAmount.toLocaleString()}원\n\n계속하시겠습니까?`
        
        if (!confirm(confirmMsg)) {
          console.log(`테이블 ${tableId} 정리 취소됨`)
          return
        }
        
        let processedCount = 0
        let errorCount = 0
        
        // 1. 결제대기 주문들 - DB에서 완전 삭제
        for (const order of pendingOrders) {
          console.log(`🗑️ 결제대기 주문 ${order.order_id} 삭제 중...`)
          const success = await tableStore.deleteOrder(order.order_id)
          if (success) {
            processedCount++
            console.log(`✅ 주문 ${order.order_id} 삭제 완료`)
          } else {
            errorCount++
            console.error(`❌ 주문 ${order.order_id} 삭제 실패`)
          }
        }
        
        // 2. 결제확인 주문들 - 취소 처리 (DB 보존)
        for (const order of confirmedOrders) {
          console.log(`❌ 결제확인 주문 ${order.order_id} 취소 처리 중...`)
          const success = await tableStore.cancelOrder(order.order_id)
          if (success) {
            processedCount++
            console.log(`✅ 주문 ${order.order_id} 취소 완료`)
          } else {
            errorCount++
            console.error(`❌ 주문 ${order.order_id} 취소 실패`)
          }
        }
        
        // 3. 기타 주문들 - 취소 처리
        for (const order of otherOrders) {
          console.log(`❌ 기타 주문 ${order.order_id} 취소 처리 중...`)
          const success = await tableStore.cancelOrder(order.order_id)
          if (success) {
            processedCount++
            console.log(`✅ 주문 ${order.order_id} 취소 완료`)
          } else {
            errorCount++
            console.error(`❌ 주문 ${order.order_id} 취소 실패`)
          }
        }
        
        // 4. 최종 테이블 정리
        console.log(`🧹 테이블 ${tableId} 최종 정리 중...`)
        const tableSuccess = await tableStore.clearTable(tableId)
        
        if (tableSuccess) {
          console.log(`✅ 테이블 ${tableId} 정리 완료! 처리된 주문: ${processedCount}개, 오류: ${errorCount}개`)
          if (errorCount === 0) {
            alert(`테이블 ${tableId}번이 정리되었습니다.`)
          } else {
            alert(`테이블 ${tableId}번 정리 완료 (일부 오류 발생: ${errorCount}개)`)
          }
        } else {
          console.error(`❌ 테이블 ${tableId} 최종 정리 실패`)
          alert('테이블 정리 중 오류가 발생했습니다.')
        }
        
      } catch (error) {
        console.error(`❌ 테이블 ${tableId} 정리 중 예외 발생:`, error)
        alert('테이블 정리 중 오류가 발생했습니다.')
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
      // 데이터 (실시간 계산 적용)
      tables: computed(() => {
        return tableStore.tables.map(table => {
          if (!table.current_order) return table
          
          // current_order의 total_amount를 실시간 계산
          const order = tableStore.getOrderById(table.current_order.order_id)
          if (order) {
            return {
              ...table,
              current_order: {
                ...table.current_order,
                total_amount: order.total_amount
              }
            }
          }
          return table
        })
      }),
      totalRevenue: tableStore.totalRevenue,
      TABLE_COUNT: tableStore.TABLE_COUNT,
      
      // 함수들
      handleTableClick,
      handleTableClearNew, // 새로운 함수명으로 변경
      goToInventory,
      goToOrders
    }
  }
}
</script>

<style scoped>
.cashier-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}
</style>