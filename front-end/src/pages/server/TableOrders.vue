<template>
    <div class="tables-container">
        <div 
            v-for="table in visibleTables" 
            :key="table.id" 
            class="table-card" 
            :class="{ 
                done: table.done,
                'all-checked': isAllItemsChecked(table) && !table.done
            }"
        >
            <div class="table-header">
                <h3>{{ table.name }}</h3>
                <span class="order-time">{{ formatTime(table.orderTime) }}</span>
            </div>
            
            <ul class="order-list">
                <li v-for="(item, index) in table.orders" :key="index">
                  <label>
                    <input 
                      type="checkbox" 
                      class="item-check" 
                      v-model="item.checked" 
                      :disabled="table.done" 
                      @change="() => handlecheckChange(table, item)" 
                    />
                    <span 
                      class="item-text" 
                      :style="{ 
                        textDecoration: item.checked || table.done ? 'line-through' : 'none', 
                        color: (item.checked || table.done) ? '#999' : 'initial' 
                      }"
                    >
                      {{ item.name }}
                    </span>
                    <span class="qty">x{{ item.qty }}</span>
                  </label>
              </li>

            </ul>
            
            <!-- 진행 상태 표시 -->
            <div class="progress-info">
                <span class="progress-text">
                    {{ getCheckedCount(table) }} / {{ table.orders.length }} 완료
                </span>
                <div class="progress-bar">
                    <div 
                        class="progress-fill" 
                        :style="{ width: getProgressPercentage(table) + '%' }"
                    ></div>
                </div>
            </div>
            
            <!-- 주문 완료 버튼 -->
            <button 
                class="complete-btn" 
                :class="{ 'ready': isAllItemsChecked(table) && !table.done }"
                :disabled="isCompleting"
                @click="handleCompleteOrder(table)"
            >
                <span v-if="isCompleting && completingTableId === table.id">
                    완료 처리 중...
                </span>
                <span v-else-if="table.done">
                    ✅ 완료됨
                </span>
                <span v-else-if="isAllItemsChecked(table)">
                    🎯 주문 완료
                </span>
                <span v-else>
                    주문 완료 ({{ getCheckedCount(table) }}/{{ table.orders.length }})
                </span>
            </button>
        </div>
        
        <!-- 완료된 주문이 없을 때 -->
        <div v-if="visibleTables.length === 0" class="empty-state">
            <h3>🎉 모든 주문이 완료되었습니다!</h3>
            <p>새로운 주문을 기다리고 있습니다.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  fetchServingList, 
  completeMenuServing, 
  completeOrderServing 
} from '@/services/api.js';

// ✅ 테이블 목록 (서빙용)
const tables = ref([]);

// ✅ 완료 처리 중 표시
const isCompleting = ref(false);
const completingTableId = ref(null);

// ✅ 완료되지 않은 테이블만 필터링
const visibleTables = computed(() => {
  return tables.value.filter(table => !table.done);
});

// ✅ 체크 여부 헬퍼
const isAllItemsChecked = (table) => {
  return table.orders.every(item => item.checked);
};

const getCheckedCount = (table) => {
  return table.orders.filter(item => item.checked).length;
};

const getProgressPercentage = (table) => {
  const total = table.orders.length;
  const checked = getCheckedCount(table);
  return total > 0 ? (checked / total) * 100 : 0;
};

const formatTime = (timeString) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

// ✅ 개별 메뉴 서빙 완료 처리
const handlecheckChange = async (table, item) => {
  if (item.checked) {
    try {
      await completeMenuServing(item.orderDetailId);
      console.log(`${item.name} 서빙 완료`);
    } catch (error) {
      console.error('개별 완료 실패:', error);
      item.checked = false;
      alert('해당 항목 완료 처리 중 오류가 발생했습니다.');
    }
  }
};

// ✅ 전체 주문 완료 처리
const handleCompleteOrder = async (table) => {
  const confirmed = confirm(`${table.name} 주문을 완료 처리하시겠습니까?`);
  if (!confirmed) return;

  isCompleting.value = true;
  completingTableId.value = table.id;

  try {
    await completeOrderServing(table.id);
    table.done = true;
    table.orders.forEach(item => (item.checked = true));
    alert(`${table.name} 주문이 완료되었습니다! 🎉`);
  } catch (error) {
    console.error('주문 완료 실패:', error);
    alert('주문 완료 처리 중 오류가 발생했습니다.');
  } finally {
    isCompleting.value = false;
    completingTableId.value = null;
  }
};

