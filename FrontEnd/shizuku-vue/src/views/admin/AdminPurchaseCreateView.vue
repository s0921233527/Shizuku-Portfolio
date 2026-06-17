<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/Product.js'

const router = useRouter()

const inventory = ref([])
const isLoading = ref(true)

const purchaseForm = ref({
  fSupplier: '台灣成衣有限公司',
  fPaymentMethod: '月結30天',
  fType: '進貨',
  fStatus: '已完成',
  fInvoiceNo: '',
  fInvoiceDate: '',
  fTaxType: '應稅',
  fNote: '',
})

const suppliers = ref([
  '台灣成衣有限公司',
  '日系服飾批發商',
  '韓國流行服飾',
  '歐美品牌代理商',
  '其他',
])

const paymentMethods = ['月結30天', '月結60天', '月結90天', '貨到付款', '預付款', '現金']
const orderTypes = ['進貨', '銷售退回', '調整進', '調整出', '進貨退出', '報廢']
const statusTypes = ['已完成', '未處理']
const untaxedAmount = computed(() => cartTotalAmount.value)
const taxTypes = ['應稅', '免稅']
const taxAmount = computed(() =>
  purchaseForm.value.fTaxType === '應稅' ? Math.round(untaxedAmount.value * 0.05) : 0,
)
const totalWithTax = computed(() => untaxedAmount.value + taxAmount.value)

const purchaseSearch = ref('')
const cartItems = ref({})

const searchResults = computed(() => {
  const results = []
  const kw = purchaseSearch.value.toLowerCase() // ← 轉小寫

  inventory.value.forEach((p) => {
    console.log('fProduct:', p.fProduct)
    ;(p.fVariants ?? []).forEach((v) => {
      const match =
        !kw || p.fProductName?.toLowerCase().includes(kw) || p.fProduct?.toLowerCase().includes(kw) // ← 加貨號搜尋
      if (match) results.push({ product: p, variant: v })
    })
  })
  return results
})

function isInCart(variantId) {
  return !!cartItems.value[variantId]
}

const isAllChecked = computed(
  () =>
    searchResults.value.length > 0 &&
    searchResults.value.every((item) => isInCart(item.variant.fVariantId)),
)

function toggleVariant(item) {
  const id = item.variant.fVariantId
  if (cartItems.value[id]) {
    delete cartItems.value[id]
  } else {
    cartItems.value[id] = {
      fQuantity: 1,
      fCostPrice: null,
      fProductName: item.product.fProductName,
      fProduct: item.product.fProduct, // ← 加這行
      fColor: item.variant.fColor,
      fSize: item.variant.fSize,
      fStock: item.variant.fStock,
    }
  }
}

function toggleAll(checked) {
  if (checked) {
    searchResults.value.forEach((item) => {
      const id = item.variant.fVariantId
      if (!cartItems.value[id]) {
        cartItems.value[id] = {
          fQuantity: 1,
          fCostPrice: null,
          fProductName: item.product.fProductName,
          fProduct: item.product.fProduct,
          fColor: item.variant.fColor,
          fSize: item.variant.fSize,
          fStock: item.variant.fStock,
        }
      }
    })
  } else {
    searchResults.value.forEach((item) => {
      delete cartItems.value[item.variant.fVariantId]
    })
  }
}

function removeFromCart(variantId) {
  delete cartItems.value[variantId]
}

const cartList = computed(() =>
  Object.entries(cartItems.value).map(([id, item]) => ({
    fVariantId: Number(id),
    ...item,
  })),
)

const cartCount = computed(() => cartList.value.length)
const cartTotalQty = computed(() =>
  cartList.value.reduce((a, v) => a + (Number(v.fQuantity) || 0), 0),
)
const cartTotalAmount = computed(() =>
  cartList.value.reduce((a, v) => a + (Number(v.fQuantity) || 0) * (Number(v.fCostPrice) || 0), 0),
)

function subTotal(item) {
  return (Number(item.fQuantity) || 0) * (Number(item.fCostPrice) || 0)
}

