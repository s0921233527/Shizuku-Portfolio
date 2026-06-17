<script setup>
import { ref, onMounted, computed } from 'vue'
import { getRevenueStatsAPI, getAllOrdersForAdminAPI } from '@/api/adminOrder'
import Skeleton from 'primevue/skeleton'

const loading = ref(true)
const revenueStats = ref({
  totalGMV: 0,
  totalOrders: 0,
  aov: 0
})
const recentOrders = ref([])

// 格式化日期時間
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 動態招呼語
const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 5) return '晚安，夜深了，注意多休息喔。'
  if (hour < 11) return '早安！祝您今天工作順心，SHIZUKU 的品牌營運今天也拜託您了！'
  if (hour < 14) return '午安，享用美味的午餐了嗎？'
  if (hour < 18) return '下午好，來杯日系熱焙茶，繼續加油！'
  return '晚安，辛苦了一天，記得放鬆心情，好好休息。'
})

// 狀態徽章樣式對應 (OrderStatus)
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 1: // Pending (未付款)
      return 'bg-amber-50 text-amber-600 border border-amber-200/50'
    case 2: // Paid (已付款)
      return 'bg-[#8E9A86]/10 text-[#8E9A86] border border-[#8E9A86]/25'
    case 3: // Shipping (出貨中)
      return 'bg-blue-50 text-blue-600 border border-blue-200/50'
    case 4: // Delivered (已送達)
      return 'bg-stone-100 text-stone-600 border border-stone-200/50'
    case 5: // Cancelled (已取消)
      return 'bg-red-50 text-red-500 border border-red-200/50'
    case 6: // PendingRefund (待退款)
      return 'bg-purple-50 text-purple-600 border border-purple-200/50'
    case 7: // Refunded (已退款)
      return 'bg-gray-100 text-gray-500 border border-gray-200/50'
    default:
      return 'bg-stone-50 text-stone-500 border border-stone-200/50'
  }
}

