<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { getPendingRefundsAPI, approveRefundAPI, rejectRefundAPI } from '@/api/adminOrder'

const toast = useToast()
const refundOrders = ref([])
const loading = ref(true)

// 載入待退款訂單清單
const loadRefunds = async () => {
  loading.value = true
  try {
    const res = await getPendingRefundsAPI()
    if (res && res.success) {
      refundOrders.value = res.data || []
    }
  } catch (err) {
    toast.add({ 
      severity: 'error', 
      summary: '載入失敗', 
      detail: '無法取得退款訂單清單', 
      life: 4000 
    })
  } finally {
    loading.value = false
  }
}

// 核准退款
const handleApprove = async (orderNo) => {
  if (!confirm(`確定要核准 ${orderNo} 的退款嗎？此操作會呼叫金流退款 API 並回補庫存。`)) return

  try {
    const res = await approveRefundAPI(orderNo)
    if (res && res.success) {
      toast.add({ 
        severity: 'success', 
        summary: '退款成功', 
        detail: res.message, 
        life: 5000 
      })
      await loadRefunds() // 重新載入清單
    } else {
      toast.add({ 
        severity: 'error', 
        summary: '退款失敗', 
        detail: res?.message || '退款操作失敗', 
        life: 5000 
      })
    }
  } catch (err) {
    toast.add({ 
      severity: 'error', 
      summary: '系統錯誤', 
      detail: '退款操作發生異常', 
      life: 5000 
    })
  }
}

// 駁回退款
const handleReject = async (orderNo) => {
  const reason = prompt('請輸入駁回原因：')
  if (!reason) return

  try {
    const res = await rejectRefundAPI(orderNo, reason)
    if (res && res.success) {
      toast.add({ 
        severity: 'warn', 
        summary: '已駁回', 
        detail: res.message, 
        life: 4000 
      })
      await loadRefunds()
    } else {
      toast.add({ 
        severity: 'error', 
        summary: '駁回失敗', 
        detail: res?.message || '駁回操作失敗', 
        life: 4000 
      })
    }
  } catch (err) {
    toast.add({ 
      severity: 'error', 
      summary: '系統錯誤', 
      detail: '駁回操作發生異常', 
      life: 4000 
    })
  }
}

onMounted(() => loadRefunds())
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5]">
    <!-- 統一的頁面標題列 -->
    <div class="px-8 pt-8 pb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[#20251F] tracking-tight">退款管理中心</h1>
        <p class="text-sm text-stone-400 mt-0.5 font-serif">集中處理顧客退款申請、線上自動退刷審核與庫存自動回補</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- 重新整理按鈕 -->
        <button
          @click="loadRefunds"
          class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98 h-[34px] font-sans"
        >
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          <span>重新整理</span>
        </button>
      </div>
    </div>

    <!-- 退款管理核心內容區 -->
    <div class="px-8 pb-8 space-y-6">
      <!-- 統計快捷卡片 -->
      <div class="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 flex items-center justify-between shadow-sm font-serif w-full max-w-[280px]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <i class="pi pi-undo text-sm"></i>
          </div>
          <div>
            <p class="text-xs text-stone-500 font-medium">待處理退款申請</p>
            <p class="text-2xl font-bold font-mono text-stone-850 mt-0.5">{{ refundOrders.length }} <span class="text-xs font-serif font-light text-stone-450">筆</span></p>
          </div>
        </div>
      </div>

      <!-- 退款資料列表 -->
      <div class="bg-white/90 rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden backdrop-blur-md p-4 font-serif">
        <div class="px-2 pb-4 pt-1 flex justify-between items-center border-b border-stone-200/30 mb-2">
          <h3 class="text-sm font-bold text-stone-750">
            待處理退款明細
          </h3>
          <span class="text-[11px] text-stone-400 font-light font-sans">
            系統中目前有 {{ refundOrders.length }} 筆退刷/退款待確認
          </span>
        </div>

        <DataTable
          :value="refundOrders"
          :loading="loading"
          stripedRows
          :paginator="refundOrders.length > 10"
          :rows="10"
          responsiveLayout="stack"
          breakpoint="960px"
          class="p-datatable-sm custom-refund-table font-sans"
        >
          <!-- 訂單編號 -->
          <Column field="orderNo" header="訂單編號" sortable class="font-mono text-xs font-semibold text-stone-800">
            <template #body="{ data }">
              <span class="font-bold text-stone-850 tracking-tight">{{ data.orderNo }}</span>
            </template>
          </Column>

          <!-- 會員姓名 -->
          <Column field="memberName" header="會員姓名">
            <template #body="{ data }">
              <div class="flex items-center gap-2 font-serif text-xs">
                <div class="w-6.5 h-6.5 rounded-full bg-[#8E9A86]/10 flex items-center justify-center text-[10px] font-bold text-[#8E9A86]">
                  {{ data.memberName?.charAt(0) || '?' }}
                </div>
                <span class="font-bold text-stone-800">{{ data.memberName }}</span>
              </div>
            </template>
          </Column>

          <!-- 退款金額 -->
          <Column field="totalAmount" header="退款金額" sortable class="font-mono text-xs font-semibold text-rose-600">
            <template #body="{ data }">
              <span class="font-bold">
                NT$ {{ data.totalAmount?.toLocaleString() }}
              </span>
            </template>
          </Column>

          <!-- 付款管道 -->
          <Column field="paymentMethod" header="付款管道">
            <template #body="{ data }">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide shadow-xs border inline-block"
                :class="data.paymentMethod === 'LINE Pay' 
                  ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' 
                  : data.paymentMethod === '貨到付款' 
                    ? 'bg-amber-500/5 text-amber-600 border-amber-500/10' 
                    : 'bg-sky-500/5 text-sky-600 border-sky-500/10'"
              >
                {{ data.paymentMethod }}
              </span>
            </template>
          </Column>

          <!-- 退款原因 -->
          <Column field="note" header="退款原因" class="max-w-[220px] text-xs text-stone-600 font-light">
            <template #body="{ data }">
              <span :title="data.note" class="line-clamp-2 leading-relaxed">{{ data.note || '顧客未填寫原因' }}</span>
            </template>
          </Column>

          <!-- 申請時間 -->
          <Column field="updatedAt" header="申請時間" sortable class="text-stone-500 text-xs font-serif font-light">
            <template #body="{ data }">
              <span>
                {{ new Date(data.updatedAt).toLocaleString('zh-TW') }}
              </span>
            </template>
          </Column>

          <!-- 操作 -->
          <Column header="操作審查" class="min-w-[180px]">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  label="核准退款"
                  icon="pi pi-check"
                  severity="success"
                  size="small"
                  class="!rounded-xl text-xs font-semibold cursor-pointer"
                  @click="handleApprove(data.orderNo)"
                />
                <Button
                  label="駁回"
                  icon="pi pi-times"
                  severity="danger"
                  outlined
                  size="small"
                  class="!rounded-xl text-xs font-semibold cursor-pointer"
                  @click="handleReject(data.orderNo)"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="py-20 text-center bg-transparent">
              <div class="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4 border border-stone-200/20 text-stone-400">
                <i class="pi pi-check text-xl text-emerald-400"></i>
              </div>
              <p class="text-stone-500 font-serif text-sm font-medium">目前沒有待退款的申請</p>
              <p class="text-stone-400 text-xs mt-1 font-serif">所有的退刷審核已全數處理完畢</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
