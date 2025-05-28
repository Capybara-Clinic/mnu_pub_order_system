<template>
  <div class="tables-container">
    <div 
      v-for="table in visibleTables" 
      :key="table.id" 
      class="table-card" 
      :class="{ done: table.done }"
    >
      <h3>{{ table.name }}</h3>
      <ul class="order-list">
        <li v-for="(item, index) in table.orders" :key="index">
          <label>
            <!-- 체크박스: 개별 아이템 상태 제어 -->
            <input 
              type="checkbox" 
              class="item-check" 
              v-model="item.checked" 
              :disabled="table.done" 
            />
            <!-- 아이템 이름: 체크되었으면 줄긋기 및 흐릿한 색 -->
            <span 
              class="item-text" 
              :style="{ 
                textDecoration: item.checked || table.done ? 'line-through' : 'none', 
                color: (item.checked || table.done) ? '#999' : 'initial' 
              }"
            >
              {{ item.name }}
            </span>
            <!-- 수량 -->
            <span class="qty">{{ item.qty }}</span>
          </label>
        </li>
      </ul>
      <!-- 주문 완료 버튼 -->
      <button class="complete-btn" @click="toggleDone(table)">
        {{ table.done ? '완료 취소' : '주문 완료' }}
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
            { name: '콜라', qty: 9, checked: false },
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
  computed: {
    // 모든 항목이 체크된 테이블은 화면에서 제외
    visibleTables() {
      return this.tables.filter(table => 
        !table.orders.every(item => item.checked)
      );
    },
  },
  methods: {
    // 주문 완료/취소 토글: 체크 상태 일괄 변경
    toggleDone(table) {
      table.done = !table.done;
      table.orders.forEach(item => {
        item.checked = table.done;
      });
    },
  },
};
</script>

<style scoped>
/* 전체 테이블 카드들을 담는 컨테이너 */
.tables-container {
  display: flex;              /* 가로로 배치 */
  flex-wrap: wrap;            /* 넘치면 줄바꿈 */
  gap: 20px;                  /* 카드 사이 간격 */
  justify-content: flex-start;
}

/* 개별 테이블 카드 스타일 */
.table-card {
  background-color: #eef2d5;  /* 연한 초록 배경 */
  padding: 20px;              /* 내부 여백 */
  width: calc((100% - 60px) / 4); /* 4개씩 배치 */
  border-radius: 10px;        /* 둥근 테두리 */
  box-sizing: border-box;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* 약간의 그림자 */
}

/* 완료된 테이블 카드: 버튼 색을 더 진한 초록색으로 */
.table-card.done .complete-btn {
  background-color: #218838;
}

/* 각 주문 항목 라벨 정렬 */
.order-list label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

/* 주문 항목 텍스트 */
.item-text {
  flex-grow: 1; /* 남은 공간 채우기 */
  white-space: nowrap;
}

/* 수량 스타일 */
.qty {
  margin-left: 10px;
  font-weight: bold;
}

/* ✅ 초록색 "주문 완료" 버튼 스타일 */
.complete-btn {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #28a745;  /* 초록색 배경 */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: white;               /* 글자 흰색으로 */
}

/* 버튼 hover 시 진한 초록색으로 변경 */
.complete-btn:hover {
  background-color: #218838;
}
</style>