// 撈取後台統計與最新訂單資料
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const statsRes = await getRevenueStatsAPI()
    if (statsRes.success) {
      revenueStats.value = statsRes.data
    }
    
    const ordersRes = await getAllOrdersForAdminAPI()
    if (ordersRes.success && Array.isArray(ordersRes.data)) {
      recentOrders.value = ordersRes.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    }
  } catch (err) {
    console.error('[AdminDashboardView] 載入資料發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
    
    <!-- 頂部招呼 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <span class="text-[10px] font-bold text-[#8E9A86] tracking-widest uppercase font-mono">Console Dashboard</span>
        <h1 class="text-2xl font-bold text-stone-850 mt-1 font-serif flex items-center gap-2">
          <span>儀表板管理首頁</span>
        </h1>
        <p class="text-xs text-stone-400 mt-1 font-serif">
          {{ greetingMessage }}
        </p>
      </div>
      
      <!-- 重新整理按鈕 -->
      <div>
        <button 
          @click="fetchDashboardData"
          class="flex items-center gap-1.5 px-4 py-2 border border-stone-200 hover:border-[#8E9A86] hover:bg-[#8E9A86]/5 text-stone-600 hover:text-[#8E9A86] rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer"
        >
          <i class="pi pi-refresh text-[10px]" :class="{ 'animate-spin': loading }"></i>
          <span>重新整理</span>
        </button>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- 卡片 1: 本月總營收 -->
      <div class="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
        <div class="space-y-1.5">
          <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-serif">本月營收 (GMV)</p>
          <div v-if="loading" class="h-8 w-24 bg-stone-100 rounded animate-pulse"></div>
          <p v-else class="text-2xl font-bold text-stone-850 font-mono">
            NT$ {{ revenueStats.totalGMV?.toLocaleString() }}
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-[#8E9A86]/10 border border-[#8E9A86]/20 flex items-center justify-center text-[#8E9A86] group-hover:scale-105 transition-transform duration-300">
          <i class="pi pi-wallet text-base"></i>
        </div>
      </div>

      <!-- 卡片 2: 總訂單數 -->
      <div class="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
        <div class="space-y-1.5">
          <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-serif">交易訂單量</p>
          <div v-if="loading" class="h-8 w-16 bg-stone-100 rounded animate-pulse"></div>
          <p v-else class="text-2xl font-bold text-stone-850 font-mono">
            {{ revenueStats.totalOrders?.toLocaleString() }} <span class="text-xs text-stone-400 font-serif font-normal">筆</span>
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-[#8E9A86]/10 border border-[#8E9A86]/20 flex items-center justify-center text-[#8E9A86] group-hover:scale-105 transition-transform duration-300">
          <i class="pi pi-shopping-bag text-base"></i>
        </div>
      </div>

      <!-- 卡片 3: 平均客單價 -->
      <div class="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
        <div class="space-y-1.5">
          <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-serif">平均客單價 (AOV)</p>
          <div v-if="loading" class="h-8 w-24 bg-stone-100 rounded animate-pulse"></div>
          <p v-else class="text-2xl font-bold text-stone-850 font-mono">
            NT$ {{ Math.round(revenueStats.aov)?.toLocaleString() }}
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-[#8E9A86]/10 border border-[#8E9A86]/20 flex items-center justify-center text-[#8E9A86] group-hover:scale-105 transition-transform duration-300">
          <i class="pi pi-calculator text-base"></i>
        </div>
      </div>

      <!-- 卡片 4: 系統防禦與推播 -->
      <div class="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
        <div class="space-y-1.5">
          <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-serif">即時監控防線</p>
          <p class="text-sm font-bold text-emerald-600 flex items-center gap-1.5 pt-1.5 font-serif">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>防護已啟動</span>
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform duration-300">
          <i class="pi pi-shield text-base"></i>
        </div>
      </div>

    </div>

    <!-- 近期訂單列表 (替代原本開發中的區塊) -->
    <div class="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h3 class="text-base font-bold text-stone-800 font-serif">全站近期訂單動態</h3>
          <p class="text-[10px] text-stone-400 mt-0.5">即時載入最新產生的前五筆顧客交易紀錄</p>
        </div>
        <router-link 
          :to="{ name: 'admin-orders-all' }" 
          class="text-xs font-semibold text-[#8E9A86] hover:text-[#7d8b75] transition-colors flex items-center gap-1 cursor-pointer font-serif"
        >
          <span>進入控制中心</span>
          <i class="pi pi-arrow-right text-[9px]"></i>
        </router-link>
      </div>

      <!-- 載入中骨架 -->
      <div v-if="loading && recentOrders.length === 0" class="space-y-3.5 py-4">
        <div v-for="i in 5" :key="i" class="flex items-center justify-between">
          <Skeleton width="180px" height="16px" />
          <Skeleton width="120px" height="16px" />
          <Skeleton width="80px" height="16px" />
          <Skeleton width="60px" height="20px" borderRadius="12px" />
        </div>
      </div>

      <!-- 空資料 -->
      <div v-else-if="recentOrders.length === 0" class="text-center py-12 text-stone-400">
        <i class="pi pi-inbox text-4xl mb-3 block text-stone-200"></i>
        <p class="text-xs font-serif">目前全站尚無交易訂單資料</p>
      </div>

      <!-- 近期訂單表格 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs font-serif text-stone-600 border-collapse">
          <thead>
            <tr class="text-[10px] text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100">
              <th class="pb-3 px-4 font-semibold">訂單編號</th>
              <th class="pb-3 px-4 font-semibold">下單日期與時間</th>
              <th class="pb-3 px-4 font-semibold">交易金額</th>
              <th class="pb-3 px-4 font-semibold">目前狀態</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr 
              v-for="order in recentOrders" 
              :key="order.orderNo" 
              class="hover:bg-[#8E9A86]/5 transition-colors group cursor-pointer"
              @click="router.push({ name: 'admin-orders-all' })"
            >
              <!-- 訂單 ID -->
              <td class="py-3.5 px-4 font-medium text-stone-850 font-mono tracking-wider group-hover:text-[#8E9A86] transition-colors">
                {{ order.orderNo }}
              </td>
              
              <!-- 時間 -->
              <td class="py-3.5 px-4 text-stone-500 font-sans">
                {{ formatDateTime(order.createdAt) }}
              </td>
              
              <!-- 金額 -->
              <td class="py-3.5 px-4 font-bold text-stone-800 font-sans">
                NT$ {{ order.totalAmount?.toLocaleString() }}
              </td>
              
              <!-- 狀態 Badge -->
              <td class="py-3.5 px-4">
                <span 
                  :class="getStatusBadgeClass(order.status)" 
                  class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide font-sans shadow-2xs"
                >
                  {{ order.statusText }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 淡入動畫 */
.max-w-7xl {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
