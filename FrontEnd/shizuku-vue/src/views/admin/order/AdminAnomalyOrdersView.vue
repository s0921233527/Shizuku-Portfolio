<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAbnormalOrdersAPI, rescueOrderAPI } from '@/api/adminOrder'
import { getAbnormalPaymentsAPI } from '@/api/adminPayment'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import Tooltip from 'primevue/tooltip'
import Skeleton from 'primevue/skeleton'

const vTooltip = Tooltip
const toast = useToast()
const loading = ref(false)
const abnormalOrders = ref([])

// 支付監控相關資料
const highFreqList = ref([])
const highAmountList = ref([])
const lastScanned = ref('')

// 頂部分頁切換：'orders' | 'payments'
const activeSubTab = ref('orders')

const loadAllData = async () => {
  loading.value = true
  try {
    const [orderRes, paymentRes] = await Promise.all([
      getAbnormalOrdersAPI(),
      getAbnormalPaymentsAPI()
    ])

    if (orderRes && orderRes.success) {
      abnormalOrders.value = orderRes.data || []
    }

    if (paymentRes && paymentRes.success) {
      highFreqList.value = paymentRes.data.highFreqFailures || []
      highAmountList.value = paymentRes.data.highAmountTxns || []
      lastScanned.value = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  } catch (err) {
    console.error('載入異常資料失敗:', err)
    toast.add({ severity: 'error', summary: '載入失敗', detail: err.message, life: 3000 })
  } finally {
    loading.value = false
  }
}

const conflictOrdersList = computed(() => {
  return abnormalOrders.value.filter(o => o.abnormalityType === 'Conflict')
})

const behaviorOrdersList = computed(() => {
  return abnormalOrders.value.filter(o => o.abnormalityType === 'Behavior')
})

const stats = computed(() => {
  return {
    conflict: conflictOrdersList.value.length,
    behavior: behaviorOrdersList.value.length
  }
})

const handleRescue = async (orderNo) => {
  try {
    const res = await rescueOrderAPI(orderNo)
    if (res.success) {
      toast.add({ severity: 'success', summary: '救援成功', detail: res.message, life: 3000 })
      await loadAllData()
    } else {
      toast.add({ severity: 'error', summary: '救援失敗', detail: res.message, life: 5000 })
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: '救援失敗', detail: '伺服器錯誤', life: 5000 })
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  toast.add({ severity: 'info', summary: '已複製訂單編號', detail: text, life: 2000 })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(value || 0)
}

onMounted(loadAllData)
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5]">
    <!-- 統一的頁面標題列 -->
    <div class="px-8 pt-8 pb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[#20251F] tracking-tight">異常訂單監控</h1>
        <p class="text-sm text-stone-400 mt-0.5 font-serif">監控並診斷全站金流交易衝突、惡意鎖庫存行為，並提供系統主動式救援機制</p>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="lastScanned" class="text-xs text-stone-400 font-sans">上次更新：{{ lastScanned }}</span>
        <!-- 重新整理按鈕 -->
        <button
          @click="loadAllData"
          class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 h-[34px] font-sans"
        >
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          <span>立即刷新</span>
        </button>
      </div>
    </div>

    <!-- 核心內容區 -->
    <div class="px-8 pb-8 space-y-6">
      <!-- 頂部頁籤切換 (新穎現代的膠囊型按鈕) -->
      <div class="flex bg-stone-100 p-1.5 rounded-2xl self-start mb-4 border border-stone-200/20 font-serif w-max">
        <button
          @click="activeSubTab = 'orders'"
          :class="['px-5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 border-0 cursor-pointer', activeSubTab === 'orders' ? 'bg-white text-[#8E9A86] shadow-sm font-bold' : 'text-stone-500 hover:text-stone-850']"
        >
          <i class="pi pi-exclamation-triangle"></i>
          <span>訂單異常監控 ({{ stats.conflict + stats.behavior }})</span>
        </button>
        <button
          @click="activeSubTab = 'payments'"
          :class="['px-5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 border-0 cursor-pointer', activeSubTab === 'payments' ? 'bg-white text-[#8E9A86] shadow-sm font-bold' : 'text-stone-500 hover:text-stone-850']"
        >
          <i class="pi pi-shield"></i>
          <span>支付安全監控 ({{ highFreqList.length + highAmountList.length }})</span>
        </button>
      </div>

      <!-- ── 分頁 1：訂單異常監控 ── -->
      <div v-if="activeSubTab === 'orders'" class="space-y-6">
        <!-- 頂部引導橫幅 -->
        <div class="p-4 bg-stone-50 border border-stone-200/50 text-stone-700 rounded-2xl flex items-start gap-3 shadow-xs font-serif">
          <i class="pi pi-info-circle text-[#8E9A86] text-lg mt-0.5 flex-shrink-0"></i>
          <div>
            <h4 class="text-xs font-bold text-stone-800">業務營運鎖單監控說明</h4>
            <p class="text-[11px] text-stone-500 mt-1 leading-relaxed">
              此處主要監控與防範異常的業務操作（例如：顧客下單已扣款但因網路超時导致訂單狀態判定衝突、或是惡意建立大量訂單以惡意占用商品庫存）。管理員可在此直接執行系統補正。
            </p>
          </div>
        </div>

        <!-- 統計摘要卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 卡片：金流衝突 -->
          <div class="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 flex items-center justify-between shadow-sm font-serif">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <i class="pi pi-bolt text-rose-500 animate-pulse"></i>
                <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider">金流衝突交易</span>
              </div>
              <div class="text-2xl font-bold font-mono text-stone-850">{{ stats.conflict }}</div>
              <div class="text-[11px] text-stone-400 mt-1 font-sans">綠界或綠金已付款成功，但系統訂單被超時判定為「已取消」</div>
            </div>
            <i class="pi pi-bolt text-4xl text-rose-200/60"></i>
          </div>

          <!-- 卡片：惡意鎖單 -->
          <div class="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-5 flex items-center justify-between shadow-sm font-serif">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <i class="pi pi-users text-amber-600"></i>
                <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">鎖庫存行為異常</span>
              </div>
              <div class="text-2xl font-bold font-mono text-stone-850">{{ stats.behavior }}</div>
              <div class="text-[11px] text-stone-400 mt-1 font-sans">單一會員帳號在 24 小時內發生取消/超時未付訂單達 3 次以上</div>
            </div>
            <i class="pi pi-users text-4xl text-amber-200/60"></i>
          </div>
        </div>

        <!-- 左右雙欄清單佈局 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-serif">
          <!-- 左欄：金流衝突 -->
          <div class="bg-white/90 border border-stone-200/50 p-5 rounded-3xl shadow-sm flex flex-col backdrop-blur-md">
            <h3 class="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
              <span class="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
              金流衝突清單
            </h3>
            
            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <div v-if="loading" class="space-y-3">
                <Skeleton v-for="i in 2" :key="i" height="120px" borderRadius="16px" />
              </div>
              <div v-else-if="conflictOrdersList.length === 0" class="py-16 text-center text-stone-400">
                <i class="pi pi-check-circle text-4xl mb-3 text-emerald-400 opacity-60"></i>
                <p class="text-sm font-bold text-stone-600">目前無金流衝突交易</p>
                <p class="text-xs text-stone-400 mt-1">系統環境運行非常健康</p>
              </div>
              <div v-else class="space-y-3 font-sans">
                <div
                  v-for="item in conflictOrdersList"
                  :key="item.orderNo"
                  class="bg-stone-50/50 border border-stone-200/30 rounded-2xl p-4 flex flex-col gap-3 text-left hover:bg-stone-50 transition-all duration-200"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-xs font-mono font-bold text-stone-850">訂單 #{{ item.orderNo }}</div>
                      <div class="text-[11px] text-stone-450 mt-1 font-serif">買家：{{ item.memberName }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs font-mono font-bold text-rose-600">{{ formatCurrency(item.totalAmount) }}</div>
                      <div class="text-[10px] text-stone-400 mt-1 font-serif">{{ new Date(item.createdAt).toLocaleString() }}</div>
                    </div>
                  </div>
                  <div class="text-xs text-stone-650 bg-white/80 p-3 rounded-xl border border-stone-200/40 leading-relaxed">
                    <p><strong>診斷原因：</strong>{{ item.description }}</p>
                    <p class="mt-1.5 pt-1.5 border-t border-stone-100 text-rose-600"><strong>建議處置：</strong>{{ item.suggestion }}</p>
                  </div>
                  <div class="flex justify-end">
                    <Button 
                      icon="pi pi-bolt" 
                      label="執行訂單救援" 
                      severity="danger" 
                      size="small"
                      @click="handleRescue(item.orderNo)"
                      class="!rounded-xl text-xs font-semibold cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右欄：行為異常 -->
          <div class="bg-white/90 border border-stone-200/50 p-5 rounded-3xl shadow-sm flex flex-col backdrop-blur-md">
            <h3 class="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
              <span class="w-2 h-2 rounded-full bg-[#8E9A86] inline-block"></span>
              鎖庫存警示清單
            </h3>
            
            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <div v-if="loading" class="space-y-3">
                <Skeleton v-for="i in 2" :key="i" height="120px" borderRadius="16px" />
              </div>
              <div v-else-if="behaviorOrdersList.length === 0" class="py-16 text-center text-stone-400">
                <i class="pi pi-check-circle text-4xl mb-3 text-emerald-400 opacity-60"></i>
                <p class="text-sm font-bold text-stone-600">目前無異常鎖單行為</p>
                <p class="text-xs text-stone-400 mt-1">無惡意刷單或鎖定庫存情事</p>
              </div>
              <div v-else class="space-y-3 font-sans">
                <div
                  v-for="item in behaviorOrdersList"
                  :key="item.orderNo"
                  class="bg-stone-50/50 border border-stone-200/30 rounded-2xl p-4 flex flex-col gap-3 text-left hover:bg-stone-50 transition-all duration-200"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-xs font-serif font-bold text-stone-850">買家：{{ item.memberName }}</div>
                      <div class="text-[11px] text-stone-450 mt-1 font-mono">關聯單號：#{{ item.orderNo }}</div>
                    </div>
                    <div class="text-right">
                      <span class="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                        24H 內取消 {{ item.relatedCount }} 次
                      </span>
                      <div class="text-[10px] text-stone-400 mt-1 font-serif">{{ new Date(item.createdAt).toLocaleString() }}</div>
                    </div>
                  </div>
                  <div class="text-xs text-stone-650 bg-white/80 p-3 rounded-xl border border-stone-200/40 leading-relaxed">
                    <p><strong>行為診斷：</strong>{{ item.description }}</p>
                    <p class="mt-1.5 pt-1.5 border-t border-stone-100"><strong>建議處置：</strong>{{ item.suggestion }}</p>
                  </div>
                  <div class="flex justify-end">
                    <Button 
                      icon="pi pi-copy" 
                      label="複製單號" 
                      severity="secondary" 
                      outlined
                      size="small" 
                      @click="copyToClipboard(item.orderNo)"
                      class="!rounded-xl text-xs font-semibold cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 分頁 2：支付安全監控 ── -->
      <div v-else-if="activeSubTab === 'payments'" class="space-y-6">
        <!-- 頂部引導橫幅 -->
        <div class="p-4 bg-stone-50 border border-stone-200/50 text-stone-700 rounded-2xl flex items-start gap-3 shadow-xs font-serif">
          <i class="pi pi-shield text-[#8E9A86] text-lg mt-0.5 flex-shrink-0"></i>
          <div>
            <h4 class="text-xs font-bold text-stone-800">金流安全與防刷卡監控說明</h4>
            <p class="text-[11px] text-stone-500 mt-1 leading-relaxed">
              此處主要監控支付安全性，防範機器人利用發卡行失敗代碼進行「卡片測試 (Card Testing) / 測卡防盜刷」或其它高額交易異常風險，若有警告請立即聯絡金流窗口。
            </p>
          </div>
        </div>

        <!-- 統計摘要卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 卡片：高頻失敗 -->
          <div class="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-5 flex items-center justify-between shadow-sm font-serif">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <i class="pi pi-exclamation-circle text-amber-600"></i>
                <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">高頻失敗警示</span>
              </div>
              <div class="text-2xl font-bold font-mono text-stone-850">{{ highFreqList.length }}</div>
              <div class="text-[11px] text-stone-400 mt-1 font-sans">單一訂單在 10 分鐘內付款失敗達 3 次以上（防範測卡刷卡）</div>
            </div>
            <i class="pi pi-shield text-4xl text-amber-200/60"></i>
          </div>

          <!-- 卡片：高額交易 -->
          <div class="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 flex items-center justify-between shadow-sm font-serif">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <i class="pi pi-shield text-rose-500"></i>
                <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider">高額交易警戒</span>
              </div>
              <div class="text-2xl font-bold font-mono text-stone-850">{{ highAmountList.length }}</div>
              <div class="text-[11px] text-stone-400 mt-1 font-sans">單筆交易額度突破 NT$ 50,000 以上之防洗錢/防盜刷稽核</div>
            </div>
            <i class="pi pi-dollar text-4xl text-rose-200/60"></i>
          </div>
        </div>

        <!-- 左右雙欄清單佈局 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-serif">
          <!-- 左欄：高頻失敗 -->
          <div class="bg-white/90 border border-stone-200/50 p-5 rounded-3xl shadow-sm flex flex-col backdrop-blur-md">
            <h3 class="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
              <span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              付款次數異常訂單
            </h3>
            
            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <div v-if="loading" class="space-y-3">
                <Skeleton v-for="i in 3" :key="i" height="70px" borderRadius="16px" />
              </div>
              <div v-else-if="highFreqList.length === 0" class="py-16 text-center text-stone-400">
                <i class="pi pi-check-circle text-4xl mb-3 text-emerald-400 opacity-60"></i>
                <p class="text-sm font-bold text-stone-600">目前無高頻失敗異常</p>
                <p class="text-xs text-stone-400 mt-1">無偵測到惡意重複付款失敗情事</p>
              </div>
              <div v-else class="space-y-2 font-sans">
                <div
                  v-for="item in highFreqList"
                  :key="item.orderId"
                  class="flex items-center justify-between bg-stone-50/50 border border-stone-200/30 rounded-2xl px-4 py-3 text-left hover:bg-stone-50 transition-all duration-200"
                >
                  <div>
                    <div class="text-xs font-mono font-bold text-stone-850">訂單 #{{ item.orderId }}</div>
                    <div class="text-[10px] text-stone-400 mt-1 font-serif">最後嘗試：{{ item.latestTime }}</div>
                  </div>
                  <span class="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                    失敗 {{ item.failCount }} 次
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右欄：異常高額 -->
          <div class="bg-white/90 border border-stone-200/50 p-5 rounded-3xl shadow-sm flex flex-col backdrop-blur-md">
            <h3 class="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
              <span class="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
              高額交易警示
            </h3>
            
            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <div v-if="loading" class="space-y-3">
                <Skeleton v-for="i in 3" :key="i" height="70px" borderRadius="16px" />
              </div>
              <div v-else-if="highAmountList.length === 0" class="py-16 text-center text-stone-400">
                <i class="pi pi-check-circle text-4xl mb-3 text-emerald-400 opacity-60"></i>
                <p class="text-sm font-bold text-stone-600">目前無異常高額交易</p>
                <p class="text-xs text-stone-400 mt-1">無單筆大額警示需要稽核</p>
              </div>
              <div v-else class="space-y-2 font-sans">
                <div
                  v-for="txn in highAmountList"
                  :key="txn.transactionNo"
                  class="flex items-center justify-between bg-stone-50/50 border border-stone-200/30 rounded-2xl px-4 py-3 text-left hover:bg-stone-50 transition-all duration-200"
                >
                  <div>
                    <div class="text-xs font-mono font-bold text-stone-850">{{ txn.transactionNo }}</div>
                    <div class="text-[10px] text-stone-400 mt-1 font-serif">交易時間：{{ txn.createdAt }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs font-mono font-bold text-rose-600">{{ formatCurrency(txn.amount) }}</div>
                    <span class="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2.5 py-0.5 rounded-[6px] text-[9px] font-semibold mt-1 inline-block uppercase">
                      高額警示
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 深度複寫 */
</style>
