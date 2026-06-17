using Microsoft.AspNetCore.Mvc;
using Shizuku.DTOs;
using Shizuku.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;
using Serilog;
using Shizuku.Helpers;

namespace Shizuku.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemApiController : ControllerBase
    {
        private readonly SystemService _systemService;
        private readonly IWebHostEnvironment _env;

        public SystemApiController(SystemService systemService, IWebHostEnvironment env)
        {
            _systemService = systemService;
            _env = env;
        }

        // POST: api/SystemApi/log-pageview
        [HttpPost("log-pageview")]
        public IActionResult LogPageView([FromBody] PageViewDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Path))
            {
                return BadRequest();
            }

            // 1. 抓取真實 IP
            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "未知";
            if (HttpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
            {
                ip = forwardedFor.ToString().Split(',')[0].Trim();
            }

            // 2. 抓取裝置與瀏覽器並進行簡化
            string userAgent = UserAgentHelper.Simplify(HttpContext.Request.Headers["User-Agent"].ToString());

            // 3. 抓取已登入使用者資訊
            var user = HttpContext.User;
            string loggedUser = "未登入訪客";
            if (user.Identity?.IsAuthenticated == true)
            {
                var userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var email = user.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value;
                var role = user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                // 角色中文化
                string roleZh = role switch
                {
                    "Admin" => "後台管理員",
                    "Member" => "一般會員",
                    _ => role ?? "未知"
                };

                loggedUser = $"ID: {userId} (信箱: {email} | 角色: {roleZh})";
            }

            Log.Information("【頁面瀏覽: {PagePath}】\n  ├─ [來源IP: {ClientIP}]\n  ├─ [身分: {LoggedUser}]\n  └─ [裝置: {UserAgent}]", 
                dto.Path, ip, loggedUser, userAgent);
            return Ok();
        }

        // PUT: api/SystemApi/config
        [HttpPut("config")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateConfig([FromBody] UpdateConfigDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.ConfigKey))
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "請求參數錯誤",
                    Data = false
                });
            }

            var result = await _systemService.UpdateConfigAsync(dto);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return result;
        }

        // GET: api/SystemApi/config
        [HttpGet("config")]
        public async Task<ActionResult<ApiResponse<SystemConfigResponseDto>>> GetSystemConfigAsync()
        {
            try
            {
                // 非同步獲取整理好的設定資料
                var configData = await _systemService.GetSystemConfigAsync();

                return Ok(new ApiResponse<SystemConfigResponseDto>
                {
                    Success = true,
                    Message = "載入系統設定資料成功",
                    Data = configData
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<SystemConfigResponseDto>
                {
                    Success = false,
                    Message = $"後端載入系統設定失敗: {ex.Message}",
                    Data = null
                });
            }
        }
    }

    public class PageViewDto
    {
        public required string Path { get; set; }
    }
}
