// import axios from 'axios';

// // ✅ Vue CLI에서는 process.env 사용
// const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // 📌 1. 메뉴 및 주문 관련
// export const fetchMenuAndOrders = async (tableId) => {
//   const res = await api.get(`/menu/${tableId}`);
//   return res.data;
// };

// export const submitOrder = async ({ tableId, depositorName, items }) => {
//   const res = await api.post('/order/submit', {
//     table_id: tableId,
//     depositor_name: depositorName,
//     items,
//   });
//   return res.data;
// };

// // 📌 2. 주문 내역 조회 (옵션)
// export const fetchOrderHistoryByTable = async (tableId) => {
//   const res = await api.get(`/cashier/orders/table/${tableId}`);
//   return res.data;
// };

// // 📌 3. SSE 전용 URL 반환 함수 (브라우저에서 직접 사용)
// export const getStockSSEUrl = () => `${BASE_URL}/sse/menu/stocks`;

// // 📌 4. 메뉴 재고 정보
// export const fetchMenuStocks = async () => {
//   const res = await api.get('/menu/stocks');
//   return res.data;
// };

// export default api;
// import axios from 'axios'; // ❌ axios 제거

// axios import 제거: 실제 요청이 없으므로 불필요
// import axios from 'axios';

// 더미 응답 지연을 위한 헬퍼
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ 1. 메뉴 및 주문 관련
export const fetchMenuAndOrders = async (tableId) => {
  await wait(200);
  return {
    tableId,
    menus: [
      {
        menu_id: 1,
        menu_name: "감바스",
        price: 10000,
        stock_quantity: 5,
        description: "올리브와 새우를 볶은 메뉴",
        is_available: true,
      },
      {
        menu_id: 2,
        menu_name: "감바스",
        price: 10000,
        stock_quantity: 5,
        description: "올리브와 새우를 볶은 메뉴",
        is_available: true,
      },
      {
        menu_id: 1,
        menu_name: "감바스",
        price: 10000,
        stock_quantity: 5,
        description: "올리브와 새우를 볶은 메뉴",
        is_available: true,
      },
    ],
    order_history: [
      {
        order_id: 10,
        order_status: "결제확인",
        items: [
          {
            menu_name: "감바스",
            quantity: 2,
            option: "맵지 않게",
          },
        ],
      },
    ],
  };
};

export const submitOrder = async ({ tableId, depositorName, items }) => {
  await wait(200);
  return {
    tableId,
    depositorName, // 예금자 명
    order_id: 100,
    total_amount: items.reduce((acc, item) => acc + item.quantity * 10000, 0),
    message: "주문이 접수되었습니다.",
  };
};

// ✅ 2. 주문 내역 조회 (옵션)
export const fetchOrderHistoryByTable = async (tableId) => {
  await wait(200);
  return {
    tableId,
    orders: [
      {
        order_id: 10,
        order_status: "결제확인",
        items: [
          {
            menu_name: "감바스",
            quantity: 2,
            option: "기본",
          },
        ],
      },
    ],
  };
};

// ✅ 3. SSE URL 반환 함수 (사용하지 않음)
export const getStockSSEUrl = () => `http://localhost:8000/sse/menu/stocks`;

// ✅ 4. 메뉴 재고 정보
export const fetchMenuStocks = async () => {
  await wait(200);
  return [
    {
      menu_id: 1,
      menu_name: "감바스",
      stock_quantity: 5,
      is_available: true,
    },
  ];
};

// 기본 export는 제거
// export default api; ❌ 더 이상 필요 없음
