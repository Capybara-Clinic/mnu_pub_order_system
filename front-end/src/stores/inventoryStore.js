// stores/inventoryStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useInventoryStore = defineStore('inventory', () => {
    // 재고 데이터 (더미)
    const inventory = ref([
        // 메인 메뉴
        { 
            id: 1, 
            name: '알리오올리오', 
            price: 12000, 
            currentStock: 8, 
            minStock: 3, 
            unit: '개',
            category: 'main',
            is_available: true  // 🆕 판매 가능 여부
        },
        { 
            id: 2, 
            name: '감바스', 
            price: 15000, 
            currentStock: 5, 
            minStock: 2, 
            unit: '개',
            category: 'main',
            is_available: true
        },
        { 
            id: 3, 
            name: '에그인더헬', 
            price: 8000, 
            currentStock: 12, 
            minStock: 5, 
            unit: '개',
            category: 'main',
            is_available: true
        },
        { 
            id: 4, 
            name: '토마토파스타', 
            price: 14000, 
            currentStock: 6, 
            minStock: 3, 
            unit: '개',
            category: 'main',
            is_available: true
        },
        
        // 사이드 메뉴 (기존)
        { 
            id: 5, 
            name: '콘치즈', 
            price: 8000, 
            currentStock: 15, 
            minStock: 8, 
            unit: '개',
            category: 'side',
            is_available: true
        },
        { 
            id: 6, 
            name: '소세지구이', 
            price: 10000, 
            currentStock: 9, 
            minStock: 4, 
            unit: '개',
            category: 'side',
            is_available: true
        },
        { 
            id: 7, 
            name: '나쵸', 
            price: 12000, 
            currentStock: 7, 
            minStock: 3, 
            unit: '개',
            category: 'side',
            is_available: true
        },
        
        // 🍺 음료 메뉴 (새로 추가)
        { 
            id: 8, 
            name: '소주', 
            price: 5000, 
            currentStock: 24, 
            minStock: 10, 
            unit: '병',
            category: 'side',
            is_available: true
        },
        { 
            id: 9, 
            name: '맥주', 
            price: 5000, 
            currentStock: 18, 
            minStock: 8, 
            unit: '병',
            category: 'side',
            is_available: false  // 🆕 테스트용 품절 상태
        }
    ])
    
    // Computed 속성들
    const mainMenus = computed(() => {
        return inventory.value.filter(item => item.category === 'main')
    })
    
    const sideMenus = computed(() => {
        return inventory.value.filter(item => item.category === 'side')
    })
    
    const lowStockItems = computed(() => {
        return inventory.value.filter(item => item.currentStock <= item.minStock)
    })
    
    const lowStockCount = computed(() => {
        return lowStockItems.value.length
    })
    
    // 메뉴별 재고 부족 체크
    const isLowStock = (itemId) => {
        const item = inventory.value.find(item => item.id === itemId)
        return item && item.currentStock <= item.minStock
    }
    
    // 재고 증가/감소 함수들
    const increaseStock = (itemId, amount = 1) => {
        const item = inventory.value.find(item => item.id === itemId)
        if (item) {
            item.currentStock += amount
            console.log(`${item.name} 재고 증가: ${item.currentStock}${item.unit}`)
        }
    }
    
    const decreaseStock = (itemId, amount = 1) => {
        const item = inventory.value.find(item => item.id === itemId)
        if (item && item.currentStock >= amount) {
            item.currentStock -= amount
            console.log(`${item.name} 재고 감소: ${item.currentStock}${item.unit}`)
        } else if (item) {
            console.warn(`${item.name} 재고 부족! 현재: ${item.currentStock}${item.unit}`)
        }
    }
    
    // 특정 메뉴의 재고 조회
    const getMenuStock = (itemId) => {
        const item = inventory.value.find(item => item.id === itemId)
        return item ? item.currentStock : 0
    }
    
    // 메뉴명으로 검색
    const findMenuByName = (menuName) => {
        return inventory.value.find(item => item.name === menuName)
    }
    
    // 카테고리별 조회 함수 (템플릿에서 직접 호출 가능)
    const getMainMenus = () => {
        return inventory.value.filter(item => item.category === 'main')
    }
    
    const getSideMenus = () => {
        return inventory.value.filter(item => item.category === 'side')
    }
    
    // API 연동용 함수 (나중에 구현)
    const loadMenuFromAPI = async () => {
        console.log('API에서 메뉴 데이터 로딩... (구현 예정)')
        // TODO: 실제 API 호출로 대체
    }
    
    const updateMenuToAPI = async (itemId, newStock) => {
        console.log(`API로 ${itemId}번 메뉴 재고 업데이트: ${newStock} (구현 예정)`)
        // TODO: 실제 API 호출로 대체
    }
    
    return {
        // 데이터
        inventory,
        
        // Computed
        mainMenus,
        sideMenus,
        lowStockItems,
        lowStockCount,
        
        // 메소드
        isLowStock,
        increaseStock,
        decreaseStock,
        getMenuStock,
        findMenuByName,
        getMainMenus,
        getSideMenus,
        loadMenuFromAPI,
        updateMenuToAPI
    }
})