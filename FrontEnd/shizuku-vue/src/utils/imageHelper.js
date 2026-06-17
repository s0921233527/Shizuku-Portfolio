// src/utils/imageHelper.js

// 從環境變數動態取得後端 API 地址，例如 "https://localhost:7197/api"
const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'

// 移除尾端的 "/api" 得到後端網站的根網址 (例如 "https://localhost:7197")
const baseUrl = apiBase.replace(/\/api$/, '')

const defaultImg = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800'

/**
 * 解析商品圖片路徑，若為相對路徑則自動補全後端 API 基底，若為絕對路徑或空值則做適當處理。
 * @param {string} path - 圖片路徑
 * @returns {string} 完整的圖片網址
 */
export const getImageUrl = (path) => {
  if (!path) return defaultImg
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${baseUrl}${path}`
}
