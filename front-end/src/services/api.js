// src/services/api.js
import apiClient from './apiClient.js';

// ==============================================
// 🎭 가라데이터 정의
// ==============================================
const mockData = {
    // 서빙 주문 가라데이터
    servingOrders: {
        orders: [
            {
                order_id: 10,
                table_id: 1,
                time: "2025-05-28T14:30:00Z",
                items: [
                    { menu_name: "감바스", quantity: 2, option: "기본" },
                    { menu_name: "파스타", quantity: 1, option: "매운맛" },
                    { menu_name: "맥주", quantity: 3, option: "차가운" }
                ]
            },
            {
                order_id: 11,
                table_id: 3,
                time: "2025-05-28T14:32:00Z",
                items: [
                    { menu_name: "스테이크", quantity: 1, option: "미디엄" },
                    { menu_name: "샐러드", quantity: 2, option: "기본" },
                    { menu_name: "와인", quantity: 1, option: "레드" }
                ]
            },
            {
                order_id: 12,
                table_id: 2,
                time: "2025-05-28T14:25:00Z",
                items: [
                    { menu_name: "피자", quantity: 1, option: "페퍼로니" },
                    { menu_name: "콜라", quantity: 2, option: "기본" }
                ]
            },
            {
                order_id: 13,
                table_id: 4,
                time: "2025-05-28T14:35:00Z",
                items: [
                    { menu_name: "치킨", quantity: 2, option: "양념" },
                    { menu_name: "소주", quantity: 1, option: "차가운" }
                ]
            }
        ]
    },

    // 주방 주문 가라데이터 (음식만)
    kitchenOrders: {
        orders: [
            {
                order_id: 14,
                table_id: 5,
                time: "2025-05-28T14:40:00Z",
                items: [
                    { menu_name: "김치찌개", quantity: 2, option: "매운맛" },
                    { menu_name: "계란말이", quantity: 1, option: "기본" }
                ]
            },
            {
                order_id: 15,
                table_id: 6,
                time: "2025-05-28T14:42:00Z",
                items: [
                    { menu_name: "된장찌개", quantity: 1, option: "순한맛" },
                    { menu_name: "불고기", quantity: 2, option: "기본" }
                ]
            }
        ]
    },

    // 메뉴 가라데이터
    menus: [
        { id: 1, name: "감바스", category: "요리", price: 15000, available: true },
        { id: 2, name: "파스타", category: "요리", price: 12000, available: true },
        { id: 3, name: "스테이크", category: "요리", price: 25000, available: true },
        { id: 4, name: "피자", category: "요리", price: 18000, available: true },
        { id: 5, name: "맥주", category: "주류", price: 4000, available: true },
        { id: 6, name: "소주", category: "주류", price: 3000, available: true },
        { id: 7, name: "와인", category: "주류", price: 8000, available: true },
        { id: 8, name: "콜라", category: "음료", price: 2000, available: true }
    ],

    // 테이블 가라데이터
    tables: [
        { id: 1, number: 1, status: "occupied", customers: 4 },
        { id: 2, number: 2, status: "occupied", customers: 2 },
        { id: 3, number: 3, status: "occupied", customers: 3 },
        { id: 4, number: 4, status: "occupied", customers: 2 },
        { id: 5, number: 5, status: "available", customers: 0 },
        { id: 6, number: 6, status: "available", customers: 0 }
    ],

    // 주문 목록 가라데이터
    orders: [
        {
            id: 1,
            table_id: 1,
            items: [
                { menu_name: "감바스", quantity: 2, price: 15000 },
                { menu_name: "맥주", quantity: 3, price: 4000 }
            ],
            total: 42000,
            status: "pending",
            created_at: "2025-05-28T14:30:00Z"
        },
        {
            id: 2,
            table_id: 2,
            items: [
                { menu_name: "파스타", quantity: 1, price: 12000 },
                { menu_name: "콜라", quantity: 2, price: 2000 }
            ],
            total: 16000,
            status: "completed",
            created_at: "2025-05-28T14:25:00Z"
        }
    ],

    // 재고 가라데이터
    inventory: [
        { id: 1, name: "새우", quantity: 50, unit: "개", min_quantity: 10 },
        { id: 2, name: "파스타면", quantity: 20, unit: "포", min_quantity: 5 },
        { id: 3, name: "소고기", quantity: 5, unit: "kg", min_quantity: 2 },
        { id: 4, name: "맥주", quantity: 100, unit: "병", min_quantity: 20 }
    ]
};

