using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using Shizuku.Models;
using Shizuku.Services;
using Shizuku.Hubs;
using Shizuku.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// 啟用 Serilog 內部除錯
Serilog.Debugging.SelfLog.Enable(msg => System.Diagnostics.Debug.WriteLine(msg));

try
{
    var builder = WebApplication.CreateBuilder(args);
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    // JWT: 取得設定檔中的 JWT 資訊
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

    // --- 1. Serilog 配置 ---
    var sinkOptions = new MSSqlServerSinkOptions
    {
        TableName = "SystemLogs",
        AutoCreateSqlTable = true
    };

    Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.AspNetCore.Mvc", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Async(a => a.MSSqlServer(connectionString, sinkOptions))
        .WriteTo.Debug()
        .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
        .CreateLogger();

    builder.Host.UseSerilog();

    // --- 2. 註冊基礎服務 ---
    builder.Services.AddControllersWithViews(options =>
    {
        options.Filters.Add<Shizuku.Helpers.ReadOnlyFilter>();
    });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddMemoryCache();

    builder.Services.AddDbContext<DbShizukuDemoContext>(options =>
        options.UseSqlServer(connectionString));

    // --- 3. 設定 CORS ---
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.SetIsOriginAllowed(origin => true) // 允許任何來源連線（解決 Vercel 隨機網址的 CORS 問題）
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    // --- 4. JWT 驗證服務設定 ---
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // 恢復驗證發行者
            ValidateAudience = true, // 恢復驗證接收者
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };

        // 為 SignalR WebSockets 提供 JWT 讀取機制
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && 
                    (path.StartsWithSegments("/adminNotificationHub") || path.StartsWithSegments("/chatHub")))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

    // --- 5. 註冊自定義服務 (DI) ---
    builder.Services.AddScoped<OrderService>();
    builder.Services.AddScoped<EmployeeService>();
    builder.Services.AddScoped<MemberService>();
    builder.Services.AddHttpClient<LinePayService>();
    builder.Services.AddScoped<ProductService>();
    builder.Services.AddScoped<PaymentAdminService>();
    builder.Services.AddScoped<OrderAdminService>();
    builder.Services.AddScoped<AnomalyMonitorService>();
    builder.Services.AddScoped<RefundAdminService>();
    builder.Services.AddHostedService<OrderTimeoutService>();




    builder.Services.AddScoped<SystemService>();
    builder.Services.AddScoped<SystemLogsService>();
    builder.Services.AddScoped<HomepageService>();

    // 新增合併進來的服務
    builder.Services.AddScoped<JwtHelper>();
    builder.Services.AddScoped<EmailService>();
    builder.Services.AddScoped<VerificationService>();

    // --- 6. 註冊金流服務 (DI) ---
    builder.Services.AddScoped<ECPayPaymentService>();
    builder.Services.AddScoped<LinePayPaymentService>();
    builder.Services.AddScoped<CashOnDeliveryPaymentService>();
    builder.Services.AddScoped<PaymentFactory>();

    // 加入這行，讓系統載入 SignalR 的相關功能
    builder.Services.AddSignalR();

    // 註冊異常偵測背景服務
    builder.Services.AddSingleton<PaymentAnomalyService>();
    builder.Services.AddHostedService(provider => provider.GetRequiredService<PaymentAnomalyService>());
    builder.Services.AddSingleton<OrderAnomalyService>();
    builder.Services.AddHostedService(provider => provider.GetRequiredService<OrderAnomalyService>());

    // 所有的服務註冊都必須在 Build 之前完成
    var app = builder.Build();

    // --- 7. 中間件順序 (Pipeline) ---
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        app.UseExceptionHandler("/Home/Error");
        app.UseHsts();
    }

    app.UseSerilogRequestLogging(options =>
    {
        // 🌟 自訂 HTTP 請求日誌的訊息模板，使其附帶中文化連線資訊（加上換行與結構符號）
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms\n  ├─ [來源IP: {ClientIP}]\n  ├─ [身分: {LoggedUser}]\n  └─ [裝置: {UserAgent}]";

        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            var request = httpContext.Request;
            var user = httpContext.User;

            // 1. 抓取真實 IP (相容 Render/Cloudflare 等代理)
            string ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "未知";
            if (request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
            {
                ip = forwardedFor.ToString().Split(',')[0].Trim();
            }
            diagnosticContext.Set("ClientIP", ip);

            // 2. 抓取裝置與瀏覽器 (User-Agent，進行中文化簡化)
            diagnosticContext.Set("UserAgent", UserAgentHelper.Simplify(request.Headers["User-Agent"].ToString()));

            // 3. 抓取已登入使用者資訊
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

                diagnosticContext.Set("LoggedUser", $"ID: {userId} (信箱: {email} | 角色: {roleZh})");
            }
            else
            {
                diagnosticContext.Set("LoggedUser", "未登入訪客");
            }
        };
    });
    app.UseHttpsRedirection();
    app.UseStaticFiles();

    app.UseCors("AllowAll"); // CORS 必須在 Routing 之前

    app.UseRouting();

    app.UseAuthentication(); // 認證：你是誰
    app.UseAuthorization();  // 授權：你能做什麼

    app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}");

    app.MapHub<ChatHub>("/chatHub");

    // 後台管理員通知專用通道
    app.MapHub<AdminNotificationHub>("/adminNotificationHub");

    Log.Information("應用程式正在啟動...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "應用程式啟動失敗！");
}
finally
{
    Log.CloseAndFlush();
}