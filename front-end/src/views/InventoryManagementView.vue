<template>
  <div class="inventory-management min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-6">
    <div class="max-w-7xl mx-auto w-full">
      <!-- 헤더 -->
      <header class="mb-8 flex items-center justify-between">
        <button 
          @click="goBack"
          class="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        >
          <span class="text-2xl">←</span>
          <span class="font-medium">뒤로</span>
        </button>
        
        <h1 class="text-3xl font-bold text-gray-800">📦 재고 관리</h1>
        
        <div class="w-20"></div> <!-- 중앙 정렬용 -->
      </header>

      <!-- 재고 목록 -->
      <div class="bg-white rounded-xl p-8 shadow-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="item in allItems" 
            :key="item.id"
            class="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
            :class="{ 'opacity-50 bg-red-50 border-red-200': !item.is_available }"
          >
            <div class="flex-1">
              <div class="text-lg font-semibold mb-2" :class="{ 'line-through text-gray-500': !item.is_available }">
                {{ item.name }}
                <span v-if="!item.is_available" class="text-red-500 text-sm ml-2 font-normal">품절</span>
              </div>
              <div class="text-base text-gray-600">{{ item.is_available ? item.currentStock : 0 }}{{ item.unit }}</div>
            </div>
            
            <div class="flex items-center gap-3">
              <!-- 재고 조절 버튼 -->
              <button 
                @click="decreaseStock(item.id)"
                :disabled="!item.is_available || item.currentStock <= 0"
                class="w-12 h-12 bg-red-500 text-white rounded-lg text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
              >
                -
              </button>
              <span class="w-12 text-center text-lg font-semibold">{{ item.is_available ? item.currentStock : 0 }}</span>
              <button 
                @click="increaseStock(item.id)"
                class="w-12 h-12 bg-green-500 text-white rounded-lg text-lg font-bold hover:bg-green-600 transition-colors"
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
}
</style>