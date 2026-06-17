import request from '@/api/index';

// 取得圖形驗證碼
export const getCaptchaAPI = () => {
    return request.get('/MemberApi/captcha');
};

// 登入
export const loginAPI = (data) => {
    return request.post('/MemberApi/login', data);
};

// 註冊
export const apiMemberRegister = (data) => {
    return request.post('/MemberApi/Register', data);
}

// 驗證電子郵件驗證碼
export const apiVerifyCode = (data) => {
    return request.post('/VerificationApi/verify-code', data);
};

// 會員資料 (預留)
// export const getMemberInfoAPI = (id) => request.get(`/MemberApi/${id}`);

// 取得地址列表 (GET: api/MemberAddressApi/{memberId})
export const getAddressesAPI = (memberId) => {
    return request.get(`/MemberAddressApi/${memberId}`);
};

// 更新地址清單 (PUT: api/MemberAddressApi/{memberId})
export const updateAddressesAPI = (memberId, data) => {
    return request.put(`/MemberAddressApi/${memberId}`, data);
};

// 會員更新個人資料
export const updateProfileAPI = (data) => {
    return request.put('/MemberApi/UpdateProfile', data);
};

// 會員更新手機號碼
// 請求安全驗證碼
export const sendSecurityCodeAPI = (data) => {
    return request.post('/MemberApi/security/request-code', data);
};

// 驗證安全驗證碼
export const verifySecurityCodeAPI = (data) => {
    return request.post('/MemberApi/security/verify-code', data);
};

// 執行更新手機
export const updatePhoneWithCodeAPI = (data) => {
    return request.post('/MemberApi/security/update-phone', data);
};

// 執行更新生日
export const updateBirthdayWithCodeAPI = (data) => {
    return request.post('/MemberApi/security/update-birthday', data);
};

// 執行更新密碼
export const updatePasswordWithCodeAPI = (data) => {
    return request.post('/MemberApi/security/update-password', data);
};

// 更新會員頭像
export const updateAvatar = (memberId, data) => {
    return request.post(`/MemberApi/${memberId}/upload-avatar`, data);
};

// Google 第三方登入 API
export const googleLoginAPI = (data) => {
    return request.post('/MemberApi/google-login', data);
};

// 忘記密碼流程 API
export const forgotPasswordRequestCodeAPI = (data) => {
    return request.post('/MemberApi/forgot-password/request-code', data);
};

export const forgotPasswordVerifyCodeAPI = (data) => {
    return request.post('/MemberApi/forgot-password/verify-code', data);
};

export const forgotPasswordResetAPI = (data) => {
    return request.post('/MemberApi/forgot-password/reset', data);
};
