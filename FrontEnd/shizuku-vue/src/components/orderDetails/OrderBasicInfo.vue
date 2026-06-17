<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { ORDER_STATUS } from '@/services/orderStatusManager'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const statusTextToCode = {
  未付款: ORDER_STATUS.PENDING,
  已付款: ORDER_STATUS.PAID,
  出貨中: ORDER_STATUS.SHIPPING,
  已出貨: ORDER_STATUS.SHIPPING,
  已送達: ORDER_STATUS.DELIVERED,
  已完成: ORDER_STATUS.DELIVERED,
  已取消: ORDER_STATUS.CANCELLED,
}

// 顏色邏輯對齊狀態機 (PrimeVue Tag Severity 語意)
const getSeverity = (statusText) => {
  const status = statusTextToCode[statusText]
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'warn'
    case ORDER_STATUS.PAID:
      return 'info'
    case ORDER_STATUS.SHIPPING:
      return 'warn'
    case ORDER_STATUS.DELIVERED:
      return 'success'
    case ORDER_STATUS.CANCELLED:
      return 'secondary'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <div class="bg-white/60 p-6 rounded-2xl border border-stone-200/50 backdrop-blur-md font-serif">
    <h2
      class="text-base font-medium text-stone-850 border-l-2 border-[#8E9A86] pl-3 mb-6 flex items-center gap-2"
    >
      <i class="pi pi-info-circle text-[#8E9A86]"></i> 基本資訊
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-700">
      <div class="flex flex-col bg-stone-50/40 p-4 rounded-xl border border-stone-200/30">
        <span class="text-stone-400 text-[10px] mb-1.5 uppercase tracking-widest font-light">訂單編號</span>
        <span class="font-sans text-stone-850 font-normal break-all">{{ props.order.orderNo }}</span>
      </div>
      <div class="flex flex-col bg-stone-50/40 p-4 rounded-xl border border-stone-200/30">
        <span class="text-stone-400 text-[10px] mb-1.5 uppercase tracking-widest font-light">訂單時間</span>
        <span class="font-sans text-stone-850 font-light text-sm mt-0.5">{{ new Date(props.order.createdAt).toLocaleString() }}</span>
      </div>
      <div
        class="flex flex-col bg-stone-50/40 p-4 rounded-xl border border-stone-200/30 items-start justify-center"
      >
        <span class="text-stone-400 text-[10px] mb-1.5 uppercase tracking-widest font-light">訂單狀態</span>
        <!-- 自訂高質感 Tag 代替原本的 PrimeVue Tag，保證視覺統一 -->
        <span :class="['px-3 py-0.5 text-[10px] rounded-full border tracking-wide transition-all font-light flex items-center gap-1.5 mt-0.5',
          getSeverity(props.order.statusText) === 'success' ? 'bg-[#8E9A86]/10 text-[#8E9A86] border-[#8E9A86]/20' :
          getSeverity(props.order.statusText) === 'warn' ? 'bg-amber-500/5 text-amber-600 border-amber-100' :
          getSeverity(props.order.statusText) === 'info' ? 'bg-stone-500/5 text-stone-600 border-stone-200' :
          'bg-stone-50 text-stone-500 border-stone-200/50'
        ]">
          {{ props.order.statusText }}
        </span>
      </div>
    </div>
  </div>
</template>
