import request from '@/api/index';

// 取得後台系統設定
export const getSystemConfig = () => {
    return request.get('/SystemApi/config');
};

// 後台系統設定
export const updateSystemConfig = (data) => {
    return request.put('/SystemApi/config', data);
};

// 取得系統日誌
export const getSystemLogs = (params) => {
    return request.get('/SystemLogsApi', { params });
};