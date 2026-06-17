<script setup>
import CartItemList from '@/components/cart/AppCartItemList.vue'
import CartSummary from '@/components/cart/AppCartSummary.vue'
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()
</script>

<template>
  <div class="min-h-screen bg-[#FCFBF9] text-stone-850 font-serif pb-24 pt-28">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 標題與進度條 -->
      <div class="flex flex-col items-center mb-16 text-center">
        <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] font-serif uppercase">Your Cart</span>
        <h1 class="text-2xl md:text-3xl font-light tracking-[0.2em] text-stone-850 font-serif mt-2">購物車清單</h1>
        <div class="w-8 h-[1px] bg-[#8E9A86] mt-4"></div>
      </div>

      <div class="flex flex-col lg:flex-row gap-12 xl:gap-16">
        <!-- 左側：商品清單 -->
        <div class="flex-1">
          <CartItemList :items="cartStore.items" :removeTool="cartStore.removeFromCart" />
        </div>

        <!-- 右側：訂單摘要 -->
        <div class="w-full lg:w-[380px] xl:w-[420px]">
          <CartSummary :items="cartStore.items" />
        </div>
      </div>
    </div>
  </div>
</template>
