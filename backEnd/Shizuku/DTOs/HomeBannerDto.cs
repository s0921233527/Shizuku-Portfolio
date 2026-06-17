namespace Shizuku.DTOs
{
    public class HomeBannerDto
    {
        public int fId { get; set; }
        public string? fSubtitle { get; set; }
        public string? fTitle { get; set; }
        public string? fDescription { get; set; }
        public string fImage { get; set; } = null!;
        public int fSortOrder { get; set; }
    }
}
