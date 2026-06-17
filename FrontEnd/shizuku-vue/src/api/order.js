import request from '@/api/index'

//  建立訂單
export const createOrderAPI = async (data) => {
  const response = await request.post('/orderApi/create', data)
  //先拔掉 Axios 的第一層 data
  return response.data
}

//  確認付款
export const confirmPaymentAPI = async (data) => {
  const response = await request.post('/orderApi/confirm', data)
  return response.data
}

//  根據會員ID 取得訂單列表
export const getMemberOrdersAPI = async (memberId) => {
  const response = await request.get(`/orderApi/member/${memberId}`)
  return response.data
}

//取得單筆訂單詳情
export const getOrderDetailAPI = async (orderNo, memberId) => {
  const response = await request.get(`/orderApi/${orderNo}`, { params: { memberId } })
  return response.data
}

// 重新付款
export const repayOrderAPI = async (orderNo, paymentMethodId, isMobile = false) => {
  const response = await request.post(`/orderApi/repay/${orderNo}`, { paymentMethodId, isMobile })
  return response.data
}

//取消訂單
export const cancelOrderApi = async (orderNo) => {
  const response = await request.patch(`/orderApi/${orderNo}/cancel`)
  return response.data
}

// 前台會員申請退款
export const requestRefundAPI = async (orderNo, reason) => {
  const response = await request.post(`/orderApi/${orderNo}/refund`, { reason })
  return response.data
}

// 取得訂單的金流交易明細列表 (含通訊日誌)
// 後端 PaymentAdminService 已有此資料，透過 orderNo 比對 orderId 取出
export const getOrderTransactionsAPI = async (orderNo) => {
  const response = await request.get(`/orderApi/${orderNo}/transactions`)
  return response.data
}

export const orderApi = {
  getSalesStats: () => request.get(`/orderApi/sales-stats`), //13
}

// 取得首頁熱銷商品排行
export const getTopProductsAPI = async () => {
  const response = await request.get('/orderApi/top-products')
  return response.data
}
