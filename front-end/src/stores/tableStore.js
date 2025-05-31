// stores/tableStore.js (세션 관리 개선 버전)
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTableStore = defineStore('table', () => {
    // 테이블 개수 설정 (12개로 변경)
    const TABLE_COUNT = 12
    
    // 테이블 목록 (12개 모두 빈 상태) - Flask 폴백용
    const tables = ref([
        { table_id: 1, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 2, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 3, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 4, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 5, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 6, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 7, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 8, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 9, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 10, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 11, is_occupied: false, current_session_id: null, current_order: null },
        { table_id: 12, is_occupied: false, current_session_id: null, current_order: null }
    ])
    
    // 주문 데이터 (빈 상태) - Flask 폴백용
    const orders = ref({
        // Flask 서버 연결 안될 때만 사용되는 빈 구조
    })
    
    // 세션 데이터 (빈 상태) - Flask 폴백용  
    const sessions = ref({
        // Flask 서버 연결 안될 때만 사용되는 빈 구조
    })
    
    // 결제 데이터 (빈 상태) - Flask 폴백용
    const payments = ref({
        // Flask 서버 연결 안될 때만 사용되는 빈 구조
    })
    
    // 계산된 속성 (Flask 우선, 로컬 폴백)
    const occupiedTableCount = computed(() => tables.value.filter(t => t.is_occupied).length)
    const totalRevenue = computed(() => {
        // Flask 데이터가 없으면 로컬 orders에서 계산 (현재는 빈 상태)
        return Object.values(orders.value)
            .filter(order => order.order_status === '완료')
            .reduce((sum, order) => {
                const calculatedTotal = order.order_details?.reduce((detailSum, detail) => detailSum + detail.subtotal, 0) || 0
                return sum + calculatedTotal
            }, 0)
    })
    
    // ===== 세션 관리 함수들 =====
    
    // 새 세션 시작
    const startNewSession = (tableId, customerCount = 1, notes = '') => {
        const table = tables.value.find(t => t.table_id === tableId)
        
        // 기존 세션이 있으면 먼저 종료
        if (table && table.current_session_id) {
            const oldSessionId = table.current_session_id
            endSession(oldSessionId)
            console.log(`🔄 기존 세션 ${oldSessionId} 종료 후 새 세션 시작`)
        }
        
        const sessionId = `session_${Date.now()}`
        const newSession = {
            session_id: sessionId,
            table_id: tableId,
            start_time: new Date().toISOString(),
            end_time: null,
            is_active: true,
            customer_count: customerCount,
            notes: notes
        }
        
        sessions.value[sessionId] = newSession
        
        // 테이블 상태 초기화
        if (table) {
            table.current_session_id = sessionId
            table.current_order = null  // 새 세션이므로 current_order 초기화
            console.log(`✅ 테이블 ${tableId}에 새 세션 시작: ${sessionId}`)
        }
        
        return sessionId
    }
    
    // 세션 종료
    const endSession = (sessionId) => {
        const session = sessions.value[sessionId]
        if (session) {
            session.is_active = false
            session.end_time = new Date().toISOString()
            
            // 해당 세션의 테이블 정리
            const table = tables.value.find(t => t.current_session_id === sessionId)
            if (table) {
                table.is_occupied = false
                table.current_session_id = null
                table.current_order = null
                console.log(`🧹 테이블 ${table.table_id} 초기화됨`)
            }
            
            console.log(`✅ 세션 ${sessionId} 종료됨`)
            return true
        }
        return false
    }
    
    // 특정 세션의 모든 주문 조회
    const getOrdersBySession = (sessionId) => {
        return Object.values(orders.value).filter(order => order.session_id === sessionId)
    }
    
    // 테이블의 현재 세션 조회
    const getCurrentSession = (tableId) => {
        const table = tables.value.find(t => t.table_id === tableId)
        if (table && table.current_session_id) {
            return sessions.value[table.current_session_id]
        }
        return null
    }
    
    // ===== 기존 함수들 (세션 지원 추가) =====
    
    // 새 주문 생성 (세션 지원)
    const createOrder = async (tableId, depositorName, orderDetails, sessionId = null) => {
        try {
            // 세션이 없으면 새로 생성
            if (!sessionId) {
                sessionId = startNewSession(tableId)
            }
            
            const newOrderId = Math.max(...Object.keys(orders.value).map(Number)) + 1
            const orderNumber = `ORD${String(newOrderId).padStart(3, '0')}`
            
            const newOrder = {
                order_id: newOrderId,
                session_id: sessionId, // 세션 ID 추가
                table_id: tableId,
                depositor_name: depositorName,
                total_amount: orderDetails.reduce((sum, item) => sum + item.subtotal, 0),
                order_status: '결제대기',
                order_time: new Date().toISOString(),
                order_number: orderNumber,
                order_details: orderDetails
            }
            
            orders.value[newOrderId] = newOrder
            
            // 결제 정보 생성
            payments.value[newOrderId] = {
                payment_id: Math.max(...Object.values(payments.value).map(p => p.payment_id)) + 1,
                order_id: newOrderId,
                session_id: sessionId, // 세션 ID 추가
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
                table.current_session_id = sessionId
                table.current_order = {
                    order_id: newOrderId,
                    session_id: sessionId, // 세션 ID 추가
                    order_status: '결제대기',
                    total_amount: newOrder.total_amount,
                    order_time: newOrder.order_time,
                    depositor_name: depositorName,
                    order_number: orderNumber
                }
            }
            
            console.log('✅ 새 주문 생성 성공 (세션 포함):', newOrder)
            return newOrderId
        } catch (error) {
            console.error('❌ 새 주문 생성 실패:', error)
            alert('주문 생성에 실패했습니다.')
            return null
        }
    }
    
    // 테이블 정리 (세션 종료 포함) - 개선된 버전
    const clearTable = async (tableId) => {
        const table = tables.value.find(t => t.table_id === tableId)
        if (!table) return false
        
        try {
            // 현재 세션 종료
            if (table.current_session_id) {
                await endSession(table.current_session_id)
            }
            
            console.log(`✅ 테이블 ${tableId} 정리 완료 (세션 종료 포함)`)
            return true
        } catch (error) {
            console.error(`❌ 테이블 ${tableId} 정리 실패:`, error)
            return false
        }
    }
    
    // ===== 기존 함수들 (유지) =====
    const fetchTables = async () => {
        console.log('✅ 테이블 목록 조회 (로컬 데이터 사용)')
    }
    
    const fetchOrder = async (orderId) => {
        console.log(`✅ 주문 ${orderId} 조회 (로컬 데이터 사용)`)
        return orders.value[orderId] || null
    }
    
    const addNewOrder = async (tableId, depositorName, orderDetails) => {
        return await createOrder(tableId, depositorName, orderDetails)
    }
    
    const updateOrder = async (orderId, depositorName, orderDetails, orderStatus) => {
        try {
            const order = orders.value[orderId]
            if (!order) {
                console.error('수정할 주문을 찾을 수 없습니다')
                return false
            }
            
            const calculatedTotal = orderDetails.reduce((sum, item) => sum + item.subtotal, 0)
            
            order.depositor_name = depositorName
            order.order_details = orderDetails
            order.total_amount = calculatedTotal
            order.order_status = orderStatus || order.order_status
            
            // 테이블의 current_order도 업데이트 (해당 주문이 current_order인 경우에만)
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table && table.current_order && table.current_order.order_id === orderId) {
                table.current_order.depositor_name = depositorName
                table.current_order.order_status = order.order_status
                // total_amount는 대시보드에서 실시간 계산되므로 여기서는 업데이트하지 않음
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
    
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const order = orders.value[orderId]
            if (order) {
                order.order_status = newStatus
            }
            
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table && table.current_order && table.current_order.order_id === orderId) {
                table.current_order.order_status = newStatus
            }
            
            console.log(`✅ 주문 ${orderId} 상태 변경 성공: ${newStatus} (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 주문 ${orderId} 상태 변경 실패:`, error)
            return false
        }
    }
    
    const updateMenuServedStatus = async (orderId, orderDetailId, isServed) => {
        try {
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
    
    const verifyPayment = async (orderId) => {
        try {
            const payment = payments.value[orderId]
            if (!payment) {
                alert('결제 정보를 찾을 수 없습니다.')
                return false
            }
            
            payment.is_verified = true
            payment.payment_status = '완료'
            payment.check_time = new Date().toISOString()
            
            await updateOrderStatus(orderId, '결제확인')
            
            console.log(`✅ 결제 확인 완료: 주문 ${orderId} (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 결제 확인 실패:`, error)
            return false
        }
    }
    
    const cancelOrder = async (orderId) => {
        try {
            const order = orders.value[orderId]
            if (order) {
                order.order_status = '취소'
            }
            
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table && table.current_order && table.current_order.order_id === orderId) {
                // current_order인 주문이 취소되면 같은 세션의 다른 주문을 current_order로 설정
                const sessionOrders = Object.values(orders.value).filter(order => 
                    order.table_id === table.table_id && 
                    order.session_id === table.current_session_id && 
                    order.order_id !== orderId &&
                    order.order_status !== '취소'
                )
                
                if (sessionOrders.length > 0) {
                    // 가장 빠른 시간의 주문을 current_order로 설정
                    const earliestOrder = sessionOrders.sort((a, b) => new Date(a.order_time) - new Date(b.order_time))[0]
                    table.current_order = {
                        order_id: earliestOrder.order_id,
                        session_id: earliestOrder.session_id,
                        order_status: earliestOrder.order_status,
                        total_amount: earliestOrder.total_amount,
                        order_time: earliestOrder.order_time,
                        depositor_name: earliestOrder.depositor_name,
                        order_number: earliestOrder.order_number
                    }
                } else {
                    // 세션에 다른 주문이 없으면 테이블을 빈 상태로 만들지 않고 세션 유지
                    // (빈 세션은 아웃 버튼으로만 정리)
                }
            }
            
            console.log(`✅ 주문 ${orderId} 취소 완료 (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 주문 ${orderId} 취소 실패:`, error)
            return false
        }
    }
    
    const deleteOrder = async (orderId) => {
        try {
            delete orders.value[orderId]
            delete payments.value[orderId]
            
            const table = tables.value.find(t => t.current_order?.order_id === orderId)
            if (table && table.current_order && table.current_order.order_id === orderId) {
                // current_order인 주문이 삭제되면 같은 세션의 다른 주문을 current_order로 설정
                const sessionOrders = Object.values(orders.value).filter(order => 
                    order.table_id === table.table_id && 
                    order.session_id === table.current_session_id && 
                    order.order_id !== orderId
                )
                
                if (sessionOrders.length > 0) {
                    // 가장 빠른 시간의 주문을 current_order로 설정
                    const earliestOrder = sessionOrders.sort((a, b) => new Date(a.order_time) - new Date(b.order_time))[0]
                    table.current_order = {
                        order_id: earliestOrder.order_id,
                        session_id: earliestOrder.session_id,
                        order_status: earliestOrder.order_status,
                        total_amount: earliestOrder.total_amount,
                        order_time: earliestOrder.order_time,
                        depositor_name: earliestOrder.depositor_name,
                        order_number: earliestOrder.order_number
                    }
                } else {
                    // 세션에 다른 주문이 없으면 테이블을 빈 상태로 만들지 않고 세션 유지
                    // (빈 세션은 아웃 버튼으로만 정리)
                }
            }
            
            console.log(`✅ 주문 ${orderId} 삭제 완료 (로컬)`)
            return true
        } catch (error) {
            console.error(`❌ 주문 ${orderId} 삭제 실패:`, error)
            return false
        }
    }
    
    // ===== 조회 함수들 =====
    const getTableById = (tableId) => {
        return tables.value.find(t => t.table_id === tableId)
    }
    
    const getOrderById = (orderId) => {
        const order = orders.value[orderId]
        if (!order) return null
        
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
    
    // 초기화 (Flask 우선, 로컬 폴백)
    const initializeStore = () => {
        console.log('🚀 Table Store 초기화 (Flask 우선, 로컬 폴백)')
    }
    
    return {
        // 기본 데이터
        tables,
        orders,
        payments,
        sessions,
        occupiedTableCount,
        totalRevenue,
        TABLE_COUNT,
        
        // 세션 관리 함수들
        startNewSession,
        endSession,
        getOrdersBySession,
        getCurrentSession,
        
        // API 함수들
        fetchTables,
        fetchOrder,
        createOrder,
        addNewOrder,
        updateOrder,
        updateOrderStatus,
        updateMenuServedStatus,
        verifyPayment,
        cancelOrder,
        deleteOrder,
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