// stores/inventoryStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useInventoryStore = defineStore('inventory', () => {
  // 메인 메뉴
  const mainMenus = ref([
    {
      id: 1,
      name: '알리오올리오',
      price: 12000,
      currentStock: 8,
      unit: '개',
      is_available: true,
      category: 'main'
    },
    {
      id: 2,
      name: '감바스',
      price: 15000,
      currentStock: 5,
      unit: '개',
      is_available: true,
      category: 'main'
    },
    {
      id: 3,
      name: '에그인더헬',
      price: 8000,
      currentStock: 12,
      unit: '개',
      is_available: true,
      category: 'main'
    },
    {
      id: 4,
      name: '토마토파스타',
      price: 13000,
      currentStock: 6,
      unit: '개',
      is_available: true,
      category: 'main'
    }
  ])

  // 사이드 메뉴
  const sideMenus = ref([
    {
      id: 5,
      name: '콘치즈',
      price: 8000,
      currentStock: 15,
      unit: '개',
      is_available: true,
      category: 'side'
    },
    {
      id: 6,
      name: '감자튀김',
      price: 6000,
      currentStock: 24,
      unit: '개',
      is_available: true,
      category: 'side'
    },
    {
      id: 7,
      name: '나쵸',
      price: 12000,
      currentStock: 7,
      unit: '개',
      is_available: true,
      category: 'side'
    },
    {
      id: 8,
      name: '소세지구이',
      price: 9000,
      currentStock: 9,
      unit: '개',
      is_available: true,
      category: 'side'
    },
    {
      id: 9,
      name: '맥주',
      price: 5000,
      currentStock: 18,
      unit: '병',
      is_available: true,
      category: 'side'
    }
  ])

  // 전체 인벤토리 (메인 + 사이드)
  const inventory = ref([...mainMenus.value, ...sideMenus.value])

  // 재고 증가
  const increaseStock = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (item) {
      item.currentStock += 1
      // 재고가 1 이상이 되면 판매 가능으로 변경
      if (item.currentStock > 0) {
        item.is_available = true
      }
      console.log(`${item.name} 재고 증가: ${item.currentStock}${item.unit}`)
    }
  }

  // 재고 감소
  const decreaseStock = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (item && item.currentStock > 0) {
      item.currentStock -= 1
      // 재고가 0이 되면 품절로 변경
      if (item.currentStock === 0) {
        item.is_available = false
      }
      console.log(`${item.name} 재고 감소: ${item.currentStock}${item.unit}`)
    }
  }

  // 품절 상태 토글
  const toggleAvailability = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (item) {
      item.is_available = !item.is_available
      console.log(`${item.name} 판매 상태 변경: ${item.is_available ? '판매 가능' : '품절'}`)
    }
  }

  // 재고 설정
  const setStock = (itemId, newStock) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (item) {
      item.currentStock = newStock
      if (newStock === 0) {
        item.is_available = false
      } else if (!item.is_available && newStock > 0) {
        item.is_available = true
      }
      console.log(`${item.name} 재고 설정: ${newStock}${item.unit}`)
    }
  }

  // ID로 메뉴 찾기
  const getMenuById = (menuId) => {
    return inventory.value.find(item => item.id === menuId)
  }

  // 판매 가능한 메뉴들
  const getAvailableMenus = () => {
    return inventory.value.filter(item => item.is_available)
  }

  return {
    // 데이터
    mainMenus,
    sideMenus,
    inventory,
    
    // 함수들
    increaseStock,
    decreaseStock,
    toggleAvailability,
    setStock,
    getMenuById,
    getAvailableMenus
  }
})