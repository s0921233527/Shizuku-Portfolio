import axios from 'axios';
import router from '@/router';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://shizuku-backend.onrender.com/api',
});

// 【JWT 自動化】請求攔截器
request.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('memberUser');
        if (userStr) {
            const token = localStorage.getItem('memberToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 【安全性優化】回應攔截器
request.interceptors.response.use(
    (response) => response,
    (error) => {
        // 新增：檢查是不是登入請求（忽略大小寫）
        const isLoginRequest = error.config?.url?.toLowerCase().includes('/memberapi/login');

        // 如果後端回傳 401 Unauthorized，且【不是】登入 API，才認定為 Token 過期
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            alert('登入時效已過，請重新登入');
            localStorage.removeItem('memberUser');
            localStorage.removeItem('memberToken');
            router.push('/login');
        }

        // 記得要把 error reject 回去，這樣 AppLogin.vue 的 catch 才能接得到
        return Promise.reject(error);
    }
);

export default request;