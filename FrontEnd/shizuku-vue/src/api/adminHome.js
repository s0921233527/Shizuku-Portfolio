import request from '@/api/index';

// 取得首頁輪播圖設定
export const getHomeBanners = () => {
    return request.get('/HomepageApi/banners');
};

// 儲存首頁輪播圖設定
export const saveHomeBanners = (banners) => {
    return request.post('/HomepageApi/banners', banners);
};

// 上傳首頁輪播圖圖片
export const uploadBannerImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/HomepageApi/banners/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
