<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
  },
  finalTotal: {
    type: Number,
    required: true,
  },
})
import { getImageUrl } from '@/utils/imageHelper'
</script>

<template>
  <div class="bg-stone-50/40 border-b border-stone-200/50 p-6 sm:p-10 font-serif">
    <h2 class="text-lg font-light text-stone-850 mb-6 flex items-center gap-2.5 pb-4 border-b border-stone-200/50">
      <i class="pi pi-shopping-bag text-[#8E9A86] text-lg"></i>
      <span>訂單摘要</span>
    </h2>

    <!-- 購物車商品清單 -->
    <div class="space-y-5 mb-6">
      <div
        v-for="item in props.items"
        :key="item.id"
        class="flex items-center gap-4 relative"
      >
        <div class="relative flex-shrink-0">
          <div
            class="w-16 h-16 bg-white border border-stone-200/40 rounded-md overflow-hidden flex items-center justify-center"
          >
            <img :src="getImageUrl(item.image)" class="w-full h-full object-cover mix-blend-multiply" />
          </div>
          <span
            class="absolute -top-2 -right-2 bg-[#8E9A86] text-white text-[10px] font-light w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
          >{{ item.quantity }}</span>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-stone-800 text-sm tracking-wide">{{ item.name }}</h4>
          <p class="text-stone-400 text-xs mt-1">
            NT$ {{ item.price.toLocaleString() }} <span class="mx-1 font-sans">x</span> {{ item.quantity }}
          </p>
        </div>
        <!-- 小計 -->
        <p class="font-light text-stone-800 text-sm">
          NT$ {{ (item.price * item.quantity).toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- 折扣碼區塊 -->
    <div class="flex gap-3 mb-6 pt-6 border-t border-stone-200/50">
      <input
        type="text"
        placeholder="折扣碼"
        class="flex-1 bg-white/70 rounded-md border border-stone-200/80 px-4 py-3 text-sm focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-800"
      />
      <button
        class="bg-[#8E9A86]/10 text-[#8E9A86] font-light px-6 rounded-md hover:bg-[#8E9A86]/20 transition text-sm tracking-wider cursor-pointer"
      >
        套用
      </button>
    </div>

    <!-- 結算明細 -->
    <div class="space-y-3 text-sm text-stone-600 border-t border-stone-200/50 pt-6">
      <div class="flex justify-between">
        <span class="font-light">小計</span>
        <span class="font-light text-stone-850">
          NT$ {{ props.subtotal.toLocaleString() }}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="flex items-center gap-1.5 font-light">
          <i class="pi pi-truck text-xs text-[#8E9A86]"></i> 運費
        </span>
        <span
          :class="props.shippingFee > 0 ? 'text-stone-850 font-light' : 'text-[#8E9A86] font-light'"
        >
          {{ props.shippingFee > 0 ? `NT$ ${props.shippingFee.toLocaleString()}` : '免運費' }}
        </span>
      </div>
      <!-- 總金額 -->
      <div class="flex justify-between items-center pt-4 mt-2 border-t border-stone-200/50">
        <span class="text-sm font-light text-stone-800 uppercase tracking-widest">Total</span>
        <div class="flex items-center gap-2">
          <span class="text-xs text-stone-400">TWD</span>
          <span class="text-2xl font-light text-[#8E9A86] tracking-tight">
            NT$ {{ props.finalTotal.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
