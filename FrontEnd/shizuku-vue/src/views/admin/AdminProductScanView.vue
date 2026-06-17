<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import { productApi } from '@/api/Product.js'

const router = useRouter()

const scanner = ref(null)
const isScanning = ref(false)
const scannedItem = ref(null)
const errorMsg = ref('')
const quantity = ref(1)
const actionType = ref('進貨')
const note = ref('')
const isSubmitting = ref(false)
const scanHistory = ref([])

const orderTypes = ['進貨', '調整進', '調整出', '報廢']

async function startScan() {
  errorMsg.value = ''
  try {
    scanner.value = new Html5Qrcode('qrcode-reader')
    await scanner.value.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      () => {},
    )
    isScanning.value = true
  } catch (err) {
    errorMsg.value = '無法開啟相機，請確認已允許相機權限'
    console.error(err)
  }
}

async function stopScan() {
  if (scanner.value && isScanning.value) {
    await scanner.value.stop()
    isScanning.value = false
  }
}

async function onScanSuccess(decodedText) {
  await stopScan()
  errorMsg.value = ''

  try {
    // QRcode 內容是 variantId 或 skuCode
    const res = await productApi.getVariantBySkuOrId(decodedText)
    if (res.data.data) {
      scannedItem.value = res.data.data
      quantity.value = 1
      actionType.value = '進貨'
      note.value = ''
    } else {
      errorMsg.value = '找不到此商品規格，請確認 QRcode 是否正確'
    }
  } catch (err) {
    errorMsg.value = '查詢商品失敗，請再試一次'
  }
}

async function submitAction() {
  if (!scannedItem.value) return
  if (quantity.value <= 0) {
    alert('請填寫數量')
    return
  }

  isSubmitting.value = true
  try {
    await productApi.createPurchaseOrder({
      fType: actionType.value,
      fStatus: '已完成',
      fSupplier: null,
      fPaymentMethod: null,
      fTaxType: '免稅',
      fUntaxedAmount: 0,
      fTaxAmount: 0,
      fNote: note.value,
      fDetails: [
        {
          fVariantId: scannedItem.value.fVariantId,
          fQuantity: Number(quantity.value),
          fCostPrice: null,
        },
      ],
    })

    // 加入歷史紀錄
    scanHistory.value.unshift({
      name: scannedItem.value.fProductName,
      color: scannedItem.value.fColor,
      size: scannedItem.value.fSize,
      actionType: actionType.value,
      quantity: quantity.value,
      time: new Date().toLocaleTimeString('zh-TW'),
    })

    scannedItem.value = null
    alert('異動成功！')
  } catch (err) {
    alert('異動失敗，請再試一次')
  } finally {
    isSubmitting.value = false
  }
}

function rescan() {
  scannedItem.value = null
  errorMsg.value = ''
  startScan()
}

onMounted(() => startScan())
onUnmounted(() => stopScan())
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col" style="max-width: 480px; margin: 0 auto">
    <!-- Header -->
    <div
      class="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
    >
      <button
        @click="router.push({ name: 'admin-inventory', query: { tab: 'records' } })"
        class="text-gray-400 hover:text-gray-600"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="font-medium text-base flex-1">掃描入庫</h1>
      <span class="text-xs text-gray-400">用手機掃描商品 QRcode</span>
    </div>

    <!-- 掃描區 -->
    <div class="bg-black relative" style="height: 300px">
      <div id="qrcode-reader" class="w-full h-full"></div>
      <div
        v-if="!isScanning && !scannedItem"
        class="absolute inset-0 flex flex-col items-center justify-center text-white gap-3"
      >
        <i class="pi pi-camera text-4xl opacity-50"></i>
        <p class="text-sm opacity-70">相機啟動中...</p>
      </div>
      <div v-if="scannedItem" class="absolute inset-0 flex items-center justify-center bg-black/80">
        <div class="text-center text-white">
          <i class="pi pi-check-circle text-5xl text-green-400 mb-3 block"></i>
          <p class="text-sm">掃描成功</p>
        </div>
      </div>
      <p class="absolute bottom-4 left-0 right-0 text-center text-white/60 text-xs">
        將 QRcode 對準框框內掃描
      </p>
    </div>

    <!-- 錯誤訊息 -->
    <div
      v-if="errorMsg"
      class="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600"
    >
      {{ errorMsg }}
    </div>

    <!-- 掃描結果 -->
    <div v-if="scannedItem" class="mx-4 mt-4 bg-white rounded-xl border border-gray-100 p-4">
      <div class="mb-3 pb-3 border-b border-gray-100">
        <p class="font-medium text-gray-800">{{ scannedItem.fProductName }}</p>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ scannedItem.fColor }} / {{ scannedItem.fSize }}
        </p>
        <p class="text-xs font-mono text-gray-300 mt-0.5">{{ scannedItem.fSkuCode }}</p>
        <p class="text-xs text-amber-500 mt-1">目前庫存：{{ scannedItem.fStock }} 件</p>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-400 mb-1 block">異動類型</label>
          <select
            v-model="actionType"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
          >
            <option v-for="t in orderTypes" :key="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">數量</label>
          <input
            v-model="quantity"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">備註（選填）</label>
          <input
            v-model="note"
            type="text"
            placeholder="選填"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div class="flex gap-2 mt-4">
        <button
          @click="rescan"
          class="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          重新掃描
        </button>
        <button
          @click="submitAction"
          :disabled="isSubmitting"
          class="flex-1 py-2.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          {{ isSubmitting ? '處理中...' : '確認異動' }}
        </button>
      </div>
    </div>

    <!-- 本次掃描歷史 -->
    <div
      v-if="scanHistory.length > 0"
      class="mx-4 mt-4 mb-6 bg-white rounded-xl border border-gray-100 p-4"
    >
      <h3 class="text-sm font-medium mb-3 pb-2 border-b border-gray-100">
        本次已掃描（{{ scanHistory.length }} 筆）
      </h3>
      <div
        v-for="(record, i) in scanHistory"
        :key="i"
        class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
      >
        <div class="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-700 truncate">
            {{ record.name }} {{ record.color }}/{{ record.size }}
          </p>
          <p class="text-xs text-gray-400">{{ record.actionType }} {{ record.quantity }} 件</p>
        </div>
        <span class="text-xs text-gray-300 shrink-0">{{ record.time }}</span>
      </div>
    </div>
  </div>
</template>
