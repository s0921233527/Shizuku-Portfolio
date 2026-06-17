<script setup>
import { computed } from 'vue'
import { orderStatusManager, ORDER_STATUS } from '@/services/orderStatusManager'

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
  已送達: ORDER_STATUS.DELIVERED,
  已取消: ORDER_STATUS.CANCELLED,
  待退款: ORDER_STATUS.PENDING_REFUND,
  已退款: ORDER_STATUS.REFUNDED,
}

const currentStatus = computed(() => {
  return props.order.status || statusTextToCode[props.order.statusText] || ORDER_STATUS.PENDING
})
const timelineEvents = computed(() => {
  // 如果是取消或退款狀態，將 timeline 計算的基準訂在已付款或未付款，防止正向進度條「全亮」
  let evalStatus = Number(currentStatus.value)
  if (
    evalStatus === ORDER_STATUS.CANCELLED ||
    evalStatus === ORDER_STATUS.PENDING_REFUND ||
    evalStatus === ORDER_STATUS.REFUNDED
  ) {
    evalStatus = ORDER_STATUS.PENDING
  }
  return orderStatusManager.getTimelineSteps(evalStatus)
})

const activeStepIndex = computed(() => {
  // 如果訂單已取消、待退款或已退款，進度條不顯示任何正向進度
  if (
    currentStatus.value === ORDER_STATUS.CANCELLED ||
    currentStatus.value === ORDER_STATUS.PENDING_REFUND ||
    currentStatus.value === ORDER_STATUS.REFUNDED
  ) {
    return -1
  }

  // 找出最後一個已完成 (completed) 的步驟索引
  const lastCompletedIndex = [...timelineEvents.value].reverse().findIndex((e) => e.completed)
  if (lastCompletedIndex === -1) return 0

  return timelineEvents.value.length - 1 - lastCompletedIndex
})
</script>

<template>
  <div class="bg-white/80 p-6 rounded-2xl shadow-xs border border-stone-200/40 backdrop-blur-md font-serif text-stone-850">
    <h2
      class="text-base font-medium text-stone-850 border-l-4 border-[#8E9A86] pl-3 mb-8 flex items-center gap-2 font-serif"
    >
      <i class="pi pi-map text-[#8E9A86]"></i> 訂單處理進度
    </h2>

    <!-- 退款或取消狀態尊榮橫幅 -->
    <div
      v-if="
        currentStatus === ORDER_STATUS.PENDING_REFUND ||
        currentStatus === ORDER_STATUS.REFUNDED ||
        currentStatus === ORDER_STATUS.CANCELLED
      "
      class="mb-8 p-4 rounded-xl border flex items-start gap-3 transition-all duration-300"
      :class="[
        currentStatus === ORDER_STATUS.PENDING_REFUND
          ? 'bg-purple-500/5 border-purple-200/40 text-purple-700'
          : currentStatus === ORDER_STATUS.REFUNDED
            ? 'bg-stone-100 border-stone-200/50 text-stone-600'
            : 'bg-rose-500/5 border-rose-200/40 text-rose-500',
      ]"
    >
      <div class="flex-shrink-0 mt-0.5">
        <i
          :class="[
            currentStatus === ORDER_STATUS.PENDING_REFUND
              ? 'pi pi-spin pi-spinner text-purple-400 text-sm'
              : currentStatus === ORDER_STATUS.REFUNDED
                ? 'pi pi-undo text-stone-400 text-sm'
                : 'pi pi-times-circle text-rose-400 text-sm',
          ]"
        ></i>
      </div>
      <div>
        <h4 class="font-medium text-sm mb-1 font-serif">
          {{
            currentStatus === ORDER_STATUS.PENDING_REFUND
              ? '退款申請處理中'
              : currentStatus === ORDER_STATUS.REFUNDED
                ? '訂單退款已完成'
                : '訂單已取消'
          }}
        </h4>
        <p class="text-xs opacity-90 leading-relaxed font-serif font-light">
          {{
            currentStatus === ORDER_STATUS.PENDING_REFUND
              ? '本筆訂單已發起退款流程，金流服務商正在進行刷退作業。規格庫存已預先完成回補，請耐心等候刷退成功。'
              : currentStatus === ORDER_STATUS.REFUNDED
                ? '本筆訂單金流已成功由後台系統發起線上刷退，款項將退回您的原支付卡片或帳戶，交易已正式終止。'
                : '本筆訂單交易已終止，系統已安全釋放保留的庫存與優惠券。'
          }}
        </p>
      </div>
    </div>

    <div class="w-full p-2">
      <div class="relative flex justify-between w-full">
        <!-- 灰線背景：從第一個圈圈中心連到最後一個圈圈中心 -->
        <div
          class="absolute top-4 h-0.5 bg-stone-200/60 -translate-y-1/2 z-0"
          :style="{
            left: (100 / (2 * timelineEvents.length)) + '%',
            right: (100 / (2 * timelineEvents.length)) + '%'
          }"
        ></div>

        <!-- 綠線進度：同樣起點，根據當前步驟精準推移到對應的圈圈中心 -->
        <div
          class="absolute top-4 h-0.5 bg-[#8E9A86] -translate-y-1/2 transition-all duration-500 ease-out z-0"
          :style="{
            left: (100 / (2 * timelineEvents.length)) + '%',
            width: (Math.max(0, activeStepIndex) / (timelineEvents.length - 1)) * (100 - (100 / timelineEvents.length)) + '%'
          }"
        ></div>

        <div
          v-for="(step, index) in timelineEvents"
          :key="index"
          class="relative z-10 flex flex-col items-center flex-1"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
            :class="[
              index <= activeStepIndex
                ? 'bg-[#8E9A86] border-[#8E9A86] text-white shadow-md ring-4 ring-[#8E9A86]/20'
                : 'bg-white border-stone-200/60 text-stone-400',
            ]"
          >
            <i
              :class="index < activeStepIndex ? 'pi pi-check text-xs' : step.icon"
              class="text-xs"
            ></i>
          </div>

          <span
            class="text-xs font-medium mt-3 transition-colors duration-300 font-serif"
            :class="index <= activeStepIndex ? 'text-[#8E9A86]' : 'text-stone-400'"
          >
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
