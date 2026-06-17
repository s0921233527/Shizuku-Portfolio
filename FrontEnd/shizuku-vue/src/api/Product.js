import myRequest from './myRequest'

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
const base = `${apiBase}/product`

export const productApi = {
  // 查詢列表 新增分類篩選
  getList: (keyword, categoryId, isAdmin = false) =>
    myRequest.get(base, { params: { keyword, categoryId, isAdmin } }),

  // 查單筆
  getById: (id) => myRequest.get(`${base}/${id}`),

  // 查規格
  getVariants: (id) => myRequest.get(`${base}/${id}/variants`),

  // 查下拉選單
  getDropdowns: () => myRequest.get(`${base}/dropdowns`),

  // 新增商品
  create: (dto) => myRequest.post(base, dto),

  // 上傳圖片
  uploadImage: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return myRequest.post(`${base}/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadImageExtra: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return myRequest.post(`${base}/${id}/image/extra`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 更新商品
  update: (id, dto) => myRequest.put(`${base}/${id}`, dto),

  // 更新庫存
  updateVariants: (id, variants) => myRequest.put(`${base}/${id}/variants`, variants),

  // 刪除
  delete: (id) => myRequest.delete(`${base}/${id}`),

  getStats: () => myRequest.get(`${base}/stats`),
  getInventory: () => myRequest.get(`${base}/inventory`),

  //結帳時檢查庫存與價格
  checkItems: (variantIds) => myRequest.post(`${base}/check-items`, variantIds),

  getInventoryReport: () => myRequest.get(`${base}/inventory-report`),

  getImages: (id) => myRequest.get(`${base}/${id}/images`),
  getRelated: (id) => myRequest.get(`${base}/${id}/related`),

  getStockRecords: (variantId = null) =>
    myRequest.get(`${base}/stock-records`, { params: variantId ? { variantId } : {} }),
  addStockRecord: (dto) => myRequest.post(`${base}/stock-records`, dto),
  getPurchaseOrders: () => myRequest.get(`${base}/purchase-orders`),
  getPurchaseOrder: (id) => myRequest.get(`${base}/purchase-orders/${id}`),
  updatePurchaseOrderStatus: (id, status) =>
    myRequest.put(`${base}/purchase-orders/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    }),
  getVariantBySkuOrId: (sku) => myRequest.get(`${base}/variant-by-sku`, { params: { sku } }),
  createPurchaseOrder: (dto) => myRequest.post(`${base}/purchase-orders`, dto),
  addVariants: (id, variants) => myRequest.post(`${base}/${id}/variants`, variants),
}
