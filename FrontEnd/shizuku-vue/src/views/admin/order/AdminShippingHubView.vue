<script setup>
import { ref, onMounted, watch } from 'vue'
import { getShippingOrdersAPI, batchUpdateStatusAPI } from '@/api/adminOrder'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const loading = ref(false)
const orders = ref([])
const selectedOrders = ref([])
const activeStatus = ref(2) // 預設 2: 待出貨

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await getShippingOrdersAPI(activeStatus.value)
    if (res.success) {
      orders.value = res.data
      selectedOrders.value = [] // 切換分頁時清空選取
    }
  } catch (err) {
    toast.add({ 
      severity: 'error', 
      summary: '載入失敗', 
      detail: '無法獲取出貨清單', 
      life: 3000 
    })
  } finally {
    loading.value = false
  }
}

const handleBatchUpdate = async (newStatus) => {
  if (selectedOrders.value.length === 0) return

  const orderNos = selectedOrders.value.map((o) => o.fOrderNo)
  loading.value = true

  try {
    const res = await batchUpdateStatusAPI(orderNos, newStatus)
    if (res.success) {
      toast.add({ 
        severity: 'success', 
        summary: '批次更新成功', 
        detail: res.message, 
        life: 3000 
      })
      await loadOrders()
    } else {
      toast.add({ 
        severity: 'error', 
        summary: '更新失敗', 
        detail: res.message, 
        life: 5000 
      })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: '系統錯誤',
      detail: '批次更新過程發生錯誤',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// 監聽分頁切換
watch(activeStatus, () => {
  loadOrders()
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(value || 0)
}

onMounted(loadOrders)
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5]">
    <!-- 統一的頁面標題列 -->
    <div class="px-8 pt-8 pb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[#20251F] tracking-tight">出貨作業中心</h1>
        <p class="text-sm text-stone-400 mt-0.5 font-serif">倉儲人員專屬！集中顯示「待出貨」與「已寄出」訂單，提供一鍵批次發貨與狀態更新</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- 批次選擇計數提示 -->
        <span
          v-if="selectedOrders.length > 0"
          class="bg-[#8E9A86]/10 text-[#8E9A86] border border-[#8E9A86]/20 px-3 py-1.5 rounded-xl text-xs font-sans font-medium"
        >
          已選取 {{ selectedOrders.length }} 筆
        </span>
        <!-- 重新整理按鈕 -->
        <button
          @click="loadOrders"
          class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 h-[34px] font-sans"
        >
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          <span>重新整理</span>
        </button>
      </div>
    </div>

    <!-- 出貨管理核心內容區 -->
    <div class="px-8 pb-8 space-y-6">
      <!-- 自訂極簡頁籤導覽 -->
      <div class="flex gap-6 border-b border-stone-200/40 pb-px font-serif">
        <button 
          @click="activeStatus = 2" 
          :class="['tab-btn pb-3 text-sm font-semibold tracking-wide flex items-center gap-2 transition-all relative cursor-pointer', activeStatus === 2 ? 'text-[#8E9A86] active-tab-line' : 'text-stone-400 hover:text-stone-700']"
        >
          <span>待出貨打包</span>
          <span :class="['count-badge px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all', activeStatus === 2 ? 'bg-[#8E9A86]/10 text-[#8E9A86]' : 'bg-stone-100 text-stone-400']">
            {{ activeStatus === 2 ? orders.length : '0' }}
          </span>
        </button>
        <button 
          @click="activeStatus = 3" 
          :class="['tab-btn pb-3 text-sm font-semibold tracking-wide flex items-center gap-2 transition-all relative cursor-pointer', activeStatus === 3 ? 'text-[#8E9A86] active-tab-line' : 'text-stone-400 hover:text-stone-700']"
        >
          <span>配送中追蹤</span>
          <span :class="['count-badge px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all', activeStatus === 3 ? 'bg-[#8E9A86]/10 text-[#8E9A86]' : 'bg-stone-100 text-stone-400']">
            {{ activeStatus === 3 ? orders.length : '0' }}
          </span>
        </button>
      </div>

      <!-- 撿貨工作資料表卡片 -->
      <div class="bg-white/90 rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden backdrop-blur-md p-4 font-serif">
        <div class="px-2 pb-4 pt-1 flex justify-between items-center border-b border-stone-200/30 mb-2">
          <h3 class="text-sm font-bold text-stone-750">
            {{ activeStatus === 2 ? '待打包撿貨清單' : '在途包裹狀態追蹤' }}
          </h3>
          <span class="text-[11px] text-stone-400 font-light font-sans">
            顯示 {{ orders.length }} 筆符合的發貨紀錄
          </span>
        </div>

        <DataTable
          v-model:selection="selectedOrders"
          :value="orders"
          dataKey="fOrderNo"
          stripedRows
          paginator
          :rows="10"
          responsiveLayout="stack"
          breakpoint="960px"
          class="p-datatable-sm custom-shipping-table font-sans"
        >
          <Column selectionMode="multiple" headerStyle="width: 3.5rem"></Column>

          <Column
            field="fOrderNo"
            header="訂單編號"
            sortable
            class="font-mono text-xs font-semibold text-stone-800"
          >
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-file-edit text-stone-400 text-[10px]"></i>
                <span class="font-bold text-stone-850 tracking-tight">{{ slotProps.data.fOrderNo }}</span>
              </div>
            </template>
          </Column>

          <Column header="收件人資訊">
            <template #body="slotProps">
              <div class="flex flex-col text-xs pr-2 font-serif">
                <span class="font-bold text-stone-800">{{ slotProps.data.fReceiverName }}</span>
                <span class="text-stone-400 text-[10px] mt-0.5 font-sans">{{ slotProps.data.fReceiverPhone }}</span>
              </div>
            </template>
          </Column>

          <Column field="fReceiverAddress" header="收件地址" class="max-w-[240px] truncate text-stone-600 font-light text-xs leading-relaxed">
            <template #body="slotProps">
              <span :title="slotProps.data.fReceiverAddress">
                {{ slotProps.data.fReceiverAddress }}
              </span>
            </template>
          </Column>

          <Column field="itemSummary" header="撿貨內容摘要" class="max-w-[320px]">
            <template #body="slotProps">
              <div class="p-2.5 bg-[#8E9A86]/5 border border-stone-200/20 rounded-xl text-xs text-stone-700 leading-relaxed font-sans">
                {{ slotProps.data.itemSummary }}
              </div>
            </template>
          </Column>

          <Column field="fTotalAmount" header="訂單金額" sortable class="text-right font-mono text-xs font-semibold text-stone-800">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.fTotalAmount) }}
            </template>
          </Column>

          <template #empty>
            <div class="py-20 text-center bg-transparent">
              <div class="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4 border border-stone-200/20 text-stone-400">
                <i class="pi pi-box text-xl animate-bounce"></i>
              </div>
              <p class="text-stone-500 font-serif text-sm font-medium">當前沒有需要處理的訂單</p>
              <p class="text-stone-400 text-xs mt-1 font-serif">該分類下的所有訂單已處理發貨完畢</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- 底部黑色磨砂浮動操作列 -->
    <transition name="slide-up">
      <div v-if="selectedOrders.length > 0" class="floating-actions shadow-2xl">
        <div class="flex items-center gap-6">
          <div class="text-left">
            <p class="text-[9px] text-stone-450 uppercase tracking-widest leading-none font-bold">BATCH PROCESSING</p>
            <p class="font-semibold text-white text-xs mt-1 font-sans">已選擇 {{ selectedOrders.length }} 筆出貨清單</p>
          </div>
          <div class="h-6 w-px bg-white/10"></div>
          <div class="flex gap-2">
            <template v-if="activeStatus === 2">
              <button
                @click="handleBatchUpdate(3)"
                class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <i class="pi pi-truck text-xs"></i>
                <span>批次標記出貨</span>
              </button>
            </template>
            <template v-if="activeStatus === 3">
              <button
                @click="handleBatchUpdate(4)"
                class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <i class="pi pi-check-circle text-xs"></i>
                <span>批次標記已送達</span>
              </button>
            </template>
          </div>
        </div>
        <button
          class="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-0"
          @click="selectedOrders = []"
        >
          <i class="pi pi-times text-xs"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* 頁籤選單下底線動畫 */
.tab-btn {
  background: transparent;
  border: none;
}
.active-tab-line::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #8E9A86;
}

/* 浮動操作列樣式 */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(32, 37, 31, 0.85);
  backdrop-filter: blur(12px);
  padding: 0.85rem 1.75rem;
  border-radius: 9999px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 480px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100px);
  opacity: 0;
}

/* Table override styles */
:deep(.p-datatable-thead > tr > th) {
  background-color: transparent !important;
  border-bottom: 2px solid #f5f5f4 !important;
  color: #78716c !important;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.05em;
  padding: 1rem 0.75rem !important;
}

:deep(.p-checkbox .p-checkbox-box) {
  border-radius: 6px !important;
  border-color: #d6d3d1 !important;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: #8E9A86 !important;
  border-color: #8E9A86 !important;
}
</style>
