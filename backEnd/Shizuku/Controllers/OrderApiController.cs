using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shizuku.DTOs;
using Shizuku.Enums;
using Shizuku.Services;

namespace Shizuku.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderApiController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly PaymentFactory _paymentFactory;
        private readonly RefundAdminService _refundService;
        private readonly ProductService _productService;

        // 建構子注入：注入訂單服務、金流抽象工廠、退款服務與商品服務
        public OrderApiController(OrderService orderService, PaymentFactory paymentFactory, RefundAdminService refundService, ProductService productService)
        {
            _orderService = orderService;
            _paymentFactory = paymentFactory;
            _refundService = refundService;
            _productService = productService;
        }

        // 建立新訂單 (POST /api/orderApi/create)
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequestDto request)
        {
            var result = await _orderService.CreateOrder(request);
            return Ok(result);
        }

        // 確認付款並扣款 (POST /api/orderApi/confirm)
        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequestDto request)
        {
            try
            {
                // 動態獲取該筆訂單所使用的金流方式 ID
                int paymentMethodId = await _orderService.GetLastPaymentMethodIdAsync(request.OrderId);
                var paymentService = _paymentFactory.GetPaymentService(paymentMethodId);
                
                if (paymentService == null)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "系統未正確配置對應的金流服務"
                    });
                }

                bool isSuccess = await paymentService.ConfirmPaymentAsync(request.TransactionId, request.OrderId);
                if (isSuccess)
                {
                    await _orderService.MarkOrderAsPaidAsync(request.OrderId, paymentMethodId);
                    return Ok(new ApiResponse<object> { Success = true, Message = "付款成功！" });
                }

                return BadRequest(new ApiResponse<object> { Success = false, Message = "金流扣款確認失敗！" });
            }
            catch (Exception ex)
            {
                return InternalServerError("金流交易確認失敗", ex);
            }
        }

        // 讀取特定會員的所有訂單列表 (GET /api/orderApi/member/{memberId})
        [HttpGet("member/{memberId}")]
        public async Task<IActionResult> GetMemberOrders(int memberId)
        {
            try
            {
                var orders = await _orderService.GetMemberOrdersAsync(memberId);
                return Ok(new ApiResponse<List<OrderListDto>>
                {
                    Success = true,
                    Message = "查詢訂單成功",
                    Data = orders
                });
            }
            catch (Exception ex)
            {
                return InternalServerError("獲取會員訂單列表失敗", ex);
            }
        }

        // 讀取特定訂單明細 (GET /api/orderApi/{orderNo})
        [HttpGet("{orderNo}")]
        public async Task<IActionResult> GetOrderDetail(string orderNo, [FromQuery] int memberId)
        {
            var result = await _orderService.GetOrderDetailAsync(orderNo, memberId);
            if (!result.Success) return NotFound(result); 
            return Ok(result);
        }

        // 產生自動轉向綠界收銀台的 HTML 表單 (GET /api/orderApi/ecpay/{orderNo})
        [AllowAnonymous]
        [HttpGet("ecpay/{orderNo}")]
        public async Task<IActionResult> GenerateECPayForm(string orderNo)
        {
            string htmlForm = await _orderService.GenerateECPayHtmlFormAsync(orderNo);
            if (string.IsNullOrEmpty(htmlForm))
            {
                return NotFound(new ApiResponse<object> { Success = false, Message = "找不到這筆訂單" });
            }
            return Content(htmlForm, "text/html");
        }

        // 綠界金流非同步交易回傳通知 (POST /api/orderApi/ecpayResult)
        [AllowAnonymous]
        [HttpPost("ecpayResult")]
        public async Task<IActionResult> ECPayResult([FromForm] IFormCollection form)
        {
            try
            {
                var paymentService = _paymentFactory.GetPaymentService(1);
                if (paymentService != null)
                {
                    var formDict = form.ToDictionary(k => k.Key, k => k.Value.ToString());
                    if (await paymentService.ProcessCallbackAsync(formDict, out string orderNo))
                    {
                        await _orderService.MarkOrderAsPaidAsync(orderNo);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("ECPay 狀態更新失敗：" + ex.Message);
            }

            string html = @"
         <html>
        <body style='display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;'>
            <div style='text-align:center;'>
                <h2 style='color: #4CAF50;'>付款成功！</h2>
                <p>訂單已成立，正在為您導回首頁，請稍候...</p>
            </div>
            <script>
                if (window.opener) {
                    window.opener.postMessage('PAYMENT_SUCCESS', '*');
                    window.close();
                } else {
                    window.location.href = 'https://shizuku-frontend.vercel.app/member/orders';
                }
            </script>
        </body>
        </html>";
            return Content(html, "text/html");
        }

        // 重新發起付款流程 (POST /api/orderApi/repay/{orderNo})
        [HttpPost("repay/{orderNo}")]
        public async Task<IActionResult> RepayOrder(string orderNo, [FromBody] RepayRequestDto request)
        {
            var order = await _orderService.GetOrderAsync(orderNo);
            if (order == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Message = "找不到該筆訂單" });
            }

            if (order.FStatus != 1)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = "此訂單狀態無法重新付款" });
            }

            try
            {
                if (request.PaymentMethodId == (int)PaymentMethod.COD)
                {
                    await _orderService.MarkOrderAsPaidAsync(orderNo, request.PaymentMethodId);
                    return Ok(new ApiResponse<CreateOrderResponseDto>
                    {
                        Success = true,
                        Message = "付款方式已更改為貨到付款",
                        Data = new CreateOrderResponseDto
                        {
                            OrderNo = orderNo,
                            PaymentUrl = ""
                        }
                    });
                }

                string paymentUrl = await _orderService.GeneratePaymentUrlAsync(orderNo, request.PaymentMethodId, order.FTotalAmount, request.IsMobile);
                return Ok(new ApiResponse<CreateOrderResponseDto>
                {
                    Success = true,
                    Message = "產生付款連結成功",
                    Data = new CreateOrderResponseDto
                    {
                        OrderNo = orderNo,
                        PaymentUrl = paymentUrl
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = $"產生付款連結失敗: {ex.Message}"
                });
            }
        }

        // 會員手動取消未付款訂單 (HttpPatch /api/orderApi/{orderNo}/cancel)
        [HttpPatch("{orderNo}/cancel")]
        public async Task<IActionResult> CancelOrder(string orderNo)
        {
            var result = await _orderService.CancelOrderAsync(orderNo);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // 取得前台統計用銷量數據 (GET /api/orderApi/sales-stats)
        [AllowAnonymous]
        [HttpGet("sales-stats")]
        public async Task<IActionResult> GetSalesStats()
        {
            try
            {
                var stats = await _productService.GetSalesStatsAsync();
                return Ok(new ApiResponse<List<VariantSalesStatsDto>>
                {
                    Success = true,
                    Message = "查詢成功",
                    Data = stats
                });
            }
            catch (Exception ex)
            {
                return InternalServerError("查詢銷量統計失敗", ex);
            }
        }

        // 取得前台首頁熱銷商品排行數據 (GET /api/orderApi/top-products)
        [AllowAnonymous]
        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts()
        {
            try
            {
                var stats = await _productService.GetTopSellingProductsAsync();
                return Ok(new ApiResponse<List<ProductSalesStatsDto>>
                {
                    Success = true,
                    Message = "查詢成功",
                    Data = stats
                });
            }
            catch (Exception ex)
            {
                return InternalServerError("查詢熱銷商品統計失敗", ex);
            }
        }

        // 前台會員申請退款 (POST /api/OrderApi/{orderNo}/refund)
        [HttpPost("{orderNo}/refund")]
        public async Task<IActionResult> RequestRefund(string orderNo, [FromBody] RefundRequestDto request)
        {
            var result = await _refundService.RequestRefundAsync(orderNo, request.Reason);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // 取得訂單的金流交易列表 (GET /api/orderApi/{orderNo}/transactions)
        // 供前台「支付明細列表」頁面使用，顯示該訂單所有的支付嘗試紀錄
        [HttpGet("{orderNo}/transactions")]
        public async Task<IActionResult> GetOrderTransactions(string orderNo)
        {
            try
            {
                var order = await _orderService.GetOrderAsync(orderNo);
                if (order == null)
                    return NotFound(new ApiResponse<object> { Success = false, Message = "找不到該筆訂單" });

                var transactions = await _orderService.GetOrderTransactionsAsync(order.FId);
                return Ok(new ApiResponse<object> { Success = true, Message = "查詢成功", Data = transactions });
            }
            catch (Exception ex)
            {
                return InternalServerError("查詢金流交易列表失敗", ex);
            }
        }

        // 輔助方法：統一處理錯誤訊息與狀態碼回傳
        private IActionResult InternalServerError(string customMessage, Exception ex)
        {
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = $"{customMessage}: {ex.Message}"
            });
        }
    }
}
