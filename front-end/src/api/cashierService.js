// 팀원 코드 스타일에 맞춘 API 서비스
const BASE_URL = process.env.VUE_APP_API_BASE_URL

// ✅ 공통 fetch 유틸 (팀원 코드와 동일)
const jsonFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`API 요청 실패: ${url}`)
  return await res.json()
}

// 캐셔 관련 API 서비스 (일반 HTTP만 사용)
export const cashierAPI = {
  // ✅ 일반 HTTP: 전체 테이블 상태 조회 
  fetchAllTables: () => jsonFetch(`${BASE_URL}/cashier/tables`),
  
  // ✅ 캐셔a: 전체 주문 목록 조회
  fetchAllOrders: () => jsonFetch(`${BASE_URL}/cashier/ordermanagement`),
  
  // ✅ 캐셔: 특정 테이블 주문 조회
  fetchTableOrders: (tableId) => jsonFetch(`${BASE_URL}/cashier/table/${tableId}`),
  
  // ✅ 캐셔: 테이블 정리 (아웃 버튼)
  resetTable: (tableId) =>
    jsonFetch(`${BASE_URL}/cashier/tables/reset`, {
      method: 'POST',
      body: JSON.stringify({ table_id: tableId }),
    }),
  
  // ✅ 캐셔: 주문 결제 확인
  confirmOrder: (orderId) =>
    jsonFetch(`${BASE_URL}/cashier/confirm_order`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    }),

  // ✅ 캐셔: 주문 상태 수동 변경
updateOrderStatus: (orderId, status) =>
  jsonFetch(`${BASE_URL}/cashier/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_status: status }),
  }),


  // ✅ 캐셔: 주문 취소
  deleteOrder: (order_id) =>
    jsonFetch(`${BASE_URL}/cashier/order/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ order_id }),
    }),

  // ✅ 캐셔: 수동 주문 등록
  createManualOrder: (tableId, depositorName, items) =>
    jsonFetch(`${BASE_URL}/cashier/manual_order`, {
      method: 'POST',
      body: JSON.stringify({
        table_id: tableId,
        depositor_name: depositorName,
        items: items  // [{ menu_id: 1, quantity: 2 }, ...]
      }),
    }),

  updateOrder: (orderId, items) =>
  jsonFetch(`${BASE_URL}/cashier/order/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',  // ✅ 꼭 필요
    },
    body: JSON.stringify({
      order_id: orderId,
      items: items,  // ✅ [{ menu_id: 1, quantity: 2 }, ...]
    }),
  }),


  // ✅ 일반: 주문 제출 (고객용)
  submitOrder: (orderData) =>
    jsonFetch(`${BASE_URL}/order/submit`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // ✅ 테이블별 메뉴와 주문 정보 조회
  fetchTableMenu: (tableId) => jsonFetch(`${BASE_URL}/menu/${tableId}`),

  // ✅ 주문 결제 정보 조회
  getPaymentInfo: (orderId) => jsonFetch(`${BASE_URL}/order/payment_info/${orderId}`),

  // ✅ 메뉴: 전체 메뉴 재고 조회
  fetchMenuStocks: () => jsonFetch(`${BASE_URL}/menu/stocks`),

  // ✅ 메뉴: 개별 메뉴 재고 업데이트
  updateMenuStock: (menuId, stockQuantity) =>
    jsonFetch(`${BASE_URL}/menu/stock/update`, {
      method: 'POST',
      body: JSON.stringify({ 
        menu_id: menuId,
        stock_quantity: stockQuantity
      }),
    }),

  // ✅ 메뉴: 메뉴 비활성화
  disableMenu: (menuId) =>
    jsonFetch(`${BASE_URL}/menu/disable`, {
      method: 'POST',
      body: JSON.stringify({ menu_id: menuId }),
    })
}