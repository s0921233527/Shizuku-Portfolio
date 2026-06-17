<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import {
  getAdminOrderDetailAPI,
  updateOrderStatusAPI,
  cancelOrderForAdminAPI,
} from '@/api/adminOrder'
import { orderStatusManager, ORDER_STATUS } from '@/services/orderStatusManager'
import OrderProgressStepper from '@/components/orderDetails/OrderProgressStepper.vue'
import OrderDeliveryPayment from '@/components/orderDetails/OrderDeliveryPayment.vue'
import OrderProductList from '@/components/orderDetails/OrderProductList.vue'
import OrderAmountSummary from '@/components/orderDetails/OrderAmountSummary.vue'

const props = defineProps({
  visible: Boolean,
  orderNo: String,
  currentStatus: Number,
})

const emit = defineEmits(['update:visible', 'updated'])
const toast = useToast()

const loading = ref(false)
const selectedOrder = ref(null)
const selectedOrderDetails = ref([])
const newStatus = ref(1)

// 監聽 visible 變化，開啟時抓取資料
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal && props.orderNo) {
      await fetchDetail()
      newStatus.value = props.currentStatus || 1
    }
  },
)

const fetchDetail = async () => {
  try {
    loading.value = true
    const res = await getAdminOrderDetailAPI(props.orderNo)
    if (res.success) {
      const orderData = res.data
      const items = orderData.items || []
      const computedSubtotal = items.reduce(
        (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
        0,
      )

      selectedOrder.value = {
        ...orderData,
        subtotal: orderData.subtotal !== undefined ? orderData.subtotal : computedSubtotal,
        shippingFee: orderData.shippingFee !== undefined ? orderData.shippingFee : 0,
        discount: orderData.discount !== undefined ? orderData.discount : 0,
        totalAmount:
          orderData.totalAmount !== undefined
            ? orderData.totalAmount
            : orderData.total || computedSubtotal,
      }
      selectedOrderDetails.value = items
    }
  } catch (error) {
    console.error('Fetch Detail Error:', error)
    toast.add({
      severity: 'error',
      summary: '讀取詳情失敗',
      detail: '無法載入該筆訂單明細。',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const saveStatus = async () => {
  if (!selectedOrder.value) return
  if (!orderStatusManager.isValidTransition(selectedOrder.value.status, Number(newStatus.value))) {
    if (!confirm(`偵測到非標準的狀態跳轉，您確定要手動強改訂單狀態嗎？`)) {
      return
    }
  } else {
    if (!confirm('確定要更新此訂單的狀態嗎？')) return
  }

  try {
    let res
    if (Number(newStatus.value) === ORDER_STATUS.CANCELLED) {
      res = await cancelOrderForAdminAPI(selectedOrder.value.orderNo)
    } else {
      res = await updateOrderStatusAPI(selectedOrder.value.orderNo, Number(newStatus.value))
    }

    if (res.success) {
      toast.add({
        severity: 'success',
        summary: '更新狀態成功',
        detail: '訂單狀態已成功更新！',
        life: 2000,
      })
      emit('updated')
      emit('update:visible', false)
    } else {
      toast.add({
        severity: 'error',
        summary: '更新狀態失敗',
        detail: res.message || '無法儲存新的訂單狀態。',
        life: 3000,
      })
    }
  } catch (error) {
    console.error('Update Status Error:', error)
    toast.add({
      severity: 'error',
      summary: '系統連線錯誤',
      detail: '發生未知錯誤，請稍後再試。',
      life: 3000,
    })
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :style="{ width: '75vw' }"
    :breakpoints="{ '1199px': '85vw', '991px': '90vw', '575px': '95vw' }"
    class="admin-order-detail-dialog"
    :pt="{
      mask: { class: '!backdrop-blur-md bg-stone-900/40' },
      root: { class: '!bg-[#FAF8F5] border border-stone-200/50 rounded-[20px] shadow-2xl overflow-hidden' },
      header: { class: '!bg-[#FAF8F5] border-b border-stone-200/50 p-5 flex items-center justify-between' },
      content: { class: 'p-6 overflow-y-auto max-h-[80vh]' }
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#8E9A86]/10 flex items-center justify-center text-[#8E9A86]">
          <i class="pi pi-receipt text-sm"></i>
        </div>
        <div>
          <span class="text-[10px] text-stone-400 font-light font-mono block leading-none">ORDER NO</span>
          <span class="text-sm font-semibold text-stone-850 font-mono tracking-tight">{{ orderNo }}</span>
        </div>
      </div>
    </template>

    <div v-if="loading" class="space-y-6 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
        <div class="lg:col-span-7 space-y-6">
          <div class="h-20 bg-stone-200 rounded-2xl w-full"></div>
          <div class="h-48 bg-stone-200 rounded-2xl w-full"></div>
        </div>
        <div class="lg:col-span-5 space-y-6">
          <div class="h-32 bg-stone-200 rounded-2xl w-full"></div>
          <div class="h-36 bg-stone-200 rounded-2xl w-full"></div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedOrder" class="space-y-6 font-serif">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- 左欄 (佔 7/12) — 訂單流程與商品列表 -->
        <div class="lg:col-span-7 space-y-6">
          <!-- 訂單配送進度 -->
          <OrderProgressStepper :order="selectedOrder" />

          <!-- 商品細目清單 -->
          <OrderProductList :items="selectedOrderDetails" />
        </div>

        <!-- 右欄 (佔 5/12) — 配送資訊、財務加總、後台狀態控制 -->
        <div class="lg:col-span-5 space-y-6">
          <!-- 配送與收件人資訊 -->
          <OrderDeliveryPayment :order="selectedOrder" />

          <!-- 結帳金額摘要 -->
          <OrderAmountSummary :order="selectedOrder" />

          <!-- 後台管理操作區 -->
          <div class="bg-white/60 p-5 rounded-2xl border border-stone-200/50 shadow-sm backdrop-blur-sm">
            <h3 class="font-semibold text-stone-850 mb-4 flex items-center gap-2 text-sm border-l-2 border-[#8E9A86] pl-2">
              <i class="pi pi-cog text-[#8E9A86] text-xs"></i>
              後台管理：更新訂單狀態
            </h3>
            
            <div class="flex flex-col gap-3">
              <select
                v-model="newStatus"
                class="border border-stone-200/80 bg-white rounded-xl px-4 py-2.5 w-full focus:ring-2 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] focus:outline-none font-sans text-sm text-stone-700 font-medium cursor-pointer"
              >
                <!-- 禁止手動切換至待付款/已付款 -->
                <option
                  if="selectedOrder?.status === ORDER_STATUS.PENDING"
                  :value="ORDER_STATUS.PENDING"
                  disabled
                >
                  未付款 (由金流系統自動處理)
                </option>
                <option
                  if="selectedOrder?.status === ORDER_STATUS.PAID"
                  :value="ORDER_STATUS.PAID"
                  disabled
                >
                  已付款 (由金流系統自動處理)
                </option>

                <option
                  :value="ORDER_STATUS.SHIPPING"
                  :disabled="
                    selectedOrder?.status < ORDER_STATUS.PAID ||
                    selectedOrder?.status >= ORDER_STATUS.SHIPPING
                  "
                >
                  已出貨 (理貨完成寄出)
                </option>
                <option
                  :value="ORDER_STATUS.DELIVERED"
                  :disabled="
                    selectedOrder?.status < ORDER_STATUS.SHIPPING ||
                    selectedOrder?.status >= ORDER_STATUS.DELIVERED
                  "
                >
                  已送達 (完成包裹交付)
                </option>
                <option
                  :value="ORDER_STATUS.CANCELLED"
                  :disabled="selectedOrder?.status === ORDER_STATUS.CANCELLED"
                >
                  取消此訂單 (退回庫存)
                </option>
              </select>
              
              <button
                @click="saveStatus"
                class="w-full bg-[#8E9A86] hover:bg-[#7d8b75] text-white py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 text-sm hover:shadow active:scale-98 cursor-pointer font-sans"
              >
                確認並儲存狀態
              </button>
            </div>
            
            <p
              v-if="Number(newStatus) === ORDER_STATUS.CANCELLED"
              class="text-[11px] text-red-500 mt-3 font-medium bg-red-50/50 p-3 rounded-xl border border-red-100/60 flex items-start gap-2 font-sans"
            >
              <i class="pi pi-exclamation-triangle mt-0.5 text-xs flex-shrink-0"></i>
              <span>注意：變更為「取消此訂單」將會同步進行「庫存回補作業」，請務必確認商品尚未寄出！</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* 深度複寫 PrimeVue Dialog 預設關閉按鈕樣式 */
:deep(.p-dialog-header-actions) {
  margin-left: auto;
}

:deep(.p-dialog-close-button) {
  width: 28px !important;
  height: 28px !important;
  border-radius: 9999px !important;
  background-color: transparent !important;
  border: none !important;
  color: #78716c !important;
  transition: all 0.2s !important;
}

:deep(.p-dialog-close-button:hover) {
  background-color: #f5f5f4 !important;
  color: #1c1917 !important;
}
</style>
