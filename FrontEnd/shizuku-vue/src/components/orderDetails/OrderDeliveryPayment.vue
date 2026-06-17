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

// 將狀態文字轉為數字的輔助 Map
const statusTextToCode = {
  未付款: ORDER_STATUS.PENDING,
  已付款: ORDER_STATUS.PAID,
  出貨中: ORDER_STATUS.SHIPPING,
  已送達: ORDER_STATUS.DELIVERED,
  已取消: ORDER_STATUS.CANCELLED,
  待退款: ORDER_STATUS.PENDING_REFUND,
  已退款: ORDER_STATUS.REFUNDED,
}

const currentStatus = computed(() => {
  return props.order.status || statusTextToCode[props.order.statusText] || ORDER_STATUS.PENDING
})

// 出貨狀態邏輯
const shippingStatus = computed(() => {
  const status = currentStatus.value

  if (status === ORDER_STATUS.PENDING || status === ORDER_STATUS.CANCELLED) {
    return { text: '尚未出貨', severity: 'secondary', icon: 'pi pi-box' }
  }
  if (status === ORDER_STATUS.PAID) {
    return {
      text: '理貨中 (準備出貨)',
      severity: 'info',
      icon: 'pi pi-spin pi-spinner',
    }
  }
  if (status === ORDER_STATUS.SHIPPING) {
    return { text: '已交寄 (配送中)', severity: 'warn', icon: 'pi pi-truck' }
  }
  if (status === ORDER_STATUS.DELIVERED) {
    return { text: '已送達', severity: 'success', icon: 'pi pi-check-circle' }
  }
  if (status === ORDER_STATUS.PENDING_REFUND) {
    return { text: '物流已截留 (退款審核中)', severity: 'warn', icon: 'pi pi-exclamation-triangle' }
  }
  if (status === ORDER_STATUS.REFUNDED) {
    return { text: '物流已取消 (交易終止)', severity: 'secondary', icon: 'pi pi-times-circle' }
  }
  return {
    text: '未知狀態',
    severity: 'danger',
    icon: 'pi pi-question-circle',
  }
})
</script>

<template>
  <div class="bg-white/60 p-6 rounded-2xl border border-stone-200/50 flex-1 h-full font-serif backdrop-blur-md">
    <h2
      class="text-base font-medium text-stone-850 border-l-2 border-[#8E9A86] pl-3 mb-6 flex items-center gap-2"
    >
      <i class="pi pi-truck text-[#8E9A86]"></i> 配送資訊
    </h2>
    <div class="flex flex-col gap-5 text-stone-700">
      <div class="flex items-start gap-4 p-4 bg-stone-50/40 rounded-xl border border-stone-200/30">
        <div
          class="w-10 h-10 rounded-full bg-[#8E9A86]/10 flex items-center justify-center flex-shrink-0 text-[#8E9A86]"
        >
          <i class="pi pi-user text-sm"></i>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] text-stone-400 font-light uppercase tracking-wider">收件人</span>
          <span class="font-normal text-stone-850 text-sm mb-2">{{ props.order.receiverName }}</span>
          <span class="text-[10px] text-stone-400 font-light uppercase tracking-wider">聯絡電話</span>
          <span class="font-normal text-stone-850 text-sm font-sans">{{ props.order.receiverPhone }}</span>
        </div>
      </div>

      <div class="flex items-start gap-4 p-4 bg-stone-50/40 rounded-xl border border-stone-200/30">
        <div
          class="w-10 h-10 rounded-full bg-[#8E9A86]/10 flex items-center justify-center flex-shrink-0 text-[#8E9A86]"
        >
          <i class="pi pi-map-marker text-sm"></i>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] text-stone-400 font-light uppercase tracking-wider">收件地址</span>
          <span class="text-stone-750 text-sm leading-relaxed font-light mt-1">{{ props.order.receiverAddress }}</span>
        </div>
      </div>

      <div
        class="flex items-center justify-between p-4 bg-[#8E9A86]/5 rounded-xl border border-stone-200/40 mt-2"
      >
        <span class="text-xs text-stone-600 font-light tracking-wide">物流出貨狀態</span>
        <!-- 自訂高質感 Tag 代替原本的 PrimeVue Tag，保證視覺統一 -->
        <span :class="['px-3 py-0.5 text-[10px] rounded-full border tracking-wide transition-all font-light flex items-center gap-1.5',
          shippingStatus.severity === 'success' ? 'bg-[#8E9A86]/10 text-[#8E9A86] border-[#8E9A86]/20' :
          shippingStatus.severity === 'warn' ? 'bg-amber-500/5 text-amber-600 border-amber-100' :
          shippingStatus.severity === 'info' ? 'bg-stone-500/5 text-stone-600 border-stone-200' :
          'bg-stone-50 text-stone-500 border-stone-200/50'
        ]">
          <i :class="[shippingStatus.icon, 'text-[10px]']"></i>
          {{ shippingStatus.text }}
        </span>
      </div>
    </div>
  </div>
</template>
