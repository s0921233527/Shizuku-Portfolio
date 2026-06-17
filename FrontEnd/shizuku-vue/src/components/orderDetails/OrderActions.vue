<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

import { ORDER_STATUS, PAYMENT_METHOD, orderStatusManager } from '@/services/orderStatusManager'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

// 根據付款方式 ID 或字串，取得高防禦性的 dynamic 金流 UI 資訊
const paymentMethodInfo = computed(() => {
  // 1. 如果訂單已經取消 (已取消)，付款方式應變更為「交易已終止」
  if (props.order.status === ORDER_STATUS.CANCELLED || props.order.statusText === '已取消') {
    return { text: '交易已終止 (已取消)', color: '#9ca3af', icon: 'pi pi-times-circle' }
  }

  // 2. 如果訂單已經退款 (已退款)，付款方式應變更為「金流已退回」
  if (props.order.status === ORDER_STATUS.REFUNDED || props.order.statusText === '已退款') {
    return { text: '已退還 (金流已退回)', color: '#64748b', icon: 'pi pi-undo' }
  }

  // 3. 如果訂單處於退款審核中 (待退款)
  if (props.order.status === ORDER_STATUS.PENDING_REFUND || props.order.statusText === '待退款') {
    return { text: '退款處理中', color: '#a855f7', icon: 'pi pi-spinner pi-spin' }
  }

  // 4. 常規未退款前的原付款方式渲染
  if (props.order.paymentMethodId) {
    return orderStatusManager.getPaymentMethodInfo(props.order.paymentMethodId)
  }

  // 智能降級字串模糊比對，防止 API 未回傳 ID 時畫面破裂
  const text = props.order.paymentMethod || '未指定'
  if (text.includes('LINE')) {
    return orderStatusManager.getPaymentMethodInfo(PAYMENT_METHOD.LINEPAY)
  }
  if (text.includes('貨到') || text.includes('COD')) {
    return orderStatusManager.getPaymentMethodInfo(PAYMENT_METHOD.COD)
  }
  if (text.includes('信用卡') || text.includes('金融卡') || text.includes('綠界')) {
    return orderStatusManager.getPaymentMethodInfo(PAYMENT_METHOD.ECPAY)
  }

  return { text, color: '#64748b', icon: 'pi pi-wallet' }
})

const emit = defineEmits(['repay', 'cancel', 'requestRefund'])

const menu = ref()
const items = ref([
  {
    label: '信用卡',
    icon: 'pi pi-credit-card',
    command: () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
      const paymentWindow = isMobile ? null : window.open('about:blank', '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes')
      emit('repay', PAYMENT_METHOD.ECPAY, paymentWindow)
    },
  },
  {
    label: 'LINE Pay',
    icon: 'pi pi-mobile',
    command: () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
      const paymentWindow = isMobile ? null : window.open('about:blank', '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes')
      emit('repay', PAYMENT_METHOD.LINEPAY, paymentWindow)
    },
  },
  {
    label: '貨到付款',
    icon: 'pi pi-box',
    command: () => {
      emit('repay', PAYMENT_METHOD.COD, null)
    },
  },
])

// 利用狀態機進行完全無魔術字判定
const isPendingPayment = computed(() => {
  return props.order.status === ORDER_STATUS.PENDING || props.order.statusText === '未付款'
})

const isDelivered = computed(() => {
  return props.order.status === ORDER_STATUS.DELIVERED || props.order.statusText === '已送達'
})

const isPaid = computed(() => {
  return props.order.status === ORDER_STATUS.PAID || props.order.statusText === '已付款'
})

const isPendingRefund = computed(() => {
  return props.order.status === ORDER_STATUS.PENDING_REFUND || props.order.statusText === '待退款'
})

const isRefunded = computed(() => {
  return props.order.status === ORDER_STATUS.REFUNDED || props.order.statusText === '已退款'
})

const toggleMenu = (event) => {
  menu.value.toggle(event)
}
</script>

<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4"
  >
    <!-- 隱藏的彈出式 Menu，用於點擊前往結帳時供選取付款管道 -->
    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />

    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
      <div
        class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-colors"
        :style="{ color: paymentMethodInfo.color }"
      >
        <i :class="[paymentMethodInfo.icon || 'pi pi-wallet', 'text-sm']"></i>
      </div>
      <div class="flex flex-col">
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">付款方式</span>
        <span class="font-bold text-gray-800 text-sm">{{ paymentMethodInfo.text }}</span>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <!-- 1. 當訂單為待付款/未付款時，顯示取消與前往結帳 -->
      <template v-if="isPendingPayment">
        <Button
          label="取消訂單"
          severity="danger"
          variant="outlined"
          class="rounded-xl px-6 font-bold"
          @click="emit('cancel')"
        />
        <Button
          label="前往結帳"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="rounded-xl px-6 font-bold !bg-gray-900 !border-gray-900 hover:!bg-gray-800 transition-colors"
          @click="toggleMenu"
        />
      </template>

      <!-- 2. 已付款但尚未出貨：自助秒退款，直接執行退刷 (貨到付款無金流退刷，顯示取消訂單) -->
      <template v-else-if="isPaid">
        <Button
          :label="
            props.order.paymentMethodId === PAYMENT_METHOD.COD ||
            props.order.paymentMethod === '貨到付款'
              ? '取消訂單'
              : '取消訂單並退款'
          "
          icon="pi pi-times-circle"
          severity="danger"
          class="rounded-xl px-6 font-bold"
          @click="emit('requestRefund')"
        />
      </template>

      <!-- 3. 已送達：常規客服審核退款 -->
      <template v-else-if="isDelivered">
        <Button
          label="申請退款"
          icon="pi pi-undo"
          severity="warning"
          class="rounded-xl px-6 font-bold"
          @click="emit('requestRefund')"
        />
      </template>

      <!-- 4. 待退款狀態提示 -->
      <template v-else-if="isPendingRefund">
        <div
          class="flex items-center gap-2 bg-purple-50 px-5 py-3 rounded-xl border border-purple-200"
        >
          <i class="pi pi-spinner pi-spin text-purple-500"></i>
          <span class="text-sm font-bold text-purple-700">退款審核處理中，請耐心等候</span>
        </div>
      </template>

      <!-- 5. 已退款狀態提示 (貨到付款顯示已取消，線上支付顯示已退款) -->
      <template v-else-if="isRefunded">
        <div
          class="flex items-center gap-2 bg-gray-100 px-5 py-3 rounded-xl border border-gray-200"
        >
          <i class="pi pi-check-circle text-gray-500"></i>
          <span class="text-sm font-bold text-gray-600">
            {{
              props.order.paymentMethodId === PAYMENT_METHOD.COD ||
              props.order.paymentMethod === '貨到付款'
                ? '此訂單已成功取消'
                : '此訂單已完成退款'
            }}
          </span>
        </div>
      </template>

      <!-- 6. 其他已付款、出貨中或取消狀態，顯示再次購買按鈕 -->
      <template v-else>
        <Button
          label="再次購買"
          icon="pi pi-shopping-cart"
          severity="secondary"
          variant="outlined"
          class="rounded-xl px-6 font-bold opacity-60 cursor-not-allowed"
          title="再次購買功能開發中，敬請期待"
          disabled
        />
      </template>
    </div>
  </div>
</template>
