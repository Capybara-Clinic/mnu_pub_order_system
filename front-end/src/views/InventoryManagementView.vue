<template>
  <div class="inventory-management min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-6">
    <div class="max-w-7xl mx-auto w-full">
      <!-- 헤더 -->
      <header class="mb-8">
        <div class="relative flex items-center justify-center">
          <!-- 뒤로 버튼 (절대 위치) -->
          <button 
            @click="goBack"
            class="absolute left-0 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span class="text-xl">←</span>
            <span class="font-medium">뒤로</span>
          </button>
          
          <!-- 중앙 제목 -->
          <h1 class="text-2xl font-bold text-gray-800">📦 재고 관리</h1>
        </div>
      </header>

      <!-- 변경사항 알림 (변경사항이 있을 때만 표시) -->
      <div v-if="hasChanges" class="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="font-medium">
            🔄 {{ changedItemsCount }}개 아이템에 변경사항이 있습니다
          </span>
          <span class="text-sm">하단 확정 버튼을 눌러 저장하세요</span>
        </div>
      </div>

      <!-- 재고 목록 -->
      <div class="bg-white rounded-xl p-8 shadow-lg mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="item in allItems" 
            :key="item.id"
            class="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200"
            :class="getItemCardClass(item)"
          >
            <div class="flex-1">
              <div class="text-base font-semibold mb-2 flex items-center gap-2">
                <span 
                  :class="{ 'line-through text-gray-500': !item.is_available }"
                  class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
                  :title="item.name"
                >
                  {{ item.name }}
                </span>
                
                <!-- 변경사항 점 표시 -->
                <span v-if="isItemChanged(item.id)" class="w-2 h-2 bg-orange-500 rounded-full"></span>
                
                <!-- 품절 표시 -->
                <span v-if="!item.is_available" class="text-red-500 text-sm font-normal">
                  품절
                </span>
              </div>
              
              <!-- 재고 정보 -->
              <div class="text-sm text-gray-600">
                <span class="font-semibold text-base">{{ getCurrentDisplayStock(item.id) }}{{ item.unit }}</span>
                
                <!-- 원본 재고와 다른 경우 화살표로 변경사항 표시 -->
                <span v-if="isItemChanged(item.id)" class="text-orange-600 text-sm ml-2">
                  ({{ item.currentStock }} → {{ getCurrentDisplayStock(item.id) }})
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- 재고 조절 버튼 -->
              <button 
                @click="tempDecreaseStock(item.id)"
                :disabled="getCurrentDisplayStock(item.id) <= 0"
                class="w-8 h-8 bg-red-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                -
              </button>
              <span class="w-10 text-center text-base font-semibold">
                {{ getCurrentDisplayStock(item.id) }}
              </span>
              <button 
                @click="tempIncreaseStock(item.id)"
                class="w-8 h-8 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 확정/취소 버튼 (변경사항이 있을 때만 표시) -->
      <div v-if="hasChanges" class="flex gap-4">
        <button 
          @click="cancelAllChanges"
          :disabled="isSaving"
          class="flex-1 bg-gray-500 text-white text-xl font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          모든 변경사항 취소
        </button>
        
        <button 
          @click="confirmAllChanges"
          :disabled="isSaving"
          class="flex-1 bg-blue-500 text-white text-xl font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {{ isSaving ? '저장 중...' : `변경사항 확정 (${changedItemsCount}개)` }}
        </button>
      </div>

      <!-- 변경사항이 없을 때 안내 -->
      <div v-if="!hasChanges" class="text-center text-gray-500 mt-6">
        <p class="text-lg">위의 +/- 버튼으로 재고를 조절해주세요</p>
        <p class="text-sm">변경 후 확정 버튼이 나타납니다</p>
      </div>
    </div>

    <!-- 저장 성공/실패 토스트 -->
    <div 
      v-if="showToast"
      class="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
      :class="toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventoryStore'

