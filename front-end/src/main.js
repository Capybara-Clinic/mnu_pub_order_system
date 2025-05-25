// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

console.log('🎯 POS 시스템 시작!')
console.log('📱 라우터 등록 완료')
console.log('🗃️ Pinia Store 등록 완료')