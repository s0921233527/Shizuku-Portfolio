using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Text.Json;
using Shizuku.DTOs;

namespace Shizuku.Services
{
    public class HomepageService
    {
        private readonly IWebHostEnvironment _env;

        public HomepageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        // 取得目前的系統輪播圖設定
        public async Task<List<HomeBannerDto>> GetHomeBannersAsync()
        {
            var configPath = Path.Combine(_env.WebRootPath, "configs", "home_banners.json");
            if (!File.Exists(configPath))
            {
                var defaultBanners = new List<HomeBannerDto>
                {
                    new HomeBannerDto
                    {
                        fId = 1,
                        fSubtitle = "2026 Autumn / Winter Collection",
                        fTitle = "溫柔流淌的針織光影",
                        fDescription = "本季精選天然天絲棉與羊毛材質，打造舒適與風格兼具的日常暖秋穿搭。",
                        fImage = "/img/shizuku_banner_beige.png",
                        fSortOrder = 1
                    },
                    new HomeBannerDto
                    {
                        fId = 2,
                        fSubtitle = "Organic Linen Wear",
                        fTitle = "自然呼吸：極簡日系洋裝",
                        fDescription = "輕盈柔和的天然亞麻剪裁，給您無負擔的極致親膚觸感。",
                        fImage = "/img/shizuku_banner_grey.png",
                        fSortOrder = 2
                    },
                    new HomeBannerDto
                    {
                        fId = 3,
                        fSubtitle = "Aesthetic Modern Daily",
                        fTitle = "秋日特惠：精選單品 85 折起",
                        fDescription = "在秋意漸濃的時節，為衣櫃添置一件溫暖的日系質感日常。",
                        fImage = "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop",
                        fSortOrder = 3
                    }
                };

                var dir = Path.GetDirectoryName(configPath);
                if (dir != null && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }
                var json = JsonSerializer.Serialize(defaultBanners, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(configPath, json);
                return defaultBanners;
            }

            var content = await File.ReadAllTextAsync(configPath);
            return JsonSerializer.Deserialize<List<HomeBannerDto>>(content) ?? new List<HomeBannerDto>();
        }

        // 儲存輪播圖設定
        public async Task<bool> SaveHomeBannersAsync(List<HomeBannerDto> banners)
        {
            var configPath = Path.Combine(_env.WebRootPath, "configs", "home_banners.json");
            var dir = Path.GetDirectoryName(configPath);
            if (dir != null && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            var json = JsonSerializer.Serialize(banners, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(configPath, json);
            return true;
        }
    }
}
