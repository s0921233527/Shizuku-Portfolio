<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getAllOrdersForAdminAPI, triggerOrderScanAPI } from '@/api/adminOrder'
import AdminOrderListTable from '@/components/admin/orders/AdminOrderListTable.vue'
import AdminOrderDetailModal from '@/components/admin/orders/AdminOrderDetailModal.vue'
import { ORDER_STATUS, orderStatusManager } from '@/services/orderStatusManager'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'

const toast = useToast()
const orders = ref([])
const loading = ref(false)
const scanning = ref(false)

// 篩選與搜尋狀態
const searchQuery = ref('')
const searchMemberId = ref('')
const dateRange = ref(null)
const statusFilter = ref('all')

// Modal 控制狀態
const isModalOpen = ref(false)
const selectedOrderNo = ref('')
const selectedOrderCurrentStatus = ref(ORDER_STATUS.PENDING)

// 取得所有訂單
const fetchOrders = async () => {
  try {
    loading.value = true
    const res = await getAllOrdersForAdminAPI()
    if (res.success) {
      orders.value = res.data
    } else {
      toast.add({
        severity: 'error',
        summary: '讀取資料失敗',
        detail: res.message || '無法載入後台訂單列表。',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Fetch Orders Error:', error)
    toast.add({
      severity: 'error',
      summary: '系統連線錯誤',
      detail: '無法與伺服器建立連線，請檢查網路狀態。',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// 執行異常掃描
const triggerScan = async () => {
  scanning.value = true
  try {
    await triggerOrderScanAPI()
    toast.add({
      severity: 'info',
      summary: '掃描已執行',
      detail: '訂單異常掃描完成，若有偵測到異常將立即推播通知。',
      life: 4000,
    })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: '掃描失敗',
      detail: '無法執行掃描，請確認後端服務是否正常。',
      life: 5000,
    })
  } finally {
    scanning.value = false
  }
}

// 開啟明細 Modal
const openDetailModal = (orderNo) => {
  selectedOrderNo.value = orderNo
  const currentOrder = orders.value.find((o) => o.orderNo === orderNo)
  selectedOrderCurrentStatus.value = currentOrder ? currentOrder.status : ORDER_STATUS.PENDING
  isModalOpen.value = true
}

// 計算各狀態的統計數量
const statusStats = computed(() => {
  const list = orders.value || []
  return {
    all: list.length,
    pending: list.filter((o) => o.status === ORDER_STATUS.PENDING).length,
    paid: list.filter((o) => o.status === ORDER_STATUS.PAID).length,
    shipping: list.filter((o) => o.status === ORDER_STATUS.SHIPPING).length,
    delivered: list.filter((o) => o.status === ORDER_STATUS.DELIVERED).length,
    cancelledRefunded: list.filter((o) => 
      [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING_REFUND, ORDER_STATUS.REFUNDED].includes(o.status)
    ).length
  }
})

// 生成狀態選單選項
const statusOptions = computed(() => {
  const options = Object.values(ORDER_STATUS).map((status) => {
    const info = orderStatusManager.getStatusInfo(status)
    return { value: String(status), label: info.text }
  })
  options.push({ value: 'cancelledRefunded', label: '已取消 / 退款中' })
  return options
})

// 重設所有篩選條件
const resetFilters = () => {
  searchQuery.value = ''
  searchMemberId.value = ''
  dateRange.value = null
  statusFilter.value = 'all'
}

// 計算屬性：負責搜尋與過濾的聯動
const filteredOrders = computed(() => {
  let result = orders.value

  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'cancelledRefunded') {
      result = result.filter((o) => 
        [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING_REFUND, ORDER_STATUS.REFUNDED].includes(o.status)
      )
    } else {
      result = result.filter((o) => o.status === Number(statusFilter.value))
    }
  }

  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase().trim()
    result = result.filter((o) => o.orderNo.toLowerCase().includes(keyword))
  }

  if (searchMemberId.value) {
    const mId = Number(searchMemberId.value.trim())
    if (!isNaN(mId)) {
      result = result.filter((o) => o.memberId === mId)
    }
  }

  if (dateRange.value && dateRange.value[0]) {
    const start = new Date(dateRange.value[0])
    start.setHours(0, 0, 0, 0)

    let end = dateRange.value[1] ? new Date(dateRange.value[1]) : new Date(start)
    end.setHours(23, 59, 59, 999)

    result = result.filter((o) => {
      const orderTime = new Date(o.createdAt)
      return orderTime >= start && orderTime <= end
    })
  }

  return result
})

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5]">
    <!-- 統一的頁面標題列 -->
    <div class="px-8 pt-8 pb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[#20251F] tracking-tight">全站訂單管理</h1>
        <p class="text-sm text-stone-400 mt-0.5 font-serif">總覽全站交易，支援即時關鍵字查詢、明細檢視與強制狀態變更</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- 立即掃描異常按鈕 -->
        <Button
          label="立即掃描異常"
          icon="pi pi-search"
          severity="secondary"
          outlined
          size="small"
          :loading="scanning"
          @click="triggerScan"
          class="!rounded-xl text-xs font-semibold cursor-pointer"
        />
        <!-- 重新整理按鈕 -->
        <button
          @click="fetchOrders"
          class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 h-[34px] font-sans"
        >
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          <span>重新整理</span>
        </button>
      </div>
    </div>

    <!-- 訂單管理核心內容 -->
    <div class="px-8 pb-8 space-y-6">
      <!-- 狀態統計快捷卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <!-- 全部 -->
        <div
          @click="statusFilter = 'all'"
          class="p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 shadow-sm"
          :class="statusFilter === 'all' 
            ? 'border-[#8E9A86] bg-[#8E9A86]/5 text-[#8E9A86]' 
            : 'border-stone-200/50 bg-white/70 text-stone-600 hover:bg-stone-50/50 hover:border-stone-300'"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium font-serif">全部訂單</span>
            <i class="pi pi-shopping-bag text-sm opacity-80"></i>
          </div>
          <span class="text-2xl font-bold font-mono tracking-tight leading-none">
            {{ statusStats.all }}
          </span>
        </div>

        <!-- 待付款 -->
        <div
          @click="statusFilter = '1'"
          class="p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 shadow-sm"
          :class="statusFilter === '1' 
            ? 'border-amber-500 bg-amber-500/5 text-amber-600' 
            : 'border-stone-200/50 bg-white/70 text-stone-600 hover:bg-stone-50/50 hover:border-stone-300'"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium font-serif">待付款</span>
            <i class="pi pi-wallet text-sm opacity-80"></i>
          </div>
          <span class="text-2xl font-bold font-mono tracking-tight leading-none">
            {{ statusStats.pending }}
          </span>
        </div>

        <!-- 待出貨 -->
        <div
          @click="statusFilter = '2'"
          class="p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 shadow-sm"
          :class="statusFilter === '2' 
            ? 'border-sky-500 bg-sky-500/5 text-sky-600' 
            : 'border-stone-200/50 bg-white/70 text-stone-600 hover:bg-stone-50/50 hover:border-stone-300'"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium font-serif">待出貨</span>
            <i class="pi pi-box text-sm opacity-80"></i>
          </div>
          <span class="text-2xl font-bold font-mono tracking-tight leading-none">
            {{ statusStats.paid }}
          </span>
        </div>

        <!-- 出貨中 -->
        <div
          @click="statusFilter = '3'"
          class="p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 shadow-sm"
          :class="statusFilter === '3' 
            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600' 
            : 'border-stone-200/50 bg-white/70 text-stone-600 hover:bg-stone-50/50 hover:border-stone-300'"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium font-serif">配送中</span>
            <i class="pi pi-truck text-sm opacity-80"></i>
          </div>
          <span class="text-2xl font-bold font-mono tracking-tight leading-none">
            {{ statusStats.shipping }}
          </span>
        </div>

        <!-- 已完成 -->
        <div
          @click="statusFilter = '4'"
          class="p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 shadow-sm"
          :class="statusFilter === '4' 
            ? 'border-emerald-600 bg-emerald-500/5 text-emerald-600' 
            : 'border-stone-200/50 bg-white/70 text-stone-600 hover:bg-stone-50/50 hover:border-stone-300'"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium font-serif">已送達</span>
            <i class="pi pi-check-circle text-sm opacity-80"></i>
          </div>
          <span class="text-2xl font-bold font-mono tracking-tight leading-none">
            {{ statusStats.delivered }}
          </span>
        </div>

        <!-- 已取消 / 退款 -->
        <div
          @click="statusFilter = 'cancelledRefunded'"
          class="p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 shadow-sm"
          :class="statusFilter === 'cancelledRefunded' 
            ? 'border-rose-500 bg-rose-500/5 text-rose-500' 
            : 'border-stone-200/50 bg-white/70 text-stone-600 hover:bg-stone-50/50 hover:border-stone-300'"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium font-serif">取消 / 退款</span>
            <i class="pi pi-times-circle text-sm opacity-80"></i>
          </div>
          <span class="text-2xl font-bold font-mono tracking-tight leading-none">
            {{ statusStats.cancelledRefunded }}
          </span>
        </div>
      </div>

      <!-- 搜尋與過濾區塊 -->
      <div class="bg-white/80 p-5 rounded-2xl border border-stone-200/40 flex flex-wrap gap-4 items-end backdrop-blur-md shadow-sm">
        <!-- 搜尋訂單編號 -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-semibold text-stone-600 mb-1.5 font-serif">搜尋訂單編號</label>
          <div class="relative">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="輸入 ORD..."
              class="w-full border border-stone-200 bg-white rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] transition-all font-sans"
            />
          </div>
        </div>

        <!-- 搜尋會員編號 -->
        <div class="w-48">
          <label class="block text-xs font-semibold text-stone-600 mb-1.5 font-serif">搜尋會員編號</label>
          <div class="relative">
            <i class="pi pi-user absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
            <input
              v-model="searchMemberId"
              type="text"
              placeholder="輸入會員 ID"
              class="w-full border border-stone-200 bg-white rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] transition-all font-sans"
            />
          </div>
        </div>

        <!-- 時間區間 -->
        <div class="w-64">
          <label class="block text-xs font-semibold text-stone-600 mb-1.5 font-serif">時間區間</label>
          <DatePicker
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            placeholder="選擇時間範圍"
            class="w-full font-sans"
            showIcon
            iconDisplay="input"
            :pt="{
              input: { class: 'w-full border border-stone-200 bg-white rounded-xl pl-3 pr-3 py-2.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] transition-all' }
            }"
          />
        </div>

        <!-- 訂單狀態下拉選單 -->
        <div class="w-48">
          <label class="block text-xs font-semibold text-stone-600 mb-1.5 font-serif">訂單狀態</label>
          <select
            v-model="statusFilter"
            class="w-full border border-stone-200 bg-white rounded-xl px-3 py-2.5 text-xs text-stone-750 focus:outline-none focus:ring-2 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] transition-all font-sans font-medium cursor-pointer"
          >
            <option value="all">全部狀態</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- 重設篩選按鈕 -->
        <button
          @click="resetFilters"
          class="px-4 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-650 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 min-h-[40px] cursor-pointer"
        >
          <i class="pi pi-filter-slash text-xs"></i>
          <span>重設篩選</span>
        </button>
      </div>

      <!-- 訂單列表表格組件 -->
      <AdminOrderListTable
        :orders="filteredOrders"
        :loading="loading"
        @view-detail="openDetailModal"
      />

      <!-- 訂單詳情右側大彈窗組件 -->
      <AdminOrderDetailModal
        v-model:visible="isModalOpen"
        :orderNo="selectedOrderNo"
        :currentStatus="selectedOrderCurrentStatus"
        @updated="fetchOrders"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.p-datepicker-trigger) {
  color: #78716c !important;
}
</style>
