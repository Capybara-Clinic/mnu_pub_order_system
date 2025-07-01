<template>
  <div 
    class="table-card rounded-lg p-4 shadow-md cursor-pointer min-h-[120px] flex flex-col justify-between"
    :class="cardClass"
    @click="handleClick"
  >
    <!-- 테이블 정보 -->
    <div :class="tableData.is_occupied ? 'text-white' : 'text-gray-800'">
      <h3 class="font-bold text-lg mb-1">테이블 {{ tableData.table_id }}번</h3>
      
      <!-- 빈 테이블 -->
      <div v-if="!tableData.is_occupied" class="text-center text-gray-700 py-2">
        <span class="text-sm">빈 테이블</span>
        <div class="text-xs mt-1">클릭하여 새 주문</div>
      </div>
      
      <!-- 빈 세션 (주문이 모두 취소된 상태) -->
      <div v-else-if="tableData.current_order?.order_status === '빈세션'" class="text-center py-2">
        <span class="text-xs font-medium">빈 세션</span>
        <div class="text-xs mt-1 opacity-90">주문 추가 또는 아웃</div>
      </div>
      
      <!-- 사용 중인 테이블 -->
      <div v-else-if="tableData.current_order" class="space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium">{{ getStatusText(tableData.current_order.order_status) }}</span>
          <span class="text-xs">{{ formatTime(tableData.current_order.order_time) }}</span>
        </div>
        
        <div class="text-sm font-medium">
          {{ tableData.current_order.total_amount.toLocaleString() }}원
        </div>
      </div>
    </div>
    
    <!-- 하단 버튼 영역 (아웃 버튼만) -->
    <div v-if="tableData.is_occupied" class="mt-3 flex gap-2">
      <div class="flex-1"></div> <!-- 공간 확보용 -->
      <button 
        @click.stop="clearTable"
        class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded transition-colors z-10 relative"
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
  
  emits: ['table-clicked', 'table-cleared'],
  
  setup(props, { emit }) {
    // 카드 색상 (주문 상태별)
    const cardClass = computed(() => {
      if (!props.tableData.is_occupied) {
        return 'bg-gray-300'  // 빈 테이블
      }
      
      const status = props.tableData.current_order?.order_status
      switch (status) {
        case '결제대기': return 'bg-orange-500'    // 주황 - 결제 대기
        case '결제확인': return 'bg-blue-500'      // 파랑 - 결제 확인
        case '완료': return 'bg-green-500'         // 초록 - 완료
        case '취소': return 'bg-red-500'           // 빨강 - 취소
        case '빈세션': return 'bg-purple-500'     // 보라 - 빈 세션
        default: return 'bg-gray-500'              // 기본
      }
    })
    
    // 상태 텍스트 변환
    const getStatusText = (status) => {
      switch (status) {
        case '결제대기': return '결제 대기'
        case '결제확인': return '결제 확인'
        case '완료': return '서빙 완료'
        case '취소': return '취소됨'
        case '빈세션': return '빈 세션'
        default: return status
      }
    }
    
    // 시간 포맷팅
    const formatTime = (timeString) => {
      try {
        const date = new Date(timeString)
        return date.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } catch (error) {
        return timeString
      }
    }
    
    // 테이블 클릭 (상세 페이지로 이동)
    const handleClick = () => {
      console.log(`테이블 ${props.tableData.table_id}번 클릭됨`)
      emit('table-clicked', props.tableData.table_id)
    }
    
    // 테이블 정리 (아웃) - 확인창 제거!
    const clearTable = (event) => {
      console.log(`🎯 테이블 ${props.tableData.table_id}번 아웃 버튼 클릭됨`)
      
      // 이벤트 전파 방지
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }
      
      // 확인창 없이 바로 이벤트 발신
      console.log(`✅ 테이블 ${props.tableData.table_id}번 아웃 이벤트 발신`)
      emit('table-cleared', props.tableData.table_id)
    }
    
    return {
      cardClass,
      getStatusText,
      formatTime,
      handleClick,
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

/* 상태별 그라데이션 */
.table-card.bg-gray-300 {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  color: #374151;
}

.table-card.bg-orange-500 {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.table-card.bg-blue-500 {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.table-card.bg-green-500 {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.table-card.bg-red-500 {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.table-card.bg-purple-500 {
  background: linear-gradient(135deg, #a855f7, #9333ea);
}

.table-card.bg-gray-500 {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

/* 아웃 버튼 스타일 강화 */
button {
  pointer-events: auto;
  touch-action: manipulation;
}

button:active {
  transform: scale(0.95);
}
</style>