// ==============================================
// 🎭 Mock Fallback 유틸리티
// ==============================================

// 환경변수로 Mock 모드 제어
const FORCE_MOCK_MODE = process.env.VUE_APP_FORCE_MOCK === 'true';
const SHOW_MOCK_ALERTS = process.env.VUE_APP_SHOW_MOCK_ALERTS !== 'false';

/**
 * Mock 모드 알림 (개발 중에만)
 */
const showMockAlert = (message) => {
    if (SHOW_MOCK_ALERTS && process.env.NODE_ENV === 'development') {
        console.warn(`🎭 [MOCK MODE] ${message}`);
    }
};

/**
 * API 호출 + Mock Fallback 함수
 * @param {Function} apiCall - 실제 API 호출 함수
 * @param {any} mockResponse - 서버 실패 시 사용할 가라데이터
 * @param {string} apiName - API 이름 (로깅용)
 */
const callApiWithMockFallback = async (apiCall, mockResponse, apiName = 'API') => {
    // 강제 Mock 모드인 경우
    if (FORCE_MOCK_MODE) {
        showMockAlert(`${apiName} - 강제 Mock 모드 사용`);
        await new Promise(resolve => setTimeout(resolve, 300)); // 실제 API 응답 시뮬레이션
        return { data: mockResponse };
    }

    try {
        // 실제 API 호출 시도
        const response = await apiCall();
        console.log(`✅ [REAL API] ${apiName} 성공`);
        return response;
    } catch (error) {
        console.error(`❌ [API ERROR] ${apiName} 실패:`, error.message);
        
        // 네트워크 에러 또는 서버 에러인 경우 Mock 데이터 사용
        if (!error.response || error.response.status >= 500 || error.code === 'NETWORK_ERROR') {
            showMockAlert(`${apiName} - 서버 응답 실패로 Mock 데이터 사용`);
            return { data: mockResponse };
        }
        
        // 다른 에러 (401, 404 등)는 그대로 throw
        throw error;
    }
};

// ==============================================
// 공통 API 유틸리티 함수들
// ==============================================

/**
 * API 호출 시 에러를 처리하는 공통 함수 (기존 버전 - 호환성 유지)
 * @param {Function} apiCall - 실행할 API 함수
 * @param {string} errorMessage - 에러 발생 시 표시할 메시지
 */
export const handleApiCall = async (apiCall, errorMessage = 'API 호출 중 오류가 발생했습니다.') => {
    try {
        const response = await apiCall();
        return { success: true, data: response.data };
    } catch (error) {
        console.error(errorMessage, error);
        return { success: false, error: error.message || errorMessage };
    }
};

/**
 * API 호출 시 에러를 처리하는 공통 함수 (Mock Fallback 포함)
 * @param {Function} apiCall - 실행할 API 함수
 * @param {any} mockResponse - Mock 응답 데이터
 * @param {string} errorMessage - 에러 발생 시 표시할 메시지
 * @param {string} apiName - API 이름
 */
export const handleApiCallWithMock = async (apiCall, mockResponse, errorMessage = 'API 호출 중 오류가 발생했습니다.', apiName = 'API') => {
    try {
        const response = await callApiWithMockFallback(apiCall, mockResponse, apiName);
        return { success: true, data: response.data, isMock: FORCE_MOCK_MODE || !response.config };
    } catch (error) {
        console.error(errorMessage, error);
        return { success: false, error: error.message || errorMessage, isMock: false };
    }
};

