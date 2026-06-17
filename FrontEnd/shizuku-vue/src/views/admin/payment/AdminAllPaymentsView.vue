<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { triggerPaymentScanAPI } from '@/api/adminOrder'
import { usePaymentAdmin } from '@/composables/usePaymentAdmin'
import PaymentLogDialog from '@/components/admin/payments/PaymentLogDialog.vue'
import PaymentDiagnosisDialog from '@/components/admin/payments/PaymentDiagnosisDialog.vue'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

const toast = useToast()
const scanning = ref(false)

const { transactions, loading, fetchTransactions, getStatusInfo, formatDate, getPaymentMethodIcon } =
  usePaymentAdmin()

const diagnosisDialogVisible = ref(false) // 診斷彈窗狀態
const searchQuery = ref('')
const logDialogVisible = ref(false)
const selectedTransaction = ref(null)

const openLogs = (data) => {
  selectedTransaction.value = data
  logDialogVisible.value = true
}

const openDiagnosis = (data) => {
  selectedTransaction.value = data
  diagnosisDialogVisible.value = true
}

// 模糊搜尋邏輯
const filteredTransactions = computed(() => {
  const list = transactions.value || []
  if (!searchQuery.value) return list
  const keyword = searchQuery.value.toLowerCase().trim()
  return list.filter(
    (t) =>
      t.fTransactionNo?.toLowerCase().includes(keyword) ||
      t.orderNo?.toLowerCase().includes(keyword) ||
      t.methodName?.toLowerCase().includes(keyword),
  )
})

