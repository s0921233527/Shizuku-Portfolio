import request from '@/api/myRequest'
const sanitizeApiResponse = (response) => {
  const res = response.data
  if (res && res.success && res.data) {
    res.data = res.data.$values || res.data
  }
  return res
}

// 取得全站所有金流交易列表 (後台專用)
export const getPaymentTransactionsForAdminAPI = async () => {
  const response = await request.get('/admin/payments')
  return sanitizeApiResponse(response)
}

// 取得特定交易的通訊日誌 (後台專用)
export const getPaymentTransactionLogsForAdminAPI = async (transactionId) => {
  const response = await request.get(`/admin/payments/${transactionId}/logs`)
  return sanitizeApiResponse(response)
}

// 取得異常支付資料
export const getAbnormalPaymentsAPI = async () => {
  const response = await request.get('/AdminOrderApi/payment-anomalies')
  return sanitizeApiResponse(response)
}