/**
 * 여러 API를 동시에 호출하는 공통 함수
 * @param {Array} apiCalls - 실행할 API 함수들의 배열
 */
export const handleMultipleApiCalls = async (apiCalls) => {
    try {
        const responses = await Promise.all(apiCalls);
        return { success: true, data: responses.map(res => res.data) };
    } catch (error) {
        console.error('복수 API 호출 중 오류 발생:', error);
        return { success: false, error: error.message };
    }
};

// ==============================================
// 주문 관리 API (Mock Fallback 지원)
// ==============================================
export const orderApi = {
    // 주문 목록 조회
    getOrders: () => callApiWithMockFallback(
        () => apiClient.get('/orders'),
        mockData.orders,
        '주문 목록 조회'
    ),
    
    // 특정 테이블 주문 조회  
    getOrdersByTable: (tableId) => callApiWithMockFallback(
        () => apiClient.get(`/orders/table/${tableId}`),
        mockData.orders.filter(order => order.table_id === tableId),
        `테이블 ${tableId} 주문 조회`
    ),
    
    // 주문 상세 조회
    getOrderById: (orderId) => callApiWithMockFallback(
        () => apiClient.get(`/orders/${orderId}`),
        mockData.orders.find(order => order.id === orderId),
        `주문 ${orderId} 조회`
    ),
    
    // TODO: 새 주문 생성 API 구현 필요
    // createOrder: (orderData) => callApiWithMockFallback(
    //     () => apiClient.post('/orders', orderData),
    //     { success: true, order_id: Date.now() },
    //     '주문 생성'
    // ),
    
    // TODO: 주문 수정 API 구현 필요  
    // updateOrder: (orderId, orderData) => callApiWithMockFallback(
    //     () => apiClient.put(`/orders/${orderId}`, orderData),
    //     { success: true, message: "주문 수정됨" },
    //     '주문 수정'
    // ),
    
    // TODO: 주문 삭제 API 구현 필요
    // deleteOrder: (orderId) => callApiWithMockFallback(
    //     () => apiClient.delete(`/orders/${orderId}`),
    //     { success: true, message: "주문 삭제됨" },
    //     '주문 삭제'
    // ),
    
    // TODO: 주문 상태 변경 API 구현 필요
    // updateOrderStatus: (orderId, status) => callApiWithMockFallback(
    //     () => apiClient.patch(`/orders/${orderId}/status`, { status }),
    //     { success: true, message: "상태 변경됨" },
    //     '주문 상태 변경'
    // ),
};

// ==============================================
// 메뉴 관리 API (Mock Fallback 지원)
// ==============================================
export const menuApi = {
    // 메뉴 목록 조회
    getMenus: () => callApiWithMockFallback(
        () => apiClient.get('/menus'),
        mockData.menus,
        '메뉴 목록 조회'
    ),
    
    // 카테고리별 메뉴 조회
    getMenusByCategory: (category) => callApiWithMockFallback(
        () => apiClient.get(`/menus/category/${category}`),
        mockData.menus.filter(menu => menu.category === category),
        `${category} 메뉴 조회`
    ),
    
    // TODO: 메뉴 관련 CUD 작업 API 구현 필요
    // addMenu: (menuData) => callApiWithMockFallback(
    //     () => apiClient.post('/menus', menuData),
    //     { success: true, menu_id: Date.now() },
    //     '메뉴 추가'
    // ),
    // updateMenu: (menuId, menuData) => callApiWithMockFallback(
    //     () => apiClient.put(`/menus/${menuId}`, menuData),
    //     { success: true, message: "메뉴 수정됨" },
    //     '메뉴 수정'
    // ),
    // deleteMenu: (menuId) => callApiWithMockFallback(
    //     () => apiClient.delete(`/menus/${menuId}`),
    //     { success: true, message: "메뉴 삭제됨" },
    //     '메뉴 삭제'
    // ),
};

