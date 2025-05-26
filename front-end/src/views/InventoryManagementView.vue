<template>
  <div class="inventory-management min-h-screen bg-gray-50 p-4">
    <!-- 헤더 -->
    <header class="mb-6 flex items-center justify-between">
      <button 
        @click="goBack"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span class="text-lg">←</span>
        <span class="font-medium">뒤로</span>
      </button>
      
      <h1 class="text-xl font-bold text-gray-800">📦 재고 관리</h1>
      
      <div class="w-16"></div> <!-- 중앙 정렬용 -->
    </header>

    <!-- 재고 목록 -->
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="item in allItems" 
            :key="item.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            :class="{ 'opacity-50 bg-red-50': !item.is_available }"
          >
            <div class="flex-1">
              <div class="font-medium" :class="{ 'line-through text-gray-500': !item.is_available }">
                {{ item.name }}
                <span v-if="!item.is_available" class="text-red-500 text-xs ml-2">품절</span>
              </div>
              <div class="text-sm text-gray-600">{{ item.is_available ? item.currentStock : 0 }}{{ item.unit }}</div>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- 재고 조절 버튼 -->
              <button 
                @click="decreaseStock(item.id)"
                :disabled="!item.is_available || item.currentStock <= 0"
                class="w-8 h-8 bg-red-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
              >
                -
              </button>
              <span class="w-8 text-center text-sm">{{ item.is_available ? item.currentStock : 0 }}</span>
              <button 
                @click="increaseStock(item.id)"
                class="w-8 h-8 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventoryStore'

export default {
  name: 'InventoryManagementView',
  
  setup() {
    // Composables
    const router = useRouter()
    const inventoryStore = useInventoryStore()
    
    // Computed
    const allItems = computed(() => inventoryStore.inventory)
    
    // Methods
    const goBack = () => {
      router.push('/dashboard')
    }
    
    const increaseStock = (itemId) => {
      inventoryStore.increaseStock(itemId)
    }
    
    const decreaseStock = (itemId) => {
      inventoryStore.decreaseStock(itemId)
    }
    
    return {
      // Computed
      allItems,
      
      // Methods
      goBack,
      increaseStock,
      decreaseStock
    }
  }
}
</script>

<style scoped>
/* 호버 효과 */
.bg-gray-50:hover {
  background-color: #f3f4f6;
}

/* 반응형 */
@media (max-width: 768px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>