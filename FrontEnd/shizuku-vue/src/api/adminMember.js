import request from '@/api/index'; // 引入你封裝好的 axios 實例

// 取得後台會員列表
export const getAdminMemberList = () => {
  return request.get('/MemberApi/MemberList/list');
};


//取得後台黑名單列表
export const getAdminBlacklist = () => {
  return request.get('/MemberApi/MemberList/blacklist');
};

// 解除黑名單
export const unbanAdminMember = (id) => {
  return request.put(`/MemberApi/MemberList/unban/${id}`);
};