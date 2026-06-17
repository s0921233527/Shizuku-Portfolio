-- =========================================================================
-- Shizuku 後台金流與訂單管理系統 — 假資料生成腳本
-- 適用資料庫: dbShizukuDemo
-- 特點: 
-- 1. 使用相對時間 (DATEADD/GETDATE)，無論何時執行皆為最近 30 天的熱騰騰資料。
-- 2. 完整連結 tOrders, tOrderDetails, tPaymentTransactions, tPaymentLogs, tRefunds。
-- 3. 自動適應你現有的會員 ID (1~54) 與商品款式 ID (129~539)。
-- =========================================================================

USE dbShizukuDemo;
GO

-- 啟用交易以確保資料一致性
BEGIN TRANSACTION;
BEGIN TRY

    -- ---------------------------------------------------------------------
    -- 1. 初始化支付方式 (tPaymentMethods)
    -- ---------------------------------------------------------------------
    PRINT '正在初始化支付方式...';
    IF NOT EXISTS (SELECT 1 FROM tPaymentMethods WHERE fId = 1)
    BEGIN
        SET IDENTITY_INSERT tPaymentMethods ON;
        INSERT INTO tPaymentMethods (fId, fMethod_name, fProvider_code, fHandling_fee, fIs_active) VALUES
        (1, N'綠界科技 ECPay (信用卡/金融卡)', 'ECPAY', 0.00, 1),
        (2, N'LINE Pay 行動支付', 'LINEPAY', 0.00, 1),
        (3, N'貨到付款 (COD)', 'COD', 30.00, 1);
        SET IDENTITY_INSERT tPaymentMethods OFF;
        PRINT '-> 已成功新增 ECPay、LinePay、COD 付款方式。';
    END
    ELSE
    BEGIN
        PRINT '-> 付款方式已存在，跳過。';
    END

    -- ---------------------------------------------------------------------
    -- 清理舊的測試假資料 (僅清理 ID >= 1000 的假資料，避免破壞你原本的資料)
    -- ---------------------------------------------------------------------
    PRINT '清理舊的假資料紀錄...';
    DELETE FROM tPaymentLogs WHERE fPayment_transactions_id >= 1000;
    DELETE FROM tRefunds WHERE fId >= 1000;
    DELETE FROM tPaymentTransactions WHERE fId >= 1000;
    DELETE FROM tOrderDetails WHERE fOrder_id >= 1000;
    DELETE FROM tOrders WHERE fId >= 1000;

    -- ---------------------------------------------------------------------
    -- 2. 插入訂單資料 (tOrders)
    -- 欄位: fId, fOrder_no, fMember_id, fTotal_amount, fStatus, fReceiver_name, 
    --       fReceiver_phone, fReceiver_address, fNote, fCreated_at, fUpdated_at
    -- 狀態定義 (EOrderStatus):
    --   1: Pending (待付款), 2: Paid (已付款/待出貨), 3: Shipping (出貨中),
    --   4: Delivered (已送達), 5: Cancelled (已取消), 6: PendingRefund (待退款), 7: Refunded (已退款)
    -- ---------------------------------------------------------------------
    PRINT '正在插入訂單主表資料...';
    SET IDENTITY_INSERT tOrders ON;

    -- 我們生成 40 筆具有代表性的訂單，ID 從 1000 到 1039
    -- 會員 ID 採用隨機分配 (1, 3, 4, 8, 9, 12, 15, 20 等現有 ID)
    -- 日期分佈在過去 30 天內
    INSERT INTO tOrders (fId, fOrder_no, fMember_id, fTotal_amount, fStatus, fReceiver_name, fReceiver_phone, fReceiver_address, fNote, fCreated_at, fUpdated_at) VALUES
    -- === 待付款 (Pending = 1) ===
    (1000, 'ORD202605260001', 1,  2660.00, 1, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', N'請於抵達前電話聯絡', DATEADD(MINUTE, -30, GETDATE()), DATEADD(MINUTE, -30, GETDATE())),
    (1001, 'ORD202605260002', 3,  1960.00, 1, N'張嘉豪', '0988888888', N'高雄市前金街24巷6號', NULL, DATEADD(HOUR, -2, GETDATE()), DATEADD(HOUR, -2, GETDATE())),
    (1002, 'ORD202605250001', 4,  1380.00, 1, N'張雅婷', '0910049380', N'高雄市苓雅區四維三路2號', N'放管理室管理員代收即可', DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -1, GETDATE())),
    (1003, 'ORD202605250002', 8,  3560.00, 1, N'徐若芸', '0910098760', N'台北市信義區忠孝東路五段100號', NULL, DATEADD(DAY, -1, DATEADD(HOUR, -5, GETDATE())), DATEADD(DAY, -1, DATEADD(HOUR, -5, GETDATE()))),
    (1004, 'ORD202605240001', 9,  880.00,  1, N'黃文宏', '0910111105', N'新北市板橋區縣民大道二段7號', NULL, DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, -2, GETDATE())),

    -- === 已付款 / 待出貨 (Paid = 2) ===
    (1005, 'ORD202605240002', 1,  3360.00, 2, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', NULL, DATEADD(DAY, -2, DATEADD(HOUR, -8, GETDATE())), DATEADD(DAY, -2, DATEADD(HOUR, -8, GETDATE()))),
    (1006, 'ORD202605230001', 3,  1780.00, 2, N'陳志明', '0922333444', N'台中市西屯區台灣大道三段99號', N'送禮用，請勿放明細', DATEADD(DAY, -3, GETDATE()), DATEADD(DAY, -3, GETDATE())),
    (1007, 'ORD202605230002', 4,  2760.00, 2, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', NULL, DATEADD(DAY, -3, DATEADD(HOUR, -4, GETDATE())), DATEADD(DAY, -3, DATEADD(HOUR, -4, GETDATE()))),
    (1008, 'ORD202605220001', 8,  4340.00, 2, N'孫小美', '0977888999', N'彰化市中山路二段50號', NULL, DATEADD(DAY, -4, GETDATE()), DATEADD(DAY, -4, GETDATE())),
    (1009, 'ORD202605220002', 9,  1980.00, 2, N'黃文宏', '0910111105', N'新北市板橋區縣民大道二段7號', NULL, DATEADD(DAY, -4, DATEADD(HOUR, -10, GETDATE())), DATEADD(DAY, -4, DATEADD(HOUR, -10, GETDATE()))),
    (1010, 'ORD202605210001', 1,  1580.00, 2, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', N'警衛代收', DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -5, GETDATE())),

    -- === 出貨中 (Shipping = 3) ===
    (1011, 'ORD202605200001', 3,  5340.00, 3, N'張嘉豪', '0988888888', N'高雄市前金街24巷6號', NULL, DATEADD(DAY, -6, GETDATE()), DATEADD(DAY, -6, GETDATE())),
    (1012, 'ORD202605200002', 4,  3160.00, 3, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', NULL, DATEADD(DAY, -6, DATEADD(HOUR, -3, GETDATE())), DATEADD(DAY, -5, GETDATE())),
    (1013, 'ORD202605190001', 8,  980.00,  3, N'徐若芸', '0910098760', N'台北市信義區忠孝東路五段100號', NULL, DATEADD(DAY, -7, GETDATE()), DATEADD(DAY, -6, GETDATE())),
    (1014, 'ORD202605180001', 9,  2260.00, 3, N'周杰倫', '0910111222', N'屏東市民族路120號', NULL, DATEADD(DAY, -8, GETDATE()), DATEADD(DAY, -7, GETDATE())),
    (1015, 'ORD202605170001', 1,  2760.00, 3, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', NULL, DATEADD(DAY, -9, GETDATE()), DATEADD(DAY, -8, GETDATE())),

    -- === 已送達 (Delivered = 4) ===
    (1016, 'ORD202605160001', 3,  1760.00, 4, N'張嘉豪', '0988888888', N'高雄市前金街24巷6號', NULL, DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, -8, GETDATE())),
    (1017, 'ORD202605150001', 4,  1380.00, 4, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', NULL, DATEADD(DAY, -11, GETDATE()), DATEADD(DAY, -9, GETDATE())),
    (1018, 'ORD202605140001', 8,  5340.00, 4, N'孫小美', '0977888999', N'彰化市中山路二段50號', N'包裝請完整', DATEADD(DAY, -12, GETDATE()), DATEADD(DAY, -10, GETDATE())),
    (1019, 'ORD202605130001', 9,  1980.00, 4, N'黃文宏', '0910111105', N'新北市板橋區縣民大道二段7號', NULL, DATEADD(DAY, -13, GETDATE()), DATEADD(DAY, -11, GETDATE())),
    (1020, 'ORD202605120001', 1,  3560.00, 4, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', NULL, DATEADD(DAY, -14, GETDATE()), DATEADD(DAY, -12, GETDATE())),
    (1021, 'ORD202605110001', 3,  2360.00, 4, N'陳志明', '0922333444', N'台中市西屯區台灣大道三段99號', NULL, DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -13, GETDATE())),
    (1022, 'ORD202605100001', 4,  880.00,  4, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', NULL, DATEADD(DAY, -16, GETDATE()), DATEADD(DAY, -14, GETDATE())),
    (1023, 'ORD202605090001', 8,  4340.00, 4, N'徐若芸', '0910098760', N'台北市信義區忠孝東路五段100號', NULL, DATEADD(DAY, -17, GETDATE()), DATEADD(DAY, -15, GETDATE())),
    (1024, 'ORD202605080001', 9,  1580.00, 4, N'周杰倫', '0910111222', N'屏東市民族路120號', NULL, DATEADD(DAY, -18, GETDATE()), DATEADD(DAY, -16, GETDATE())),
    (1025, 'ORD202605070001', 1,  2760.00, 4, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', NULL, DATEADD(DAY, -19, GETDATE()), DATEADD(DAY, -17, GETDATE())),
    (1026, 'ORD202605060001', 3,  3360.00, 4, N'張嘉豪', '0988888888', N'高雄市前金街24巷6號', NULL, DATEADD(DAY, -20, GETDATE()), DATEADD(DAY, -18, GETDATE())),
    (1027, 'ORD202605050001', 4,  1780.00, 4, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', NULL, DATEADD(DAY, -21, GETDATE()), DATEADD(DAY, -19, GETDATE())),
    (1028, 'ORD202605040001', 8,  980.00,  4, N'孫小美', '0977888999', N'彰化市中山路二段50號', NULL, DATEADD(DAY, -22, GETDATE()), DATEADD(DAY, -20, GETDATE())),
    (1029, 'ORD202605030001', 9,  2260.00, 4, N'黃文宏', '0910111105', N'新北市板橋區縣民大道二段7號', NULL, DATEADD(DAY, -23, GETDATE()), DATEADD(DAY, -21, GETDATE())),
    (1030, 'ORD202605020001', 1,  1380.00, 4, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', NULL, DATEADD(DAY, -24, GETDATE()), DATEADD(DAY, -22, GETDATE())),

    -- === 已取消 (Cancelled = 5) ===
    (1031, 'ORD202605010001', 3,  1960.00, 5, N'張嘉豪', '0988888888', N'高雄市前金街24巷6號', N'買錯尺寸，申請取消', DATEADD(DAY, -25, GETDATE()), DATEADD(DAY, -25, GETDATE())),
    (1032, 'ORD202604300001', 4,  880.00,  5, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', N'不想買了', DATEADD(DAY, -26, GETDATE()), DATEADD(DAY, -26, GETDATE())),
    (1033, 'ORD202604290001', 8,  1780.00, 5, N'徐若芸', '0910098760', N'台北市信義區忠孝東路五段100號', NULL, DATEADD(DAY, -27, GETDATE()), DATEADD(DAY, -27, GETDATE())),

    -- === 待退款 (PendingRefund = 6) ===
    (1034, 'ORD202604280001', 9,  1980.00, 6, N'黃文宏', '0910111105', N'新北市板橋區縣民大道二段7號', N'衣服發現重大瑕疵瑕疵，要求退貨退款', DATEADD(DAY, -28, GETDATE()), DATEADD(DAY, -25, GETDATE())),
    (1035, 'ORD202604270001', 1,  1580.00, 6, N'李哲毅', '0955555555', N'台北市大安區忠孝東路四段218號5樓', N'寄錯商品，已寄回', DATEADD(DAY, -29, GETDATE()), DATEADD(DAY, -26, GETDATE())),
    (1036, 'ORD202604260001', 3,  3560.00, 6, N'張嘉豪', '0988888888', N'高雄市前金街24巷6號', N'家人重覆購買', DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, -27, GETDATE())),

    -- === 已退款 (Refunded = 7) ===
    (1037, 'ORD202604250001', 4,  2760.00, 7, N'張雅婷', '0933444555', N'高雄市苓雅區四維三路2號', N'收到破損，已退款成功', DATEADD(DAY, -31, GETDATE()), DATEADD(DAY, -28, GETDATE())),
    (1038, 'ORD202604240001', 8,  2260.00, 7, N'孫小美', '0977888999', N'彰化市中山路二段50號', N'尺寸太大退貨', DATEADD(DAY, -32, GETDATE()), DATEADD(DAY, -29, GETDATE())),
    (1039, 'ORD202604230001', 9,  1380.00, 7, N'黃文宏', '0910111105', N'新北市板橋區縣民大道二段7號', N'不合身退貨', DATEADD(DAY, -33, GETDATE()), DATEADD(DAY, -30, GETDATE()));

    SET IDENTITY_INSERT tOrders OFF;
    PRINT '-> 已成功新增 40 筆模擬訂單主表紀錄！';

    -- ---------------------------------------------------------------------
    -- 3. 插入訂單明細資料 (tOrderDetails)
    -- 欄位: fId, fOrder_id, fVariant_id, fProduct_name_snap, fPrice_snap, fQuantity, fSubtotal
    -- ---------------------------------------------------------------------
    PRINT '正在插入訂單明細資料...';
    SET IDENTITY_INSERT tOrderDetails ON;

    INSERT INTO tOrderDetails (fId, fOrder_id, fVariant_id, fProduct_name_snap, fPrice_snap, fQuantity, fSubtotal) VALUES
    -- 1000 (Total: 2660)
    (1000, 1000, 129, N'日系透膚輕薄針織衫', 890.00, 1, 890.00),
    (1001, 1000, 300, N'法式碎花雪紡長洋裝', 1780.00, 1, 1780.00),
    -- 1001 (Total: 1960)
    (1002, 1001, 150, N'法式條紋海魂衫', 980.00, 2, 1960.00),
    -- 1002 (Total: 1380)
    (1003, 1002, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 1, 1380.00),
    -- 1003 (Total: 3560)
    (1004, 1003, 300, N'法式碎花雪紡長洋裝', 1780.00, 2, 3560.00),
    -- 1004 (Total: 880)
    (1005, 1004, 200, N'厚磅純棉素色短袖', 880.00, 1, 880.00),
    -- 1005 (Total: 3360)
    (1006, 1005, 500, N'韓系收腰西裝短洋裝', 1680.00, 2, 3360.00),
    -- 1006 (Total: 1780)
    (1007, 1006, 300, N'法式碎花雪紡長洋裝', 1780.00, 1, 1780.00),
    -- 1007 (Total: 2760)
    (1008, 1007, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 2, 2760.00),
    -- 1008 (Total: 4340)
    (1009, 1008, 350, N'韓系落肩西裝外套', 1980.00, 2, 3960.00),
    (1010, 1008, 200, N'厚磅純棉素色短袖', 380.00, 1, 380.00),
    -- 1009 (Total: 1980)
    (1011, 1009, 400, N'細肩帶緞面長洋裝', 1980.00, 1, 1980.00),
    -- 1010 (Total: 1580)
    (1012, 1010, 530, N'通勤大容量托特包', 1580.00, 1, 1580.00),
    -- 1011 (Total: 5340)
    (1013, 1011, 350, N'韓系落肩西裝外套', 1980.00, 2, 3960.00),
    (1014, 1011, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 1, 1380.00),
    -- 1012 (Total: 3160)
    (1015, 1012, 530, N'通勤大容量托特包', 1580.00, 2, 3160.00),
    -- 1013 (Total: 980)
    (1016, 1013, 150, N'法式條紋海魂衫', 980.00, 1, 980.00),
    -- 1014 (Total: 2260)
    (1017, 1014, 450, N'高腰垂墜西裝寬褲', 1380.00, 1, 1380.00),
    (1018, 1014, 200, N'厚磅純棉素色短袖', 880.00, 1, 880.00),
    -- 1015 (Total: 2760)
    (1019, 1015, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 2, 2760.00),
    -- 1016 (Total: 1760)
    (1020, 1016, 200, N'厚磅純棉素色短袖', 880.00, 2, 1760.00),
    -- 1017 (Total: 1380)
    (1021, 1017, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 1, 1380.00),
    -- 1018 (Total: 5340)
    (1022, 1018, 350, N'韓系落肩西裝外套', 1980.00, 2, 3960.00),
    (1023, 1018, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 1, 1380.00),
    -- 1019 (Total: 1980)
    (1024, 1019, 400, N'細肩帶緞面長洋裝', 1980.00, 1, 1980.00),
    -- 1020 (Total: 3560)
    (1025, 1020, 300, N'法式碎花雪紡長洋裝', 1780.00, 2, 3560.00),
    -- 1021 (Total: 2360)
    (1026, 1021, 450, N'高腰垂墜西裝寬褲', 1380.00, 1, 1380.00),
    (1027, 1021, 150, N'法式條紋海魂衫', 980.00, 1, 980.00),
    -- 1022 (Total: 880)
    (1028, 1022, 200, N'厚磅純棉素色短袖', 880.00, 1, 880.00),
    -- 1023 (Total: 4340)
    (1029, 1023, 350, N'韓系落肩西裝外套', 1980.00, 2, 3960.00),
    (1030, 1023, 200, N'厚磅純棉素色短袖', 380.00, 1, 380.00),
    -- 1024 (Total: 1580)
    (1031, 1024, 530, N'通勤大容量托特包', 1580.00, 1, 1580.00),
    -- 1025 (Total: 2760)
    (1032, 1025, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 2, 2760.00),
    -- 1026 (Total: 3360)
    (1033, 1026, 500, N'韓系收腰西裝短洋裝', 1680.00, 2, 3360.00),
    -- 1027 (Total: 1780)
    (1034, 1027, 300, N'法式碎花雪紡長洋裝', 1780.00, 1, 1780.00),
    -- 1028 (Total: 980)
    (1035, 1028, 150, N'法式條紋海魂衫', 980.00, 1, 980.00),
    -- 1029 (Total: 2260)
    (1036, 1029, 450, N'高腰垂墜西裝寬褲', 1380.00, 1, 1380.00),
    (1037, 1029, 200, N'厚磅純棉素色短袖', 880.00, 1, 880.00),
    -- 1030 (Total: 1380)
    (1038, 1030, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 1, 1380.00),
    -- 1031 (Total: 1960)
    (1039, 1031, 150, N'法式條紋海魂衫', 980.00, 2, 1960.00),
    -- 1032 (Total: 880)
    (1040, 1032, 200, N'厚磅純棉素色短袖', 880.00, 1, 880.00),
    -- 1033 (Total: 1780)
    (1041, 1033, 300, N'法式碎花雪紡長洋裝', 1780.00, 1, 1780.00),
    -- 1034 (Total: 1980)
    (1042, 1034, 400, N'細肩帶緞面長洋裝', 1980.00, 1, 1980.00),
    -- 1035 (Total: 1580)
    (1043, 1035, 530, N'通勤大容量托特包', 1580.00, 1, 1580.00),
    -- 1036 (Total: 3560)
    (1044, 1036, 300, N'法式碎花雪紡長洋裝', 1780.00, 2, 3560.00),
    -- 1037 (Total: 2760)
    (1045, 1037, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 2, 2760.00),
    -- 1038 (Total: 2260)
    (1046, 1038, 450, N'高腰垂墜西裝寬褲', 1380.00, 1, 1380.00),
    (1047, 1038, 200, N'厚磅純棉素色短袖', 880.00, 1, 880.00),
    -- 1039 (Total: 1380)
    (1048, 1039, 250, N'復古宮廷泡泡袖襯衫', 1380.00, 1, 1380.00);

    SET IDENTITY_INSERT tOrderDetails OFF;
    PRINT '-> 已成功新增所有訂單明細紀錄！';

    -- ---------------------------------------------------------------------
    -- 4. 插入金流交易主表 (tPaymentTransactions)
    -- 欄位: fId, fTransaction_no, fOrder_id, fMember_id, fMethod_id, fAmount, fGateway_trade_no, fStatus, fPaid_at, fCreated_at
    -- fStatus: 0: Unpaid (未付款), 1: Success (成功), 2: Failed (失敗), 3: Refunded (已退款)
    -- ---------------------------------------------------------------------
    PRINT '正在插入金流交易主表資料...';
    SET IDENTITY_INSERT tPaymentTransactions ON;

    -- 除了 Pending(1000-1004) 與 Cancelled(1031-1033) 外，其他皆有交易紀錄。
    INSERT INTO tPaymentTransactions (fId, fTransaction_no, fOrder_id, fMember_id, fMethod_id, fAmount, fGateway_trade_no, fStatus, fPaid_at, fCreated_at) VALUES
    -- === 成功交易 (Status = 1) ===
    (1005, 'TXN202605240005', 1005, 1, 1, 3360.00, 'ECPAY20260524103945', 1, DATEADD(MINUTE, 5, DATEADD(DAY, -2, DATEADD(HOUR, -8, GETDATE()))), DATEADD(DAY, -2, DATEADD(HOUR, -8, GETDATE()))),
    (1006, 'TXN202605230006', 1006, 3, 2, 1780.00, 'LPAY20260523120155',  1, DATEADD(MINUTE, 3, DATEADD(DAY, -3, GETDATE())), DATEADD(DAY, -3, GETDATE())),
    (1007, 'TXN202605230007', 1007, 4, 1, 2760.00, 'ECPAY20260523164402', 1, DATEADD(MINUTE, 4, DATEADD(DAY, -3, DATEADD(HOUR, -4, GETDATE()))), DATEADD(DAY, -3, DATEADD(HOUR, -4, GETDATE()))),
    (1008, 'TXN202605220008', 1008, 8, 2, 4340.00, 'LPAY20260522091234',  1, DATEADD(MINUTE, 2, DATEADD(DAY, -4, GETDATE())), DATEADD(DAY, -4, GETDATE())),
    (1009, 'TXN202605220009', 1009, 9, 1, 1980.00, 'ECPAY20260522104512', 1, DATEADD(MINUTE, 6, DATEADD(DAY, -4, DATEADD(HOUR, -10, GETDATE()))), DATEADD(DAY, -4, DATEADD(HOUR, -10, GETDATE()))),
    (1010, 'TXN202605210010', 1010, 1, 2, 1580.00, 'LPAY20260521151240',  1, DATEADD(MINUTE, 3, DATEADD(DAY, -5, GETDATE())), DATEADD(DAY, -5, GETDATE())),
    (1011, 'TXN202605200011', 1011, 3, 1, 5340.00, 'ECPAY20260520110456', 1, DATEADD(MINUTE, 8, DATEADD(DAY, -6, GETDATE())), DATEADD(DAY, -6, GETDATE())),
    (1012, 'TXN202605200012', 1012, 4, 2, 3160.00, 'LPAY20260520140239',  1, DATEADD(MINUTE, 2, DATEADD(DAY, -6, DATEADD(HOUR, -3, GETDATE()))), DATEADD(DAY, -6, DATEADD(HOUR, -3, GETDATE()))),
    (1013, 'TXN202605190013', 1013, 8, 3, 980.00,  NULL,                  1, DATEADD(DAY, 1, DATEADD(DAY, -7, GETDATE())), DATEADD(DAY, -7, GETDATE())), -- COD 貨到付款 (在送達日收款)
    (1014, 'TXN202605180014', 1014, 9, 1, 2260.00, 'ECPAY20260518084530', 1, DATEADD(MINUTE, 4, DATEADD(DAY, -8, GETDATE())), DATEADD(DAY, -8, GETDATE())),
    (1015, 'TXN202605170015', 1015, 1, 2, 2760.00, 'LPAY20260517173000',  1, DATEADD(MINUTE, 3, DATEADD(DAY, -9, GETDATE())), DATEADD(DAY, -9, GETDATE())),
    (1016, 'TXN202605160016', 1016, 3, 1, 1760.00, 'ECPAY20260516102211', 1, DATEADD(MINUTE, 5, DATEADD(DAY, -10, GETDATE())), DATEADD(DAY, -10, GETDATE())),
    (1017, 'TXN202605150017', 1017, 4, 2, 1380.00, 'LPAY20260515152200',  1, DATEADD(MINUTE, 2, DATEADD(DAY, -11, GETDATE())), DATEADD(DAY, -11, GETDATE())),
    (1018, 'TXN202605140018', 1018, 8, 1, 5340.00, 'ECPAY20260514120340', 1, DATEADD(MINUTE, 7, DATEADD(DAY, -12, GETDATE())), DATEADD(DAY, -12, GETDATE())),
    (1019, 'TXN202605130019', 1019, 9, 2, 1980.00, 'LPAY20260513094015',  1, DATEADD(MINUTE, 3, DATEADD(DAY, -13, GETDATE())), DATEADD(DAY, -13, GETDATE())),
    (1020, 'TXN202605120020', 1020, 1, 1, 3560.00, 'ECPAY20260512140510', 1, DATEADD(MINUTE, 5, DATEADD(DAY, -14, GETDATE())), DATEADD(DAY, -14, GETDATE())),
    (1021, 'TXN202605110021', 1021, 3, 3, 2360.00, NULL,                  1, DATEADD(DAY, 2, DATEADD(DAY, -15, GETDATE())), DATEADD(DAY, -15, GETDATE())), -- COD
    (1022, 'TXN202605100022', 1022, 4, 1, 880.00,  'ECPAY20260510090212', 1, DATEADD(MINUTE, 4, DATEADD(DAY, -16, GETDATE())), DATEADD(DAY, -16, GETDATE())),
    (1023, 'TXN202605090023', 1023, 8, 2, 4340.00, 'LPAY20260509170240',  1, DATEADD(MINUTE, 2, DATEADD(DAY, -17, GETDATE())), DATEADD(DAY, -17, GETDATE())),
    (1024, 'TXN202605080024', 1024, 9, 1, 1580.00, 'ECPAY20260508131245', 1, DATEADD(MINUTE, 6, DATEADD(DAY, -18, GETDATE())), DATEADD(DAY, -18, GETDATE())),
    (1025, 'TXN202605070025', 1025, 1, 2, 2760.00, 'LPAY20260507110930',  1, DATEADD(MINUTE, 3, DATEADD(DAY, -19, GETDATE())), DATEADD(DAY, -19, GETDATE())),
    (1026, 'TXN202605060026', 1026, 3, 1, 3360.00, 'ECPAY20260506161205', 1, DATEADD(MINUTE, 5, DATEADD(DAY, -20, GETDATE())), DATEADD(DAY, -20, GETDATE())),
    (1027, 'TXN202605050027', 1027, 4, 2, 1780.00, 'LPAY20260505141010',  1, DATEADD(MINUTE, 2, DATEADD(DAY, -21, GETDATE())), DATEADD(DAY, -21, GETDATE())),
    (1028, 'TXN202605040028', 1028, 8, 3, 980.00,  NULL,                  1, DATEADD(DAY, 2, DATEADD(DAY, -22, GETDATE())), DATEADD(DAY, -22, GETDATE())), -- COD
    (1029, 'TXN202605030029', 1029, 9, 1, 2260.00, 'ECPAY20260503112040', 1, DATEADD(MINUTE, 4, DATEADD(DAY, -23, GETDATE())), DATEADD(DAY, -23, GETDATE())),
    (1030, 'TXN202605020030', 1030, 1, 2, 1380.00, 'LPAY20260502100410',  1, DATEADD(MINUTE, 3, DATEADD(DAY, -24, GETDATE())), DATEADD(DAY, -24, GETDATE())),

    -- === 待退款交易 (Status = 1，訂單端將退款) ===
    (1034, 'TXN202604280034', 1034, 9, 1, 1980.00, 'ECPAY20260428140210', 1, DATEADD(MINUTE, 5, DATEADD(DAY, -28, GETDATE())), DATEADD(DAY, -28, GETDATE())),
    (1035, 'TXN202604270035', 1035, 1, 2, 1580.00, 'LPAY20260427103245',  1, DATEADD(MINUTE, 3, DATEADD(DAY, -29, GETDATE())), DATEADD(DAY, -29, GETDATE())),
    (1036, 'TXN202604260036', 1036, 3, 1, 3560.00, 'ECPAY20260426110305', 1, DATEADD(MINUTE, 4, DATEADD(DAY, -30, GETDATE())), DATEADD(DAY, -30, GETDATE())),

    -- === 已退款交易 (Status = 3) ===
    (1037, 'TXN202604250037', 1037, 4, 1, 2760.00, 'ECPAY20260425091210', 3, DATEADD(MINUTE, 6, DATEADD(DAY, -31, GETDATE())), DATEADD(DAY, -31, GETDATE())),
    (1038, 'TXN202604240038', 1038, 8, 2, 2260.00, 'LPAY20260424151240',  3, DATEADD(MINUTE, 3, DATEADD(DAY, -32, GETDATE())), DATEADD(DAY, -32, GETDATE())),
    (1039, 'TXN202604230039', 1039, 9, 1, 1380.00, 'ECPAY20260423100502', 3, DATEADD(MINUTE, 5, DATEADD(DAY, -33, GETDATE())), DATEADD(DAY, -33, GETDATE()));

    SET IDENTITY_INSERT tPaymentTransactions OFF;
    PRINT '-> 已成功新增 32 筆金流交易紀錄！';

    -- ---------------------------------------------------------------------
    -- 5. 插入金流通訊日誌 (tPaymentLogs)
    -- 欄位: fId, fPayment_transactions_id, fAction_type, fRequest_data, fResponse_data, fCreated_at
    -- 這裡我們為每筆 ECPay / LINE Pay 交易生成 1~2 筆通訊記錄，提供豐富的 log 供前端查詢。
    -- ---------------------------------------------------------------------
    PRINT '正在插入金流通訊日誌 (API Logs)...';
    SET IDENTITY_INSERT tPaymentLogs ON;

    -- 透過模擬真實的 ECPay & LinePay JSON payload，讓通訊日誌表格呈現出極具專業感的 Raw Data。
    INSERT INTO tPaymentLogs (fId, fPayment_transactions_id, fAction_type, fRequest_data, fResponse_data, fCreated_at) VALUES
    -- TXN 1005 (ECPay)
    (1000, 1005, 'PAYMENT_REQUEST', N'{"MerchantID":"3002607","ChoosePayment":"Credit","TotalAmount":3360,"TradeDesc":"Shizuku Order 1005"}', N'{"Status":"OK","Html":"<form id=''ecpay'' action=''https://payment-stage.ecpay.com.tw''></form>"}', DATEADD(MINUTE, -2, DATEADD(DAY, -2, DATEADD(HOUR, -8, GETDATE())))),
    (1001, 1005, 'PAYMENT_CALLBACK', N'{"MerchantID":"3002607","MerchantTradeNo":"TXN202605240005","RtnCode":1,"RtnMsg":"Succeeded","TradeAmt":3360}', N'{"Status":"Success","Handled":true}', DATEADD(MINUTE, 5, DATEADD(DAY, -2, DATEADD(HOUR, -8, GETDATE())))),

    -- TXN 1006 (LinePay)
    (1002, 1006, 'PAYMENT_REQUEST', N'{"amount":1780,"currency":"TWD","orderId":"ORD202605230001","packages":[{"id":"pack_1","amount":1780,"products":[{"name":"法式碎花雪紡長洋裝","quantity":1,"price":1780}]}]}', N'{"returnCode":"0000","returnMessage":"Success","info":{"paymentUrl":{"web":"https://sandbox-web-pay.line.me"},"transactionId":202605230099}}', DATEADD(MINUTE, -1, DATEADD(DAY, -3, GETDATE()))),
    (1003, 1006, 'PAYMENT_CALLBACK', N'{"transactionId":202605230099,"amount":1780}', N'{"returnCode":"0000","returnMessage":"Success"}', DATEADD(MINUTE, 3, DATEADD(DAY, -3, GETDATE()))),

    -- TXN 1007 (ECPay)
    (1004, 1007, 'PAYMENT_REQUEST', N'{"MerchantID":"3002607","ChoosePayment":"Credit","TotalAmount":2760}', N'{"Status":"OK"}', DATEADD(MINUTE, -3, DATEADD(DAY, -3, DATEADD(HOUR, -4, GETDATE())))),
    (1005, 1007, 'PAYMENT_CALLBACK', N'{"MerchantTradeNo":"TXN202605230007","RtnCode":1,"RtnMsg":"Succeeded"}', N'{"Status":"Success"}', DATEADD(MINUTE, 4, DATEADD(DAY, -3, DATEADD(HOUR, -4, GETDATE())))),

    -- TXN 1008 (LinePay)
    (1006, 1008, 'PAYMENT_REQUEST', N'{"amount":4340,"orderId":"ORD202605220001"}', N'{"returnCode":"0000","info":{"transactionId":202605220088}}', DATEADD(MINUTE, -2, DATEADD(DAY, -4, GETDATE()))),
    (1007, 1008, 'PAYMENT_CALLBACK', N'{"transactionId":202605220088,"amount":4340}', N'{"returnCode":"0000"}', DATEADD(MINUTE, 2, DATEADD(DAY, -4, GETDATE()))),

    -- TXN 1037 (已退款 - ECPay)
    (1008, 1037, 'PAYMENT_CALLBACK', N'{"MerchantTradeNo":"TXN202604250037","RtnCode":1,"TradeAmt":2760}', N'{"Status":"Success"}', DATEADD(MINUTE, 6, DATEADD(DAY, -31, GETDATE()))),
    (1009, 1037, 'REFUND_REQUEST', N'{"MerchantID":"3002607","MerchantTradeNo":"TXN202604250037","RefundAmount":2760,"Reason":"收到破損，已退款成功"}', N'{"Status":"OK","RefundStatus":"Success"}', DATEADD(DAY, 3, DATEADD(DAY, -31, GETDATE()))),

    -- TXN 1038 (已退款 - LinePay)
    (1010, 1038, 'PAYMENT_CALLBACK', N'{"transactionId":202604240099,"amount":2260}', N'{"returnCode":"0000"}', DATEADD(MINUTE, 3, DATEADD(DAY, -32, GETDATE()))),
    (1011, 1038, 'REFUND_REQUEST', N'{"refundAmount":2260,"reason":"尺寸太大退貨"}', N'{"returnCode":"0000","returnMessage":"Refund Success"}', DATEADD(DAY, 3, DATEADD(DAY, -32, GETDATE())));

    SET IDENTITY_INSERT tPaymentLogs OFF;
    PRINT '-> 已成功新增所有金流通訊日誌紀錄！';

    -- ---------------------------------------------------------------------
    -- 6. 插入退款紀錄 (tRefunds)
    -- 欄位: fId, fRefund_no, fTransaction_id, fOrder_id, fMember_id, fRefund_amount, fReason, fStatus, fProcessed_at
    -- fStatus: 0: 待處理 (Pending), 1: 已同意退款 (Approved), 2: 拒絕退款 (Rejected)
    -- ---------------------------------------------------------------------
    PRINT '正在插入退款紀錄 (tRefunds)...';
    SET IDENTITY_INSERT tRefunds ON;

    -- 對應 PendingRefund (1034-1036) 為待處理 (Status = 0)
    -- 對應 Refunded (1037-1039) 為已退款成功 (Status = 1)
    INSERT INTO tRefunds (fId, fRefund_no, fTransaction_id, fOrder_id, fMember_id, fRefund_amount, fReason, fStatus, fProcessed_at) VALUES
    -- 待處理 (Status = 0)
    (1000, 'REF202605260001', 1034, 1034, 9, 1980.00, N'衣服發現重大瑕疵，要求退貨退款', 0, NULL),
    (1001, 'REF202605260002', 1035, 1035, 1, 1580.00, N'寄錯商品，已寄回', 0, NULL),
    (1002, 'REF202605260003', 1036, 1036, 3, 3560.00, N'家人重覆購買', 0, NULL),

    -- 已退款 (Status = 1)
    (1003, 'REF202605220001', 1037, 1037, 4, 2760.00, N'收到破損，已退款成功', 1, DATEADD(DAY, 3, DATEADD(DAY, -31, GETDATE()))),
    (1004, 'REF202605210001', 1038, 1038, 8, 2260.00, N'尺寸太大退貨', 1, DATEADD(DAY, 3, DATEADD(DAY, -32, GETDATE()))),
    (1005, 'REF202605200001', 1039, 1039, 9, 1380.00, N'不合身退貨', 1, DATEADD(DAY, 3, DATEADD(DAY, -33, GETDATE())));

    SET IDENTITY_INSERT tRefunds OFF;
    PRINT '-> 已成功新增所有退款紀錄！';

    -- ---------------------------------------------------------------------
    -- 提交交易
    -- ---------------------------------------------------------------------
    COMMIT TRANSACTION;
    PRINT '=========================================================================';
    PRINT ' 恭喜！所有訂單管理與金流管理假資料已成功寫入！';
    PRINT ' 假資料 ID 均大於等於 1000，方便後續識別與管理。';
    PRINT '=========================================================================';

END TRY
BEGIN CATCH
    -- 發生錯誤，回滾交易
    ROLLBACK TRANSACTION;
    PRINT '=========================================================================';
    PRINT ' 錯誤：假資料寫入失敗！已執行 ROLLBACK。';
    PRINT ' 錯誤訊息: ' + ERROR_MESSAGE();
    PRINT ' 錯誤行數: ' + CAST(ERROR_LINE() as VARCHAR);
    PRINT '=========================================================================';
END CATCH;
GO
