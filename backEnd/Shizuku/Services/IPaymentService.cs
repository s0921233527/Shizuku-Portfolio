using System.Collections.Generic;
using Shizuku.DTOs;

namespace Shizuku.Services
{
    public interface IPaymentService
    {
        // 產生給前端導向的付款連結
        Task<string> GeneratePaymentUrlAsync(string orderNo, decimal totalAmount, bool isMobile = false);
        
        // 產生綠界等需要 auto-submit 的 HTML 表單 (不需要的就回傳空字串)
        Task<string> GenerateHtmlFormAsync(string orderNo);

        // 金流退款接口 (LINE Pay 為真實沙盒退款，ECPay / COD 為模擬退款)
        Task<ApiResponse<object>> RefundAsync(string orderNo, decimal amount, string gatewayTradeNo);

        // 金流請款與交易確認接口 (LINE Pay 為真實扣款，ECPay / COD 直接回傳成功)
        Task<bool> ConfirmPaymentAsync(string transactionId, string orderId);

        // 金流回呼處理接口 (ECPay 回呼處理，LINE Pay / COD 直接回傳 false 或不處理)
        Task<bool> ProcessCallbackAsync(IDictionary<string, string> callbackData, out string orderNo);
    }
}
