// stores/tableStore.js (결제 대기 상태 추가, 10개 테이블, 단방향 흐름)
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTableStore = defineStore('table', () => {
    // 테이블 개수 설정 (10개 고정)
    const TABLE_COUNT = 10
    
    // 개별 테이블별 주문 데이터 (더미)
    const tableOrders = ref({
        1: [  // 테이블 1번 주문들
            {
                id: 'order-1-1',
                orderTime: '19:15',
                status: 'completed',
                items: [
                    { id: 1, name: '알리오올리오', quantity: 1, price: 12000, completed: true },
                    { id: 5, name: '콘치즈', quantity: 1, price: 8000, completed: true }
                ]
            }
        ],
        2: [  // 테이블 2번 주문들
            {
                id: 'order-2-1', 
                orderTime: '19:30',
                status: 'cooking',  // 조리 중 상태
                items: [
                    { id: 2, name: '감바스', quantity: 1, price: 15000, completed: false },
                    { id: 7, name: '나쵸', quantity: 2, price: 24000, completed: false }
                ]
            }
        ],
        3: [  // 테이블 3번 주문들
            {
                id: 'order-3-1',
                orderTime: '19:25',
                status: 'completed',
                items: [
                    { id: 3, name: '에그인더헬', quantity: 1, price: 8000, completed: true },
                    { id: 9, name: '맥주', quantity: 2, price: 10000, completed: true }
                ]
            },
            {
                id: 'order-3-2',
                orderTime: '19:32',
                status: 'cooking',
                items: [
                    { id: 4, name: '토마토파스타', quantity: 1, price: 14000, completed: false }
                ]
            },
            {
                id: 'order-3-3',
                orderTime: '19:05',
                status: 'completed',
                items: [
                    { id: 6, name: '소세지구이', quantity: 2, price: 20000, completed: true }
                ]
            },
            {
                id: 'order-3-4',
                orderTime: '19:20',
                status: 'partial',
                items: [
                    { id: 8, name: '소주', quantity: 2, price: 10000, completed: true },
                    { id: 9, name: '맥주', quantity: 1, price: 5000, completed: false }
                ]
            }
        ],
        6: [  // 결제 대기 중인 테이블
            {
                id: 'order-6-1',
                orderTime: '19:42',
                status: 'waiting_payment',
                items: [
                    { id: 1, name: '알리오올리오', quantity: 2, price: 24000, completed: false },
                    { id: 9, name: '맥주', quantity: 2, price: 10000, completed: false }
                ]
            }
        ],
        10: [  // 또 다른 결제 대기 테이블
            {
                id: 'order-10-1',
                orderTime: '19:35',
                status: 'waiting_payment',
                items: [
                    { id: 3, name: '에그인더헬', quantity: 1, price: 8000, completed: false }
                ]
            }
        ]
    })
    
    // 10개 테이블 더미 데이터 (정확히 10개)
    const tables = ref([
        { id: 1, name: '테이블 1번', status: 'ready', amount: 20000, orderTime: '19:15', statusText: '준비 완료' },
        { id: 2, name: '테이블 2번', status: 'cooking', amount: 39000, orderTime: '19:30', statusText: '조리 중' },
        { id: 3, name: '테이블 3번', status: 'partial', amount: 91000, orderTime: '19:38', statusText: '부분 완료' },
        { id: 4, name: '테이블 4번', status: 'empty', amount: 0, orderTime: '', statusText: '빈 테이블' },
        { id: 5, name: '테이블 5번', status: 'empty', amount: 0, orderTime: '', statusText: '빈 테이블' },
        { id: 6, name: '테이블 6번', status: 'waiting_payment', amount: 34000, orderTime: '19:42', statusText: '결제 대기' },
        { id: 7, name: '테이블 7번', status: 'empty', amount: 0, orderTime: '', statusText: '빈 테이블' },
        { id: 8, name: '테이블 8번', status: 'empty', amount: 0, orderTime: '', statusText: '빈 테이블' },
        { id: 9, name: '테이블 9번', status: 'cooking', amount: 0, orderTime: '19:20', statusText: '조리 중' },
        { id: 10, name: '테이블 10번', status: 'waiting_payment', amount: 8000, orderTime: '19:35', statusText: '결제 대기' }
    ])
    
    // 간단한 계산된 속성
    const activeTableCount = ref(6)  // 빈 테이블 제외한 개수
    const totalRevenue = ref(150000)  // 전체 매출
    
    // 실시간 테이블 금액 계산 함수
    const getTableAmount = (tableId) => {
        const orders = tableOrders.value[tableId] || []
        return orders.reduce((total, order) => {
            return total + order.items.reduce((orderTotal, item) => orderTotal + item.price, 0)
        }, 0)
    }
    
    // 🎯 삼각형 버튼: 결제 대기 → 조리 중 → 준비 완료 (끝)
    const nextTableStatus = (tableId) => {
        const table = tables.value.find(t => t.id === tableId)
        if (!table || table.status === 'empty') return
        
        console.log(`${table.name} 상태 변경 시작: ${table.statusText}`)
        
        // 단방향 진행만 허용
        switch (table.status) {
            case 'waiting_payment':   // 결제 대기 → 조리 중
                table.status = 'cooking'
                table.statusText = '조리 중'
                console.log(`${table.name} → 조리 중`)
                break
            case 'cooking':   // 조리 중 → 준비 완료
                table.status = 'ready'
                table.statusText = '준비 완료'
                console.log(`${table.name} → 준비 완료`)
                break
            case 'partial':   // 부분 완료 → 준비 완료
                table.status = 'ready'
                table.statusText = '준비 완료'
                console.log(`${table.name} → 준비 완료 (부분완료에서)`)
                break
            case 'ready':     // 준비 완료에서는 더 이상 진행 안 함
                console.log(`${table.name} → 준비 완료 상태 유지 (아웃 버튼으로만 초기화 가능)`)
                return // 상태 변경 없음
            default:
                console.log(`${table.name} → 알 수 없는 상태: ${table.status}`)
                return
        }
        
        console.log(`${table.name} 상태 변경 완료: ${table.statusText}`)
    }
    
    // 상세 페이지에서 사용할 부분 완료 설정 함수
    const setPartialComplete = (tableId, completedItems, totalItems) => {
        const table = tables.value.find(t => t.id === tableId)
        if (!table) return
        
        if (completedItems === 0) {
            // 아무것도 완료되지 않음
            const orders = tableOrders.value[tableId] || []
            const hasCookingOrder = orders.some(order => order.status === 'cooking')
            
            if (hasCookingOrder) {
                table.status = 'cooking'
                table.statusText = '조리 중'
            } else {
                table.status = 'waiting_payment'
                table.statusText = '결제 대기'
            }
        } else if (completedItems === totalItems) {
            // 모든 메뉴 완료 → 준비 완료
            table.status = 'ready'
            table.statusText = '준비 완료'
        } else {
            // 일부만 완료 → 부분 완료
            table.status = 'partial'
            table.statusText = '부분 완료'
        }
    }
        
    // 개별 테이블 주문 조회
    const getTableOrders = (tableId) => {
        return tableOrders.value[tableId] || []
    }
    
    // 개별 메뉴 아이템 완료 상태 토글
    const toggleItemComplete = (tableId, orderId, itemId) => {
        const orders = tableOrders.value[tableId] || []
        const order = orders.find(o => o.id === orderId)
        if (!order) return
        
        const item = order.items.find(i => i.id === itemId)
        if (!item) return
        
        item.completed = !item.completed
        console.log(`${item.name} 완료 상태: ${item.completed}`)
        
        // 주문별 상태 업데이트
        updateOrderStatus(tableId, orderId)
        
        // 테이블 전체 상태 업데이트
        updateTableStatus(tableId)
    }
    
    // 주문별 상태 업데이트
    const updateOrderStatus = (tableId, orderId) => {
        const orders = tableOrders.value[tableId] || []
        const order = orders.find(o => o.id === orderId)
        if (!order) return
        
        const completedItems = order.items.filter(item => item.completed).length
        const totalItems = order.items.length
        
        if (completedItems === 0) {
            if (order.status === 'cooking' || order.status === 'partial') {
                order.status = 'cooking'
            } else {
                order.status = 'waiting_payment'
            }
        } else if (completedItems === totalItems) {
            order.status = 'completed'
        } else {
            order.status = 'partial'
        }
        
        console.log(`주문 ${orderId} 상태: ${order.status} (${completedItems}/${totalItems})`)
    }
    
    // 테이블 전체 상태 업데이트
    const updateTableStatus = (tableId) => {
        const orders = tableOrders.value[tableId] || []
        if (orders.length === 0) return
        
        const allCompletedItems = orders.flatMap(order => order.items).filter(item => item.completed).length
        const allTotalItems = orders.flatMap(order => order.items).length
        
        setPartialComplete(tableId, allCompletedItems, allTotalItems)
    }
    
    // 새 주문 추가 (백엔드에서 호출)
    const addNewOrder = (tableId, items) => {
        if (!tableOrders.value[tableId]) {
            tableOrders.value[tableId] = []
        }
        
        const newOrder = {
            id: `order-${tableId}-${Date.now()}`,
            orderTime: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            status: 'waiting_payment',  // 결제 대기부터 시작
            items: items.map(item => ({ ...item, completed: false }))
        }
        
        tableOrders.value[tableId].push(newOrder)
        console.log(`테이블 ${tableId}에 새 주문 추가:`, newOrder)
        
        // 빈 테이블에 주문 추가시 테이블 활성화
        const table = tables.value.find(t => t.id === tableId)
        if (table && table.status === 'empty') {
            table.status = 'waiting_payment'
            table.statusText = '결제 대기'
            table.orderTime = newOrder.orderTime
            console.log(`테이블 ${tableId} 활성화: 빈 테이블 → 결제 대기`)
        }
        
        updateTableStatus(tableId)
        return newOrder.id
    }
    
    // 결제 완료 처리 (결제 대기 → 조리 중)
    const completePayment = (tableId, orderId = null) => {
        const table = tables.value.find(t => t.id === tableId)
        const orders = tableOrders.value[tableId] || []
        
        if (orderId) {
            // 특정 주문만 결제 완료
            const order = orders.find(o => o.id === orderId)
            if (order && order.status === 'waiting_payment') {
                order.status = 'cooking'
                console.log(`주문 ${orderId} 결제 완료 → 조리 시작`)
            }
        } else {
            // 테이블의 모든 결제 대기 주문을 조리 중으로
            orders.forEach(order => {
                if (order.status === 'waiting_payment') {
                    order.status = 'cooking'
                }
            })
            console.log(`테이블 ${tableId} 모든 주문 결제 완료 → 조리 시작`)
        }
        
        // 테이블 상태도 업데이트
        if (table && table.status === 'waiting_payment') {
            table.status = 'cooking'
            table.statusText = '조리 중'
        }
        
        updateTableStatus(tableId)
    }
    
    // 기존 주문 업데이트
    const updateOrder = (tableId, orderId, updatedOrderData) => {
        const orders = tableOrders.value[tableId] || []
        const orderIndex = orders.findIndex(o => o.id === orderId)
        
        if (orderIndex === -1) {
            console.error(`주문 ${orderId}를 찾을 수 없습니다`)
            return false
        }
        
        orders[orderIndex] = {
            ...orders[orderIndex],
            ...updatedOrderData,
            items: updatedOrderData.items || orders[orderIndex].items
        }
        
        console.log(`테이블 ${tableId} 주문 ${orderId} 업데이트:`, orders[orderIndex])
        updateTableStatus(tableId)
        return true
    }
    
    // 주문 삭제
    const deleteOrder = (tableId, orderId) => {
        const orders = tableOrders.value[tableId] || []
        const orderIndex = orders.findIndex(o => o.id === orderId)
        
        if (orderIndex === -1) {
            console.error(`주문 ${orderId}를 찾을 수 없습니다`)
            return false
        }
        
        const deletedOrder = orders.splice(orderIndex, 1)[0]
        console.log(`테이블 ${tableId} 주문 ${orderId} 삭제:`, deletedOrder)
        
        if (orders.length === 0) {
            clearTable(tableId)
        } else {
            updateTableStatus(tableId)
        }
        
        return true
    }
    
    // 특정 주문 조회
    const getOrder = (tableId, orderId) => {
        const orders = tableOrders.value[tableId] || []
        return orders.find(o => o.id === orderId)
    }
    
    // 🚪 아웃 버튼: 테이블 초기화 (수동으로만 가능)
    const clearTable = (tableId) => {
        const table = tables.value.find(t => t.id === tableId)
        if (table) {
            const oldStatus = table.statusText
            console.log(`${table.name} 초기화 시작: ${oldStatus}`)
            
            table.status = 'empty'
            table.amount = 0
            table.orderTime = ''
            table.statusText = '빈 테이블'
            
            // 주문 데이터도 초기화
            if (tableOrders.value[tableId]) {
                delete tableOrders.value[tableId]
            }
            
            console.log(`${table.name} 초기화 완료: ${oldStatus} → 빈 테이블`)
        }
    }
    
    const resetAllTables = () => {
        console.log('모든 테이블 초기화')
    }
    
    return {
        tables,
        tableOrders,
        activeTableCount,
        totalRevenue,
        clearTable,
        nextTableStatus,        // 🎯 삼각형 버튼: 결제 대기 → 조리 중 → 준비 완료
        setPartialComplete,
        getTableOrders,
        getOrder,
        getTableAmount,
        toggleItemComplete,
        addNewOrder,           // 백엔드에서 새 주문 생성
        updateOrder,
        deleteOrder,
        completePayment,       // 결제 완료 처리
        resetAllTables,
        TABLE_COUNT            // 10개 고정
    }
})