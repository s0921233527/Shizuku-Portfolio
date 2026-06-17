import request from '@/api/myRequest'

// 員工後台登入
export const employeeLoginAPI = async (data) => {
  const response = await request.post('/employeeApi/login', data)
  return response.data
}