const triggerScan = async () => {
  scanning.value = true
  try {
    await triggerPaymentScanAPI()
    toast.add({
      severity: 'info',
      summary: '掃描已執行',
      detail: '金流異常掃描完成，若有偵測到異常將立即推播通知。',
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

onMounted(fetchTransactions)
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5]">
    <div class="px-4 sm:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#20251F] tracking-tight">全站交易對帳</h1>
        <p class="text-sm text-stone-400 mt-0.5 font-serif">監控全站金流流水，支援單號檢視、支付狀態查詢與詳細通訊日誌</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <!-- 立即掃描金流異常按鈕 -->
        <Button
          label="立即掃描金流異常"
          icon="pi pi-search"
          severity="warn"
          outlined
          size="small"
          :loading="scanning"
          @click="triggerScan"
          class="!rounded-xl text-xs font-semibold cursor-pointer"
        />
        <!-- 重新整理按鈕 -->
        <button
          @click="fetchTransactions"
          class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 h-[34px] font-sans"
        >
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          <span>重新整理</span>
        </button>
      </div>
    </div>

    <!-- 交易對帳核心內容區 -->
    <div class="px-4 sm:px-8 pb-8 space-y-6">
      <!-- 搜尋區塊 -->
      <div class="bg-white/80 p-5 rounded-2xl border border-stone-200/40 flex items-end backdrop-blur-md shadow-sm">
        <div class="w-full max-w-md">
          <label class="block text-xs font-semibold text-stone-600 mb-1.5 font-serif">模糊搜尋交易資訊</label>
          <div class="relative">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="輸入支付單號、訂單號碼或付款方式名稱..."
              class="w-full border border-stone-200 bg-white rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] transition-all font-sans"
            />
          </div>
        </div>
      </div>

      <!-- 交易列表表格 -->
      <div class="bg-white/90 rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden backdrop-blur-md">
        <!-- 桌機版表格 -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-left border-collapse font-serif">
            <thead>
              <tr class="border-b border-stone-200/40 text-stone-500 text-[11px] font-medium tracking-wider uppercase">
                <th class="py-4 px-6">支付單號</th>
                <th class="py-4 px-6">訂單號碼</th>
                <th class="py-4 px-6">付款方式</th>
                <th class="py-4 px-6 text-right">交易金額</th>
                <th class="py-4 px-6 text-center">支付狀態</th>
                <th class="py-4 px-6 text-center">建立時間</th>
                <th class="py-4 px-6 text-center">通訊日誌</th>
                <th class="py-4 px-6 text-center">診斷審查</th>
              </tr>
            </thead>
            <tbody class="text-sm divide-y divide-stone-200/30 font-sans">
              <!-- 載入中骨架屏 -->
              <template v-if="loading">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="py-4 px-6"><Skeleton width="140px" height="14px" /></td>
                  <td class="py-4 px-6"><Skeleton width="130px" height="14px" /></td>
                  <td class="py-4 px-6"><Skeleton width="100px" height="14px" /></td>
                  <td class="py-4 px-6 text-right"><Skeleton width="80px" height="14px" class="ml-auto" /></td>
                  <td class="py-4 px-6 text-center"><Skeleton width="75px" height="22px" borderRadius="999px" class="mx-auto" /></td>
                  <td class="py-4 px-6 text-center"><Skeleton width="110px" height="14px" /></td>
                  <td class="py-4 px-6 text-center"><Skeleton width="50px" height="14px" class="mx-auto" /></td>
                  <td class="py-4 px-6 text-center"><Skeleton width="50px" height="14px" class="mx-auto" /></td>
                </tr>
              </template>

              <!-- 無資料狀態 -->
              <tr v-else-if="filteredTransactions.length === 0">
                <td colspan="8" class="py-16 text-center">
                  <div class="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4 border border-stone-200/20 text-stone-400">
                    <i class="pi pi-credit-card text-xl animate-bounce"></i>
                  </div>
                  <p class="text-stone-500 font-serif text-sm font-medium">找不到符合條件的交易紀錄</p>
                  <p class="text-stone-400 text-xs mt-1 font-serif">請確認搜尋關鍵字是否正確</p>
                </td>
              </tr>

              <!-- 交易資料 -->
              <template v-else>
                <tr
                  v-for="data in filteredTransactions"
                  :key="data.fTransactionNo"
                  class="hover:bg-stone-50/40 transition-colors duration-200 group"
                >
                  <!-- 支付單號 -->
                  <td class="py-4 px-6">
                    <span class="font-mono text-stone-850 font-semibold text-xs tracking-tight">{{ data.fTransactionNo }}</span>
                  </td>
                  <!-- 訂單號碼 -->
                  <td class="py-4 px-6">
                    <span class="font-mono text-[#8E9A86] font-semibold text-xs tracking-tight">{{ data.orderNo }}</span>
                  </td>
                  <!-- 付款方式 -->
                  <td class="py-4 px-6 text-stone-600 text-xs font-serif">
                    <span class="flex items-center gap-2">
                      <i :class="getPaymentMethodIcon(data.methodName)" class="text-stone-400 text-xs"></i>
                      <span>{{ data.methodName }}</span>
                    </span>
                  </td>
                  <!-- 金額 -->
                  <td class="py-4 px-6 text-right font-mono font-semibold text-stone-850 text-xs">
                    NT$ {{ data.fAmount?.toLocaleString() }}
                  </td>
                  <!-- 狀態 Badge -->
                  <td class="py-4 px-6 text-center">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide inline-flex items-center gap-1 shadow-xs border"
                      :class="{
                        'bg-emerald-500/5 text-emerald-600 border-emerald-500/10': data.fStatus === 1,
                        'bg-rose-500/5 text-rose-500 border-rose-500/10': data.fStatus === 0,
                        'bg-amber-500/5 text-amber-600 border-amber-500/10': data.fStatus === 2,
                      }"
                    >
                      <i
                        :class="
                          data.fStatus === 1
                            ? 'pi pi-check-circle'
                            : data.fStatus === 0
                              ? 'pi pi-times-circle'
                              : 'pi pi-clock'
                        "
                        class="text-[9px]"
                      ></i>
                      <span>{{ getStatusInfo(data.fStatus).label }}</span>
                    </span>
                  </td>
                  <!-- 建立時間 -->
                  <td class="py-4 px-6 text-center text-stone-500 text-xs font-serif font-light">
                    {{ formatDate(data.fCreatedAt) }}
                  </td>
                  <!-- 通訊日誌按鈕 -->
                  <td class="py-4 px-6 text-center">
                    <button
                      @click="openLogs(data)"
                      class="text-[#8E9A86] hover:text-[#7d8b75] font-serif font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <i class="pi pi-file-edit text-[10px]"></i>
                      <span>日誌</span>
                    </button>
                  </td>
                  <!-- 診斷按鈕 -->
                  <td class="py-4 px-6 text-center">
                    <button
                      @click="openDiagnosis(data)"
                      class="text-stone-600 hover:text-stone-850 font-serif font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <i class="pi pi-shield text-[10px]"></i>
                      <span>檢視</span>
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片清單 -->
        <div class="block md:hidden p-4 space-y-4">
          <!-- 載入中骨架屏 -->
          <template v-if="loading">
            <div v-for="i in 5" :key="i" class="p-4 rounded-xl border border-stone-100 bg-white space-y-3 animate-pulse">
              <div class="flex justify-between items-center">
                <Skeleton width="100px" height="14px" />
                <Skeleton width="60px" height="18px" borderRadius="12px" />
              </div>
              <div class="space-y-1.5">
                <Skeleton width="80px" height="12px" />
                <Skeleton width="120px" height="12px" />
              </div>
              <div class="flex justify-between items-center pt-2.5 border-t border-stone-100">
                <Skeleton width="90px" height="14px" />
                <div class="flex gap-2">
                  <Skeleton width="50px" height="24px" borderRadius="8px" />
                  <Skeleton width="50px" height="24px" borderRadius="8px" />
                </div>
              </div>
            </div>
          </template>

          <!-- 無資料狀態 -->
          <div v-else-if="filteredTransactions.length === 0" class="py-12 text-center bg-white rounded-xl border border-stone-100">
            <div class="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-3 border border-stone-200/20 text-stone-400">
              <i class="pi pi-credit-card text-lg"></i>
            </div>
            <p class="text-stone-500 font-serif text-sm font-medium">找不到符合條件的交易紀錄</p>
          </div>

          <!-- 交易資料卡片 -->
          <template v-else>
            <div
              v-for="data in filteredTransactions"
              :key="data.fTransactionNo"
              class="p-4 rounded-xl border border-stone-200/50 bg-white shadow-xs hover:border-[#8E9A86]/30 transition-all duration-200"
            >
              <!-- 標頭列：支付單號與狀態 -->
              <div class="flex justify-between items-center mb-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 border border-stone-200/20">
                    <i class="pi pi-credit-card text-[10px]"></i>
                  </div>
                  <span class="font-mono text-stone-850 font-bold text-xs tracking-tight">{{ data.fTransactionNo }}</span>
                </div>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide inline-flex items-center gap-1 shadow-2xs border"
                  :class="{
                    'bg-emerald-500/5 text-emerald-600 border-emerald-500/10': data.fStatus === 1,
                    'bg-rose-500/5 text-rose-500 border-rose-500/10': data.fStatus === 0,
                    'bg-amber-500/5 text-amber-600 border-amber-500/10': data.fStatus === 2,
                  }"
                >
                  <i
                    :class="
                      data.fStatus === 1
                        ? 'pi pi-check-circle'
                        : data.fStatus === 0
                          ? 'pi pi-times-circle'
                          : 'pi pi-clock'
                    "
                    class="text-[9px]"
                  ></i>
                  <span>{{ getStatusInfo(data.fStatus).label }}</span>
                </span>
              </div>

              <!-- 內容區：訂單號碼、付款方式與時間 -->
              <div class="text-xs space-y-1.5 text-stone-500 font-serif">
                <div class="flex items-center gap-1.5">
                  <span class="text-stone-400">訂單號碼:</span>
                  <span class="font-mono font-medium text-[#8E9A86]">{{ data.orderNo }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-stone-400">付款方式:</span>
                  <span class="flex items-center gap-1 text-stone-700">
                    <i :class="getPaymentMethodIcon(data.methodName)" class="text-stone-400 text-[10px]"></i>
                    <span>{{ data.methodName }}</span>
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-stone-400">建立時間:</span>
                  <span class="font-sans text-stone-600">{{ formatDate(data.fCreatedAt) }}</span>
                </div>
              </div>

              <!-- 底欄列：金額與動作按鈕 -->
              <div class="flex justify-between items-center mt-3.5 pt-3 border-t border-stone-100/60">
                <div class="flex flex-col">
                  <span class="text-[9px] text-stone-400 font-serif uppercase leading-none">Total Amount</span>
                  <span class="font-mono font-bold text-stone-850 text-xs mt-0.5">
                    NT$ {{ data.fAmount?.toLocaleString() }}
                  </span>
                </div>
                
                <!-- 動作按鈕 -->
                <div class="flex items-center gap-2">
                  <button
                    @click="openLogs(data)"
                    class="text-xs border border-stone-200 text-stone-600 hover:text-[#8E9A86] hover:border-[#8E9A86]/30 px-2.5 py-1 rounded-lg font-serif font-medium transition-all cursor-pointer flex items-center gap-1 bg-white"
                  >
                    <i class="pi pi-file-edit text-[9px]"></i>
                    <span>日誌</span>
                  </button>
                  <button
                    @click="openDiagnosis(data)"
                    class="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg font-serif font-medium transition-all cursor-pointer flex items-center gap-1 border border-stone-200/20"
                  >
                    <i class="pi pi-shield text-[9px]"></i>
                    <span>診斷</span>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 金流日誌彈窗 -->
    <PaymentLogDialog v-model:visible="logDialogVisible" :transaction="selectedTransaction" />
    <!-- 診斷報告彈窗 -->
    <PaymentDiagnosisDialog
      v-model:visible="diagnosisDialogVisible"
      :transaction="selectedTransaction"
    />
  </div>
</template>

<style scoped>
/* 深度複寫彈窗圓角與陰影，使其與主風格對齊 */
:deep(.p-dialog) {
  border-radius: 20px !important;
  background-color: #FAF8F5 !important;
  border: 1px solid rgba(120, 113, 108, 0.15) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04) !important;
}
:deep(.p-dialog-header) {
  background-color: #FAF8F5 !important;
  border-bottom: 1px solid rgba(120, 113, 108, 0.1) !important;
}
:deep(.p-dialog-content) {
  background-color: #FAF8F5 !important;
}
</style>
