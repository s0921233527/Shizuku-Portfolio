import request from '@/api/myRequest'

// 取得全站所有訂單
export const getAllOrdersForAdminAPI = async () => {
  const response = await request.get('/AdminOrderApi')
  return response.data
}

// 取得單筆訂單明細 (後台專用，不須傳 memberId)
export const getAdminOrderDetailAPI = async (orderNo) => {
  const response = await request.get(`/AdminOrderApi/${orderNo}`)
  return response.data
}

// 更改訂單狀態
export const updateOrderStatusAPI = async (orderNo, newStatus) => {
  const response = await request.patch(`/AdminOrderApi/${orderNo}/status`, { newStatus })
  return response.data
}

// 強制取消訂單並回補庫存
export const cancelOrderForAdminAPI = async (orderNo) => {
  const response = await request.patch(`/AdminOrderApi/${orderNo}/cancel`)
  return response.data
}

// 取得異常監控訂單清單
export const getAbnormalOrdersAPI = async () => {
  const response = await request.get('/AdminOrderApi/abnormal')
  return response.data
}

// 執行訂單救援 (恢復誤殺訂單)
export const rescueOrderAPI = async (orderNo) => {
  const response = await request.post(`/AdminOrderApi/${orderNo}/rescue`)
  return response.data
}

// 取得出貨中心清單
export const getShippingOrdersAPI = async (status) => {
  const response = await request.get(`/AdminOrderApi/shipping`, { params: { status } })
  return response.data
}

// 批次更新訂單狀態
export const batchUpdateStatusAPI = async (orderNos, newStatus) => {
  const response = await request.post('/AdminOrderApi/batch-status', { orderNos, newStatus })
  return response.data
}

// 取得營收統計數據
export const getRevenueStatsAPI = async (startDate, endDate) => {
  const params = {}
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const response = await request.get('/AdminOrderApi/revenue-stats', { params })
  return response.data
}

// 手動觸發金流異常掃描
export const triggerPaymentScanAPI = async () => {
  const response = await request.post('/AdminOrderApi/trigger-payment-scan')
  return response.data
}

// 手動觸發訂單異常掃描
export const triggerOrderScanAPI = async () => {
  const response = await request.post('/AdminOrderApi/trigger-order-scan')
  return response.data
}

// 取得待退款訂單列表
export const getPendingRefundsAPI = async () => {
  const response = await request.get('/AdminOrderApi/refunds')
  return response.data
}

// 核准退款
export const approveRefundAPI = async (orderNo) => {
  const response = await request.post(`/AdminOrderApi/${orderNo}/approve-refund`)
  return response.data
}

// 駁回退款申請
export const rejectRefundAPI = async (orderNo, reason) => {
  const response = await request.post(`/AdminOrderApi/${orderNo}/reject-refund`, { reason })
  return response.data
}
