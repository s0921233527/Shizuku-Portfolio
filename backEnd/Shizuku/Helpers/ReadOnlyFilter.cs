using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shizuku.Helpers
{
    public class ReadOnlyFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var user = context.HttpContext.User;
            // 只要是已認證且角色為 ReadOnly 的帳戶
            if (user.Identity?.IsAuthenticated == true && user.IsInRole("ReadOnly"))
            {
                var method = context.HttpContext.Request.Method;
                // 僅允許 GET 與 OPTIONS 請求，拒絕 POST, PUT, PATCH, DELETE
                if (method != "GET" && method != "OPTIONS")
                {
                    context.Result = new ObjectResult(new
                    {
                        success = false,
                        message = "測試帳號（唯讀）限制：不開放新增、修改或刪除功能。"
                    }) { StatusCode = 403 };
                    return;
                }
            }
            await next();
        }
    }
}
