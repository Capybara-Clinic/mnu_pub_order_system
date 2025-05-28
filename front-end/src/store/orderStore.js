import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
    state: () => ({
        orders: [
            {
                table: '1번 테이블',
                menu: [
                    { name: '에그인헬', count: 2 },
                    { name: '콘치즈', count: 1 },
                ],
            },
            {
                table: '3번 테이블',
                menu: [
                    { name: '맥주', count: 3 },
                    { name: '소주', count: 1 },
                ],
            },
        ],
    }),
    actions: {
        completeOrder(tableName) {
            this.orders = this.orders.filter(order => order.table !== tableName)
        },
    },
})