async function submit() {
  if (cartCount.value === 0) {
    alert('請至少勾選一筆商品')
    return
  }
  const details = cartList.value.map((v) => ({
    fVariantId: v.fVariantId,
    fQuantity: Number(v.fQuantity) || 0,
    fCostPrice: v.fCostPrice ? Number(v.fCostPrice) : null,
  }))
  // ▶【改動 1】宣告動態業務名稱，擺脫寫死的「進貨」字眼
  const actionName = purchaseForm.value.fType || '進貨'

  // ▶【改動 2】新增報廢防呆機制：若選報廢，備註（原因）未填則攔截並警告
  if (actionName === '報廢' && !purchaseForm.value.fNote?.trim()) {
    alert('商品報廢時，請務必在「備註」欄位輸入報廢原因！')
    return
  }
  // ▶【改動 3】修改數量防呆字眼：將「進貨數量」改為動態的「${actionName}數量」
  if (details.some((d) => d.fQuantity <= 0)) {
    alert(`請填寫所有勾選商品的${actionName}數量`)
    return
  }

  // ▶【改動 4】新增彈窗文字過濾：當類型為「報廢」時，自動隱藏廠商資訊那一行
  const supplierInfo =
    actionName === '報廢' || actionName === '銷售退回'
      ? ''
      : `廠商：${purchaseForm.value.fSupplier || '無'}\n`

  // ▶【改動 5】修改 confirm 彈窗：主標題與內文資訊全部改為變數動態帶入
  const confirmed = confirm(
    `確認${actionName}？\n\n` +
      supplierInfo +
      `共 ${cartCount.value} 筆商品，總數量 ${cartTotalQty.value} 件\n` +
      `合計金額：NT$${cartTotalAmount.value.toLocaleString()}\n\n` +
      `確認後庫存將自動更新，無法撤銷。`,
  )
  if (!confirmed) return

  try {
    await productApi.createPurchaseOrder({
      fSupplier: purchaseForm.value.fSupplier,
      fPaymentMethod: purchaseForm.value.fPaymentMethod,
      fType: purchaseForm.value.fType,
      fStatus: purchaseForm.value.fStatus,
      fInvoiceNo: purchaseForm.value.fInvoiceNo || null,
      fInvoiceDate: purchaseForm.value.fInvoiceDate || null,
      fTaxType: purchaseForm.value.fTaxType,
      fUntaxedAmount: untaxedAmount.value,
      fTaxAmount: taxAmount.value,
      fNote: purchaseForm.value.fNote,
      fDetails: details,
    })
    router.push({ name: 'admin-inventory', query: { tab: 'records' } })
  } catch (err) {
    console.error(`${actionName}失敗`, err)
    alert(`${actionName}失敗，請再試一次`)
  }
}