// ✅ 서버에서 서빙 항목 불러오기
const fetchServingOrders = async () => {
  try {
    const data = await fetchServingList(); // API 함수 직접 사용
    tables.value = data.map(order => ({
      id: order.order_id,
      name: `${order.table_id}번 테이블`,
      done: false,
      orderTime: order.time,
      orders: order.items.map(item => ({
        name: item.menu_name,
        qty: item.quantity,
        checked: false,
        orderDetailId: item.order_detail_id
      }))
    }));
  } catch (error) {
    console.error('서빙 항목 조회 실패:', error);
  }
};

// ✅ 마운트 시 자동 호출 + 주기적 새로고침
onMounted(() => {
  fetchServingOrders();
  setInterval(fetchServingOrders, 30000); // 30초 간격 갱신
});
</script>

<style scoped>
/* 전체 테이블 카드들을 담는 컨테이너 */
.tables-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start;
    padding: 20px;
}

/* 개별 테이블 카드 스타일 */
.table-card {
    background-color: #eef2d5;
    padding: 20px;
    width: calc((100% - 60px) / 4);
    min-width: 280px;
    border-radius: 10px;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

/* 모든 아이템이 체크된 테이블 (완료 준비) */
.table-card.all-checked {
    border: 2px solid #28a745;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

/* 완료된 테이블 카드 */
.table-card.done {
    background-color: #d4edda;
    opacity: 0.8;
}

/* 테이블 헤더 */
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.table-header h3 {
    margin: 0;
    color: #2c3e50;
}

.order-time {
    font-size: 0.9em;
    color: #666;
    background: rgba(255, 255, 255, 0.8);
    padding: 4px 8px;
    border-radius: 4px;
}

/* 주문 목록 */
.order-list {
    list-style: none;
    padding: 0;
    margin: 0 0 15px 0;
}

.order-list li {
    margin-bottom: 8px;
}

.order-list label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.order-list label:hover {
    background-color: rgba(255, 255, 255, 0.5);
}

/* 체크박스 스타일 */
.item-check {
    margin-right: 10px;
    transform: scale(1.2);
}

/* 주문 항목 텍스트 */
.item-text {
    flex-grow: 1;
    white-space: nowrap;
    font-weight: 500;
}

/* 수량 스타일 */
.qty {
    margin-left: 10px;
    font-weight: bold;
    background: rgba(52, 152, 219, 0.1);
    color: #2980b9;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.9em;
}

/* 진행 상태 표시 */
.progress-info {
    margin-bottom: 15px;
}

.progress-text {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 5px;
    display: block;
}

.progress-bar {
    background-color: #e9ecef;
    border-radius: 10px;
    height: 6px;
    overflow: hidden;
}

.progress-fill {
    background: linear-gradient(90deg, #17a2b8, #28a745);
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 10px;
}

/* 주문 완료 버튼 */
.complete-btn {
    width: 100%;
    padding: 12px;
    background-color: #6c757d;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: white;
    font-weight: 600;
    font-size: 1em;
    transition: all 0.3s ease;
}

/* 완료 준비된 버튼 */
.complete-btn.ready {
    background: linear-gradient(135deg, #28a745, #20c997);
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

/* 완료된 버튼 */
.complete-btn:disabled {
    background-color: #28a745;
    cursor: not-allowed;
    opacity: 0.8;
}

.complete-btn:hover:not(:disabled) {
    background-color: #218838;
    transform: translateY(-2px);
}

/* 빈 상태 */
.empty-state {
    width: 100%;
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-state h3 {
    margin-bottom: 10px;
    font-size: 1.5em;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
    .table-card {
        width: calc((100% - 40px) / 3);
    }
}

@media (max-width: 900px) {
    .table-card {
        width: calc((100% - 20px) / 2);
    }
}

@media (max-width: 600px) {
    .table-card {
        width: 100%;
    }
    
    .tables-container {
        padding: 10px;
    }
}
</style>