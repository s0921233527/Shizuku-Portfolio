// src/composables/useProductCart.js
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from 'primevue/usetoast'

export function useProductCart(product, variants, selectedColor, selectedSize, quantity) {
  const cartStore = useCartStore()
  const toast = useToast()

  // 找出目前選中的規格物件
  const currentVariant = computed(() => {
    return variants.value.find(
      (v) => v.fColor === selectedColor.value && v.fSize === selectedSize.value,
    )
  })

  // 計算庫存
  const currentStock = computed(() => currentVariant.value?.fStock ?? 0)

  // 加入購物車邏輯
  const handleAddToCart = () => {
    if (!currentVariant.value) {
      toast.add({
        severity: 'warn',
        summary: '提示',
        detail: '請先選擇商品規格！',
        life: 3000,
      })
      return
    }

    const itemToAdd = {
      id: currentVariant.value.fId,
      productId: product.value.fId,     // 記錄商品頁 ID，供購物車「換規格」導航使用
      name: product.value.fName,
      price: currentVariant.value.fPrice ?? product.value.fPrice,
      image: product.value.fImage,
      color: selectedColor.value,
      size: selectedSize.value,
    }

    cartStore.addToCart(itemToAdd, quantity.value)
    
    // 呼叫 Toast 動畫取代原生 alert
    toast.add({
      severity: 'success',
      summary: '加入成功',
      detail: `已將 ${product.value.fName} 加入購物車！`,
      life: 3000,
    })
  }

  return {
    currentStock,
    handleAddToCart,
  }
}
