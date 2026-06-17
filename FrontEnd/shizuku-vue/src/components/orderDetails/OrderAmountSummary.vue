<script setup>
import { PAYMENT_METHOD } from '@/services/orderStatusManager'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="bg-white/60 p-6 md:p-8 rounded-2xl border border-stone-200/50 flex-1 h-full flex flex-col font-serif backdrop-blur-md"
  >
    <h2 class="text-base font-medium text-stone-850 mb-6 flex items-center gap-2">
      <span class="w-1 h-4 bg-[#8E9A86] rounded-full"></span>
      金額明細
    </h2>
    <div class="flex flex-col flex-1">
      <!-- 商品個別金額細目 -->
      <div class="flex flex-col gap-3 mb-6">
        <div
          v-for="(item, index) in props.order.items"
          :key="index"
          class="flex justify-between items-start text-xs"
        >
          <div class="flex flex-col pr-4 gap-0.5">
            <span class="text-stone-850 font-normal leading-relaxed">{{ item.productName }}</span>
            <span class="text-stone-400 font-sans text-[10px]"
              >NT$ {{ item.unitPrice.toLocaleString() }} <span class="mx-1 text-[8px]">x</span>
              {{ item.quantity }}</span
            >
          </div>
          <span class="font-sans text-stone-750 font-light whitespace-nowrap"
            >NT$ {{ (item.unitPrice * item.quantity).toLocaleString() }}</span
          >
        </div>
      </div>

      <!-- 分隔線 -->
      <hr class="border-stone-200/50 border-dashed mb-6" />

      <!-- 小計、運費、折扣 -->
      <div class="flex flex-col gap-4 text-xs text-stone-600 mb-8 font-light">
        <div class="flex justify-between items-center">
          <p>商品小計</p>
          <p class="font-sans text-stone-800 font-light">NT$ {{ props.order.subtotal.toLocaleString() }}</p>
        </div>

        <div class="flex justify-between items-center">
          <p class="flex items-center gap-1.5"><i class="pi pi-truck text-stone-400 text-[10px]"></i> 運費</p>
          <p class="font-sans text-stone-800 font-light">NT$ {{ props.order.shippingFee.toLocaleString() }}</p>
        </div>

        <div class="flex justify-between items-center text-red-500">
          <p class="flex items-center gap-1.5"><i class="pi pi-tag text-red-400 text-[10px]"></i> 折扣金額</p>
          <p class="font-sans font-light">- NT$ {{ props.order.discount.toLocaleString() }}</p>
        </div>
      </div>

      <!-- 總金額 -->
      <div class="mt-auto pt-4 border-t border-stone-200/50">
        <div class="flex justify-between items-end">
          <p class="font-medium text-stone-800 tracking-wider text-xs mb-1 uppercase">總計</p>
          <p class="text-2xl font-light text-[#8E9A86] tracking-tight">
            <span class="text-sm text-stone-450 font-light mr-0.5">NT$</span
            >{{ props.order.totalAmount.toLocaleString() }}
          </p>
        </div>
        <!-- 貨到付款提醒 -->
        <p
          v-if="
            props.order.paymentMethodId === PAYMENT_METHOD.COD ||
            props.order.paymentMethod === '貨到付款'
          "
          class="mt-4 text-right text-[10px] text-amber-600 font-light tracking-wide"
        >
          * 此金額將於商品送達時以現金支付
        </p>
      </div>
    </div>
  </div>
</template>
