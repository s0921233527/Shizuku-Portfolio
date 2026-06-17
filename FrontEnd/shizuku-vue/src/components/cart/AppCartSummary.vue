<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()
const router = useRouter()
const props = defineProps({
  items: Array,
})

const goToCheckout = () => {
  router.push({ name: 'checkout' })
}
</script>

<template>
  <div class="bg-[#FAF8F5] p-8 rounded-2xl border border-stone-200/50 sticky top-28 font-serif">
    <h2 class="text-lg font-medium text-stone-850 mb-6 tracking-wider">訂單摘要</h2>

    <div class="space-y-4 text-sm text-stone-600 border-b border-stone-200/50 pb-6 mb-6">
      <div class="flex justify-between items-center">
        <span>商品金額小計</span>
        <span class="font-semibold text-stone-850"
          >NT$ {{ cartStore.totalPrice.toLocaleString() }}</span
        >
      </div>
      <div class="flex justify-between items-center">
        <span>運費</span>
        <span class="text-stone-400">結帳時計算</span>
      </div>
    </div>

    <!-- 總金額 -->
    <div class="flex justify-between items-end mb-8">
      <span class="text-base font-semibold text-stone-850 font-serif">總計</span>
      <div class="flex items-center gap-2">
        <span class="text-xs text-stone-400">TWD</span>
        <span class="text-2xl font-bold text-[#8E9A86]"
          >NT$ {{ cartStore.totalPrice.toLocaleString() }}</span
        >
      </div>
    </div>

    <!-- 結帳按鈕 -->
    <button
      @click="goToCheckout"
      :disabled="cartStore.items.length === 0"
      class="w-full bg-[#8E9A86] text-white py-4 rounded-full font-bold tracking-[0.2em] hover:bg-[#7D8A75] transition shadow-xs flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      前往結帳 <i class="pi pi-arrow-right text-sm"></i>
    </button>

    <!-- 支援的支付方式 Icon (裝飾用增加信任感) -->
    <div class="mt-8 flex justify-center items-center gap-5 text-stone-300 text-2xl">
      <i class="pi pi-credit-card hover:text-[#8E9A86]/70 transition"></i>
      <i class="pi pi-paypal hover:text-[#8E9A86]/70 transition"></i>
      <i class="pi pi-apple hover:text-[#8E9A86]/70 transition"></i>
    </div>
  </div>
</template>
