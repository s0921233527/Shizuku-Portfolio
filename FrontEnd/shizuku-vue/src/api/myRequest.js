import axios from 'axios'
import router from '@/router'

// 專屬後台登入、管理員功能的網路客戶端
const myRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://shizuku-backend.onrender.com/api',
})

// 【JWT】
myRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 【安全性優化】回應攔截器
myRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.toLowerCase().includes('/employeeapi/login')

    // 如果後端回傳 401 且不是登入 API
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      alert('管理員登入時效已過，請重新登入')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminToken')
      router.push({ name: 'admin-login' })
    }
    return Promise.reject(error)
  }
)

export default myRequest

