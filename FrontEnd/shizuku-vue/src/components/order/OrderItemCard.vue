<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ORDER_STATUS } from '@/services/orderStatusManager'

// 呼叫司機待命
const router = useRouter()

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

// 統一對照表
const statusTextToCode = {
  未付款: ORDER_STATUS.PENDING,
  已付款: ORDER_STATUS.PAID,
  出貨中: ORDER_STATUS.SHIPPING,
  已出貨: ORDER_STATUS.SHIPPING,
  已送達: ORDER_STATUS.DELIVERED,
  已完成: ORDER_STATUS.DELIVERED,
  已取消: ORDER_STATUS.CANCELLED,
  待退款: ORDER_STATUS.PENDING_REFUND,
  已退款: ORDER_STATUS.REFUNDED,
}

// 取得數值化訂單狀態
const currentStatusCode = computed(() => {
  const statusValue = props.order.status
  if (typeof statusValue === 'number') return statusValue
  return statusTextToCode[statusValue] || ORDER_STATUS.PENDING
})

// 倒數計時邏輯
const timeLeft = ref('')
let timer = null

const startLocalCountdown = () => {
  if (currentStatusCode.value !== ORDER_STATUS.PENDING || !props.order.createdAt) {
    timeLeft.value = ''
    return
  }

  const updateTimer = () => {
    const created = new Date(props.order.createdAt)
    const deadline = new Date(created.getTime() + 10 * 60 * 1000) // 建立時間 + 10 分鐘
    const now = new Date()
    const diff = deadline - now

    if (diff <= 0) {
      timeLeft.value = '已逾時'
      clearInterval(timer)
      timer = null
      return
    }

    const minutes = Math.floor(diff / 1000 / 60)
    const seconds = Math.floor((diff / 1000) % 60)
    timeLeft.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  updateTimer()
  timer = setInterval(updateTimer, 1000)
}

onMounted(() => {
  startLocalCountdown()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 計算出精確的付款狀態與對應的 UI 樣式
const paymentStatus = computed(() => {
  const code = currentStatusCode.value
  if (code === ORDER_STATUS.PENDING) {
    return { text: '未付款', severity: 'danger' } // 紅色/橙色警示未付款
  }
  if (code === ORDER_STATUS.CANCELLED) {
    return { text: '已取消', severity: 'secondary' } // 灰色
  }
  if (code === ORDER_STATUS.PENDING_REFUND) {
    return { text: '退款中', severity: 'warn' } // 橘黃色退款中
  }
  if (code === ORDER_STATUS.REFUNDED) {
    return { text: '已退款', severity: 'secondary' } // 灰色已退款
  }
  return { text: '已付款', severity: 'success' } // 綠色已付款
})

// 計算出精確的物流與訂單進度狀態與對應的 UI 樣式
const shippingStatus = computed(() => {
  const code = currentStatusCode.value
  if (code === ORDER_STATUS.PENDING) {
    return { text: '訂單待付款', severity: 'secondary' }
  }
  if (code === ORDER_STATUS.PAID) {
    return { text: '理貨中', severity: 'info' }
  }
  if (code === ORDER_STATUS.SHIPPING) {
    return { text: '配送中', severity: 'warn' }
  }
  if (code === ORDER_STATUS.DELIVERED) {
    return { text: '商品已送達', severity: 'success' }
  }
  if (code === ORDER_STATUS.CANCELLED) {
    return { text: '訂單已終止', severity: 'secondary' }
  }
  if (code === ORDER_STATUS.PENDING_REFUND) {
    return { text: '退款申請審核中', severity: 'warn' }
  }
  if (code === ORDER_STATUS.REFUNDED) {
    return { text: '交易已終止退款', severity: 'secondary' }
  }
  return { text: '處理中', severity: 'secondary' }
})

// 跳轉到詳情頁的動作
const goToDetail = () => {
  router.push({
    name: 'MemberOrderDetail',
    params: { id: props.order.id },
  })
}
</script>

<template>
  <div
    class="bg-white/60 rounded-xl p-6 mb-4 border border-stone-200/50 shadow-sm hover:border-[#8E9A86] hover:bg-[#8E9A86]/5 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden group font-serif"
  >
    <!-- 左側裝飾性漸變背景條 -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
      :class="[
        currentStatusCode === ORDER_STATUS.PENDING
          ? 'bg-amber-400/80'
          : currentStatusCode === ORDER_STATUS.PENDING_REFUND
            ? 'bg-stone-300'
            : currentStatusCode === ORDER_STATUS.CANCELLED ||
                currentStatusCode === ORDER_STATUS.REFUNDED
              ? 'bg-stone-200'
              : 'bg-[#8E9A86]',
      ]"
    ></div>

    <!-- 左側：訂單識別與時間 -->
    <div class="flex items-center gap-5 pl-2">
      <div
        class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
        :class="[
          currentStatusCode === ORDER_STATUS.PENDING
            ? 'bg-amber-500/5 text-amber-600 border border-amber-200/30'
            : currentStatusCode === ORDER_STATUS.PENDING_REFUND
              ? 'bg-stone-100 text-stone-500 border border-stone-200/30'
              : currentStatusCode === ORDER_STATUS.CANCELLED ||
                  currentStatusCode === ORDER_STATUS.REFUNDED
                ? 'bg-stone-50 text-stone-400 border border-stone-100'
                : 'bg-[#8E9A86]/10 text-[#8E9A86] border border-[#8E9A86]/10',
        ]"
      >
        <i class="pi pi-receipt text-lg"></i>
      </div>

      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] font-light text-stone-400 tracking-widest uppercase">訂單編號</span>
        <h3
          class="text-base font-normal text-stone-850 tracking-wide group-hover:text-[#8E9A86] transition-colors break-all"
        >
          {{ props.order.id }}
        </h3>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
          <div class="flex items-center gap-1.5 text-xs text-stone-400 font-light">
            <i class="pi pi-calendar text-[10px] text-[#8E9A86]"></i>
            <span>訂購時間：{{ props.order.date }}</span>
          </div>
          <!-- 倒數計時提示 -->
          <div
            v-if="currentStatusCode === ORDER_STATUS.PENDING && timeLeft && timeLeft !== '已逾時'"
            class="flex items-center gap-1.5 text-xs text-amber-600 font-light bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-200/20"
          >
            <i class="pi pi-clock text-[10px] text-amber-500"></i>
            <span>付款剩餘時間：<span class="font-mono font-medium">{{ timeLeft }}</span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側：金額、雙狀態標籤與詳情按鈕 -->
    <div
      class="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 justify-between w-full lg:w-auto pl-2 lg:pl-0"
    >
      <!-- 狀態與金額區 -->
      <div class="flex flex-col lg:items-end gap-2.5">
        <!-- 雙狀態 Badge 容器 -->
        <div class="flex flex-wrap items-center gap-2 lg:justify-end">
          <!-- 付款狀態 Tag -->
          <span
            class="px-3 py-0.5 text-xs rounded-full border tracking-wide transition-all font-light"
            :class="[
              paymentStatus.severity === 'danger'
                ? 'bg-red-500/5 text-red-600 border-red-100'
                : paymentStatus.severity === 'warn'
                  ? 'bg-amber-500/5 text-amber-600 border-amber-100'
                  : paymentStatus.severity === 'secondary'
                    ? 'bg-stone-50 text-stone-500 border-stone-250/50'
                    : 'bg-[#8E9A86]/10 text-[#8E9A86] border-[#8E9A86]/20',
            ]"
          >
            <i class="pi pi-wallet text-[10px] mr-1 text-[#8E9A86]/70"></i>
            {{ paymentStatus.text }}
          </span>

          <!-- 物流/進度 Tag -->
          <span
            class="px-3 py-0.5 text-xs rounded-full border tracking-wide transition-all font-light"
            :class="[
              shippingStatus.severity === 'secondary'
                ? 'bg-stone-50 text-stone-400 border-stone-200'
                : shippingStatus.severity === 'info'
                  ? 'bg-[#8E9A86]/10 text-[#8E9A86] border-[#8E9A86]/20'
                  : shippingStatus.severity === 'warn'
                    ? 'bg-amber-500/5 text-amber-600 border-amber-100'
                    : 'bg-[#8E9A86]/15 text-[#8E9A86] border-[#8E9A86]/30',
            ]"
          >
            <i class="pi pi-box text-[10px] mr-1 text-[#8E9A86]/70"></i>
            {{ shippingStatus.text }}
          </span>
        </div>

        <!-- 總計金額 -->
        <div class="flex items-baseline gap-1 lg:justify-end">
          <span class="text-[10px] text-stone-400 font-light uppercase tracking-wider">NT$</span>
          <span class="text-xl font-light text-stone-800 tracking-tight">
            {{ Number(props.order.total).toLocaleString() }}
          </span>
        </div>
      </div>

      <!-- 查看詳情按鈕 -->
      <div class="flex items-center w-full lg:w-auto">
        <button
          @click="goToDetail"
          class="w-full lg:w-auto px-6 py-2.5 bg-white/60 hover:bg-[#8E9A86] text-stone-700 hover:text-white border border-stone-200/80 hover:border-[#8E9A86] font-light rounded-full shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
        >
          <span>查看詳情</span>
          <i
            class="pi pi-arrow-right text-[10px] transition-transform duration-300 group-hover/btn:translate-x-1"
          ></i>
        </button>
      </div>
    </div>
  </div>
</template>
