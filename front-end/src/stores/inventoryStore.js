// stores/inventoryStore.js (확정 버튼 시스템)
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useInventoryStore = defineStore('inventory', () => {
  // 메인 메뉴 (원본 데이터)
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

  // 사이드 메뉴 (원본 데이터)
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
  const inventory = computed(() => [...mainMenus.value, ...sideMenus.value])

  // ===== 임시 수정 데이터 (확정 전까지 저장) =====
  const tempChanges = ref({})
  
  // 변경사항이 있는지 확인
  const hasChanges = computed(() => {
    return Object.keys(tempChanges.value).length > 0
  })
  
  // 변경된 아이템 개수
  const changedItemsCount = computed(() => {
    return Object.keys(tempChanges.value).length
  })

  // ===== 임시 재고 조절 함수들 (확정 전까지는 tempChanges에만 저장) =====
  
  // 임시 재고 증가
  const tempIncreaseStock = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (!item) return
    
    // 현재 임시 재고 계산
    const currentTempStock = tempChanges.value[itemId]?.currentStock ?? item.currentStock
    
    // 임시 변경사항에 저장
    tempChanges.value[itemId] = {
      ...tempChanges.value[itemId],
      id: itemId,
      name: item.name,
      originalStock: item.currentStock,
      currentStock: currentTempStock + 1,
      unit: item.unit
    }
    
    console.log(`${item.name} 임시 재고 증가: ${currentTempStock + 1}${item.unit} (원본: ${item.currentStock}${item.unit})`)
  }

  // 임시 재고 감소
  const tempDecreaseStock = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (!item) return
    
    // 현재 임시 재고 계산
    const currentTempStock = tempChanges.value[itemId]?.currentStock ?? item.currentStock
    
    if (currentTempStock <= 0) return // 0 이하로는 감소 불가
    
    // 임시 변경사항에 저장
    tempChanges.value[itemId] = {
      ...tempChanges.value[itemId],
      id: itemId,
      name: item.name,
      originalStock: item.currentStock,
      currentStock: currentTempStock - 1,
      unit: item.unit
    }
    
    console.log(`${item.name} 임시 재고 감소: ${currentTempStock - 1}${item.unit} (원본: ${item.currentStock}${item.unit})`)
  }

  // 특정 아이템의 현재 표시될 재고 가져오기 (임시 변경사항 반영)
  const getCurrentDisplayStock = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (!item) return 0
    
    return tempChanges.value[itemId]?.currentStock ?? item.currentStock
  }

  // 특정 아이템이 변경되었는지 확인
  const isItemChanged = (itemId) => {
    return Object.prototype.hasOwnProperty.call(tempChanges.value, itemId)
  }

  // 특정 아이템의 변경사항 정보 가져오기
  const getItemChangeInfo = (itemId) => {
    return tempChanges.value[itemId] || null
  }

  // ===== 확정 관련 함수들 =====
  
  // 모든 변경사항 확정 (API 호출 시뮬레이션)
  const confirmAllChanges = async () => {
    if (!hasChanges.value) {
      console.log('변경사항이 없습니다.')
      return { success: true, message: '변경사항이 없습니다.' }
    }

    try {
      console.log('📡 API 호출 시뮬레이션 시작...')
      console.log('전송할 데이터:', tempChanges.value)
      
      // API 호출 시뮬레이션 (2초 대기)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 성공적으로 API 호출이 완료되었다고 가정하고 실제 데이터에 반영
      for (const [itemId, changeInfo] of Object.entries(tempChanges.value)) {
        const item = inventory.value.find(i => i.id === parseInt(itemId))
        if (item) {
          const oldStock = item.currentStock
          item.currentStock = changeInfo.currentStock
          
          // 재고가 0이 되면 품절로 변경
          if (item.currentStock === 0) {
            item.is_available = false
          } else if (!item.is_available && item.currentStock > 0) {
            // 재고가 다시 생기면 판매 가능으로 변경
            item.is_available = true
          }
          
          console.log(`✅ ${item.name} 재고 확정: ${oldStock} → ${item.currentStock}${item.unit}`)
        }
      }
      
      // 임시 변경사항 초기화
      const confirmedCount = Object.keys(tempChanges.value).length
      tempChanges.value = {}
      
      console.log('✅ 재고 변경 확정 완료!')
      return { 
        success: true, 
        message: `${confirmedCount}개 아이템의 재고가 성공적으로 업데이트되었습니다.` 
      }
      
    } catch (error) {
      console.error('❌ 재고 업데이트 실패:', error)
      return { 
        success: false, 
        message: '재고 업데이트 중 오류가 발생했습니다.' 
      }
    }
  }
  
  // 모든 변경사항 취소
  const cancelAllChanges = () => {
    const canceledCount = Object.keys(tempChanges.value).length
    tempChanges.value = {}
    console.log(`🚫 ${canceledCount}개 아이템의 변경사항이 취소되었습니다.`)
    return { success: true, message: `${canceledCount}개 아이템의 변경사항이 취소되었습니다.` }
  }
  
  // 특정 아이템의 변경사항만 취소
  const cancelItemChange = (itemId) => {
    const changeInfo = tempChanges.value[itemId]
    if (changeInfo) {
      delete tempChanges.value[itemId]
      console.log(`🚫 ${changeInfo.name} 변경사항 취소됨`)
      return { success: true, message: `${changeInfo.name} 변경사항이 취소되었습니다.` }
    }
    return { success: false, message: '취소할 변경사항이 없습니다.' }
  }

  // ===== 기존 함수들 (직접 수정용 - API 연결 시에는 사용하지 않음) =====
  
  // 직접 재고 증가 (API 연결 후에는 사용하지 않을 예정)
  const increaseStock = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (item) {
      item.currentStock += 1
      if (item.currentStock > 0) {
        item.is_available = true
      }
      console.log(`${item.name} 재고 직접 증가: ${item.currentStock}${item.unit}`)
    }
  }

  // 직접 재고 감소 (API 연결 후에는 사용하지 않을 예정)
  const decreaseStock = (itemId) => {
    const item = inventory.value.find(i => i.id === itemId)
    if (item && item.currentStock > 0) {
      item.currentStock -= 1
      if (item.currentStock === 0) {
        item.is_available = false
      }
      console.log(`${item.name} 재고 직접 감소: ${item.currentStock}${item.unit}`)
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

  // 재고 직접 설정
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
    // 기본 데이터
    mainMenus,
    sideMenus,
    inventory,
    
    // 임시 변경사항 관련
    tempChanges,
    hasChanges,
    changedItemsCount,
    
    // 임시 수정 함수들 (확정 버튼 시스템용)
    tempIncreaseStock,
    tempDecreaseStock,
    getCurrentDisplayStock,
    isItemChanged,
    getItemChangeInfo,
    
    // 확정 관련 함수들
    confirmAllChanges,
    cancelAllChanges,
    cancelItemChange,
    
    // 기존 직접 수정 함수들 (하위 호환성)
    increaseStock,
    decreaseStock,
    toggleAvailability,
    setStock,
    getMenuById,
    getAvailableMenus
  }
})