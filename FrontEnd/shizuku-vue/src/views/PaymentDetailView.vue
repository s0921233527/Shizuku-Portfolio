<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()

// 優先從 router.state 取得資料（來自 PaymentListView 的 goToDetail 傳遞），
// 若直接從網址進入則顯示基本骨架
const tx = ref(history.state?.transaction ?? null)
const order = ref(history.state?.order ?? null)
const orderId = route.params.id ?? ''

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const statusConfig = (status) => {
  const map = {
    0: { label: '待付款', color: 'text-amber-650 bg-amber-500/5 border-amber-200/30', icon: 'pi pi-clock', dot: 'bg-amber-400' },
    1: { label: '付款成功', color: 'text-[#8E9A86] bg-[#8E9A86]/10 border-[#8E9A86]/20', icon: 'pi pi-check-circle', dot: 'bg-[#8E9A86]' },
    2: { label: '交易失敗', color: 'text-rose-500 bg-rose-500/5 border-rose-200/30', icon: 'pi pi-times-circle', dot: 'bg-rose-500' },
    3: { label: '已退款', color: 'text-stone-600 bg-stone-100 border-stone-200/40', icon: 'pi pi-undo', dot: 'bg-stone-400' },
  }
  return map[status] ?? { label: '未知', color: 'text-stone-400 bg-stone-50 border-stone-200/30', icon: 'pi pi-question', dot: 'bg-stone-300' }
}

const goBack = () => {
  router.push({ name: 'payment-list', params: { id: orderId } })
}
</script>

<template>
  <div class="min-h-screen bg-[#FCFBF9] py-16 px-6 pt-36 font-serif text-stone-850">
    <div class="max-w-2xl mx-auto flex flex-col gap-5">

      <!-- 頂部導覽 -->
      <div class="flex items-center gap-4">
        <Button icon="pi pi-arrow-left" text rounded @click="goBack"
          class="!text-[#8E9A86] !border-stone-200 hover:!bg-[#8E9A86]/5 transition-colors cursor-pointer" />
        <div>
          <span class="text-xs font-light text-stone-400 uppercase tracking-widest">Payment Detail</span>
          <h1 class="text-2xl font-light text-stone-850 tracking-wider font-serif mt-0.5">支付明細</h1>
        </div>
      </div>

      <!-- 無資料提示 (直接輸入 URL 進入時) -->
      <div
        v-if="!tx"
        class="bg-[#FAF8F5]/80 border border-stone-200/40 rounded-2xl p-10 text-center shadow-xs backdrop-blur-md font-serif"
      >
        <i class="pi pi-info-circle text-3xl text-stone-300 mb-4 block"></i>
        <p class="text-stone-500 font-light text-sm">請從「支付明細列表」頁面進入此頁查看詳細資訊</p>
        <button
          @click="goBack"
          class="mt-4 text-xs text-[#8E9A86] hover:text-[#7D8876] font-light underline cursor-pointer"
        >
          前往支付明細列表
        </button>
      </div>

      <template v-else>
        <!-- 狀態大卡 -->
        <div :class="[
          'rounded-3xl p-8 flex flex-col items-center gap-4 border shadow-xs backdrop-blur-md',
          tx.status === 1
            ? 'bg-gradient-to-b from-[#8E9A86]/10 to-white border-[#8E9A86]/20'
            : tx.status === 2
              ? 'bg-gradient-to-b from-rose-500/5 to-white border-rose-200/35'
              : 'bg-[#FAF8F5]/85 border border-stone-200/40'
        ]">
          <div :class="[
            'w-16 h-16 rounded-full flex items-center justify-center border',
            statusConfig(tx.status).color
          ]">
            <i :class="[statusConfig(tx.status).icon, 'text-3xl']"></i>
          </div>
          <div class="text-center font-serif">
            <p class="text-[10px] font-light tracking-widest uppercase text-stone-400">
              {{ statusConfig(tx.status).label }}
            </p>
            <p class="text-3xl font-light text-stone-850 mt-2 font-serif">
              NT$ {{ tx.amount?.toLocaleString() }}
            </p>
            <p v-if="tx.paidAt" class="text-xs text-[#8E9A86] font-medium mt-1.5">
              付款完成：{{ formatDate(tx.paidAt) }}
            </p>
          </div>
        </div>

        <!-- 交易資訊卡 -->
        <div class="bg-white/80 border border-stone-200/40 rounded-2xl shadow-xs overflow-hidden">
          <div class="px-6 py-4 border-b border-stone-200/30 bg-[#FAF8F5]/40">
            <h2 class="text-xs font-medium text-stone-500 uppercase tracking-wider font-serif">交易資訊</h2>
          </div>
          <div class="divide-y divide-stone-100">
            <div class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">交易流水號</span>
              <span class="text-sm font-medium text-stone-850 font-mono">{{ tx.transactionNo }}</span>
            </div>
            <div v-if="tx.gatewayTradeNo" class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">金流商單號</span>
              <span class="text-sm font-light text-stone-700 font-mono">{{ tx.gatewayTradeNo }}</span>
            </div>
            <div class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">付款方式</span>
              <span class="text-sm font-light text-stone-850">{{ tx.method }}</span>
            </div>
            <div class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">發起時間</span>
              <span class="text-sm font-light text-stone-700">{{ formatDate(tx.createdAt) }}</span>
            </div>
            <div class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">交易狀態</span>
              <span :class="[
                'text-[10px] font-light px-3 py-1 rounded-full border',
                statusConfig(tx.status).color
              ]">
                {{ tx.statusText }}
              </span>
            </div>
          </div>
        </div>

        <!-- 關聯訂單資訊 -->
        <div v-if="order" class="bg-white/80 border border-stone-200/40 rounded-2xl shadow-xs overflow-hidden">
          <div class="px-6 py-4 border-b border-stone-200/30 bg-[#FAF8F5]/40">
            <h2 class="text-xs font-medium text-stone-500 uppercase tracking-wider font-serif">關聯訂單</h2>
          </div>
          <div class="divide-y divide-stone-100">
            <div class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">訂單編號</span>
              <span class="text-sm font-medium text-stone-850 font-mono">{{ orderId }}</span>
            </div>
            <div class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">訂單金額</span>
              <span class="text-sm font-light text-stone-850 font-serif">
                NT$ {{ order.totalAmount?.toLocaleString() }}
              </span>
            </div>
            <div class="flex justify-between items-center px-6 py-4.5">
              <span class="text-sm text-stone-500 font-light">訂單狀態</span>
              <span class="text-sm font-light text-stone-700">{{ order.statusText }}</span>
            </div>
          </div>
        </div>

        <!-- 備註 -->
        <p class="text-center text-stone-400 text-[10px] leading-relaxed font-light mt-4">
          此交易紀錄由系統自動記錄，如有疑問請聯絡客服。
        </p>
      </template>

    </div>
  </div>
</template>
