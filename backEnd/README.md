# Shizuku 電商平台｜Backend

此資料夾為 Shizuku 電商平台的後端專案，使用 **ASP.NET Core Web API、Entity Framework Core、SQL Server** 建立 API 與資料庫存取流程。

本專案為全端工程師培訓期間完成的團隊專題，後端主要練習 **訂單建立、付款流程、第三方金流串接、逾時訂單處理、後台訂單與金流管理**。

---

## 技術使用

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT
- IMemoryCache
- BackgroundService
- LINE Pay / 綠界金流 / 貨到付款
- Docker

---

## 後端功能

### 訂單與付款

- 建立訂單主表與訂單明細
- 寫入付款交易紀錄
- 處理庫存扣減與回補
- 更新訂單付款狀態
- 串接 LINE Pay、綠界金流與貨到付款流程

### 重複送單與逾時訂單

- Idempotency Key + IMemoryCache：降低重複送出訂單造成重複建立訂單的風險
- BackgroundService：定時檢查逾時未付款訂單，並執行取消訂單與庫存回補流程

### 後台管理

- 訂單列表與明細查詢
- 訂單狀態更新
- 批次出貨
- 營收統計
- 交易紀錄查詢
- 通訊日誌查詢

---

## 核心流程

### 前台結帳流程

1. 前端送出購物車與結帳資料
2. 後端建立訂單主表、訂單明細與付款交易紀錄
3. 依付款方式建立 LINE Pay、綠界金流或貨到付款流程
4. 付款完成後更新訂單付款狀態
5. 後台可查詢訂單與交易紀錄

### 逾時訂單流程

1. 使用者建立訂單後未完成付款
2. BackgroundService 定時檢查逾時未付款訂單
3. 系統取消逾時訂單並回補商品庫存
4. 更新訂單狀態

---

## 本機執行

```bash
dotnet restore
dotnet run
```

---

## 環境設定

請依照實際環境設定：

- Database Connection String
- JWT Secret
- LINE Pay API 設定
- 綠界金流設定

---

## 後續改進方向

- 補充 API 文件
- 補強例外處理與錯誤回應格式
- 補強單元測試與整合測試
- 優化權限控管
- 補強金流安全驗證細節
