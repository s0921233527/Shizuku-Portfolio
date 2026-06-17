-- =========================================================================
-- Shizuku 異常訂單與金流安全監控 — 假資料生成腳本
-- 適用資料庫: dbShizukuDemo
-- 目的: 模擬「金流衝突交易」、「惡意高頻鎖單」、「高頻失敗警示」、「高額交易警戒」四種場景。
-- =========================================================================

USE dbShizukuDemo;
GO

BEGIN TRANSACTION;
BEGIN TRY

    -- ---------------------------------------------------------------------
    -- 清理舊的異常測試假資料 (僅清理 ID >= 1100 的假資料)
    -- ---------------------------------------------------------------------
    PRINT '清理舊的異常監控假資料...';
    DELETE FROM tPaymentLogs WHERE fPayment_transactions_id >= 1100;
    DELETE FROM tRefunds WHERE fOrder_id >= 1100;
    DELETE FROM tPaymentTransactions WHERE fId >= 1100 OR fOrder_id >= 1100;
    DELETE FROM tOrderDetails WHERE fOrder_id >= 1100;
    DELETE FROM tOrders WHERE fId >= 1100;

    -- ---------------------------------------------------------------------
    -- 1. 新增訂單資料 (tOrders)
    -- ---------------------------------------------------------------------
    PRINT '正在插入異常監控訂單...';
    SET IDENTITY_INSERT tOrders ON;

    INSERT INTO tOrders (fId, fOrder_no, fMember_id, fTotal_amount, fStatus, fReceiver_name, fReceiver_phone, fReceiver_address, fNote, fCreated_at, fUpdated_at) VALUES
    -- 【金流衝突】: 訂單已取消(5)，但金流成功(1)
    (1100, 'ORD202605269001', 1,  3560.00, 5, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', N'金流衝突測試訂單', DATEADD(MINUTE, -90, GETDATE()), DATEADD(MINUTE, -90, GETDATE())),

    -- 【惡意鎖單行為】: 同一會員 (ID=4) 24 小時內取消超過 3 次
    (1101, 'ORD202605269002', 4,  980.00,  5, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', N'惡意鎖單測試 1', DATEADD(HOUR, -2, GETDATE()), DATEADD(HOUR, -2, GETDATE())),
    (1102, 'ORD202605269003', 4,  1380.00, 5, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', N'惡意鎖單測試 2', DATEADD(HOUR, -3, GETDATE()), DATEADD(HOUR, -3, GETDATE())),
    (1103, 'ORD202605269004', 4,  880.00,  5, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', N'惡意鎖單測試 3', DATEADD(HOUR, -4, GETDATE()), DATEADD(HOUR, -4, GETDATE())),

    -- 【高頻付款失敗】: 同一個訂單 ID (1104) 有 3 次 or 以上付款失敗/未付款 (pt.fStatus = 0)
    (1104, 'ORD202605269005', 8,  1760.00, 1, N'孫小美', '0977888999', N'彰化市中山路二段50號', N'高頻失敗測試訂單', DATEADD(MINUTE, -15, GETDATE()), DATEADD(MINUTE, -15, GETDATE())),

    -- 【高額交易警戒】: 金額 > 50,000 元 (模擬 68,000 元)
    (1105, 'ORD202605269006', 3,  68000.00, 2, N'張嘉豪', '0988888888', N'高雄市前金街24巷6號', N'高額交易警戒測試訂單', DATEADD(MINUTE, -45, GETDATE()), DATEADD(MINUTE, -45, GETDATE()));

    SET IDENTITY_INSERT tOrders OFF;

    -- ---------------------------------------------------------------------
    -- 2. 插入訂單明細資料 (tOrderDetails)
    -- ---------------------------------------------------------------------
    PRINT '正在插入異常明細資料...';
    SET IDENTITY_INSERT tOrderDetails ON;

    INSERT INTO tOrderDetails (fId, fOrder_id, fVariant_id, fProduct_name_snap, fPrice_snap, fQuantity, fSubtotal) VALUES
    -- ORD 1100 (Total: 3560)
    (1100, 1100, 300, N'法式碎花雪紡長洋裝', 1780.00, 2, 3560.00),
    -- ORD 1101 (Total: 980)
    (1101, 1101, 150, N'法式條紋海魂衫', 980.00, 1, 980.00),
    -- ORD 1102 (Total: 1380)
    (1102, 1102, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 1, 1380.00),
    -- ORD 1103 (Total: 880)
    (1103, 1103, 200, N'厚磅純棉素色短袖', 880.00, 1, 880.00),
    -- ORD 1104 (Total: 1760)
    (1104, 1104, 200, N'厚磅純棉素色短袖', 880.00, 2, 1760.00),
    -- ORD 1105 (Total: 68000)
    (1105, 1105, 350, N'韓系落肩西裝外套(批發包裝)', 17000.00, 4, 68000.00);

    SET IDENTITY_INSERT tOrderDetails OFF;

    -- ---------------------------------------------------------------------
    -- 3. 插入金流交易資料 (tPaymentTransactions)
    -- ---------------------------------------------------------------------
    PRINT '正在插入異常交易資料...';
    SET IDENTITY_INSERT tPaymentTransactions ON;

    INSERT INTO tPaymentTransactions (fId, fTransaction_no, fOrder_id, fMember_id, fMethod_id, fAmount, fGateway_trade_no, fStatus, fPaid_at, fCreated_at) VALUES
    -- 【金流衝突】: 交易狀態為 1 (Success)，但訂單狀態為 5 (已取消)
    (1100, 'TXN202605269001', 1100, 1, 1, 3560.00, 'ECPAY20260526900101', 1, DATEADD(MINUTE, -85, GETDATE()), DATEADD(MINUTE, -90, GETDATE())),

    -- 【高頻付款失敗】: 同一個訂單 (1104) 有 3 次或以上付款失敗 (pt.fStatus = 0)
    (1104, 'TXN202605269002', 1104, 8, 2, 1760.00, NULL, 0, NULL, DATEADD(MINUTE, -12, GETDATE())),
    (1105, 'TXN202605269003', 1104, 8, 2, 1760.00, NULL, 0, NULL, DATEADD(MINUTE, -9, GETDATE())),
    (1106, 'TXN202605269004', 1104, 8, 2, 1760.00, NULL, 0, NULL, DATEADD(MINUTE, -6, GETDATE())),

    -- 【高額交易警戒】: 金額 > 50,000 (fAmount = 68000)
    (1107, 'TXN202605269005', 1105, 3, 1, 68000.00, 'ECPAY20260526900601', 1, DATEADD(MINUTE, -40, GETDATE()), DATEADD(MINUTE, -45, GETDATE()));

    SET IDENTITY_INSERT tPaymentTransactions OFF;

    -- ---------------------------------------------------------------------
    -- 4. 插入金流通訊日誌 (tPaymentLogs) - 為高額交易和衝突交易新增日誌
    -- ---------------------------------------------------------------------
    PRINT '正在插入異常日誌記錄...';
    SET IDENTITY_INSERT tPaymentLogs ON;

    INSERT INTO tPaymentLogs (fId, fPayment_transactions_id, fAction_type, fRequest_data, fResponse_data, fCreated_at) VALUES
    -- TXN 1100 (金流衝突 - ECPay)
    (1120, 1100, 'PAYMENT_REQUEST', N'{"MerchantID":"3002607","ChoosePayment":"Credit","TotalAmount":3560,"TradeDesc":"Abnormal Conflict Test"}', N'{"Status":"OK"}', DATEADD(MINUTE, -90, GETDATE())),
    (1121, 1100, 'PAYMENT_CALLBACK', N'{"MerchantTradeNo":"TXN202605269001","RtnCode":1,"RtnMsg":"Succeeded","TradeAmt":3560}', N'{"Status":"Success","Warning":"Order has been cancelled, conflict detected."}', DATEADD(MINUTE, -85, GETDATE())),

    -- TXN 1107 (高額交易 - ECPay)
    (1122, 1107, 'PAYMENT_REQUEST', N'{"MerchantID":"3002607","ChoosePayment":"Credit","TotalAmount":68000,"TradeDesc":"High Amount Wholesale Test"}', N'{"Status":"OK"}', DATEADD(MINUTE, -45, GETDATE())),
    (1123, 1107, 'PAYMENT_CALLBACK', N'{"MerchantTradeNo":"TXN202605269005","RtnCode":1,"RtnMsg":"Succeeded","TradeAmt":68000}', N'{"Status":"Success","Audit":"Flagged for manual review due to high amount."}', DATEADD(MINUTE, -40, GETDATE()));

    SET IDENTITY_INSERT tPaymentLogs OFF;

    COMMIT TRANSACTION;
    PRINT '=========================================================================';
    PRINT ' 恭喜！異常監控與金流安全防護假資料已成功寫入！';
    PRINT '=========================================================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '=========================================================================';
    PRINT ' 錯誤：異常資料寫入失敗！已執行 ROLLBACK。';
    PRINT ' 錯誤訊息: ' + ERROR_MESSAGE();
    PRINT '=========================================================================';
END CATCH;
GO
