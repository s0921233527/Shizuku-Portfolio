<script setup>
import { ref, computed, watch } from 'vue'
import { productApi } from '@/api/Product.js'
import QRCode from 'qrcode'

const showRecordModal = ref(false)
const currentVariant = ref(null)
const variantRecords = ref([])
const isLoadingRecords = ref(false)

const props = defineProps({
  inventory: { type: Array, default: () => [] },
})

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
const baseUrl = apiBase.replace(/\/api$/, '')
const defaultImg = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800'

const keyword = ref('')
const selectedStatus = ref('')
const expandedIds = ref(new Set())
const currentPage = ref(1)
const pageSize = ref(10)

const showQRCodeId = ref(null)
const qrCodeUrl = ref('')

async function toggleQRCode(variant) {
  if (showQRCodeId.value === variant.fVariantId) {
    showQRCodeId.value = null
    qrCodeUrl.value = ''
    return
  }
  try {
    qrCodeUrl.value = await QRCode.toDataURL(variant.fSkuCode, { width: 150, margin: 1 })
    showQRCodeId.value = variant.fVariantId
  } catch (err) {
    console.error('QRcode 生成失敗', err)
  }
}

watch(
  () => props.inventory,
  () => {},
  { immediate: true },
)

async function viewVariantRecords(variantId) {
  isLoadingRecords.value = true
  showRecordModal.value = true
  currentVariant.value = variantId
  try {
    const res = await productApi.getStockRecords(variantId)
    variantRecords.value = res.data.data ?? []
  } catch (err) {
    console.error('載入紀錄失敗', err)
  } finally {
    isLoadingRecords.value = false
  }
}

const filteredInventory = computed(() => {
  let result = props.inventory
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.fProductName?.toLowerCase().includes(kw) ||
        p.fProduct?.toLowerCase().includes(kw) ||
        p.fVariants?.some((v) => v.fSkuCode?.toLowerCase().includes(kw)),
    )
  }
  if (selectedStatus.value) {
    result = result.filter((p) => p.fVariants?.some((v) => v.fStockStatus === selectedStatus.value))
  }
  return result
})

const totalCount = computed(() => filteredInventory.value.length)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const pagedInventory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredInventory.value.slice(start, start + pageSize.value)
})