export default {
  name: 'InventoryManagementView',
  
  setup() {
    // ===== Composables =====
    const router = useRouter()
    const inventoryStore = useInventoryStore()
    
    // ===== Reactive State =====
    const isSaving = ref(false)
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success') // 'success' | 'error'
    
    // ===== Computed Properties =====
    const allItems = computed(() => inventoryStore.inventory)
    const hasChanges = computed(() => inventoryStore.hasChanges)
    const changedItemsCount = computed(() => inventoryStore.changedItemsCount)
    
    // ===== Methods =====
    
    const goBack = () => {
      // 변경사항이 있으면 확인
      if (hasChanges.value) {
        if (confirm('저장하지 않은 변경사항이 있습니다. 정말로 나가시겠습니까?')) {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    }
    
    // 임시 재고 증가
    const tempIncreaseStock = (itemId) => {
      inventoryStore.tempIncreaseStock(itemId)
    }
    
    // 임시 재고 감소
    const tempDecreaseStock = (itemId) => {
      inventoryStore.tempDecreaseStock(itemId)
    }
    
    // 현재 표시될 재고 가져오기
    const getCurrentDisplayStock = (itemId) => {
      return inventoryStore.getCurrentDisplayStock(itemId)
    }
    
    // 아이템이 변경되었는지 확인
    const isItemChanged = (itemId) => {
      return inventoryStore.isItemChanged(itemId)
    }
    
    // 아이템 카드 스타일 클래스
    const getItemCardClass = (item) => {
      if (isItemChanged(item.id)) {
        return 'border-orange-300 bg-orange-50 shadow-md' // 변경된 아이템
      } else if (!item.is_available) {
        return 'opacity-50 bg-red-50 border-red-200' // 품절
      } else {
        return 'bg-gray-50 border-gray-200 hover:shadow-md hover:border-gray-300' // 일반
      }
    }
    
    // 모든 변경사항 확정
    const confirmAllChanges = async () => {
      if (!hasChanges.value) return
      
      const confirmMsg = `${changedItemsCount.value}개 아이템의 재고를 확정하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      
      if (!confirm(confirmMsg)) return
      
      isSaving.value = true
      
      try {
        const result = await inventoryStore.confirmAllChanges()
        
        if (result.success) {
          showToastMessage(result.message, 'success')
          console.log('✅ 재고 확정 완료')
        } else {
          showToastMessage(result.message, 'error')
          console.error('❌ 재고 확정 실패')
        }
      } catch (error) {
        console.error('재고 확정 중 오류:', error)
        showToastMessage('재고 확정 중 오류가 발생했습니다.', 'error')
      } finally {
        isSaving.value = false
      }
    }
    
    // 모든 변경사항 취소
    const cancelAllChanges = () => {
      if (!hasChanges.value) return
      
      const confirmMsg = `${changedItemsCount.value}개 아이템의 변경사항을 모두 취소하시겠습니까?`
      
      if (confirm(confirmMsg)) {
        const result = inventoryStore.cancelAllChanges()
        showToastMessage(result.message, 'success')
        console.log('🚫 모든 변경사항 취소됨')
      }
    }
    
    // 토스트 메시지 표시
    const showToastMessage = (message, type = 'success') => {
      toastMessage.value = message
      toastType.value = type
      showToast.value = true
      
      // 3초 후 자동 숨김
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }
    
    // ===== Return =====
    return {
      // Computed
      allItems,
      hasChanges,
      changedItemsCount,
      
      // State
      isSaving,
      showToast,
      toastMessage,
      toastType,
      
      // Methods
      goBack,
      tempIncreaseStock,
      tempDecreaseStock,
      getCurrentDisplayStock,
      isItemChanged,
      getItemCardClass,
      confirmAllChanges,
      cancelAllChanges
    }
  }
}
</script>

<style scoped>
/* 호버 효과 */
.bg-gray-50:hover {
  background-color: #f9fafb;
}

/* 변경된 아이템 강조 효과 */
.bg-orange-50 {
  background-color: #fff7ed;
}

.border-orange-300 {
  border-color: #fdba74;
}

/* 토스트 애니메이션 */
.fixed {
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 버튼 호버 효과 강화 */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* 변경사항 점 애니메이션 */
.bg-orange-500.rounded-full {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 반응형 */
@media (max-width: 1280px) {
  .xl\:grid-cols-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .flex-1 {
    font-size: 16px;
  }
  
  .w-8.h-8 {
    width: 2rem;
    height: 2rem;
  }
}
</style>