<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})
import { getImageUrl } from '@/utils/imageHelper'
</script>

<template>
  <div class="bg-white/60 p-6 md:p-8 rounded-2xl border border-stone-200/50 font-serif backdrop-blur-md">
    <h2 class="text-base font-medium text-stone-850 mb-6 flex items-center gap-2">
      <span class="w-1 h-4 bg-[#8E9A86] rounded-full"></span>
      商品明細
    </h2>
    <div class="flex flex-col">
      <div
        v-for="(item, index) in props.items"
        :key="index"
        class="flex items-center gap-6 py-5 border-b border-stone-200/30 last:border-0 group"
      >
        <!-- 商品圖片 -->
        <div class="w-20 h-24 bg-[#FAF8F5] rounded-xl border border-stone-200/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
          <img
            :src="getImageUrl(item.productImage)"
            alt="商品圖片"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
          />
        </div>

        <!-- 中間資訊區 -->
        <div class="flex-1 flex flex-col justify-center">
          <h3 class="font-medium text-stone-850 text-sm tracking-wide group-hover:text-[#8E9A86] transition-colors">{{ item.productName }}</h3>
          <p class="text-xs text-stone-500 font-light mt-1.5">{{ item.variantName }}</p>
        </div>

        <!-- 右側數量區 -->
        <div class="text-right pl-4">
          <div class="inline-flex items-center justify-center px-3 py-1 bg-stone-50/50 text-stone-600 font-sans text-xs rounded-full border border-stone-200/40">
            <span class="text-stone-400 mr-1">x</span>{{ item.quantity }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
