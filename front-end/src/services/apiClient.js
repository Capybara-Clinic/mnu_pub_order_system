// ==============================================
// 📁 src/services/apiClient.js (새 파일)
// ==============================================

import axios from 'axios';

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 (공통 헤더, 로깅 등)
apiClient.interceptors.request.use(
    (config) => {
        console.log(`[API 요청] ${config.method?.toUpperCase()} ${config.url}`);
        
        // 인증 토큰이 있다면 헤더에 추가
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('[API 요청 에러]', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (공통 에러 처리, 로깅)
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API 응답] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        const { config, response } = error;
        console.error(`[API 에러] ${config?.method?.toUpperCase()} ${config?.url} - ${response?.status}`, error.message);
        
        // 공통 에러 처리
        if (response?.status === 401) {
            console.warn('인증이 필요합니다. 로그인 페이지로 이동합니다.');
            // 로그인 페이지로 리다이렉트 (router 사용하지 않고 직접)
            window.location.href = '/login';
        } else if (response?.status === 404) {
            console.warn('요청한 리소스를 찾을 수 없습니다.');
        } else if (response?.status >= 500) {
            console.error('서버 에러가 발생했습니다.');
        } else if (!response) {
            console.error('네트워크 에러 또는 서버에 연결할 수 없습니다.');
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