function closeQRCode() {
  showQRCodeId.value = null
  qrCodeUrl.value = ''
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(pageSize, () => {
  currentPage.value = 1
})
watch(keyword, () => {
  currentPage.value = 1
})

function toggleExpand(id) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

function stockStatusClass(status) {
  if (status === '售完') return 'bg-red-50 text-red-500'
  if (status === '低庫存') return 'bg-amber-50 text-amber-500'
  return 'bg-green-50 text-green-600'
}

const totalRow = computed(() => {
  const allVariants = props.inventory.flatMap((p) => p.fVariants ?? [])
  return {
    fPurchaseQty: allVariants.reduce((a, v) => a + (v.fPurchaseQty ?? 0), 0),
    fSalesQty: allVariants.reduce((a, v) => a + (v.fSalesQty ?? 0), 0),
    fReturnQty: allVariants.reduce((a, v) => a + (v.fReturnQty ?? 0), 0),
    fPurchaseReturnQty: allVariants.reduce((a, v) => a + (v.fPurchaseReturnQty ?? 0), 0),
    fAdjustInQty: allVariants.reduce((a, v) => a + (v.fAdjustInQty ?? 0), 0), // ← 補上
    fAdjustOutQty: allVariants.reduce((a, v) => a + (v.fAdjustOutQty ?? 0), 0), // ← 補上
    fScrapQty: allVariants.reduce((a, v) => a + (v.fScrapQty ?? 0), 0),
    fStock: props.inventory.reduce((a, p) => a + (p.fTotalStock ?? 0), 0),
  }
})
</script>

<template>
  <div @click="closeQRCode">
    <div class="bg-white rounded-xl border border-gray-100 p-4">
      <!-- 標題列 -->
      <div class="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <div>
          <h3 class="text-lg font-medium text-gray-800">商品進銷存報表</h3>
          <p class="text-xs text-gray-400 mt-0.5">共 {{ totalCount }} 筆商品</p>
        </div>
      </div>

      <!-- 搜尋列 -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="relative">
          <i
            class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          ></i>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜尋商品名稱、貨號、SKU..."
            class="w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
          />
          <button
            v-if="keyword"
            @click="keyword = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <i class="pi pi-times" style="font-size: 11px"></i>
          </button>
        </div>
        <div class="relative">
          <i class="pi pi-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <select
            v-model="selectedStatus"
            class="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">全部狀態</option>
            <option value="正常">正常</option>
            <option value="低庫存">低庫存</option>
            <option value="售完">售完</option>
          </select>
        </div>
      </div>

      <!-- 表格 -->
      <div class="overflow-x-auto overflow-y-auto" style="max-height: calc(100vh - 150px)">
        <table class="w-full" style="table-layout: fixed; min-width: 960px">
          <colgroup>
            <col style="width: 28px" />
            <col style="width: 40px" />
            <col style="width: 200px" />
            <col style="width: 65px" />
            <col style="width: 65px" />
            <col style="width: 75px" />
            <col style="width: 75px" />
            <col style="width: 65px" />
            <col style="width: 65px" />
            <col style="width: 75px" />
            <col style="width: 65px" />
          </colgroup>
          <thead class="text-sm sticky top-0 z-10">
            <tr class="bg-gray-100 border-b-2 border-gray-200">
              <th class="px-2 py-3"></th>
              <th class="px-2 py-3 text-center text-gray-700 font-bold">No.</th>
              <th class="px-3 py-3 text-left text-gray-700 font-bold">商品</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">進貨</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">銷量</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">銷售退回</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">進貨退出</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">調整庫存</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">報廢</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">當前存貨</th>
              <th class="px-3 py-3 text-center text-gray-700 font-bold">異動紀錄</th>
            </tr>
          </thead>
          <tbody>
            <!-- 合計列 -->
            <tr class="border-b-2 border-gray-200 bg-gray-50">
              <td colspan="3" class="px-3 py-3 text-gray-800 font-bold text-sm">全部商品</td>
              <td class="px-3 py-3 text-center font-bold text-sm text-green-700">
                {{ totalRow.fPurchaseQty }}
              </td>
              <td class="px-3 py-3 text-center font-bold text-sm text-red-500">
                {{ totalRow.fSalesQty }}
              </td>
              <td class="px-3 py-3 text-center font-bold text-sm text-gray-600">
                {{ totalRow.fReturnQty }}
              </td>
              <td class="px-3 py-3 text-center font-bold text-sm text-gray-600">
                {{ totalRow.fPurchaseReturnQty }}
              </td>
              <td class="px-3 py-3 text-center font-bold text-sm">
                <span
                  :class="
                    totalRow.fAdjustInQty - totalRow.fAdjustOutQty >= 0
                      ? 'text-green-600'
                      : 'text-red-500'
                  "
                >
                  {{ totalRow.fAdjustInQty - totalRow.fAdjustOutQty > 0 ? '+' : ''
                  }}{{ totalRow.fAdjustInQty - totalRow.fAdjustOutQty }}
                </span>
              </td>
              <td class="px-3 py-3 text-center font-bold text-sm text-gray-600">
                {{ totalRow.fScrapQty }}
              </td>
              <td class="px-3 py-3 text-center font-bold text-sm text-gray-700">
                {{ totalRow.fStock }}
              </td>
              <td></td>
            </tr>

            <template v-for="(product, index) in pagedInventory" :key="product.fProductId">
              <!-- 商品主列 -->
              <tr
                class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer bg-white"
                @click="toggleExpand(product.fProductId)"
              >
                <td class="px-2 py-3 text-gray-400">
                  <i
                    :class="
                      expandedIds.has(product.fProductId)
                        ? 'pi pi-chevron-down'
                        : 'pi pi-chevron-right'
                    "
                    style="font-size: 10px"
                  ></i>
                </td>
                <td class="px-2 py-3 text-center text-gray-700 text-sm">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </td>
                <td class="px-3 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      :src="
                        product.fImage
                          ? product.fImage.startsWith('http')
                            ? product.fImage
                            : baseUrl + product.fImage
                          : defaultImg
                      "
                      class="w-9 h-9 object-cover rounded-lg border border-gray-100 shrink-0"
                    />
                    <div>
                      <p class="font-semibold text-gray-800 text-sm">{{ product.fProductName }}</p>
                      <p class="text-gray-400 mt-0.5 font-mono text-[10px]">
                        {{ product.fProduct }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-3 text-center font-bold text-sm text-green-700">
                  {{ product.fVariants?.reduce((a, v) => a + (v.fPurchaseQty ?? 0), 0) }}
                </td>
                <td class="px-3 py-3 text-center font-bold text-sm text-red-500">
                  {{ product.fVariants?.reduce((a, v) => a + (v.fSalesQty ?? 0), 0) }}
                </td>
                <td class="px-3 py-3 text-center font-bold text-sm text-gray-600">
                  {{ product.fVariants?.reduce((a, v) => a + (v.fReturnQty ?? 0), 0) }}
                </td>
                <td class="px-3 py-3 text-center font-bold text-sm text-gray-600">
                  {{ product.fVariants?.reduce((a, v) => a + (v.fPurchaseReturnQty ?? 0), 0) }}
                </td>
                <td class="px-3 py-3 text-center font-bold text-sm">
                  <span
                    :class="
                      product.fVariants?.reduce(
                        (a, v) => a + (v.fAdjustInQty ?? 0) - (v.fAdjustOutQty ?? 0),
                        0,
                      ) >= 0
                        ? 'text-green-600'
                        : 'text-red-500'
                    "
                  >
                    {{
                      product.fVariants?.reduce(
                        (a, v) => a + (v.fAdjustInQty ?? 0) - (v.fAdjustOutQty ?? 0),
                        0,
                      ) > 0
                        ? '+'
                        : ''
                    }}{{
                      product.fVariants?.reduce(
                        (a, v) => a + (v.fAdjustInQty ?? 0) - (v.fAdjustOutQty ?? 0),
                        0,
                      )
                    }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center font-bold text-sm text-gray-600">
                  {{ product.fVariants?.reduce((a, v) => a + (v.fScrapQty ?? 0), 0) }}
                </td>
                <td class="px-3 py-3 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      product.fTotalStock === 0
                        ? 'bg-red-50 text-red-600'
                        : product.fTotalStock <= 5
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-green-50 text-green-600',
                    ]"
                  >
                    {{ product.fTotalStock }}
                  </span>
                </td>
                <td></td>
              </tr>

              <!-- 規格子列 -->
              <template v-if="expandedIds.has(product.fProductId)">
                <template v-for="variant in product.fVariants" :key="variant.fVariantId">
                  <tr class="border-b border-gray-100 bg-gray-50">
                    <td></td>
                    <td></td>
                    <td class="px-3 py-2">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 shrink-0"></div>
                        <div class="relative flex-1">
                          <div class="flex items-center gap-2">
                            <p class="text-gray-700 font-bold text-xs">
                              {{ variant.fColor }} / {{ variant.fSize }}
                            </p>
                            <button
                              @click.stop="toggleQRCode(variant)"
                              class="text-gray-400 hover:text-emerald-500 transition-colors"
                              title="顯示 QR Code"
                            >
                              <i class="pi pi-qrcode text-[11px]"></i>
                            </button>
                          </div>
                          <p class="text-gray-500 font-mono text-[10px] mt-0.5">
                            {{ variant.fSkuCode }}
                          </p>
                          <div
                            v-if="showQRCodeId === variant.fVariantId && qrCodeUrl"
                            @click.stop
                            class="absolute left-full top-0 ml-4 bg-white p-2.5 rounded-lg shadow-xl border border-gray-100 z-50 flex flex-col items-center gap-1"
                          >
                            <img :src="qrCodeUrl" alt="SKU QRCode" class="w-24 h-24 max-w-none" />
                            <span
                              class="text-[9px] font-mono text-gray-400 bg-gray-50 px-1 py-0.5 rounded block text-center truncate max-w-[96px]"
                            >
                              {{ variant.fSkuCode }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-2 text-center text-xs text-green-500">
                      {{ variant.fPurchaseQty ?? 0 }}
                    </td>
                    <td class="px-3 py-2 text-center text-xs text-red-500">
                      {{ variant.fSalesQty ?? 0 }}
                    </td>
                    <td class="px-3 py-2 text-center text-xs text-gray-500">
                      {{ variant.fReturnQty ?? 0 }}
                    </td>
                    <td class="px-3 py-2 text-center text-xs text-gray-500">
                      {{ variant.fPurchaseReturnQty ?? 0 }}
                    </td>
                    <td class="px-3 py-2 text-center text-xs">
                      <span
                        :class="
                          (variant.fAdjustInQty ?? 0) - (variant.fAdjustOutQty ?? 0) >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        "
                      >
                        {{
                          (variant.fAdjustInQty ?? 0) - (variant.fAdjustOutQty ?? 0) > 0 ? '+' : ''
                        }}{{ (variant.fAdjustInQty ?? 0) - (variant.fAdjustOutQty ?? 0) }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-center text-xs text-gray-500">
                      {{ variant.fScrapQty ?? 0 }}
                    </td>
                    <td class="px-3 py-2 text-center">
                      <span
                        :class="[
                          'px-2 py-0.5 rounded-full text-xs',
                          stockStatusClass(variant.fStockStatus),
                        ]"
                      >
                        {{ variant.fStock }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-center">
                      <button
                        @click.stop="viewVariantRecords(variant.fVariantId)"
                        class="text-xs text-indigo-500 hover:text-indigo-700"
                      >
                        紀錄
                      </button>
                    </td>
                  </tr>
                </template>
              </template>

              <!-- 商品間分隔 -->
              <tr class="h-2 bg-gray-100">
                <td colspan="11" class="p-0"></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分頁列 -->
      <div class="flex items-center justify-between px-3 py-3 border-t border-gray-100 mt-2">
        <span class="text-sm text-gray-400">共 {{ totalCount }} 筆，共 {{ totalPages }} 頁</span>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <i class="pi pi-chevron-left" style="font-size: 10px"></i>
          </button>
          <template v-for="page in totalPages" :key="page">
            <button
              v-if="
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              "
              @click="changePage(page)"
              :class="[
                'px-2.5 py-1 text-xs border rounded transition-colors',
                currentPage === page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
            <span
              v-else-if="page === currentPage - 2 || page === currentPage + 2"
              class="text-xs text-gray-300"
              >...</span
            >
          </template>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <i class="pi pi-chevron-right" style="font-size: 10px"></i>
          </button>
          <select
            v-model="pageSize"
            class="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-indigo-400 bg-white ml-2"
          >
            <option :value="10">10 筆/頁</option>
            <option :value="20">20 筆/頁</option>
            <option :value="50">50 筆/頁</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 規格異動紀錄 Modal -->
    <div
      v-if="showRecordModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="showRecordModal = false"
    >
      <div class="bg-white rounded-xl w-full mx-4 max-w-lg flex flex-col" style="max-height: 80vh">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 class="font-medium">庫存異動紀錄</h3>
          <button @click="showRecordModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 px-6 py-4">
          <div v-if="isLoadingRecords" class="text-center text-gray-400 py-8">載入中...</div>
          <div v-else-if="variantRecords.length === 0" class="text-center text-gray-300 py-8">
            尚無異動紀錄
          </div>
          <table v-else class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
                  日期
                </th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
                  異動類型
                </th>
                <th
                  class="px-3 py-2 text-center text-gray-500 font-medium border-b border-gray-100"
                >
                  數量
                </th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
                  備註
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in variantRecords"
                :key="record.fId"
                class="border-b border-gray-50 last:border-0"
              >
                <td class="px-3 py-3 text-gray-400">
                  {{ new Date(record.fCreatedAt).toLocaleDateString('zh-TW') }}
                </td>
                <td class="px-3 py-3">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      ['進貨', '銷售退回', '調整進'].includes(record.fType)
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500',
                    ]"
                  >
                    {{ record.fType || '進貨' }}
                  </span>
                </td>
                <td
                  class="px-3 py-3 text-center font-medium"
                  :class="
                    ['進貨', '銷售退回', '調整進'].includes(record.fType)
                      ? 'text-green-600'
                      : 'text-red-500'
                  "
                >
                  {{ ['進貨', '銷售退回', '調整進'].includes(record.fType) ? '+' : '-'
                  }}{{ record.fQuantity }}
                </td>
                <td class="px-3 py-3 text-gray-400">{{ record.fNote || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
