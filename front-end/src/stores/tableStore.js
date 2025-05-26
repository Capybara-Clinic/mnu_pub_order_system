// 주문 상태 // stores/tableStore.js (DB 스키마에 맞춘 버전)
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTableStore = defineStore('table', () => {
    // 테이블 개수 설정 (10개 고정)
    const TABLE_COUNT = 10
    
    // 테이블 목록 (DB의 store_tables 테이블 기반)
    const tables = ref([
        { 
            table_id: 1, 
            is_occupied: true,
            current_order: {
                order_id: 101,
                order_status: '완료',
                total_amount: 20000, // 수정: 20000원
                order_time: '2024-01-05T19:15:00Z',
                depositor_name: '김철수',
                order_number: 'ORD001'
            }
        },
        { 
            table_id: 2, 
            is_occupied: true,
            current_order: {
                order_id: 102,
                order_status: '결제확인',
                total_amount: 39000,
                order_time: '2024-01-05T19:30:00Z',
                depositor_name: '이영희',
                order_number: 'ORD002'
            }
        },
        { 
            table_id: 3, 
            is_occupied: true,
            current_order: {
                order_id: 103,
                order_status: '결제확인',
                total_amount: 18000,
                order_time: '2024-01-05T19:25:00Z',
                depositor_name: '박민수',
                order_number: 'ORD003'
            }
        },
        { table_id: 4, is_occupied: false, current_order: null },
        { table_id: 5, is_occupied: false, current_order: null },
        { 
            table_id: 6, 
            is_occupied: true,
            current_order: {
                order_id: 104,
                order_status: '결제대기',
                total_amount: 34000,
                order_time: '2024-01-05T19:42:00Z',
                depositor_name: '최지훈',
                order_number: 'ORD004'
            }
        },
        { table_id: 7, is_occupied: false, current_order: null },
        { table_id: 8, is_occupied: false, current_order: null },
        { table_id: 9, is_occupied: false, current_order: null },
        { 
            table_id: 10, 
            is_occupied: true,
            current_order: {
                order_id: 105,
                order_status: '결제대기',
                total_amount: 8000, // 수정: 8000원
                order_time: '2024-01-05T19:35:00Z',
                depositor_name: '정수연',
                order_number: 'ORD005'
            }
        }
    ])
    
    // 주문 상세 데이터 (DB의 orders + order_details 기반)
    const orders = ref({
        101: {
            order_id: 101,
            table_id: 1,
            depositor_name: '김철수',
            total_amount: 20000, // 수정: 12000 + 8000 = 20000
            order_status: '완료',
            order_time: '2024-01-05T19:15:00Z',
            order_number: 'ORD001',
            order_details: [
                {
                    order_detail_id: 1,
                    menu_id: 1,
                    menu_name: '알리오올리오',
                    quantity: 1,
                    unit_price: 12000,
                    subtotal: 12000,
                    is_served: true
                },
                {
                    order_detail_id: 2,
                    menu_id: 5,
                    menu_name: '콘치즈',
                    quantity: 1,
                    unit_price: 8000,
                    subtotal: 8000,
                    is_served: true
                }
            ]
        },
        102: {
            order_id: 102,
            table_id: 2,
            depositor_name: '이영희',
            total_amount: 39000,
            order_status: '결제확인',
            order_time: '2024-01-05T19:30:00Z',
            order_number: 'ORD002',
            order_details: [
                {
                    order_detail_id: 3,
                    menu_id: 2,
                    menu_name: '감바스',
                    quantity: 1,
                    unit_price: 15000,
                    subtotal: 15000,
                    is_served: false
                },
                {
                    order_detail_id: 4,
                    menu_id: 7,
                    menu_name: '나쵸',
                    quantity: 2,
                    unit_price: 12000,
                    subtotal: 24000,
                    is_served: false
                }
            ]
        },
        103: {
            order_id: 103,
            table_id: 3,
            depositor_name: '박민수',
            total_amount: 18000,
            order_status: '결제확인',
            order_time: '2024-01-05T19:25:00Z',
            order_number: 'ORD003',
            order_details: [
                {
                    order_detail_id: 5,
                    menu_id: 3,
                    menu_name: '에그인더헬',
                    quantity: 1,
                    unit_price: 8000,
                    subtotal: 8000,
                    is_served: true
                },
                {
                    order_detail_id: 6,
                    menu_id: 9,
                    menu_name: '맥주',
                    quantity: 2,
                    unit_price: 5000,
                    subtotal: 10000,
                    is_served: false
                }
            ]
        },
        104: {
            order_id: 104,
            table_id: 6,
            depositor_name: '최지훈',
            total_amount: 34000,
            order_status: '결제대기',
            order_time: '2024-01-05T19:42:00Z',
            order_number: 'ORD004',
            order_details: [
                {
                    order_detail_id: 7,
                    menu_id: 1,
                    menu_name: '알리오올리오',
                    quantity: 2,
                    unit_price: 12000,
                    subtotal: 24000,
                    is_served: false
                },
                {
                    order_detail_id: 8,
                    menu_id: 9,
                    menu_name: '맥주',
                    quantity: 2,
                    unit_price: 5000,
                    subtotal: 10000,
                    is_served: false
                }
            ]
        },
        105: {
            order_id: 105,
            table_id: 10,
            depositor_name: '정수연',
            total_amount: 8000, // 수정: 8000원 (에그인더헬 1개)
            order_status: '결제대기',
            order_time: '2024-01-05T19:35:00Z',
            order_number: 'ORD005',
            order_details: [
                {
                    order_detail_id: 9,
                    menu_id: 3,
                    menu_name: '에그인더헬',
                    quantity: 1,
                    unit_price: 8000,
                    subtotal: 8000,
                    is_served: false
                }
            ]
        }
    })
    
    // 결제 정보 (DB의 payments 테이블 기반)
    const payments = ref({
        101: {
            payment_id: 201,
            order_id: 101,
            amount: 20000, // 수정: 20000원
            payment_status: '완료',
            is_verified: true,
            payment_method: '계좌이체',
            check_time: '2024-01-05T19:20:00Z'
        },
        102: {
            payment_id: 202,
            order_id: 102,
            amount: 39000,
            payment_status: '완료',
            is_verified: true,
            payment_method: '계좌이체',
            check_time: '2024-01-05T19:35:00Z'
        },
        103: {
            payment_id: 203,
            order_id: 103,
            amount: 18000,
            payment_status: '완료',
            is_verified: true,
            payment_method: '계좌이체',
            check_time: '2024-01-05T19:30:00Z'
        },
        104: {
            payment_id: 204,
            order_id: 104,
            amount: 34000,
            payment_status: '대기중',
            is_verified: false,
            payment_method: '계좌이체',
            check_time: null
        },
        105: {
            payment_id: 205,
            order_id: 105,
            amount: 8000, // 수정: 8000원
            payment_status: '대기중',
            is_verified: false,
            payment_method: '계좌이체',
            check_time: null
        }
    })
    
    // 계산된 속성 (실시간 계산)
    const occupiedTableCount = computed(() => tables.value.filter(t => t.is_occupied).length)
    const totalRevenue = computed(() => {
      // 완료된 주문들의 실시간 계산된 총액 합계
      return Object.values(orders.value)
        .filter(order => order.order_status === '완료')
        .reduce((sum, order) => {
          const calculatedTotal = order.order_details?.reduce((detailSum, detail) => detailSum + detail.subtotal, 0) || 0
          return sum + calculatedTotal
        }, 0)
    })
    
    // ===== API 연동 함수들 =====
    
    // 테이블 목록 조회 (로컬 버전)
    const fetchTables = async () => {
        console.log('✅ 테이블 목록 조회 (로컬 데이터 사용)')
        // API 호출 없이 기존 로컬 데이터 사용
    }
    
    // 주문 상세 조회 (로컬 버전)
    const fetchOrder = async (orderId) => {
        console.log(`✅ 주문 ${orderId} 조회 (로컬 데이터 사용)`)
        return orders.value[orderId] || null
    }
    
    // 새 주문 생성 (로컬 버전)
    const createOrder = async (tableId, depositorName, orderDetails) => {
        try {
            // 새 주문 ID 생성
            const newOrderId = Math.max(...Object.keys(orders.value).map(Number)) + 1
            const orderNumber = `ORD${String(newOrderId).padStart(3, '0')}`
            
            const newOrder = {
                order_id: newOrderId,
                table_id: tableId,
                depositor_name: depositorName,
                total_amount: orderDetails.reduce((sum, item) => sum + item.subtotal, 0),
                order_status: '결제대기',
                order_time: new Date().toISOString(),
                order_number: orderNumber,
                order_details: orderDetails
            }
            
            // 로컬 상태 업데이트
            orders.value[newOrderId] = newOrder
            
            // 결제 정보도 함께 생성
            payments.value[newOrderId] = {
                payment_id: Math.max(...Object.values(payments.value).map(p => p.payment_id)) + 1,
                order_id: newOrderId,
                amount: newOrder.total_amount,
                payment_status: '대기중',
                is_verified: false,
                payment_method: '계좌이체',
                check_time: null
            }
            
            // 테이블 상태 업데이트
            const table = tables.value.find(t => t.table_id === tableId)
            if (table) {
                table.is_occupied = true
                table.current_order = {
                    order_id: newOrderId,
                    order_status: '결제대기',
                    total_amount: newOrder.total_amount,
                    order_time: newOrder.order_time,
                    depositor_name: depositorName,
                    order_number: orderNumber
                }
            }
            
            console.log('✅ 새 주문 생성 성공:', newOrder)
            return newOrderId
        } catch (error) {
            console.error('❌ 새 주문 생성 실패:', error)
            alert('주문 생성에 실패했습니다.')
            return null
        }
    }
    
    // addNewOrder - createOrder의 별칭 (하위 호환성)
    const addNewOrder = async (tableId, depositorName, orderDetails) => {
        return await createOrder(tableId, depositorName, orderDetails)
    }
    
    // 주문 수정 (로컬 버전)
    const updateOrder = async (orderId, depositorName, orderDetails, orderStatus) => {
        try {
            const order = orders.value[orderId]
            if (!order) {
                console.error('수정할 주문을 찾을 수 없습니다')
                return false
            }
            
            // 총액 실시간 계산
            const calculatedTotal = orderDetails.reduce((sum, item) => sum + item.subtotal, 0)
            
            // 주문 정보 업데이트
            order.depositor_name = depositorName
            order.order_details = orderDetails
            order.total_amount = calculatedTotal
            order.order_status = orderStatus || order.order_status
            
            // 테이블의 current_order도 업데이트
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table && table.current_order) {
                table.current_order.depositor_name = depositorName
                table.current_order.total_amount = calculatedTotal
                table.current_order.order_status = order.order_status
            }
            
            // payments 테이블도 업데이트
            const payment = payments.value[orderId]
            if (payment) {
                payment.amount = calculatedTotal
            }
            
            console.log('✅ 주문 수정 성공:', order)
            return true
        } catch (error) {
            console.error('❌ 주문 수정 실패:', error)
            return false
        }
    }
    
    // 주문 상태 변경 (로컬 버전)
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // 로컬 상태 업데이트
            const order = orders.value[orderId]
            if (order) {
                order.order_status = newStatus
            }
            
            // 테이블의 current_order도 업데이트
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table && table.current_order) {
                table.current_order.order_status = newStatus
            }
            
            console.log(`✅ 주문 ${orderId} 상태 변경 성공: ${newStatus} (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 주문 ${orderId} 상태 변경 실패:`, error)
            return false
        }
    }
    
    // 메뉴 서빙 상태 변경 (로컬 버전)
    const updateMenuServedStatus = async (orderId, orderDetailId, isServed) => {
        try {
            // 로컬 상태 업데이트
            const order = orders.value[orderId]
            if (order) {
                const orderDetail = order.order_details.find(d => d.order_detail_id === orderDetailId)
                if (orderDetail) {
                    orderDetail.is_served = isServed
                }
            }
            
            console.log(`✅ 메뉴 서빙 상태 변경 성공: ${isServed ? '서빙완료' : '대기중'} (로컬)`)
            return true
        } catch (error) {
            console.error('❌ 메뉴 서빙 상태 변경 실패:', error)
            return false
        }
    }
    
    // 결제 확인 처리 (로컬 버전)
    const verifyPayment = async (orderId) => {
        try {
            const payment = payments.value[orderId]
            if (!payment) {
                alert('결제 정보를 찾을 수 없습니다.')
                return false
            }
            
            // 로컬 상태 업데이트
            payment.is_verified = true
            payment.payment_status = '완료'
            payment.check_time = new Date().toISOString()
            
            // 주문 상태도 '결제확인'으로 변경
            await updateOrderStatus(orderId, '결제확인')
            
            console.log(`✅ 결제 확인 완료: 주문 ${orderId} (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 결제 확인 실패:`, error)
            return false
        }
    }
    
    // 주문 취소 (로컬 버전)
    const cancelOrder = async (orderId) => {
        try {
            // 주문 상태를 '취소'로 변경 (DB에는 남겨둠)
            const order = orders.value[orderId]
            if (order) {
                order.order_status = '취소'
            }
            
            // 테이블에서 제거
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table) {
                table.is_occupied = false
                table.current_order = null
            }
            
            console.log(`✅ 주문 ${orderId} 취소 완료 (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 주문 ${orderId} 취소 실패:`, error)
            return false
        }
    }
    
    // 주문 삭제 (DB에서 완전 제거)
    const deleteOrder = async (orderId) => {
        try {
            // 로컬 상태에서 완전 삭제
            delete orders.value[orderId]
            delete payments.value[orderId]
            
            // 테이블에서 제거
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table) {
                table.is_occupied = false
                table.current_order = null
            }
            
            console.log(`✅ 주문 ${orderId} 삭제 완료 (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 주문 ${orderId} 삭제 실패:`, error)
            return false
        }
    }
    
    // 테이블 정리 (아웃) - 로컬 버전 (완료된 주문만)
    const clearTable = async (tableId) => {
        const table = tables.value.find(t => t.table_id === tableId)
        if (!table) return false
        
        try {
            // 테이블의 모든 완료된 주문들을 정상 아웃 처리
            const tableOrders = Object.values(orders.value).filter(order => 
                order.table_id === tableId && order.order_status === '완료'
            )
            
            // 테이블 상태 변경 (로컬)
            table.is_occupied = false
            table.current_order = null
            
            console.log(`✅ 테이블 ${tableId} 정리 완료 (로컬) - ${tableOrders.length}개 완료 주문`)
            return true
        } catch (error) {
            console.error(`❌ 테이블 ${tableId} 정리 실패:`, error)
            return false
        }
    }
    
    // ===== 조회 함수들 =====
    
    const getTableById = (tableId) => {
        return tables.value.find(t => t.table_id === tableId)
    }
    
    // 조회 함수들에 동적 계산 추가
    const getOrderById = (orderId) => {
        const order = orders.value[orderId]
        if (!order) return null
        
        // total_amount를 order_details 기반으로 실시간 계산
        const calculatedTotal = order.order_details.reduce((sum, detail) => sum + detail.subtotal, 0)
        
        return {
            ...order,
            total_amount: calculatedTotal
        }
    }
    
    const getPaymentByOrderId = (orderId) => {
        return payments.value[orderId]
    }
    
    const getOrdersByStatus = (status) => {
        return Object.values(orders.value).filter(order => order.order_status === status)
    }
    
    const getOccupiedTables = () => {
        return tables.value.filter(table => table.is_occupied)
    }
    
    const getEmptyTables = () => {
        return tables.value.filter(table => !table.is_occupied)
    }
    
    // ===== 유틸리티 함수들 =====
    
    const getStatusDisplayText = (status) => {
        switch (status) {
            case '결제대기': return '결제 대기'
            case '결제확인': return '결제 확인'
            case '완료': return '완료'
            case '취소': return '취소'
            default: return status
        }
    }
    
    const getStatusColor = (status) => {
        switch (status) {
            case '결제대기': return 'orange'
            case '결제확인': return 'blue'
            case '완료': return 'green'
            case '취소': return 'red'
            default: return 'gray'
        }
    }
    
    const calculateOrderProgress = (orderDetails) => {
        if (!orderDetails || orderDetails.length === 0) return 0
        
        const servedCount = orderDetails.filter(detail => detail.is_served).length
        return Math.round((servedCount / orderDetails.length) * 100)
    }
    
    // 초기화 (로컬 버전)
    const initializeStore = () => {
        console.log('🚀 Table Store 초기화 (로컬 모드)')
        // API 호출 없이 로컬 데이터만 사용
    }
    
    return {
        // 데이터
        tables,
        orders,
        payments,
        occupiedTableCount,
        totalRevenue,
        TABLE_COUNT,
        
        // API 함수들
        fetchTables,
        fetchOrder,
        createOrder,
        addNewOrder, // 추가된 별칭 함수
        updateOrder, // 주문 수정 함수 추가
        updateOrderStatus,
        updateMenuServedStatus,
        verifyPayment,
        cancelOrder,
        deleteOrder, // 주문 삭제 함수 추가
        clearTable,
        
        // 조회 함수들
        getTableById,
        getOrderById,
        getPaymentByOrderId,
        getOrdersByStatus,
        getOccupiedTables,
        getEmptyTables,
        
        // 유틸리티
        getStatusDisplayText,
        getStatusColor,
        calculateOrderProgress,
        initializeStore
    }
})