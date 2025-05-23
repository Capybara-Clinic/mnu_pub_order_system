import { defineStore } from 'pinia';

export const useOrderStore = defineStore('order', {
  state: () => ({
    items: [],
    depositorName: '',
    phoneNumber: '',
    tableId: null,
  }),
  actions: {
    setTableId(id) {
      this.tableId = id;
    },
    addItem(menu) {
      const existing = this.items.find(i => i.menu_id === menu.menu_id);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({ ...menu, quantity: 1 });
      }
    },
    removeItem(menuId) {
      const idx = this.items.findIndex(i => i.menu_id === menuId);
      if (idx >= 0) {
        if (this.items[idx].quantity > 1) {
          this.items[idx].quantity -= 1;
        } else {
          this.items.splice(idx, 1);
        }
      }
    },
    reset() {
      this.items = [];
      this.depositorName = '';
      this.phoneNumber = '';
    }
  }
});
