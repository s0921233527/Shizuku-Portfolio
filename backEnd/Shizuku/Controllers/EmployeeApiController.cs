using Microsoft.AspNetCore.Mvc;
using Shizuku.DTOs;
using Shizuku.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Serilog;
using Shizuku.Helpers;

namespace Shizuku.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeApiController : ControllerBase
    {
        private readonly EmployeeService _employeeService;
        private readonly IConfiguration _configuration;

        // 建構子注入：注入 EmployeeService 與 IConfiguration，讀取系統 JWT 設定自行產生 Token
        public EmployeeApiController(EmployeeService employeeService, IConfiguration configuration)
        {
            _employeeService = employeeService;
            _configuration = configuration;
        }

        // 員工後台登入 API (POST /api/EmployeeApi/login)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] EmployeeLoginDto request)
        {
            // 獲取來源 IP (相容反向代理，如 Render/Cloudflare)
            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            if (HttpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
            {
                ip = forwardedFor.ToString().Split(',')[0].Trim();
            }
            string userAgent = UserAgentHelper.Simplify(HttpContext.Request.Headers["User-Agent"].ToString());

            try
            {
                // 關注點分離：將身分與在職驗證移入 Service
                var loginResult = await _employeeService.ValidateLoginAsync(request.FNumber, request.FPassword);

                if (!loginResult.Success || loginResult.Data == null)
                {
                    //  記錄後台登入失敗
                    Log.Warning("【後台登入失敗】\n  ├─ [工號: {Number}]\n  ├─ [原因: {Reason}]\n  ├─ [來源IP: {IP}]\n  └─ [裝置: {Device}]", 
                        request.FNumber, loginResult.Message, ip, userAgent);

                    return Ok(new ApiResponse<object>
                    {
                        Success = false,
                        Message = loginResult.Message,
                        Data = null
                    });
                }

                var employee = loginResult.Data;

                // 判斷若 fId 為 10 則指派 ReadOnly 角色，其餘維持 Admin
                string assignedRole = (employee.FId == 10) ? "ReadOnly" : "Admin";
                var token = GenerateEmployeeToken(employee.FId, employee.FName ?? "", employee.FEmail ?? "", assignedRole);

                //  記錄後台登入成功
                Log.Information("【後台登入成功】\n  ├─ [員工ID: {Id}]\n  ├─ [姓名: {Name}]\n  ├─ [工號: {Number}]\n  ├─ [來源IP: {IP}]\n  └─ [裝置: {Device}]", 
                    employee.FId, employee.FName, employee.FNumber, ip, userAgent);

                // 登入成功：回傳員工資料並附帶 token
                return Ok(new
                {
                    success = true,
                    message = "登入成功",
                    data = new
                    {
                        fId = employee.FId,
                        fName = employee.FName,
                        fNumber = employee.FNumber,
                        isEmployee = true,
                        isReadOnly = (employee.FId == 10)
                    },
                    token = token
                });
            }
            catch (Exception ex)
            {
                //  記錄後台登入異常
                Log.Error(ex, "【後台登入異常】\n  ├─ [工號: {Number}]\n  └─ [來源IP: {IP}]", request.FNumber, ip);

                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = $"登入處置失敗: {ex.Message}",
                    Data = null
                });
            }
        }

        /// <summary>
        /// 本地端專用：自行讀取 JWT 設定，簽發包含 "Admin" 角色宣告的員工 Token
        /// </summary>
        private string GenerateEmployeeToken(int fId, string fName, string fEmail, string role)
        {
            var secretKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, fId.ToString()), // 使用者 ID
                new Claim(JwtRegisteredClaimNames.Email, fEmail),      // Email
                new Claim("fName", fName),                             // 姓名
                new Claim(ClaimTypes.Role, role),                      // 🌟 注入 Admin 角色，供 Authorize(Roles = "Admin") 驗證
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1), // 1天後過期
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}


