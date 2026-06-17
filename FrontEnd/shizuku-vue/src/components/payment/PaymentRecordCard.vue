<script setup>
import { useRouter } from 'vue-router'

import Tag from 'primevue/tag'
import Button from 'primevue/button'

// 取得路由器以便進行頁面跳轉
const router = useRouter()

// 接收單筆支付紀錄與對應訂單編號
const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
})

// 依交易狀態回傳對應的標籤樣式
const getSeverity = (status) => {
  if (status === '付款成功') return 'success'
  if (status === '處理中') return 'warning'
  if (status === '退款完成') return 'info'
  return 'danger'
}

// 進入單筆支付明細頁
const goToPaymentDetail = () => {
  router.push({
    name: 'payment-detail',
    params: {
      id: props.orderId,
      transactionId: props.payment.transactionId,
    },
  })
}
</script>

<template>
  <div
    class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
  >
    <div>
      <h3 class="text-lg font-extrabold text-gray-800">{{ props.payment.transactionId }}</h3>
      <p class="text-sm text-gray-500 mt-1">交易時間：{{ props.payment.paidAt }}</p>
      <p class="text-sm text-gray-400 mt-1">付款方式：{{ props.payment.method }}</p>
    </div>

    <div class="flex flex-col md:items-end gap-2">
      <Tag :value="props.payment.status" :severity="getSeverity(props.payment.status)" rounded />
      <span class="text-xl font-black text-gray-700">$ {{ props.payment.totalPaid }}</span>
    </div>

    <Button
      label="查看明細"
      icon="pi pi-angle-right"
      iconPos="right"
      outlined
      rounded
      @click="goToPaymentDetail"
    />
  </div>
</template>
