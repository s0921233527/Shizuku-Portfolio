<script setup>
import { useCheckout } from '@/composables/useCheckout'
import PaymentResultOverlay from '@/components/payment/PaymentResultOverlay.vue'
import CheckoutSummary from '@/components/checkout/CheckoutSummary.vue'
import CheckoutForm from '@/components/checkout/CheckoutForm.vue'

const {
  form,
  showResultModal,
  resultStatus,
  resultMessage,
  paymentOptions,
  shippingFee,
  finalTotal,
  handleFormUpdate,
  handleBack,
  submitOrder,
  handleCountdownEnd,
  cartItems,
  cartTotal,
  addressList,
} = useCheckout()
</script>

<template>
  <div class="min-h-screen bg-[#FCFBF9] text-stone-850 font-serif pb-20 pt-28">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 標題與 LOGO -->
      <header class="mb-10 text-center">
        <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase">Checkout</span>
        <RouterLink :to="{ name: 'home' }" custom v-slot="{ navigate }">
          <h1
            class="text-3xl font-light tracking-[0.2em] text-stone-850 uppercase cursor-pointer hover:opacity-80 transition-opacity mt-2"
            @click="navigate"
          >
            Shizuku.
          </h1>
        </RouterLink>
        <div class="w-8 h-[1px] bg-[#8E9A86] mx-auto mt-4"></div>
      </header>

      <!-- 返回購物車連結 (置於卡片上方) -->
      <div class="mb-6 flex justify-start">
        <button
          @click="handleBack"
          class="inline-flex items-center gap-2 text-stone-500 hover:text-[#8E9A86] text-sm transition-colors group cursor-pointer"
        >
          <i class="pi pi-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
          <span>返回購物車</span>
        </button>
      </div>

      <!-- 主體結帳盒 (優雅和風卡片設計) -->
      <div class="bg-white/85 border border-stone-200/50 rounded-2xl shadow-sm overflow-hidden backdrop-blur-md">
        <!-- 上半部：訂單摘要 -->
        <CheckoutSummary
          :items="cartItems"
          :subtotal="cartTotal"
          :shippingFee="shippingFee"
          :finalTotal="finalTotal"
        />

        <!-- 下半部：收件與付款方式表單 -->
        <CheckoutForm
          :form="form"
          :paymentOptions="paymentOptions"
          :cartTotal="cartTotal"
          :addressList="addressList"
          @update:form="handleFormUpdate"
          @submit="submitOrder"
          @back="handleBack"
        />
      </div>
    </div>

    <!-- 付款結果彈出視窗 -->
    <PaymentResultOverlay
      :visible="showResultModal"
      :status="resultStatus"
      :message="resultMessage"
      @update:visible="showResultModal = $event"
      @countdown-end="handleCountdownEnd"
    />
  </div>
</template>

<style scoped>
/* 提供極致安全感的高級淡入排版 */
.max-w-3xl {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
