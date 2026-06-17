# Shizuku 電商平台｜Frontend

此資料夾為 Shizuku 電商平台的前端專案，使用 **Vue 3、Pinia、Vue Router、Axios** 製作前台購物流程與後台管理畫面。

本專案為全端工程師培訓期間完成的團隊專題。前端主要練習 **API 串接、購物車狀態管理、訂單流程頁面、後台訂單與金流資料呈現**。

---

## Demo

前台網站：
https://shizuku-frontend.vercel.app/

後台管理系統：
https://shizuku-frontend.vercel.app/admin

> 後台提供一鍵填入測試帳號，可快速查看訂單與金流管理功能。
> 後端部署於 Render 免費方案，首次存取 API 可能需等待約 30～60 秒完成啟動。

---

## 技術使用

- Vue 3
- Pinia
- Vue Router
- Axios
- TailwindCSS
- PrimeVue
- Vite

---

## 前端功能

### 前台功能

- 商品資料顯示
- 商品加入購物車
- 購物車數量調整與刪除
- 購物車金額計算
- 結帳頁面資料整理
- 訂單與付款結果頁面顯示

### 後台功能

- 訂單列表與明細顯示
- 訂單狀態資料呈現
- 批次出貨操作
- 營收統計資料顯示
- 交易紀錄與通訊日誌查詢

---

## 專案啟動方式

```bash
npm install
npm run dev
```

---

## 環境變數設定

請建立 `.env` 檔案，並依照實際後端 API 位置設定：

```env
VITE_API_BASE_URL=your_backend_api_url
```

---

## 學習重點

- Vue 3 元件拆分與資料綁定
- Pinia 購物車狀態管理
- Vue Router 頁面切換
- Axios 串接後端 API
- 前台購物車與訂單流程
- 後台列表、明細與統計資料呈現
- Vercel 前端部署流程
