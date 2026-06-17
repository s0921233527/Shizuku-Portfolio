import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCartStore = defineStore('cart', () => {
  //初始化狀態,先看 localstorage 有沒有東西,沒有就給空陣列
  const savedCart = localStorage.getItem('shizuku_cart')
  const items = ref(savedCart ? JSON.parse(savedCart) : [])

  //監聽items 變動
  watch(items, (newItems) =>{
    localStorage.setItem('shizuku_cart', JSON.stringify(newItems));
  }, { deep: true })

  //  Getters (計算屬性)
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })
// 計算總件數 (用來顯示購物車上小紅點的數字)
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  // Actions (操作方法)
  const addToCart = (product, quantity = 1) => {
    // 先檢查購物車是不是已經有這個商品了？
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      // 有的話，數量往上加就好
      existingItem.quantity += quantity
    } else {
      // 沒有的話，把新商品推進去
      items.value.push({ ...product, quantity })
    }
  }

  // Actions：移除特定商品
  const removeFromCart = (productId) => {
    items.value = items.value.filter(item => item.id !== productId)
  }

  // Actions：結帳完清空購物車
  const clearCart = () => {
    items.value = []
  }

  // Actions：更換商品規格（換顏色/尺寸）
  // 若目標規格 ID 已在購物車中，直接合併數量後移除原條目；否則直接更新
  const updateItemVariant = (oldVariantId, newVariant) => {
    // 1. 如果規格完全沒有改變，直接返回，避免重複比對與自我過濾 Bug
    if (oldVariantId === newVariant.id) return

    const index = items.value.findIndex(item => item.id === oldVariantId)
    if (index === -1) return

    const oldItem = items.value[index]
    const existingTarget = items.value.find(item => item.id === newVariant.id)

    if (existingTarget) {
      // 2. 目標規格已存在於購物車中 → 數量合併，並移除原規格項目
      existingTarget.quantity += oldItem.quantity
      items.value = items.value.filter(item => item.id !== oldVariantId)
    } else {
      // 3. 目標規格不存在 ➡️ 產生全新物件並替換，防止原地修改 key (id) 造成 Vue 虛擬 DOM 渲染崩潰
      items.value[index] = {
        ...oldItem,
        id: newVariant.id,
        color: newVariant.color,
        size: newVariant.size,
        price: newVariant.price
      }
    }
  }

  // 最後，把這些東西 return 出去，別的檔案才拿得到
  return { 
    items, 
    totalPrice, 
    totalItems,
    addToCart, 
    removeFromCart, 
    clearCart,
    updateItemVariant,
  }
})