onMounted(async () => {
  try {
    const res = await productApi.getInventory()
    inventory.value = res.data.data ?? []
  } finally {
    isLoading.value = false
  }
})
</script>
<template>
  <div class="p-6 flex flex-col" style="height: calc(130vh - 40px)">
    <!-- 標題列 -->
    <div class="flex items-center gap-3 mb-4 shrink-0">
      <button
        @click="router.push({ name: 'admin-inventory', query: { tab: 'records' } })"
        class="text-gray-400 hover:text-gray-600"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-xl font-medium">新增庫存異動單</h1>
      <span class="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
        單號自動生成
      </span>
    </div>

    <!-- 廠商資訊 -->
    <div
      class="grid grid-cols-5 gap-3 p-4 bg-white rounded-xl border border-gray-100 mb-4 shrink-0"
    >
      <div>
        <label class="text-xs text-gray-400 mb-1 block">異動類型</label>
        <select
          v-model="purchaseForm.fType"
          class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
        >
          <option v-for="t in orderTypes" :key="t">{{ t }}</option>
        </select>
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">廠商</label>
        <select
          v-model="purchaseForm.fSupplier"
          :disabled="['報廢', '銷售退回', '調整進', '調整出'].includes(purchaseForm.fType)"
          class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          >

          <option v-for="supplier in suppliers" :key="supplier">{{ supplier }}</option>
        </select>
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">付款方式</label>
        <select
          v-model="purchaseForm.fPaymentMethod"
          :disabled="['報廢', '銷售退回', '調整進', '調整出'].includes(purchaseForm.fType)"
          class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option v-for="m in paymentMethods" :key="m">{{ m }}</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-gray-400 mb-1 block">課稅別</label>
        <select
          v-model="purchaseForm.fTaxType"
          :disabled="['報廢', '銷售退回', '調整進', '調整出'].includes(purchaseForm.fType)"
          class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option v-for="t in taxTypes" :key="t">{{ t }}</option>
        </select>
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">發票號碼</label>
        <input
          v-model="purchaseForm.fInvoiceNo"
          type="text"
          :disabled="
            purchaseForm.fType === '報廢' ||
            purchaseForm.fType === '調整進' ||
            purchaseForm.fType === '調整出'
          "
          :placeholder="
            purchaseForm.fType === '報廢' ||
            purchaseForm.fType === '調整進' ||
            purchaseForm.fType === '調整出'
              ? '無須填寫'
              : purchaseForm.fType === '銷售退回'
                ? '請輸入原消費發票號碼'
                : purchaseForm.fType === '進貨退出'
                  ? '請輸入折讓單號或原進貨發票'
                  : '選填（一般進貨）'
          "
          class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>
      <div>
        <label class="text-xs text-gray-400 mb-1 block">發票日期</label>
        <input
          v-model="purchaseForm.fInvoiceDate"
          :disabled="
            purchaseForm.fType === '報廢' ||
            purchaseForm.fType === '調整進' ||
            purchaseForm.fType === '調整出'
          "
          :placeholder="
            ['報廢', '調整進', '調整出'].includes(purchaseForm.fType) ? '無須填寫' : '選填'
          "
          type="date"
          class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>
      <div class="col-span-3">
        <label class="text-xs text-gray-400 mb-1 block">備註</label>
        <input
          v-model="purchaseForm.fNote"
          type="text"
          :placeholder="
            purchaseForm.fType === '報廢' ? '請務必輸入報廢原因（例如：沾染污漬/樣品銷毀）' : '選填'
          "
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 placeholder-gray-400"
        />
      </div>
      <div>
        <label class="text-xs text-gray-400 mb-1 block">狀態</label>
        <select
          v-model="purchaseForm.fStatus"
          class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
        >
          <option v-for="s in statusTypes" :key="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <!-- 左右分欄 + 底部合計 -->
    <div class="flex flex-col flex-1 overflow-hidden gap-4">
      <!-- 左右分欄 -->
      <div class="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
        <!-- 左側：商品挑選 -->
        <div
          class="col-span-5 bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0"
          >
            <span class="text-sm font-medium">商品挑選</span>
            <span class="text-xs text-gray-400">點擊列加入右側</span>
          </div>
          <div class="px-4 py-2 border-b border-gray-100 shrink-0">
            <input
              v-model="purchaseSearch"
              type="text"
              placeholder="搜尋商品名稱或貨號..."
              class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div class="overflow-y-auto flex-1">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-3 py-2 border-b border-gray-100 w-8">
                    <input
                      type="checkbox"
                      :checked="isAllChecked"
                      @change="(e) => toggleAll(e.target.checked)"
                      aria-label="全選"
                    />
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100"
                  >
                    商品規格
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100"
                  >
                    貨號
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100 w-16"
                  >
                    庫存
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in searchResults"
                  :key="item.variant.fVariantId"
                  :class="[
                    'border-b border-gray-50 last:border-0 cursor-pointer',
                    isInCart(item.variant.fVariantId) ? 'bg-indigo-50/50' : 'hover:bg-gray-50',
                  ]"
                  @click="toggleVariant(item)"
                >
                  <td class="px-3 py-2.5" @click.stop>
                    <input
                      type="checkbox"
                      :checked="isInCart(item.variant.fVariantId)"
                      @change="toggleVariant(item)"
                      aria-label="勾選商品"
                    />
                  </td>
                  <td class="px-3 py-2.5">
                    <p class="font-medium text-gray-700">{{ item.product.fProductName }}</p>
                    <p class="text-gray-400 mt-0.5">
                      {{ item.variant.fColor }} / {{ item.variant.fSize }}
                    </p>
                    <p class="text-gray-300 mt-0.5 font-mono text-xs">
                      {{ item.product.fProduct }}
                    </p>
                  </td>
                  <td
                    class="px-3 py-2.5 font-medium"
                    :class="
                      item.variant.fStock === 0
                        ? 'text-red-400'
                        : item.variant.fStock <= 5
                          ? 'text-amber-500'
                          : 'text-gray-500'
                    "
                  >
                    {{ item.variant.fStock }}
                  </td>
                </tr>
                <!-- 搜尋結果為空時顯示 -->
                <tr v-if="searchResults.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center">
                    <p class="text-gray-400 text-sm mb-3">查無符合商品</p>
                    <p class="text-gray-300 text-xs mb-4">請先至商品管理建立商品後再進行庫存異動</p>
                    <button
                      @click="router.push({ name: 'admin-products-create' })"
                      class="px-4 py-2 text-sm border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      前往新增商品
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 右側：已選商品 -->
        <div
          class="col-span-7 bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0"
          >
            <span class="text-sm font-medium">已選商品</span>
            <span class="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              {{ cartCount }} 筆
            </span>
          </div>
          <div class="overflow-y-auto flex-1">
            <div
              v-if="cartCount === 0"
              class="flex items-center justify-center h-full text-gray-300 text-sm"
            >
              請從左側勾選商品
            </div>
            <table v-else class="w-full text-xs">
              <thead class="sticky top-0">
                <tr class="bg-gray-50">
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100"
                  >
                    品名
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100"
                  >
                    品號
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100"
                  >
                    顏色/尺寸
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100 w-14"
                  >
                    數量
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100 w-20"
                  >
                    成本(NT$)
                  </th>
                  <th
                    class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100 w-20"
                  >
                    小計
                  </th>
                  <th class="px-3 py-2 border-b border-gray-100 w-6"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in cartList"
                  :key="item.fVariantId"
                  class="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <td class="px-3 py-2.5">
                    <p class="font-medium text-gray-700">{{ item.fProductName }}</p>
                    <p class="text-gray-300 text-xs mt-0.5">目前庫存：{{ item.fStock }} 件</p>
                  </td>
                  <td class="px-3 py-2.5 font-mono text-gray-400 text-xs">{{ item.fProduct }}</td>
                  <td class="px-3 py-2.5 text-gray-500">{{ item.fColor }} / {{ item.fSize }}</td>
                  <td class="px-3 py-2.5">
                    <input
                      v-model="cartItems[item.fVariantId].fQuantity"
                      type="number"
                      min="1"
                      class="w-14 px-2 py-1 border border-gray-200 rounded text-center focus:outline-none focus:border-indigo-400"
                    />
                  </td>
                  <td class="px-3 py-2.5">
                    <input
                      v-model="cartItems[item.fVariantId].fCostPrice"
                      :disabled="
                        ['報廢', '銷售退回', '調整進', '調整出'].includes(purchaseForm.fType)
                      "
                      type="number"
                      min="0"
                      :placeholder="
                        ['報廢', '銷售退回', '調整進', '調整出'].includes(purchaseForm.fType)
                          ? '無須填寫'
                          : '輸入成本價'
                      "
                      class="w-20 px-2 py-1 border border-gray-200 rounded text-right focus:outline-none focus:border-indigo-400"
                    />
                  </td>
                  <td class="px-3 py-2.5 font-medium text-indigo-600 whitespace-nowrap">
                    NT${{ subTotal(cartItems[item.fVariantId]).toLocaleString() }}
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <button
                      @click="removeFromCart(item.fVariantId)"
                      class="text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="移除"
                    >
                      <i class="pi pi-times" style="font-size: 11px"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 底部合計（獨立一行在最下方）-->
      <div class="bg-white rounded-xl border border-gray-100 p-4 shrink-0">
        <div class="flex items-center justify-end">
          <div class="flex gap-6 text-xs text-gray-500">
            <span
              >已選：<strong class="text-gray-700">{{ cartCount }} 筆</strong></span
            >
            <span
              >總數量：<strong class="text-gray-700">{{ cartTotalQty }} 件</strong></span
            >

            <!-- 只有進貨/銷售退回/進貨退出才顯示稅額 -->
            <template v-if="!['報廢', '調整進', '調整出'].includes(purchaseForm.fType)">
              <span
                >未稅金額：<strong class="text-gray-700"
                  >NT${{ untaxedAmount.toLocaleString() }}</strong
                ></span
              >
              <span
                >稅額（{{ purchaseForm.fTaxType === '應稅' ? '5%' : '免稅' }}）：
                <strong class="text-gray-700">NT${{ taxAmount.toLocaleString() }}</strong>
              </span>
              <span
                >含稅總計：<strong class="text-indigo-600 text-sm"
                  >NT${{ totalWithTax.toLocaleString() }}</strong
                ></span
              >
            </template>
          </div>
          <div class="flex gap-2 shrink-0 ml-6">
            <button
              @click="router.push({ name: 'admin-inventory', query: { tab: 'records' } })"
              class="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              @click="submit"
              class="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              確認{{ purchaseForm.fType || '進貨' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
