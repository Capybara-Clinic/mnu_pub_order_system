<template>
  <div class="tables-container">
    <div 
      v-for="table in tables" 
      :key="table.id" 
      class="table-card" 
      :class="{ done: table.done }"
    >
      <h3>{{ table.name }}</h3>
      <ul class="order-list">
        <li v-for="(item, index) in table.orders" :key="index">
          <label>
            <input 
              type="checkbox" 
              class="item-check" 
              v-model="item.checked" 
              :disabled="table.done" 
            />
            <span 
              class="item-text" 
              :style="{ textDecoration: item.checked || table.done ? 'line-through' : 'none', color: (item.checked || table.done) ? '#999' : 'initial' }"
            >
              {{ item.name }}
            </span>
            <span class="qty">{{ item.qty }}</span>
          </label>
        </li>
      </ul>
      <button class="complete-btn" @click="toggleDone(table)">
        주문 완료
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableOrders',
  data() {
    return {
      tables: [
        {
          id: 1,
          name: '1번 테이블',
          done: false,
          orders: [
            { name: '에그 인 헬', qty: 3, checked: false },
            { name: '콘치즈', qty: 2, checked: false },
            { name: '맥주', qty: 4, checked: false },
          ],
        },
        {
          id: 2,
          name: '2번 테이블',
          done: false,
          orders: [
            { name: '알리오 올리오', qty: 2, checked: false },
            { name: '소주', qty: 1, checked: false },
          ],
        },
        {
          id: 3,
          name: '3번 테이블',
          done: false,
          orders: [
            { name: '콘치즈', qty: 1, checked: false },
            { name: '콜라', qty: 3, checked: false },
            { name: '콜라', qty: 3, checked: false },
            { name: '콜라', qty: 3, checked: false },
          ],
        },
        {
          id: 4,
          name: '4번 테이블',
          done: false,
          orders: [
            { name: '에그 인 헬', qty: 1, checked: false },
            { name: '맥주', qty: 2, checked: false },
          ],
        },
      ],
    };
  },
  methods: {
    toggleDone(table) {
      table.done = !table.done;
      if (table.done) {
        // 완료 상태면 체크박스 모두 체크 처리
        table.orders.forEach(item => item.checked = true);
      } else {
        // 다시 취소하면 체크 해제
        table.orders.forEach(item => item.checked = false);
      }
    },
  },
};
</script>

<style scoped>
/* 여기에 앞서 주신 CSS 복사 붙여넣으면 됩니다 */
/* 예: */
.tables-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

.table-card {
  background-color: #eef2d5;
  padding: 20px;
  width: calc((100% - 60px) / 4);
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.table-card.done .complete-btn {
  background-color: #00e600;
}

.order-list label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

/* 나머지 CSS 붙여넣기 */
</style>
