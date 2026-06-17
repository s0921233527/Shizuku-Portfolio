# Shizuku 電商平台

Shizuku 是全端工程師培訓期間完成的電商平台團隊專題，採用 ASP.NET Core Web API + Vue 3 前後端分離架構。

我主要負責 購物車、訂單建立、付款流程、第三方金流串接，以及後台訂單與金流管理功能。
開發過程中有使用 AI IDE 協助產生程式碼與除錯，並透過閱讀、測試、修改與文件整理，熟悉前後端 API 串接、訂單資料流與金流狀態更新流程。

---

## Demo

- **前台網站**：[https://shizuku-frontend.vercel.app/](https://shizuku-frontend.vercel.app/)
- **後台管理系統**：[https://shizuku-frontend.vercel.app/admin](https://shizuku-frontend.vercel.app/admin)
  _(後台提供一鍵填入測試帳號，可快速查看訂單與金流管理功能。)_
- **GitHub Repository**：[https://github.com/s0921233527/Shizuku-Portfolio.git](https://github.com/s0921233527/Shizuku-Portfolio.git)

### 注意事項

後端部署於 Render 免費方案，服務閒置後會進入休眠狀態。
首次存取時可能需要等待約 30～60 秒完成啟動（Cold Start）。

---

## 技術使用

### Frontend

- Vue 3
- Pinia
- Vue Router
- Axios
- TailwindCSS
- PrimeVue

### Backend

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- BackgroundService
- IMemoryCache

### Payment

- LINE Pay
- 綠界金流
- 貨到付款

### Deployment

- Vercel
- Render
- Docker
- Environment Variables
- CORS 設定

---

## 我主要負責的功能

### 1. 購物車功能

- 商品加入購物車
- 商品數量調整
- 商品刪除
- 金額計算
- 使用 Pinia 保存購物車資料
- 使用 Axios 串接後端 API

### 2. 訂單建立流程

- 建立訂單主表
- 建立訂單明細
- 寫入付款交易紀錄
- 處理庫存扣減邏輯
- 回傳訂單與付款相關資訊給前端

### 3. 重複送單處理

- 使用 Idempotency Key 與 IMemoryCache
- 降低使用者重複點擊送出訂單時，造成重複建立訂單的風險

### 4. 逾時未付款訂單處理

- 使用 BackgroundService 定時檢查未付款訂單
- 逾時訂單會執行取消流程
- 訂單取消後回補庫存

### 5. 第三方金流流程

- LINE Pay 付款流程
- 綠界金流付款流程
- 貨到付款流程
- 付款請求、付款確認、付款回呼、訂單付款狀態更新

### 6. 後台訂單與金流管理

- 訂單列表
- 訂單明細查詢
- 訂單狀態更新
- 批次出貨
- 營收統計
- 交易紀錄查詢
- 通訊日誌查詢

---

## 基本流程說明

### 前台結帳流程

1. 使用者將商品加入購物車
2. 前端送出訂單資料
3. 後端建立訂單主表與訂單明細
4. 後端建立付款交易紀錄
5. 根據付款方式導向 LINE Pay、綠界金流或貨到付款流程
6. 付款完成後更新訂單狀態
7. 後台可查詢訂單與金流紀錄

### 逾時訂單流程

1. 使用者建立訂單後未完成付款
2. BackgroundService 定時檢查逾時未付款訂單
3. 系統取消逾時訂單
4. 回補商品庫存
5. 更新訂單狀態

---

## 專案架構概念

本專案以 Controller、Service、Entity Framework Core 與 SQL Server 組成後端資料處理流程。
前端透過 Vue 3 建立畫面，並使用 Axios 與後端 API 溝通。
後端負責訂單建立、付款流程、庫存處理與後台管理資料回傳。

此專案目前以培訓專題與作品展示為主，仍持續補強例外處理、測試、自動化驗證與安全性細節。

---

## 我在專案中學到的內容

- 前後端分離架構下，前端如何透過 API 與後端交換資料
- 訂單主表、訂單明細與付款交易紀錄之間的資料關聯
- 第三方金流付款請求、付款確認與回呼流程
- BackgroundService 在定時任務中的使用方式
- Idempotency Key 在避免重複送單情境中的用途
- Vercel、Render 與 Docker 的基礎部署流程
- 環境變數與 CORS 在前後端分離部署中的基本設定

---

## 專案限制與後續改進方向

此專案為培訓期間完成的團隊專題，仍有可以持續改善的地方：

- 補強單元測試與整合測試
- 增加更完整的錯誤處理
- 補強金流安全驗證細節
- 優化後台操作流程
- 改善部署流程與環境設定文件
- 補充 API 文件與資料表關聯說明
