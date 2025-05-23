import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 📌 1. 메뉴 및 주문 관련
export const fetchMenuAndOrders = async (tableId) => {
  const res = await api.get(`/menu/${tableId}`);
  return res.data;
};

export const submitOrder = async ({ tableId, depositorName, items }) => {
  const res = await api.post('/order/submit', {
    table_id: tableId,
    depositor_name: depositorName,
    items,
  });
  return res.data;
};

// 📌 2. 주문 내역 조회 (옵션)
export const fetchOrderHistoryByTable = async (tableId) => {
  const res = await api.get(`/cashier/orders/table/${tableId}`);
  return res.data;
};

// 📌 3. SSE 전용 URL 반환 함수 (브라우저에서 직접 사용)
export const getStockSSEUrl = () => `${BASE_URL}/sse/menu/stocks`;

// 📌 4. 메뉴 재고 정보
export const fetchMenuStocks = async () => {
  const res = await api.get('/menu/stocks');
  return res.data;
};

export default api;