// ==============================================
// 테이블 관리 API (Mock Fallback 지원)
// ==============================================
export const tableApi = {
    // 테이블 목록 조회
    getTables: () => callApiWithMockFallback(
        () => apiClient.get('/tables'),
        mockData.tables,
        '테이블 목록 조회'
    ),
    
    // 특정 테이블 조회
    getTable: (tableId) => callApiWithMockFallback(
        () => apiClient.get(`/tables/${tableId}`),
        mockData.tables.find(table => table.id === tableId),
        `테이블 ${tableId} 조회`
    ),
    
    // TODO: 테이블 상태 관리 API 구현 필요
    // updateTableStatus: (tableId, status) => callApiWithMockFallback(
    //     () => apiClient.put(`/tables/${tableId}`, { status }),
    //     { success: true, message: "테이블 상태 변경됨" },
    //     '테이블 상태 변경'
    // ),
    // assignCustomers: (tableId, customerCount) => callApiWithMockFallback(
    //     () => apiClient.put(`/tables/${tableId}/customers`, { customerCount }),
    //     { success: true, message: "고객 수 설정됨" },
    //     '고객 수 설정'
    // ),
};

// ==============================================
// 재고 관리 API (Mock Fallback 지원)
// ==============================================
export const inventoryApi = {
    // 재고 목록 조회
    getInventory: () => callApiWithMockFallback(
        () => apiClient.get('/inventory'),
        mockData.inventory,
        '재고 목록 조회'
    ),
    
    // TODO: 재고 관리 API 구현 필요
    // updateInventory: (itemId, quantity) => callApiWithMockFallback(
    //     () => apiClient.put(`/inventory/${itemId}`, { quantity }),
    //     { success: true, message: "재고 업데이트됨" },
    //     '재고 업데이트'
    // ),
    // addProduct: (productData) => callApiWithMockFallback(
    //     () => apiClient.post('/inventory', productData),
    //     { success: true, product_id: Date.now() },
    //     '상품 추가'
    // ),
    // setStockAlert: (itemId, minQuantity) => callApiWithMockFallback(
    //     () => apiClient.put(`/inventory/${itemId}/alert`, { minQuantity }),
    //     { success: true, message: "재고 알림 설정됨" },
    //     '재고 알림 설정'
    // ),
};

// ==============================================
// 결제 관리 API (Mock Fallback 지원)
// ==============================================
export const paymentApi = {
    // TODO: 결제 관련 API 구현 필요
    // processPayment: (paymentData) => callApiWithMockFallback(
    //     () => apiClient.post('/payments', paymentData),
    //     { success: true, payment_id: Date.now(), amount: paymentData.amount },
    //     '결제 처리'
    // ),
    // getPaymentHistory: (tableId) => callApiWithMockFallback(
    //     () => apiClient.get(`/payments/table/${tableId}`),
    //     [],
    //     `테이블 ${tableId} 결제 내역`
    // ),
    // getReceipt: (paymentId) => callApiWithMockFallback(
    //     () => apiClient.get(`/payments/${paymentId}/receipt`),
    //     { receipt_id: paymentId, items: [], total: 0 },
    //     `영수증 ${paymentId} 조회`
    // ),
};

// ==============================================
// 주방 관리 API (Mock Fallback 지원)
// ==============================================
export const kitchenApi = {
    // 주방 대기 주문 조회 (음식만, is_served = false)
    getKitchenOrders: () => callApiWithMockFallback(
        () => apiClient.get('/kitchen'),
        mockData.kitchenOrders,
        '주방 주문 조회'
    ),
};

