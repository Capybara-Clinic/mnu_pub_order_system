<template>
  <div 
    class="table-card rounded-lg p-4 shadow-md cursor-pointer min-h-[120px] flex flex-col justify-between"
    :class="statusClass"
    @click="handleClick"
  >
    <!-- 테이블 정보 -->
    <div class="text-white">
      <h3 class="font-bold text-lg mb-1">{{ tableData.name }}</h3>
      <p v-if="tableData.amount > 0" class="text-sm mb-1">
        가격: {{ tableData.amount.toLocaleString() }}원
      </p>
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium">{{ tableData.statusText }}</span>
        <span v-if="tableData.status === 'ready'" class="text-sm">✓</span>
        <span v-if="tableData.orderTime" class="text-xs">⏰ {{ tableData.orderTime }}</span>
      </div>
    </div>
    
    <!-- 빈 테이블 표시 -->
    <div v-if="tableData.status === 'empty'" class="text-center text-gray-500 py-2">
      <span class="text-sm">빈 테이블</span>
    </div>
    
    <!-- 버튼들 -->
    <div v-if="tableData.status !== 'empty'" class="mt-3 flex gap-2" @click.stop>
      <button 
        @click="nextStatus" 
        class="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs py-1 rounded transition-colors"
      >
        ▶
      </button>
      <button 
        @click="clearTable"
        class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded transition-colors"
      >
        아웃
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'TableCard',
  
  props: {
    tableData: {
      type: Object,
      required: true
    }
  },
  
  emits: ['table-clicked', 'status-updated', 'table-cleared'],
  
  setup(props, { emit }) {
    // 상태별 색상 (부분완료 추가)
    const statusClass = computed(() => {
      switch (props.tableData.status) {
        case 'ready': return 'bg-green-500'      // 준비 완료
        case 'payment': return 'bg-blue-500'     // 결제 완료
        case 'cooking': return 'bg-red-500'      // 준비 중
        case 'partial': return 'bg-orange-500'   // 부분 완료
        case 'empty': return 'bg-gray-300'       // 빈 테이블
        default: return 'bg-gray-300'
      }
    })
    
    const handleClick = () => {
      console.log(`${props.tableData.name} 클릭됨`)
      emit('table-clicked', props.tableData.id)
    }
    
    const nextStatus = () => {
      console.log(`[TableCard] ${props.tableData.name} 상태 변경 요청`)
      emit('status-updated', props.tableData.id)
    }
    
    const clearTable = () => {
      console.log(`[TableCard] ${props.tableData.name} 초기화 요청`)
      if (confirm(`${props.tableData.name}을(를) 정말 초기화하시겠습니까?`)) {
        emit('table-cleared', props.tableData.id)
      }
    }
    
    return {
      statusClass,
      handleClick,
      nextStatus,
      clearTable
    }
  }
}
</script>

<style scoped>
.table-card {
  min-height: 120px;
  transition: all 0.2s ease;
}

.table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 상태별 기본 스타일 추가 */
.table-card.bg-gray-300 {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
}

.table-card.bg-green-500 {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.table-card.bg-blue-500 {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.table-card.bg-red-500 {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.table-card.bg-orange-500 {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  position: relative;
}

/* 부분 완료 특별 효과 */
.table-card.bg-orange-500::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #22c55e 0%, #22c55e 60%, #f59e0b 60%, #f59e0b 100%);
  border-radius: 0.5rem 0.5rem 0 0;
}
</style>