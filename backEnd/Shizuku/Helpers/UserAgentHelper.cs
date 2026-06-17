using System;

namespace Shizuku.Helpers
{
    public static class UserAgentHelper
    {
        /// <summary>
        /// 解析複雜的 User-Agent，傳回簡化的「系統 / 瀏覽器」字串。
        /// </summary>
        public static string Simplify(string userAgent)
        {
            if (string.IsNullOrWhiteSpace(userAgent))
            {
                return "未知裝置";
            }

            // 1. 判斷作業系統
            string os = "未知系統";
            if (userAgent.Contains("Windows"))
            {
                os = "Windows";
            }
            else if (userAgent.Contains("Android"))
            {
                os = "Android";
            }
            else if (userAgent.Contains("iPhone") || userAgent.Contains("iPad") || userAgent.Contains("iPod"))
            {
                os = "iOS";
            }
            else if (userAgent.Contains("Macintosh") || userAgent.Contains("Mac OS X"))
            {
                os = "macOS";
            }
            else if (userAgent.Contains("Linux"))
            {
                os = "Linux";
            }

            // 2. 判斷瀏覽器或客戶端
            string browser = "未知瀏覽器";
            if (userAgent.Contains("Edg/"))
            {
                browser = "Edge";
            }
            else if (userAgent.Contains("Chrome/") && !userAgent.Contains("Chromium"))
            {
                browser = "Chrome";
            }
            else if (userAgent.Contains("Safari/") && !userAgent.Contains("Chrome"))
            {
                browser = "Safari";
            }
            else if (userAgent.Contains("Firefox/"))
            {
                browser = "Firefox";
            }
            else if (userAgent.Contains("PostmanRuntime/"))
            {
                browser = "Postman";
            }
            else if (userAgent.Contains("Go-http-client/"))
            {
                browser = "Go Client";
            }

            return $"{os} / {browser}";
        }
    }
}