// ==============================================
// 서빙 관리 API (Mock Fallback 지원)
// ==============================================
export const servingApi = {
    // 서빙 대기 주문 조회 (음식 + 주류, is_served = false)
    getServingOrders: () => callApiWithMockFallback(
        () => apiClient.get('/serving'),
        mockData.servingOrders,
        '서빙 주문 조회'
    ),
    
    // 개별 아이템 서빙 완료 처리
    completeItem: (orderDetailId) => callApiWithMockFallback(
        () => apiClient.post('/serving/complete', { order_detail_id: orderDetailId }),
        { success: true, message: "아이템 완료 처리됨" },
        '아이템 완료'
    ),
    
    // 주문 전체 서빙 완료 처리
    completeOrder: (orderId) => callApiWithMockFallback(
        () => apiClient.post('/serving/completeall', { order_id: orderId }),
        { success: true, message: "주문 전체 완료 처리됨" },
        '주문 완료'
    ),
};

// ==============================================
// 통계/리포트 API (Mock Fallback 지원)
// ==============================================
export const reportApi = {
    // TODO: 리포트 관련 API 구현 필요
    // getDailySales: (date) => callApiWithMockFallback(
    //     () => apiClient.get(`/reports/sales/daily?date=${date}`),
    //     { date, sales: 150000, orders: 25 },
    //     '일일 매출 조회'
    // ),
    // getMonthlySales: (year, month) => callApiWithMockFallback(
    //     () => apiClient.get(`/reports/sales/monthly?year=${year}&month=${month}`),
    //     { year, month, sales: 4500000, orders: 750 },
    //     '월별 매출 조회'
    // ),
    // getPopularMenus: (period = '7d') => callApiWithMockFallback(
    //     () => apiClient.get(`/reports/popular-menus?period=${period}`),
    //     [
    //         { menu_name: "감바스", order_count: 45 },
    //         { menu_name: "파스타", order_count: 38 },
    //         { menu_name: "맥주", order_count: 120 }
    //     ],
    //     '인기 메뉴 조회'
    // ),
};

// ==============================================
// 가라데이터 export (개발자가 직접 접근하고 싶을 때)
// ==============================================
export { mockData };

// ==============================================
// 기본 apiClient export (직접 사용하고 싶을 때)
// ==============================================
export default apiClient;

