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
      body: JSON.stringify({ order_status: status }),
    }),

  // ✅ 캐셔: 주문 취소
  deleteOrder: (order_id) =>
    jsonFetch(`${BASE_URL}/cashier/order/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ order_id }),
    })
}