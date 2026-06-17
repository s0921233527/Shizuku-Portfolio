<script setup>
import { ORDER_STATUS, orderStatusManager } from '@/services/orderStatusManager'
import Skeleton from 'primevue/skeleton'

const props = defineProps({
  orders: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view-detail'])

// 取得狀態對應的莫蘭迪柔和 HSL Badge 樣式
const getStatusBadgeClass = (status) => {
  switch (status) {
    case ORDER_STATUS.PENDING: // 待付款
      return 'bg-amber-500/5 text-amber-600 border border-amber-500/10'
    case ORDER_STATUS.PAID: // 已付款 / 待出貨
      return 'bg-sky-500/5 text-sky-600 border border-sky-500/10'
    case ORDER_STATUS.SHIPPING: // 出貨中
      return 'bg-indigo-500/5 text-indigo-600 border border-indigo-500/10'
    case ORDER_STATUS.DELIVERED: // 已送達
      return 'bg-[#8E9A86]/10 text-[#8E9A86] border border-[#8E9A86]/20'
    case ORDER_STATUS.CANCELLED: // 已取消
      return 'bg-stone-50 text-stone-400 border border-stone-200/40'
    case ORDER_STATUS.PENDING_REFUND: // 待退款
      return 'bg-rose-500/5 text-rose-500 border border-rose-500/10'
    case ORDER_STATUS.REFUNDED: // 已退款
      return 'bg-stone-50 text-stone-400 border border-stone-200/40'
    default:
      return 'bg-stone-50 text-stone-500 border border-stone-200/30'
  }
}

const getStatusLabel = (order) => {
  if (order.statusText && order.statusText !== '未知狀態') {
    return order.statusText
  }
  const info = orderStatusManager.getStatusInfo(order.status)
  return info ? info.text : '未知狀態'
}

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="bg-white/90 rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden backdrop-blur-md">
    <!-- 桌機版表格 -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full text-left border-collapse font-serif">
        <thead>
          <tr class="border-b border-stone-200/40 text-stone-500 text-[11px] font-medium tracking-wider uppercase">
            <th class="py-4 px-6">訂單資訊</th>
            <th class="py-4 px-6">會員編號</th>
            <th class="py-4 px-6">建立時間</th>
            <th class="py-4 px-6 text-right">總金額</th>
            <th class="py-4 px-6 text-center">訂單狀態</th>
            <th class="py-4 px-6 text-center">操作作業</th>
          </tr>
        </thead>
        <tbody class="text-sm divide-y divide-stone-200/30 font-sans">
          <!-- 載入中骨架屏 -->
          <template v-if="loading">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-stone-100 flex-shrink-0"></div>
                  <Skeleton width="130px" height="14px" />
                </div>
              </td>
              <td class="py-4 px-6">
                <Skeleton width="70px" height="18px" borderRadius="6px" />
              </td>
              <td class="py-4 px-6">
                <Skeleton width="110px" height="14px" />
              </td>
              <td class="py-4 px-6 text-right">
                <Skeleton width="80px" height="14px" class="ml-auto" />
              </td>
              <td class="py-4 px-6 text-center">
                <Skeleton width="75px" height="22px" borderRadius="999px" class="mx-auto" />
              </td>
              <td class="py-4 px-6 text-center">
                <Skeleton width="50px" height="14px" class="mx-auto" />
              </td>
            </tr>
          </template>

          <!-- 無資料狀態 -->
          <tr v-else-if="orders.length === 0">
            <td colspan="6" class="py-16 text-center">
              <div class="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4 border border-stone-200/20 text-stone-400">
                <i class="pi pi-inbox text-xl animate-bounce"></i>
              </div>
              <p class="text-stone-500 font-serif text-sm font-medium">找不到符合條件的訂單</p>
              <p class="text-stone-400 text-xs mt-1 font-serif">請嘗試變更搜尋關鍵字或時間區間</p>
            </td>
          </tr>

          <!-- 訂單資料列 -->
          <template v-else>
            <tr
              v-for="order in orders"
              :key="order.orderNo"
              class="hover:bg-stone-50/40 transition-colors duration-200 group"
            >
              <!-- 訂單資訊 -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-450 border border-stone-200/30 group-hover:bg-white group-hover:text-[#8E9A86] group-hover:border-[#8E9A86]/20 transition-all duration-200">
                    <i class="pi pi-file-edit text-xs"></i>
                  </div>
                  <span class="font-mono text-stone-800 font-semibold text-xs tracking-tight group-hover:text-[#8E9A86] transition-colors">{{ order.orderNo }}</span>
                </div>
              </td>
              
              <!-- 會員 ID 標記 -->
              <td class="py-4 px-6">
                <span class="inline-flex items-center gap-1 bg-stone-100/70 border border-stone-200/20 text-stone-600 px-2 py-0.5 rounded-md text-xs font-medium font-sans">
                  <i class="pi pi-user text-[10px] text-stone-400"></i>
                  #{{ order.memberId }}
                </span>
              </td>
              
              <!-- 建立日期 -->
              <td class="py-4 px-6">
                <span class="text-stone-500 text-xs font-serif font-light">{{ formatDate(order.createdAt) }}</span>
              </td>
              
              <!-- 金額 -->
              <td class="py-4 px-6 text-right">
                <span class="font-mono font-semibold text-stone-850 text-xs">
                  NT$ {{ order.totalAmount?.toLocaleString() }}
                </span>
              </td>
              
              <!-- 狀態 Badge -->
              <td class="py-4 px-6 text-center">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase shadow-sm inline-block"
                  :class="getStatusBadgeClass(order.status)"
                >
                  {{ getStatusLabel(order) }}
                </span>
              </td>
              
              <!-- 查看按鈕 -->
              <td class="py-4 px-6 text-center">
                <button
                  @click="emit('view-detail', order.orderNo)"
                  class="text-[#8E9A86] hover:text-[#7d8b75] font-serif font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <i class="pi pi-search text-[10px]"></i>
                  <span>查看詳情</span>
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
            <Skeleton width="65px" height="24px" borderRadius="8px" />
          </div>
        </div>
      </template>

      <!-- 無資料狀態 -->
      <div v-else-if="orders.length === 0" class="py-12 text-center bg-white rounded-xl border border-stone-100">
        <div class="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-3 border border-stone-200/20 text-stone-400">
          <i class="pi pi-inbox text-lg"></i>
        </div>
        <p class="text-stone-500 font-serif text-sm font-medium">找不到符合條件的訂單</p>
      </div>

      <!-- 訂單資料卡片 -->
      <template v-else>
        <div
          v-for="order in orders"
          :key="order.orderNo"
          class="p-4 rounded-xl border border-stone-200/50 bg-white shadow-xs hover:border-[#8E9A86]/30 transition-all duration-200"
        >
          <!-- 標頭列：訂單編號與狀態 -->
          <div class="flex justify-between items-center mb-2.5">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 border border-stone-200/20">
                <i class="pi pi-file-edit text-[10px]"></i>
              </div>
              <span class="font-mono text-stone-850 font-bold text-xs tracking-tight">{{ order.orderNo }}</span>
            </div>
            <span
              class="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide uppercase shadow-2xs"
              :class="getStatusBadgeClass(order.status)"
            >
              {{ getStatusLabel(order) }}
            </span>
          </div>

          <!-- 內容區：會員與建立時間 -->
          <div class="text-xs space-y-1 text-stone-500 font-serif">
            <div class="flex items-center gap-1.5">
              <span class="text-stone-400">會員編號:</span>
              <span class="font-sans font-medium text-stone-700">#{{ order.memberId }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-stone-400">建立時間:</span>
              <span class="font-sans text-stone-600">{{ formatDate(order.createdAt) }}</span>
            </div>
          </div>

          <!-- 底欄列：金額與動作按鈕 -->
          <div class="flex justify-between items-center mt-3 pt-3 border-t border-stone-100/60">
            <div class="flex flex-col">
              <span class="text-[9px] text-stone-400 font-serif uppercase leading-none">Total Amount</span>
              <span class="font-mono font-bold text-stone-850 text-xs mt-0.5">
                NT$ {{ order.totalAmount?.toLocaleString() }}
              </span>
            </div>
            <button
              @click="emit('view-detail', order.orderNo)"
              class="text-xs bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-3 py-1.5 rounded-lg font-serif font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <i class="pi pi-search text-[9px]"></i>
              <span>查看詳情</span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 表格懸停效果優化 */
tbody tr {
  transition: all 0.2s ease;
}
</style>