// 더미 응답 지연을 위한 헬퍼
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ 1. 메뉴 및 주문 관련
export const fetchMenuAndOrders = async (tableId) => {
  await wait(200);
  return {tableId, // just dummy.
    "active_orders": [],
    "categories": [
        {
            "category_id": 1,
            "category_name": "세트메뉴",
            "menus": [
                {
                    "description": "세트메뉴: 토마토 파스타와 콘치즈",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 1,
                    "menu_name": "토마토 파스타+콘치즈",
                    "price": 19900,
                    "stock_quantity": 98
                },
                {
                    "description": "세트메뉴: 에그인헬과 콘치즈",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 2,
                    "menu_name": "에그인헬+콘치즈",
                    "price": 19900,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 2,
            "category_name": "메인메뉴",
            "menus": [
                {
                    "description": "신선한 토마토로 만든 파스타",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 3,
                    "menu_name": "토마토 파스타",
                    "price": 15900,
                    "stock_quantity": 99
                },
                {
                    "description": "토마토 소스와 계란 요리",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 4,
                    "menu_name": "에그인헬",
                    "price": 15900,
                    "stock_quantity": 100
                },
                {
                    "description": "올리브오일과 마늘 그리고 새우로 맛을 낸 파스타",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 5,
                    "menu_name": "알리오 올리오",
                    "price": 16900,
                    "stock_quantity": 100
                },
                {
                    "description": "올리브오일에 새우를 넣은 스페인 요리",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 6,
                    "menu_name": "감바스",
                    "price": 16900,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 3,
            "category_name": "사이드",
            "menus": [
                {
                    "description": "사이드 메뉴: 고소한 콘치즈",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 7,
                    "menu_name": "콘치즈",
                    "price": 5900,
                    "stock_quantity": 100
                },
                {
                    "description": "사이드 메뉴: 맛있는 소시지 구이",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 8,
                    "menu_name": "소시지 구이",
                    "price": 5900,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 4,
            "category_name": "주류",
            "menus": [
                {
                    "description": "소오오주우우",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 9,
                    "menu_name": "소교수",
                    "price": 5000,
                    "stock_quantity": 100
                },
                {
                    "description": "매애애주우우",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 10,
                    "menu_name": "맥교수",
                    "price": 5000,
                    "stock_quantity": 100
                },
                {
                    "description": "하아이이보오르",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 11,
                    "menu_name": "팅키윙키",
                    "price": 5000,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 5,
            "category_name": "음료",
            "menus": [
                {
                    "description": "시원한 펩시",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 12,
                    "menu_name": "펩시",
                    "price": 2000,
                    "stock_quantity": 100
                },
                {
                    "description": "상쾌한 스프라이트",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 13,
                    "menu_name": "스프라이트",
                    "price": 2000,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 6,
            "category_name": "기타",
            "menus": [
                {
                    "description": "물",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 14,
                    "menu_name": "물추가",
                    "price": 500,
                    "stock_quantity": 100
                },
                {
                    "description": "앞접시 추가",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 15,
                    "menu_name": "앞접시",
                    "price": 0,
                    "stock_quantity": 100
                },
                {
                    "description": "숟가락 추가",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 16,
                    "menu_name": "숟가락",
                    "price": 0,
                    "stock_quantity": 100
                },
                {
                    "description": "젓가락 추가",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 17,
                    "menu_name": "젓가락",
                    "price": 0,
                    "stock_quantity": 100
                }
            ]
        }
    ],
    "table_id": 1
  }
};

export const submitOrder = async ({ tableId, depositorName, phoneNumber, items }) => {
  await wait(200);
  
  // 실제 메뉴 가격 기반 계산을 위한 메뉴 데이터 (실제로는 DB에서 조회)
  const menuPrices = {
    1: 18000, // 감바스
    2: 15000, // 해물파전
    3: 12000, // 치킨윙
    4: 8000,  // 감자튀김
    5: 9000,  // 치즈볼
    6: 3000,  // 콜라
    7: 5000,  // 맥주
    8: 6000   // 아이스크림
  };
  
  const total_amount = items.reduce((acc, item) => {
    const price = menuPrices[item.menu_id] || 0;
    return acc + (item.quantity * price);
  }, 0);
  
  return {
    tableId,
    depositorName,
    phoneNumber,
    order_id: Math.floor(Math.random() * 1000) + 100, // 랜덤 주문 ID
    total_amount,
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
        created_at: "2024-01-15 14:30:00",
        items: [
          {
            menu_name: "감바스",
            quantity: 2,
            option: "기본",
            price: 18000
          },
          {
            menu_name: "콜라",
            quantity: 1,
            option: "기본",
            price: 3000
          }
        ],
        total_amount: 39000
      },
    ],
  };
};

// ✅ 3. SSE URL 반환 함수 (개발환경에서는 실제 동작하지 않음)
export const getStockSSEUrl = () => `http://localhost:8000/sse/menu/stocks`;

// ✅ 4. 메뉴 재고 정보 업데이트
export const fetchMenuStocks = async () => {
  await wait(200);
  return [
    {
      menu_id: 1,
      menu_name: "감바스",
      stock_quantity: 5,
      is_available: true,
    },
    {
      menu_id: 2,
      menu_name: "해물파전",
      stock_quantity: 3,
      is_available: true,
    },
    {
      menu_id: 3,
      menu_name: "치킨윙",
      stock_quantity: 0,
      is_available: false,
    }
  ];
};

// ✅ 5. SSE 시뮬레이션을 위한 추가 함수 (실제 환경에서는 불필요)
export const simulateStockUpdate = () => {
  // 실제 환경에서는 서버에서 SSE로 실시간 업데이트
  // 개발/테스트 환경에서만 사용
  return {
    menu_id: 1,
    stock_quantity: Math.floor(Math.random() * 10),
    is_available: Math.random() > 0.2 // 80% 확률로 available
  };
};
