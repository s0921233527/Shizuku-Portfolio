<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { ORDER_STATUS } from '@/services/orderStatusManager'

// 導入與 OrderItemCard 一致的高質感扁平化子元件
import OrderBasicInfo from '@/components/orderDetails/OrderBasicInfo.vue'
import OrderProductList from '@/components/orderDetails/OrderProductList.vue'
import OrderDeliveryPayment from '@/components/orderDetails/OrderDeliveryPayment.vue'
import OrderAmountSummary from '@/components/orderDetails/OrderAmountSummary.vue'
import OrderProgressStepper from '@/components/orderDetails/OrderProgressStepper.vue'
import OrderActions from '@/components/orderDetails/OrderActions.vue'

import PaymentResultOverlay from '@/components/payment/PaymentResultOverlay.vue'
import { getOrderDetailAPI, requestRefundAPI } from '@/api/order'
import { useAuthStore } from '@/stores/auth'

// 引入職責分離組合式函數
import { useOrderCountdown } from '@/composables/useOrderCountdown'
import { useOrderDetailActions } from '@/composables/useOrderDetailActions'

const toast = useToast()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const orderId = route.params.id

// 訂單狀態與資料管理
const orderData = ref(null)
const isLoading = ref(true)

// 導入倒數計時組合式函數 (專注倒數管理職責)
const { timeLeft, startCountdown } = useOrderCountdown(orderData)

