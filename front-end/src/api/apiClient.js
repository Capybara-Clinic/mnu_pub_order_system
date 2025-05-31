import axios from 'axios'

// .env에서 API URL 가져오기 (Flask의 os.environ.get()과 동일)
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL

// 기본 axios 인스턴스 생성 (가장 단순한 버전)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient