<template>
  <div class="bg-white rounded-xl p-4 shadow-md mb-4">
    <h2 class="text-xl font-bold">{{ order.table }}</h2>
    <ul>
      <li v-for="(item, idx) in order.menu" :key="idx">
        <label>
          <input type="checkbox" v-model="checked[idx]" />
          {{ item.name }} x {{ item.count }}
        </label>
      </li>
    </ul>
    <button
      class="mt-2 px-4 py-2 bg-gray-300 rounded"
      :class="{ 'bg-green-500 text-white': allChecked }"
      :disabled="!allChecked"
      @click="completeOrder"
    >
      주문 완료
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['order-complete'])

const checked = ref((props.order.menu || []).map(() => false))

const allChecked = computed(() => checked.value.every(Boolean))

function completeOrder() {
  emit('order-complete', props.order.table)
}
</script>
