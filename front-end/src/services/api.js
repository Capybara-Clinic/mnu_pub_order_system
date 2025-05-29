const BASE_URL = process.env.VUE_APP_API_BASE_URL;

// ✅ 공통 fetch 유틸
const jsonFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { error: text };
  }

  if (!res.ok) {
    throw new Error(data?.error || '알 수 없는 오류');
  }

  return data;
};

// ✅ 고객: 메뉴 및 미완료 주문 조회
export const fetchMenuAndOrders = (tableId) => {
  return jsonFetch(`${BASE_URL}/menu/${tableId}`);
};

// ✅ 고객: 주문 제출
export const submitOrder = ({ tableId, depositor, items }) => {
  return jsonFetch(`${BASE_URL}/order/submit`, {
    method: 'POST',
    body: JSON.stringify({ table_id: tableId, depositor, items }),
  });
};

// ✅ 캐셔: 주문 결제 확인
export const confirmOrder = (orderId) => {
  return jsonFetch(`${BASE_URL}/cashier/confirm_order`, {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
};

// ✅ 캐셔: 수동 주문 생성
export const createManualOrder = ({ tableId, depositor_name, items }) => {
  return jsonFetch(`${BASE_URL}/cashier/manual_order`, {
    method: 'POST',
    body: JSON.stringify({ table_id: tableId, depositor_name, items }),
  });
};

// ✅ 캐셔: 주문 상태 수동 변경
export const updateOrderStatus = (orderId, status) => {
  return jsonFetch(`${BASE_URL}/cashier/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ order_status: status }),
  });
};

// ✅ 캐셔: 주문 수정
export const updateOrder = ({ order_id, items }) => {
  return jsonFetch(`${BASE_URL}/cashier/order/update`, {
    method: 'PUT',
    body: JSON.stringify({ order_id, items }),
  });
};

// ✅ 캐셔: 주문 취소
export const deleteOrder = (order_id) => {
  return jsonFetch(`${BASE_URL}/cashier/order/delete`, {
    method: 'DELETE',
    body: JSON.stringify({ order_id }),
  });
};

// ✅ 캐셔: 전체 테이블 상태 조회
export const fetchAllTables = () => {
  return jsonFetch(`${BASE_URL}/cashier/tables`);
};

// ✅ 캐셔: 특정 테이블 주문 조회
export const fetchTableOrders = (tableId) => {
  return jsonFetch(`${BASE_URL}/cashier/table/${tableId}`);
};

// ✅ 캐셔: 전체 주문 목록 조회
export const fetchAllOrders = () => {
  return jsonFetch(`${BASE_URL}/cashier/ordermanagement`);
};

// ✅ 캐셔: 테이블 정리
export const resetTable = (tableId) => {
  return jsonFetch(`${BASE_URL}/cashier/tables/reset`, {
    method: 'POST',
    body: JSON.stringify({ table_id: tableId }),
  });
};

// ✅ 주방: 조리할 주문 목록
export const fetchKitchenOrders = () => {
  return jsonFetch(`${BASE_URL}/kitchen`);
};

// ✅ 서빙: 서빙할 전체 항목 목록
export const fetchServingList = () => {
  return jsonFetch(`${BASE_URL}/serving`);
};

// ✅ 서빙: 개별 메뉴 서빙 완료
export const completeMenuServing = (order_detail_id) => {
  return jsonFetch(`${BASE_URL}/serving/complete`, {
    method: 'POST',
    body: JSON.stringify({ order_detail_id }),
  });
};

// ✅ 서빙: 주문 전체 서빙 완료
export const completeOrderServing = (order_id) => {
  return jsonFetch(`${BASE_URL}/serving/completeall`, {
    method: 'POST',
    body: JSON.stringify({ order_id }),
  });
};

// ✅ 메뉴 재고 실시간 확인용 SSE (SSE는 단순 URL 문자열 반환)
export const getStockSSEUrl = (tableId) => {
  return `${BASE_URL}/menu/sse/${tableId}`;
};

// ✅ 수동 재고 조회
export const fetchMenuStocks = (tableId) => {
  return jsonFetch(`${BASE_URL}/menu/${tableId}`);
};
