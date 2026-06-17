<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { getOrderDetailAPI, getOrderTransactionsAPI } from '@/api/order'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const orderId = computed(() => String(route.params.id ?? ''))
const orderData = ref(null)
const transactions = ref([])
const isLoading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    if (!orderId.value) {
      errorMsg.value = '訂單編號不存在'
      return
    }

    // 同時取訂單基本資料與金流交易列表
    const [detailRes, txRes] = await Promise.all([
      getOrderDetailAPI(orderId.value, authStore.user?.fId),
      getOrderTransactionsAPI(orderId.value),
    ])

    if (detailRes?.success && detailRes.data) {
      orderData.value = detailRes.data
    }

    if (txRes?.success && Array.isArray(txRes.data)) {
      transactions.value = txRes.data
    }
  } catch (err) {
    console.error('取得金流明細失敗：', err)
    errorMsg.value = '無法載入支付紀錄，請稍後再試。'
  } finally {
    isLoading.value = false
  }
})

// 金流狀態 UI 對照
const statusConfig = (status) => {
  const map = {
    0: { label: '待付款', color: 'bg-amber-500/5 text-amber-600 border-amber-200/40', icon: 'pi pi-clock' },
    1: { label: '付款成功', color: 'bg-[#8E9A86]/10 text-[#8E9A86] border-[#8E9A86]/20', icon: 'pi pi-check-circle' },
    2: { label: '交易失敗', color: 'bg-rose-500/5 text-rose-500/80 border-rose-200/40', icon: 'pi pi-times-circle' },
    3: { label: '已退款', color: 'bg-stone-100 text-stone-600 border-stone-200/50', icon: 'pi pi-undo' },
  }
  return map[status] ?? { label: '未知', color: 'bg-stone-50 text-stone-400 border-stone-200/40', icon: 'pi pi-question' }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const goBack = () => {
  if (route.params.id) {
    router.push({ name: 'order-detail', params: { id: orderId.value } })
  } else {
    router.push({ name: 'home' })
  }
}

const goToDetail = (tx) => {
  router.push({
    name: 'payment-detail',
    params: { id: orderId.value, transactionId: tx.transactionId },
    state: { transaction: tx, order: orderData.value },
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#FCFBF9] py-16 px-6 pt-36 font-serif text-stone-850">
    <div class="max-w-3xl mx-auto flex flex-col gap-6">

      <!-- 頂部導覽 -->
      <div class="flex items-center gap-4">
        <Button icon="pi pi-arrow-left" text rounded @click="goBack"
          class="!text-[#8E9A86] !border-stone-200 hover:!bg-[#8E9A86]/5 transition-colors cursor-pointer" />
        <div>
          <span class="text-xs font-light text-stone-400 uppercase tracking-widest">Payment Records</span>
          <h1 class="text-2xl font-light text-stone-850 tracking-wider font-serif mt-0.5">支付明細列表</h1>
          <p class="text-stone-500 text-xs mt-0.5 font-light">訂單 {{ orderId }} 的所有支付交易紀錄</p>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <i class="pi pi-spin pi-spinner text-3xl text-[#8E9A86]"></i>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="errorMsg" class="bg-rose-500/5 border border-rose-200/40 rounded-2xl p-8 text-center">
        <i class="pi pi-exclamation-circle text-3xl text-rose-500/80 mb-3"></i>
        <p class="text-rose-500/80 font-light text-sm">{{ errorMsg }}</p>
      </div>

      <div v-else>
        <!-- 訂單概況卡 -->
        <div v-if="orderData" class="bg-[#FAF8F5]/85 border border-stone-200/40 p-5 rounded-2xl shadow-xs backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <p class="text-[10px] text-stone-400 font-light uppercase tracking-wider">訂單總額</p>
            <p class="text-2xl font-light text-[#8E9A86] mt-1 font-serif">
              NT$ {{ orderData.totalAmount?.toLocaleString() }}
            </p>
          </div>
          <div class="text-left sm:text-right">
            <p class="text-[10px] text-stone-400 font-light uppercase tracking-wider">建立時間</p>
            <p class="text-sm font-light text-stone-700 mt-1">{{ formatDate(orderData.createdAt) }}</p>
          </div>
        </div>

        <!-- 空狀態 -->
        <div
          v-if="transactions.length === 0"
          class="bg-[#FAF8F5]/80 border border-stone-200/40 rounded-2xl p-10 text-center shadow-xs backdrop-blur-md"
        >
          <i class="pi pi-credit-card text-3xl text-stone-300 mb-4 block"></i>
          <p class="text-stone-400 font-light text-sm">此訂單尚無支付紀錄</p>
        </div>

        <!-- 交易紀錄列表 -->
        <div v-else class="flex flex-col gap-3.5">
          <div
            v-for="tx in transactions"
            :key="tx.transactionId"
            class="bg-white/80 border border-stone-200/35 rounded-2xl p-5 hover:shadow-md hover:border-[#8E9A86]/60 transition-all duration-200 cursor-pointer group"
            @click="goToDetail(tx)"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- 左側：交易資訊 -->
              <div class="flex items-start gap-4">
                <!-- 狀態圖示 -->
                <div :class="[
                  'w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0',
                  statusConfig(tx.status).color
                ]">
                  <i :class="[statusConfig(tx.status).icon, 'text-sm']"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-medium text-stone-850 font-mono">{{ tx.transactionNo }}</span>
                    <span :class="[
                      'text-[10px] font-light px-2 py-0.5 rounded-full border',
                      statusConfig(tx.status).color
                    ]">
                      {{ tx.statusText }}
                    </span>
                  </div>
                  <p class="text-xs text-stone-400 mt-1 font-light">
                    {{ tx.method }} · {{ formatDate(tx.createdAt) }}
                  </p>
                  <p v-if="tx.gatewayTradeNo" class="text-[10px] text-stone-300 mt-0.5 font-mono">
                    金流單號：{{ tx.gatewayTradeNo }}
                  </p>
                </div>
              </div>

              <!-- 右側：金額 + 箭頭 -->
              <div class="flex items-center gap-3 flex-shrink-0">
                <div class="text-right">
                  <p class="text-lg font-light text-stone-850 font-serif">
                    NT$ {{ tx.amount?.toLocaleString() }}
                  </p>
                  <p v-if="tx.paidAt" class="text-[10px] text-[#8E9A86] font-medium mt-0.5">
                    已付款：{{ formatDate(tx.paidAt).split(' ')[1] }}
                  </p>
                </div>
                <i class="pi pi-chevron-right text-stone-300 group-hover:text-[#8E9A86] transition-colors"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- 統計小結 -->
        <div v-if="transactions.length > 0" class="bg-[#FAF8F5]/60 rounded-2xl border border-stone-200/30 p-4 text-center mt-6">
          <p class="text-[11px] text-stone-400 font-light">
            共 {{ transactions.length }} 筆支付紀錄 ·
            成功 {{ transactions.filter(t => t.status === 1).length }} 筆 ·
            失敗 {{ transactions.filter(t => t.status === 2).length }} 筆
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
