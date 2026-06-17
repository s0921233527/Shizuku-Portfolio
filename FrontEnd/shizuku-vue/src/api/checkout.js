import request from '@/api/index'

// 預檢商品庫存與最新售價
export const checkCheckoutItemsAPI = async (variantIds) => {
  const response = await request.post('/product/check-items', variantIds)
  return response.data
}
