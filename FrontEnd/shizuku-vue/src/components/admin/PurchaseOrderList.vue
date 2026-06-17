<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/Product.js'

const router = useRouter()

const props = defineProps({
  purchaseOrders: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['refresh'])

const showDetailModal = ref(false)
const currentOrder = ref(null)

// 分頁
const currentPage = ref(1)
const pageSize = 15
const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))
const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

const keyword = ref('')
const filteredOrders = computed(() => {
  if (!keyword.value) return props.purchaseOrders
  const kw = keyword.value.toLowerCase()
  return props.purchaseOrders.filter(
    (o) =>
      o.fOrderNo?.toLowerCase().includes(kw) ||
      o.fSupplier?.toLowerCase().includes(kw) ||
      o.fType?.toLowerCase().includes(kw),
  )
})

const showEditModal = ref(false)
const editingOrder = ref(null)
const editingStatus = ref('已完成')

function editOrder(order) {
  editingOrder.value = order
  editingStatus.value = order.fStatus
  showEditModal.value = true
}

async function saveEditOrder() {
  try {
    await productApi.updatePurchaseOrderStatus(editingOrder.value.fId, editingStatus.value)
    showEditModal.value = false
    emit('refresh')
  } catch (err) {
    alert('更新失敗，請再試一次')
  }
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const noSupplierTypes = ['報廢', '銷售退回', '調整進', '調整出', '進貨退出']

async function viewOrder(id) {
  const res = await productApi.getPurchaseOrder(id)
  currentOrder.value = res.data.data
  showDetailModal.value = true
}

function getTypeClass(type) {
  switch (type) {
    case '進貨':
      return 'bg-green-50 text-green-700 border border-green-100'
    case '銷售退回':
      return 'bg-green-50 text-green-600 border border-green-100'
    case '調整進':
      return 'bg-green-50 text-green-600 border border-green-100'
    case '調整出':
      return 'bg-red-50 text-red-600 border border-red-100'
    case '進貨退出':
      return 'bg-red-50 text-red-600 border border-red-100'
    case '報廢':
      return 'bg-red-50 text-red-700 border border-red-100'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

function getQuantityPrefix(type) {
  if (['進貨', '銷售退回', '調整進'].includes(type)) return '+'
  return '-'
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 p-5">
    <div class="flex items-center gap-6 mb-4 pb-3 border-b border-gray-100">
      <!-- 左側標題 -->
      <h3 class="text-sm font-medium">庫存異動紀錄</h3>

      <!-- 中間搜尋框 -->
      <div class="relative w-full max-w-xs">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜尋單號、廠商、異動類型..."
          class="w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400"
        />
        <button
          v-if="keyword"
          @click="keyword = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
        >
          <i class="pi pi-times" style="font-size: 10px"></i>
        </button>
      </div>

      <!-- 右側按鈕 -->
      <button
        @click="router.push({ name: 'admin-inventory-create' })"
        class="ml-auto flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
      >
        <i class="pi pi-plus" style="font-size: 11px"></i>
        新增異動單
      </button>
    </div>

    <table class="w-full text-xs">
      <thead>
        <tr class="bg-gray-50">
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            狀態
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            異動單號
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            廠商
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            日期
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            商品筆數
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            總數量
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            總金額
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            異動類型
          </th>
          <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
            付款方式
          </th>
          <th class="px-3 py-2 border-b border-gray-100" style="width: 80px"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="pagedOrders.length === 0">
          <td colspan="10" class="text-center text-gray-300 py-8">尚無異動紀錄</td>
        </tr>
        <tr
          v-for="order in pagedOrders"
          :key="order.fId"
          class="border-b border-gray-50 last:border-0 hover:bg-gray-50"
        >
          <td class="px-3 py-3">
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                order.fStatus === '已完成'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-600',
              ]"
            >
              {{ order.fStatus }}
            </span>
          </td>
          <td class="px-3 py-3 font-mono font-medium text-indigo-600">{{ order.fOrderNo }}</td>
          <td class="px-3 py-3 text-gray-500">{{ order.fSupplier || '—' }}</td>
          <td class="px-3 py-3 text-gray-400">
            {{ new Date(order.fCreatedAt).toLocaleDateString('zh-TW') }}
          </td>
          <td class="px-3 py-3">{{ order.fItemCount }} 筆</td>
          <td class="px-3 py-3">{{ order.fTotalQuantity }} 件</td>
          <td class="px-3 py-3 font-medium">NT${{ order.fTotalAmount.toLocaleString() }}</td>
          <td class="px-3 py-3">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="getTypeClass(order.fType)"
            >
              {{ order.fType }}
            </span>
          </td>
          <td class="px-3 py-3 text-gray-400">
            {{ noSupplierTypes.includes(order.fType) ? '—' : order.fPaymentMethod || '—' }}
          </td>
          <!-- ✅ 查看 + 編輯 兩個按鈕 -->
          <td class="px-3 py-3">
            <div class="flex items-center gap-2">
              <button
                @click="viewOrder(order.fId)"
                class="text-xs text-indigo-500 hover:text-indigo-700"
              >
                查看
              </button>
              <button @click="editOrder(order)" class="text-xs text-gray-400 hover:text-gray-600">
                編輯
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分頁控制 -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100"
    >
      <span class="text-xs text-gray-400">
        共 {{ purchaseOrders.length }} 筆，第 {{ currentPage }} / {{ totalPages }} 頁
      </span>
      <div class="flex items-center gap-1">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <i class="pi pi-chevron-left" style="font-size: 10px"></i>
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="px-2.5 py-1 text-xs rounded border transition-colors"
          :class="
            page === currentPage
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          "
        >
          {{ page }}
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <i class="pi pi-chevron-right" style="font-size: 10px"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- 詳細 Modal -->
  <div
    v-if="showDetailModal"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    @click.self="showDetailModal = false"
  >
    <div
      class="bg-white rounded-xl w-full mx-4 flex flex-col"
      style="max-width: 900px; max-height: 90vh"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div class="flex items-center gap-3">
          <span class="font-medium font-mono text-indigo-600 text-base">
            {{ currentOrder?.fOrderNo }}
          </span>
          <span
            class="px-2 py-0.5 rounded-full text-xs font-medium"
            :class="getTypeClass(currentOrder?.fType)"
          >
            {{ currentOrder?.fType }}
          </span>
          <span class="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            {{ currentOrder?.fStatus }}
          </span>
        </div>
        <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- 進貨單資訊 -->
      <div
        class="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 shrink-0 text-xs"
      >
        <template v-if="!noSupplierTypes.includes(currentOrder?.fType)">
          <div>
            <p class="text-gray-400 mb-0.5">廠商</p>
            <p class="font-medium text-gray-700">{{ currentOrder?.fSupplier || '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 mb-0.5">付款方式</p>
            <p class="font-medium text-gray-700">{{ currentOrder?.fPaymentMethod || '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 mb-0.5">課稅別</p>
            <p class="font-medium text-gray-700">{{ currentOrder?.fTaxType || '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 mb-0.5">發票號碼</p>
            <p class="font-medium text-gray-700">{{ currentOrder?.fInvoiceNo || '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 mb-0.5">發票日期</p>
            <p class="font-medium text-gray-700">
              {{
                currentOrder?.fInvoiceDate
                  ? new Date(currentOrder.fInvoiceDate).toLocaleDateString('zh-TW')
                  : '—'
              }}
            </p>
          </div>
        </template>
        <div>
          <p class="text-gray-400 mb-0.5">建立日期</p>
          <p class="font-medium text-gray-700">
            {{ currentOrder ? new Date(currentOrder.fCreatedAt).toLocaleDateString('zh-TW') : '' }}
          </p>
        </div>
        <div class="col-span-2">
          <p class="text-gray-400 mb-0.5">備註</p>
          <p class="font-medium text-gray-700">{{ currentOrder?.fNote || '—' }}</p>
        </div>
      </div>

      <!-- 明細表格 -->
      <div class="overflow-y-auto flex-1 px-6 py-4">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
                商品規格
              </th>
              <th
                class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100 w-20"
              >
                異動數量
              </th>
              <th
                class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100 w-24"
              >
                成本價
              </th>
              <th
                class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100 w-24"
              >
                小計
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="detail in currentOrder?.fDetails"
              :key="detail.fId"
              class="border-b border-gray-50 last:border-0"
            >
              <td class="px-3 py-3">
                <p class="font-medium text-gray-700">{{ detail.fProductName }}</p>
                <p class="text-xs font-mono text-slate-400 mt-0.5">{{ detail.fSkuCode }}</p>
                <p class="text-gray-400 mt-0.5">{{ detail.fColor }} / {{ detail.fSize }}</p>
              </td>
              <td class="px-3 py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full font-medium text-xs',
                    ['進貨', '銷售退回', '調整進'].includes(currentOrder?.fType)
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500',
                  ]"
                >
                  {{ ['進貨', '銷售退回', '調整進'].includes(currentOrder?.fType) ? '+' : '-'
                  }}{{ detail.fQuantity }}
                </span>
              </td>
              <td class="px-3 py-3 text-gray-400">
                {{ detail.fCostPrice ? `NT$${detail.fCostPrice.toLocaleString()}` : '—' }}
              </td>
              <td class="px-3 py-3 font-medium">
                {{ detail.fAmount ? `NT$${detail.fAmount.toLocaleString()}` : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 底部合計 -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
        <div class="flex justify-between items-end">
          <div class="text-xs text-gray-500">
            <template v-if="!noSupplierTypes.includes(currentOrder?.fType)">
              總數量：<strong class="text-gray-700">{{ currentOrder?.fTotalQuantity }} 件</strong>
            </template>
          </div>
          <div class="text-right space-y-1 text-xs text-gray-500">
            <template v-if="!noSupplierTypes.includes(currentOrder?.fType)">
              <div class="flex justify-between gap-16">
                <span>未稅金額</span>
                <span class="text-gray-700"
                  >NT${{ currentOrder?.fUntaxedAmount?.toLocaleString() }}</span
                >
              </div>
              <div class="flex justify-between gap-16">
                <span>稅額（{{ currentOrder?.fTaxType === '應稅' ? '5%' : '免稅' }}）</span>
                <span class="text-gray-700"
                  >NT${{ currentOrder?.fTaxAmount?.toLocaleString() }}</span
                >
              </div>
              <div class="flex justify-between gap-16 border-t border-gray-200 pt-1">
                <span class="font-medium text-gray-700">含稅總計</span>
                <strong class="text-indigo-600 text-sm"
                  >NT${{ currentOrder?.fTotalAmount?.toLocaleString() }}</strong
                >
              </div>
            </template>
            <template v-else>
              總數量：<strong class="text-gray-700">{{ currentOrder?.fTotalQuantity }} 件</strong>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 編輯狀態 Modal -->
  <div
    v-if="showEditModal"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    @click.self="showEditModal = false"
  >
    <div class="bg-white rounded-xl w-full mx-4 max-w-sm">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="font-medium">編輯異動單狀態</h3>
        <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <!-- Body -->
      <div class="px-6 py-4 space-y-3">
        <div>
          <p class="text-xs text-gray-400 mb-1">異動單號</p>
          <p class="text-sm font-mono text-indigo-600">{{ editingOrder?.fOrderNo }}</p>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">狀態</label>
          <select
            v-model="editingStatus"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
          >
            <option value="已完成">已完成</option>
            <option value="未處理">未處理</option>
          </select>
        </div>
        <p class="text-xs text-amber-500" v-if="editingStatus === '已完成'">
          ⚠️ 改為已完成後，庫存將自動更新
        </p>
      </div>
      <!-- Footer -->
      <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
        <button
          @click="showEditModal = false"
          class="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
        <button
          @click="saveEditOrder"
          class="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          儲存
        </button>
      </div>
    </div>
  </div>
</template>
