<script setup>
import Tag from 'primevue/tag'
import Button from 'primevue/button'

// 接收支付明細資料
const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
})

// 依照交易狀態回傳標籤樣式
const getStatusSeverity = (status) => {
  if (status === '付款成功') return 'success'
  if (status === '處理中') return 'warning'
  if (status === '退款完成') return 'info'
  return 'danger'
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">交易基本資訊</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <p><span class="text-gray-500 mr-2">交易編號:</span> {{ props.payment.transactionId }}</p>
        <p><span class="text-gray-500 mr-2">訂單編號:</span> {{ props.payment.orderId }}</p>
        <p><span class="text-gray-500 mr-2">付款時間:</span> {{ props.payment.paidAt }}</p>
        <p><span class="text-gray-500 mr-2">付款方式:</span> {{ props.payment.method }}</p>
        <p class="flex items-center gap-2">
          <span class="text-gray-500">交易狀態:</span>
          <Tag :value="props.payment.status" :severity="getStatusSeverity(props.payment.status)" rounded />
        </p>
        <p><span class="text-gray-500 mr-2">授權碼:</span> {{ props.payment.authCode }}</p>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">支付金額明細</h2>
      <div class="flex flex-col gap-3 text-gray-700">
        <div class="flex justify-between">
          <p class="text-gray-500">商品總額</p>
          <p>$ {{ props.payment.subtotal }}</p>
        </div>
        <div class="flex justify-between">
          <p class="text-gray-500">運費</p>
          <p>$ {{ props.payment.shippingFee }}</p>
        </div>
        <div class="flex justify-between text-red-500">
          <p>優惠折抵</p>
          <p>- $ {{ props.payment.discount }}</p>
        </div>
        <hr class="my-2 border-gray-200" />
        <div class="flex justify-between items-center">
          <p class="font-bold text-gray-800">實際付款金額</p>
          <p class="text-3xl font-extrabold text-blue-800">$ {{ props.payment.totalPaid }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">交易附註</h2>
      <p class="text-gray-600 leading-relaxed">
        {{ props.payment.note }}
      </p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-end">
      <Button icon="pi pi-download" label="下載支付憑證" outlined />
    </div>
  </div>
</template>
