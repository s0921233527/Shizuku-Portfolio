using Microsoft.AspNetCore.Mvc;
using Shizuku.DTOs;
using Shizuku.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace Shizuku.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomepageApiController : ControllerBase
    {
        private readonly HomepageService _homepageService;
        private readonly IWebHostEnvironment _env;

        public HomepageApiController(HomepageService homepageService, IWebHostEnvironment env)
        {
            _homepageService = homepageService;
            _env = env;
        }

        // GET: api/HomepageApi/banners
        [HttpGet("banners")]
        public async Task<ActionResult<ApiResponse<List<HomeBannerDto>>>> GetHomeBanners()
        {
            var data = await _homepageService.GetHomeBannersAsync();
            return Ok(new ApiResponse<List<HomeBannerDto>>
            {
                Success = true,
                Message = "載入首頁輪播圖設定成功",
                Data = data
            });
        }

        // POST: api/HomepageApi/banners
        [HttpPost("banners")]
        public async Task<ActionResult<ApiResponse<bool>>> SaveHomeBanners([FromBody] List<HomeBannerDto> banners)
        {
            if (banners == null)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "輪播圖設定資料不能為空",
                    Data = false
                });
            }

            var success = await _homepageService.SaveHomeBannersAsync(banners);
            return Ok(new ApiResponse<bool>
            {
                Success = success,
                Message = success ? "首頁輪播圖儲存成功" : "首頁輪播圖儲存失敗",
                Data = success
            });
        }

        // POST: api/HomepageApi/banners/upload
        [HttpPost("banners/upload")]
        public async Task<IActionResult> UploadBannerImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = "沒有上傳檔案"
                });
            }

            // 限制 5MB
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = "上傳檔案過大，限制 5MB 以下"
                });
            }

            // 檢查副檔名
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = "不支援此檔案格式，僅接受 JPG, PNG, WEBP"
                });
            }

            try
            {
                var uploadDir = Path.Combine(_env.WebRootPath, "uploads", "banners");
                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + ext;
                var filePath = Path.Combine(uploadDir, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativeUrl = "/uploads/banners/" + uniqueFileName;
                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "圖片上傳成功",
                    Data = relativeUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = $"上傳圖片發生錯誤: {ex.Message}"
                });
            }
        }
    }
}
