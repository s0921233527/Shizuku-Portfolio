<script setup>
import OrderBasicInfo from './orderDetails/OrderBasicInfo.vue'
import OrderProductList from './orderDetails/OrderProductList.vue'
import OrderDeliveryPayment from './orderDetails/OrderDeliveryPayment.vue'
import OrderAmountSummary from './orderDetails/OrderAmountSummary.vue'
import OrderActions from './orderDetails/OrderActions.vue'
import OrderProgressStepper from './orderDetails/OrderProgressStepper.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['repay', 'cancel'])

const handleRepay = (methodId) => {
  emit('repay', methodId)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="flex flex-col gap-3 mt-2 max-w-5xl mx-auto">
    <!-- 基本資訊 -->
    <OrderBasicInfo :order="props.order" />

    <!-- 商品明細 -->
    <OrderProductList :items="props.order.items" />

    <!-- 配送與金額區塊 (並排) -->
    <div class="flex flex-col md:flex-row gap-3 items-stretch">
      <div class="flex-1 min-w-[300px]">
        <OrderDeliveryPayment :order="props.order" />
      </div>
      <div class="flex-1 min-w-[300px]">
        <OrderAmountSummary :order="props.order" />
      </div>
    </div>

    <!-- 進度條 -->
    <OrderProgressStepper :order="props.order" />

    <!-- 操作按鈕 -->
    <OrderActions :order="props.order" @repay="handleRepay" @cancel="handleCancel" />
  </div>
</template>