// 讀取訂單詳細資訊
const fetchOrderDetail = async () => {
  try {
    const res = await getOrderDetailAPI(orderId, authStore.user?.fId)

    // 嚴格對接標準 ApiResponse.cs 成功狀態規範
    if (res && res.success && res.data) {
      // 統一將後端文字狀態碼，對應轉換為數值狀態碼以驅動倒數與 Stepper 狀態機
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

      const mappedData = {
        ...res.data,
        status: statusTextToCode[res.data.statusText] || ORDER_STATUS.PENDING,
      }

      orderData.value = mappedData
      startCountdown() // 觸發倒數計時 Composable 內部的計時更新
    } else {
      // ApiResponse.Success 為 false 的防禦性處理
      toast.add({
        severity: 'error',
        summary: '讀取資料失敗',
        detail: (res && res.message) || '無法載入訂單詳情。',
        life: 3000,
      })
      setTimeout(() => {
        router.push({ name: 'MemberOrders' })
      }, 1500)
    }
  } catch (error) {
    console.error('讀取訂單詳情失敗：', error)
    toast.add({
      severity: 'error',
      summary: '系統連線錯誤',
      detail: '無法與伺服器取得連線，請檢查您的網路狀態。',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

// 導入詳情流程操作組合式函數 (專注重新付款金流與取消訂單，完美對接 ApiResponse 規範)
const {
  showResultModal,
  resultStatus,
  resultMessage,
  handleRepay,
  handleCancel,
  handleCountdownEnd,
} = useOrderDetailActions(orderId, fetchOrderDetail)

onMounted(async () => {
  await fetchOrderDetail()
})

const goBack = () => {
  router.push({ name: 'MemberOrders' })
}

// ========== 統一取消與退款彈出視窗狀態 ==========
const showActionModal = ref(false)
const actionModalMode = ref('') // 'cancel' | 'refund'
const refundReason = ref('')
const isSubmitting = ref(false)

const quickReasons = [
  '買錯商品',
  '不想買了',
  '重複下單',
  '想換付款方式',
  '找到更便宜的'
]

const selectQuickReason = (reason) => {
  refundReason.value = reason
}

const openCancelModal = () => {
  actionModalMode.value = 'cancel'
  showActionModal.value = true
}

const openRefundModal = () => {
  actionModalMode.value = 'refund'
  refundReason.value = ''
  showActionModal.value = true
}

const submitAction = async () => {
  if (actionModalMode.value === 'cancel') {
    try {
      isSubmitting.value = true
      await handleCancel()
      showActionModal.value = false
    } catch (err) {
      console.error(err)
    } finally {
      isSubmitting.value = false
    }
  } else {
    if (!refundReason.value.trim()) {
      toast.add({ severity: 'warn', summary: '提示', detail: '請填寫或選擇退款原因。', life: 3000 })
      return
    }

    try {
      isSubmitting.value = true
      const res = await requestRefundAPI(orderId, refundReason.value.trim())
      if (res && res.success) {
        toast.add({ severity: 'success', summary: '申請成功', detail: res.message, life: 5000 })
        showActionModal.value = false
        await fetchOrderDetail()
      } else {
        toast.add({ severity: 'error', summary: '申請失敗', detail: res?.message || '退款申請發生錯誤', life: 5000 })
      }
    } catch (err) {
      toast.add({ severity: 'error', summary: '系統錯誤', detail: '無法連線伺服器，請稍後再試。', life: 4000 })
    } finally {
      isSubmitting.value = false
    }
  }
}

const handleRefundRequest = () => {
  openRefundModal()
}
</script>

<template>
  <!-- 載入中骨架狀態 -->
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-3 bg-transparent">
    <i class="pi pi-spin pi-spinner text-2xl text-[#8E9A86]"></i>
    <p class="text-stone-400 font-light text-xs tracking-widest animate-pulse">正在為您讀取訂單詳細資料...</p>
  </div>

  <!-- 資料就緒渲染主介面 -->
  <div v-else-if="orderData" class="w-full bg-transparent p-0 font-serif">
    <div class="w-full flex flex-col gap-6">
      <!-- 頂部精美導覽/標題區 -->
      <div class="flex items-center justify-between border-b border-stone-200/50 pb-6 mb-2">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="w-9 h-9 flex items-center justify-center bg-white/50 border border-stone-200 hover:border-[#8E9A86] text-stone-500 hover:text-[#8E9A86] rounded-full transition cursor-pointer"
          >
            <i class="pi pi-arrow-left text-sm"></i>
          </button>
          <div>
            <h1 class="text-xl font-light text-stone-850 tracking-wider">訂單詳細內容</h1>
            <p class="text-stone-500 text-xs mt-1 font-light">查看您的詳細訂單紀錄與明細</p>
          </div>
        </div>
      </div>

      <!-- 1. 精緻倒數計時提示條 (僅在未付款時顯示) -->
      <div
        v-if="orderData.status === ORDER_STATUS.PENDING && timeLeft !== '已逾時'"
        class="bg-amber-500/5 border border-amber-200/40 rounded-2xl p-5 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xs relative overflow-hidden group/alert"
      >
        <!-- 背景裝飾微光效果 -->
        <div
          class="absolute -right-4 -top-4 w-24 h-24 bg-amber-200/10 rounded-full blur-xl group-hover/alert:scale-110 transition-transform duration-300"
        ></div>

        <div class="flex items-center gap-3 text-amber-800">
          <i class="pi pi-exclamation-triangle text-xl shrink-0 text-amber-600"></i>
          <div>
            <p class="font-medium text-sm text-stone-800">此訂單尚未付款</p>
            <p class="text-xs text-stone-500 mt-1 font-light leading-relaxed">
              請於倒數結束前完成付款，否則系統將自動取消訂單並釋放庫存。
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-3 bg-white/60 px-5 py-2 rounded-xl border border-amber-200/30 shadow-inner shrink-0 z-10"
        >
          <span class="text-xs font-light text-stone-400 uppercase tracking-widest"
            >剩餘付款時間</span
          >
          <span class="text-2xl font-light text-amber-600 font-mono leading-none tracking-tight">
            {{ timeLeft }}
          </span>
        </div>
      </div>

      <!-- 2. 基本資訊 -->
      <OrderBasicInfo :order="orderData" />

      <!-- 3. 商品明細清單 -->
      <OrderProductList :items="orderData.items" />

      <!-- 4. 配送資訊 與 金額明細 -->
      <div class="flex flex-col lg:flex-row gap-6 items-stretch">
        <div class="flex-1 min-w-0">
          <OrderDeliveryPayment :order="orderData" />
        </div>
        <div class="flex-1 min-w-0">
          <OrderAmountSummary :order="orderData" />
        </div>
      </div>

      <!-- 5. 物流與配送狀態進度軸 -->
      <OrderProgressStepper :order="orderData" />

      <!-- 6. 操作按鈕 (最底部壓陣) -->
      <div class="bg-stone-50/30 p-5 rounded-2xl border border-stone-200/50 shadow-xs mt-2">
        <OrderActions :order="orderData" @repay="handleRepay" @cancel="openCancelModal" @requestRefund="handleRefundRequest" />
      </div>
    </div>

    <!-- 付款結果彈出視窗 -->
    <Teleport to="body">
      <PaymentResultOverlay
        :visible="showResultModal"
        :status="resultStatus"
        :message="resultMessage"
        @update:visible="showResultModal = $event"
        @countdown-end="handleCountdownEnd"
      />
    </Teleport>

    <!-- 統一取消/退款申請高級彈出視窗 -->
    <Teleport to="body">
      <div
        v-if="showActionModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs transition-all duration-300"
      >
        <!-- Modal Box -->
        <div
          class="bg-white rounded-3xl p-7 max-w-md w-full mx-4 shadow-2xl border border-gray-100 relative overflow-hidden transition-all duration-300 transform scale-100"
        >
          <!-- 頂部色條 -->
          <div
            class="absolute top-0 left-0 w-full h-1.5"
            :class="actionModalMode === 'cancel' ? 'bg-amber-500' : 'bg-rose-500'"
          ></div>

          <!-- 關閉按鈕 -->
          <button
            @click="showActionModal = false"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <i class="pi pi-times text-sm"></i>
          </button>

          <div class="flex flex-col items-center text-center mt-2">
            <!-- 圖示 -->
            <div
              class="p-4 rounded-full mb-4"
              :class="actionModalMode === 'cancel' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'"
            >
              <i
                :class="actionModalMode === 'cancel' ? 'pi pi-exclamation-circle' : 'pi pi-info-circle'"
                class="text-2xl"
              ></i>
            </div>

            <!-- 標題 -->
            <h3 class="text-xl font-black text-gray-800 tracking-tight">
              {{ actionModalMode === 'cancel' ? '確認取消訂單' : '申請取消與退款' }}
            </h3>

            <!-- 副標題 -->
            <p class="text-xs text-gray-500 mt-2 leading-relaxed px-2">
              {{
                actionModalMode === 'cancel'
                  ? '此筆訂單尚未付款，取消後將無法復原，商品庫存將被釋放。確定要取消此訂單嗎？'
                  : '此訂單已付款，取消將同步申請退款。請提供取消與退款原因，以利客服快速處理。'
              }}
            </p>

            <!-- 退款專用欄位 (選擇快速原因與文字框) -->
            <div v-if="actionModalMode === 'refund'" class="w-full mt-5 text-left">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 block"
                >快速選擇原因</label
              >
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="reason in quickReasons"
                  :key="reason"
                  type="button"
                  @click="selectQuickReason(reason)"
                  class="px-3 py-1.5 text-xs rounded-lg transition-all border text-left cursor-pointer"
                  :class="
                    refundReason === reason
                      ? 'bg-rose-600 border-rose-600 text-white font-bold shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  "
                >
                  {{ reason }}
                </button>
              </div>

              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block"
                >詳細原因說明</label
              >
              <textarea
                v-model="refundReason"
                placeholder="請簡述您的退款原因..."
                class="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none resize-none h-24 transition-all"
              ></textarea>
            </div>
          </div>

          <!-- 底部按鈕 -->
          <div class="flex gap-3 mt-7">
            <button
              @click="showActionModal = false"
              class="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-500 cursor-pointer"
            >
              {{ actionModalMode === 'cancel' ? '保留訂單' : '返回' }}
            </button>
            <button
              @click="submitAction"
              :disabled="isSubmitting"
              class="flex-1 py-3 text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              :class="
                actionModalMode === 'cancel'
                  ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400'
                  : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400'
              "
            >
              <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
              {{
                isSubmitting
                  ? '處理中...'
                  : actionModalMode === 'cancel'
                    ? '確認取消'
                    : '提交申請'
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* 讓數字看起來更像計時器 */
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
