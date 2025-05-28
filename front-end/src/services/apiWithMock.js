import apiClient from './apiClient.js';
import { mockData } from './mockData.js';

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
        await new Promise(resolve => setTimeout(resolve, 500)); // 실제 API 응답 시뮬레이션
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

// ==============================================
// Mock Fallback이 있는 API 함수들
// ==============================================

// 🍽️ 서빙 관리 API
export const servingApi = {
    // 서빙 대기 주문 조회 (Mock Fallback 포함)
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

// 🍳 주방 관리 API
export const kitchenApi = {
    // 주방 대기 주문 조회 (Mock Fallback 포함)
    getKitchenOrders: () => callApiWithMockFallback(
        () => apiClient.get('/kitchen'),
        mockData.kitchenOrders,
        '주방 주문 조회'
    ),
};

// 📋 메뉴 관리 API
export const menuApi = {
    // 메뉴 목록 조회
    getMenus: () => callApiWithMockFallback(
        () => apiClient.get('/menus'),
        mockData.menus,
        '메뉴 조회'
    ),
    
    // 카테고리별 메뉴 조회
    getMenusByCategory: (category) => callApiWithMockFallback(
        () => apiClient.get(`/menus/category/${category}`),
        mockData.menus.filter(menu => menu.category === category),
        `${category} 메뉴 조회`
    ),
};

// 🪑 테이블 관리 API
export const tableApi = {
    // 테이블 목록 조회
    getTables: () => callApiWithMockFallback(
        () => apiClient.get('/tables'),
        mockData.tables,
        '테이블 조회'
    ),
    
    // 특정 테이블 조회
    getTable: (tableId) => callApiWithMockFallback(
        () => apiClient.get(`/tables/${tableId}`),
        mockData.tables.find(table => table.id === tableId),
        `테이블 ${tableId} 조회`
    ),
};

// 📦 주문 관리 API
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
};

// 📊 재고 관리 API
export const inventoryApi = {
    // 재고 목록 조회
    getInventory: () => callApiWithMockFallback(
        () => apiClient.get('/inventory'),
        mockData.inventory,
        '재고 조회'
    ),
};

// 💳 결제 관리 API
export const paymentApi = {
    // TODO: 결제 관련 API 구현 필요 (Mock 포함)
};

// 📈 통계/리포트 API
export const reportApi = {
    // TODO: 리포트 관련 API 구현 필요 (Mock 포함)
};

// ==============================================
// 공통 유틸리티 함수들
// ==============================================

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
// 기본 apiClient export
// ==============================================
export default apiClient;
