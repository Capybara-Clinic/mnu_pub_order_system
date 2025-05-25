<template>
  <div class="cashier-dashboard min-h-screen bg-gray-100 p-4">
    <!-- 헤더 (단순화) -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">대시보드</h1>
    </header>
    
    <!-- 테이블 그리드 -->
    <section class="mb-8">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <TableCard 
          v-for="table in tables" 
          :key="table.id"
          :table-data="table"
          @table-clicked="handleTableClick"
          @status-updated="handleStatusUpdate"
          @table-cleared="handleTableClear"
        />
      </div>
    </section>
    
    <!-- 재고 관리 -->
    <section class="bg-white rounded-lg p-4 shadow-md mb-4">
      <h2 class="text-lg font-bold text-gray-800 mb-4">📦 재고 관리</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="item in inventory" 
          :key="item.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          :class="{ 'opacity-50 bg-red-50': !item.is_available }"
        >
          <div>
            <div class="font-medium" :class="{ 'line-through text-gray-500': !item.is_available }">
              {{ item.name }}
              <span v-if="!item.is_available" class="text-red-500 text-xs ml-2">품절</span>
            </div>
            <div class="text-sm text-gray-600">{{ item.currentStock }}{{ item.unit }}</div>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              @click="decreaseStock(item.id)"
              :disabled="!item.is_available"
              class="w-8 h-8 bg-red-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span class="w-8 text-center text-sm">{{ item.currentStock }}</span>
            <button 
              @click="increaseStock(item.id)"
              :disabled="!item.is_available"
              class="w-8 h-8 bg-green-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
            
            <!-- 🆕 품절 토글 버튼 -->
            <button 
              @click="toggleAvailability(item.id)"
              class="ml-2 px-3 py-1 text-xs rounded transition-colors"
              :class="item.is_available ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-green-500 text-white hover:bg-green-600'"
            >
              {{ item.is_available ? '품절' : '복구' }}
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 전체 주문 관리 버튼 -->
    <button 
      @click="goToOrders"
      class="w-full bg-blue-500 text-white text-lg font-bold py-4 rounded-lg"
    >
      전체 주문 관리
    </button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useTableStore } from '@/stores/tableStore'
import { useInventoryStore } from '@/stores/inventoryStore'
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
    const inventoryStore = useInventoryStore()
    
    // 직접 store의 computed 사용
    const mainMenus = inventoryStore.mainMenus
    const sideMenus = inventoryStore.sideMenus
    
    // 디버깅용 로그
    console.log('=== 재고 디버깅 ===')
    console.log('전체 재고:', inventoryStore.inventory)
    console.log('메인 메뉴:', mainMenus)
    console.log('사이드 메뉴:', sideMenus)
    console.log('==================')
    
    // 재고 부족 여부 체크
    const isLowStock = (itemId) => {
      return inventoryStore.isLowStock(itemId)
    }
    
    // 🎯 이벤트 핸들러들 - ALERT 제거하고 라우팅으로 변경!
    const handleTableClick = (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 클릭됨`)
      
      const table = tableStore.tables.find(t => t.id === tableId)
      if (table && table.status === 'empty') {
        // ✅ ALERT 대신 새 주문 페이지로 이동!
        console.log(`[Dashboard] 빈 테이블 ${tableId} - 새 주문 페이지로 이동`)
        router.push(`/order/new/${tableId}`)
      } else {
        // ✅ 활성 테이블은 상세 페이지로 이동
        console.log(`[Dashboard] 테이블 ${tableId} - 상세 페이지로 이동`)
        router.push(`/table/${tableId}`)
      }
    }
    
    const handleStatusUpdate = (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 상태 업데이트 요청`)
      tableStore.nextTableStatus(tableId)
    }
    
    const handleTableClear = (tableId) => {
      console.log(`[Dashboard] 테이블 ${tableId} 초기화 요청`)
      tableStore.clearTable(tableId)
    }
    
    const increaseStock = (itemId) => {
      inventoryStore.increaseStock(itemId)
    }
    
    const decreaseStock = (itemId) => {
      inventoryStore.decreaseStock(itemId)
    }
    
    // 🆕 품절 토글
    const toggleAvailability = (itemId) => {
      const item = inventoryStore.inventory.find(i => i.id === itemId)
      if (item) {
        const newStatus = !item.is_available
        const confirmMsg = newStatus ? 
          `${item.name}을(를) 판매 가능으로 변경하시겠습니까?` : 
          `${item.name}을(를) 품절 처리하시겠습니까?`
        
        if (confirm(confirmMsg)) {
          // TODO: API 연결
          // await toggleMenuAvailabilityAPI(itemId, newStatus)
          
          item.is_available = newStatus
          console.log(`${item.name} 판매 상태 변경: ${newStatus ? '판매 가능' : '품절'}`)
        }
      }
    }
    
    const refreshInventory = () => {
      console.log('재고 새로고침')
      // TODO: 나중에 DB에서 최신 재고 데이터 가져오기
      inventoryStore.loadMenuFromAPI()
    }
    
    const goToOrders = () => {
      router.push('/orders')
    }
    
    // 개발용 테스트 함수들
    const testNextStatus = () => {
      console.log('[테스트] 테이블 1번 상태 변경 테스트')
      tableStore.nextTableStatus(1)
    }
    
    const testClearTable = () => {
      console.log('[테스트] 테이블 2번 초기화 테스트')
      tableStore.clearTable(2)
    }
    
    return {
      // 데이터
      tables: tableStore.tables,   // 다시 기본으로
      mainMenus,
      sideMenus,
      lowStockCount: inventoryStore.lowStockCount,
      
      // 디버그용
      allInventory: inventoryStore.inventory,
      inventory: inventoryStore.inventory,
      rawMainMenus: inventoryStore.getMainMenus(),
      rawSideMenus: inventoryStore.getSideMenus(),
      
      // 메소드
      isLowStock,
      handleTableClick,
      handleStatusUpdate,
      handleTableClear,
      increaseStock,
      decreaseStock,
      toggleAvailability,  // 🆕 품절 토글
      refreshInventory,
      goToOrders,
      testNextStatus,
      testClearTable
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