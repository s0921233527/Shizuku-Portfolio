<script setup>
import { ref, watch } from 'vue'
import { getPaymentTransactionLogsForAdminAPI } from '@/api/adminPayment'
import Dialog from 'primevue/dialog'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Skeleton from 'primevue/skeleton'

const props = defineProps({
  visible: Boolean,
  transaction: Object,
})

const emit = defineEmits(['update:visible'])
const logs = ref([])
const loading = ref(false)

const parseLogData = (dataStr) => {
  if (!dataStr) return null
  try {
    return JSON.parse(dataStr)
  } catch (e) {
    return dataStr
  }
}

// 翻譯字典
const translateKey = (key) => {
  const dictionary = {
    MerchantID: '商店代號',
    TradeDesc: '交易描述',
    CustomField1: '自訂欄位1',
    CustomField2: '自訂欄位2',
    CustomField3: '自訂欄位3',
    CustomField4: '自訂欄位4',
    MerchantTradeNo: '特店交易編號',
    MerchantTradeDate: '特店交易日期',
    ItemName: '商品名稱',
    ReturnURL: '付款結果通知 URL',
    OrderResultURL: '付款完成後導向 URL',
    ChoosePayment: '選擇付款方式',
    EncryptType: '加密類型',
    PaymentDate: '交易日期',
    PaymentType: '交易方式',
    TradeAmt: '交易金額',
    StoreID: '特店門市編號',
    SimulatePaid: '是否為模擬付款(0為模擬付款)',
    PaymentTypeChargeFee: '交易手續費',
    TotalAmount: '交易總金額',
    RtnCode: '回傳代碼 (1為成功)',
    RtnMsg: '回傳訊息',
    TradeDate: '交易日期',
    TradeNo: '綠界交易序號',
    amount: '交易金額',
    orderId: '訂單編號',
    returnCode: '回傳代碼 (0000為成功)',
    returnMessage: '回傳訊息',
    Success: '成功',
    transactionId: '金流商交易序號',
    CheckMacValue: '檢查碼',
    currency: '幣別',
    packages: '商品包裹明細',
    redirectUrls: '付款導向網址設定',
    id: '包裹編號',
    name: '包裹名稱',
    products: '商品品項清單',
    quantity: '購買數量',
    price: '商品單價',
    confirmUrl: '成功付款後導向網址',
    cancelUrl: '取消付款後導向網址',
    info: '金流詳細交易資訊',
    payInfo: '付款明細資訊',
    method: '付款管道',
    maskedCardNumber: '信用卡卡號 (遮罩)',
    paymentAccessToken: '付款授權 Token',
    cardBrand: '發卡組織',
    cardType: '卡片種類',
    paymentUrl: '金流支付跳轉網址',
    web: '電腦版網頁支付連結',
    app: '手機版 App 支付連結',
    refundTransactionId: '退款交易ID',
    refundTransactionDate: '退款交易日期',
    refundAmount: '退款金額',
  }
  return dictionary[key] || key
}

const translateActionType = (type) => {
  const dictionary = {
    PaymentRequest: '發送交易請求',
    Payment_Request: '發送交易請求 (手動測試)',
    CreateRequest: '向金流商建立訂單',
    ConfirmResponse: '確認扣款回應',
    CreateResponse: '金流商同步回應',
    Notification: '非同步付款通知 (Webhook)',
    ConfirmPayment: '確認扣款請求',
    RefundRequest: '退款請求',
    RefundResponse: '退款回應',
  }
  return dictionary[type] || type
}

// 監聽視窗開啟狀態
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal && props.transaction) {
      loading.value = true
      try {
        const res = await getPaymentTransactionLogsForAdminAPI(props.transaction.fId)
        if (res && res.success) {
          logs.value = res.data || []
        }
      } catch (err) {
        console.error('Fetch transaction logs failed', err)
      } finally {
        loading.value = false
      }
    }
  },
)
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :style="{ width: '70vw' }"
    :breakpoints="{ '1199px': '85vw', '575px': '95vw' }"
    class="admin-payment-log-dialog font-serif"
    :pt="{
      mask: { class: '!backdrop-blur-md bg-stone-900/40' },
      root: { class: '!bg-[#FAF8F5] border border-stone-200/50 rounded-[20px] shadow-2xl overflow-hidden' },
      header: { class: '!bg-[#FAF8F5] border-b border-stone-200/50 p-5 flex items-center justify-between' },
      content: { class: 'p-6 overflow-y-auto max-h-[75vh]' }
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#8E9A86]/10 flex items-center justify-center text-[#8E9A86]">
          <i class="pi pi-database text-sm"></i>
        </div>
        <div>
          <span class="text-sm font-semibold text-stone-850 tracking-tight">金流通訊日誌</span>
        </div>
      </div>
    </template>

    <!-- 上方基礎交易資訊區塊 -->
    <div v-if="transaction" class="mb-5 p-4 bg-stone-50/50 border border-stone-200/30 rounded-2xl flex flex-col gap-1.5 text-xs text-stone-700">
      <div>
        <span class="text-stone-400 font-sans mr-1">支付單號：</span>
        <strong class="font-mono text-stone-800 font-semibold">{{ transaction.fTransactionNo }}</strong>
      </div>
      <div>
        <span class="text-stone-400 font-sans mr-1">金流商序號：</span>
        <strong class="font-mono text-stone-850">{{ transaction.fGatewayTradeNo || '未回傳或無' }}</strong>
      </div>
    </div>

    <!-- 載入中骨架屏 -->
    <div v-if="loading" class="space-y-4 py-4 animate-pulse">
      <Skeleton height="50px" borderRadius="12px" />
      <Skeleton height="50px" borderRadius="12px" />
      <Skeleton height="50px" borderRadius="12px" />
    </div>

    <!-- 無通訊紀錄 -->
    <div v-else-if="logs.length === 0" class="py-16 text-center text-stone-400">
      <div class="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-3 border border-stone-200/20 text-stone-400">
        <i class="pi pi-inbox text-lg"></i>
      </div>
      <p class="text-stone-500 text-sm font-medium">目前尚無任何通訊通訊紀錄</p>
    </div>

    <!-- 通訊日誌詳細手風琴清單 -->
    <Accordion v-else multiple class="space-y-3 custom-log-accordion">
      <AccordionPanel v-for="(log, index) in logs" :key="index" :value="String(index)" class="border border-stone-200/40 bg-white/70 rounded-2xl overflow-hidden shadow-xs backdrop-blur-md">
        <AccordionHeader class="!bg-stone-50/20 hover:!bg-stone-50/40 transition-colors p-4">
          <div class="flex justify-between items-center w-full pr-4 text-left">
            <div class="flex items-center gap-3">
              <span class="font-semibold text-stone-850 text-sm">
                {{ translateActionType(log.fActionType) }}
              </span>
              <span class="bg-stone-100 text-stone-500 border border-stone-200/30 px-2 py-0.5 rounded-lg text-[9px] font-mono leading-none scale-90">
                {{ log.fActionType }}
              </span>
            </div>
            <span class="text-stone-400 text-[10px] flex items-center gap-1.5 font-sans font-light">
              <i class="pi pi-clock text-[9px]"></i>
              {{ new Date(log.fCreatedAt).toLocaleString('zh-TW') }}
            </span>
          </div>
        </AccordionHeader>

        <AccordionContent class="p-4 border-t border-stone-200/30 !bg-white/40">
          <div class="flex flex-col gap-5">
            <!-- 1. 發送請求區塊 (Request) -->
            <div v-if="log.fRequestData" class="bg-white border border-stone-200/30 p-5 rounded-2xl shadow-xs">
              <h4 class="font-semibold text-stone-800 mb-4 border-b border-stone-100 pb-2.5 flex items-center gap-2 text-xs">
                <i class="pi pi-send text-[#8E9A86] text-xs"></i> 系統發送內容 (Request)
              </h4>
              
              <div v-if="typeof parseLogData(log.fRequestData) === 'object' && log.fRequestData">
                <div
                  v-for="(value, key) in parseLogData(log.fRequestData)"
                  :key="key"
                  class="text-xs mb-3.5 flex flex-col border-b border-stone-100/50 pb-2.5 last:border-0 last:pb-0"
                >
                  <span class="text-stone-400 font-mono text-[9px] leading-none mb-1">{{ key }}</span>
                  <span class="font-bold text-stone-750 text-xs mb-1.5">{{ translateKey(key) }}</span>

                  <!-- LINE Pay Packages 渲染 -->
                  <div v-if="key === 'packages'" class="mt-2.5 pl-3 border-l-2 border-[#8E9A86] bg-[#8E9A86]/5 p-3.5 rounded-xl">
                    <div v-for="(pkg, pIdx) in value" :key="pIdx" class="mb-4 last:mb-0">
                      <div class="grid grid-cols-2 gap-2 text-xs text-stone-600 mb-2.5">
                        <div>
                          <span class="text-stone-400">包裹編號:</span>
                          <span class="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200/40 ml-1.5 text-stone-750">{{ pkg.id }}</span>
                        </div>
                        <div>
                          <span class="text-stone-400">包裹總額:</span>
                          <span class="text-stone-800 font-bold ml-1.5 font-mono">${{ pkg.amount?.toLocaleString() }}</span>
                        </div>
                        <div class="col-span-2 mt-0.5">
                          <span class="text-stone-400">包裹名稱:</span>
                          <span class="text-stone-800 font-medium ml-1.5">{{ pkg.name }}</span>
                        </div>
                      </div>
                      
                      <!-- 包裹內商品清單 -->
                      <div class="bg-white p-3 rounded-xl border border-stone-250/20 mt-2 font-sans">
                        <div class="text-[10px] font-bold text-[#8E9A86] mb-2 flex items-center gap-1.5 font-serif">
                          <i class="pi pi-box"></i> 商品項目明細：
                        </div>
                        <div
                          v-for="(prod, prIdx) in pkg.products"
                          :key="prIdx"
                          class="text-xs text-stone-650 flex justify-between py-1.5 border-b border-stone-50 last:border-0"
                        >
                          <span>名稱: <strong class="text-stone-800 font-serif">{{ prod.name }}</strong></span>
                          <span>數量: <strong class="font-mono text-stone-800">{{ prod.quantity }}</strong></span>
                          <span>單價: <strong class="font-mono text-[#8E9A86]">${{ prod.price?.toLocaleString() }}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- LINE Pay redirectUrls 渲染 -->
                  <div v-else-if="key === 'redirectUrls'" class="mt-2 pl-3 border-l-2 border-[#8E9A86] bg-[#8E9A86]/5 p-3 rounded-xl">
                    <div class="flex flex-col gap-2.5 text-xs font-sans">
                      <div class="flex flex-col md:flex-row md:items-center gap-2">
                        <span class="bg-[#8E9A86]/10 text-[#8E9A86] border border-[#8E9A86]/20 px-2 py-0.5 rounded text-[9px] font-bold shrink-0">成功導向</span>
                        <a :href="value.confirmUrl" target="_blank" class="text-blue-600 hover:underline break-all font-mono text-[11px]">{{ value.confirmUrl }}</a>
                      </div>
                      <div class="flex flex-col md:flex-row md:items-center gap-2 mt-1">
                        <span class="bg-stone-100 text-stone-500 border border-stone-250/20 px-2 py-0.5 rounded text-[9px] font-bold shrink-0">取消導向</span>
                        <a :href="value.cancelUrl" target="_blank" class="text-stone-550 hover:underline break-all font-mono text-[11px]">{{ value.cancelUrl }}</a>
                      </div>
                    </div>
                  </div>

                  <!-- 一般欄位 -->
                  <span v-else class="text-stone-700 font-mono text-xs break-all leading-normal">
                    {{ value }}
                  </span>
                </div>
              </div>
              <pre v-else class="text-xs text-stone-600 bg-stone-50 p-4 rounded-xl font-mono whitespace-pre-wrap overflow-auto max-h-[300px] border border-stone-200/30">{{ log.fRequestData }}</pre>
            </div>

            <!-- 2. 接收回應區塊 (Response) -->
            <div v-if="log.fResponseData" class="bg-white border border-stone-200/30 p-5 rounded-2xl shadow-xs">
              <h4 class="font-semibold text-stone-800 mb-4 border-b border-stone-100 pb-2.5 flex items-center gap-2 text-xs">
                <i class="pi pi-download text-[#8E9A86] text-xs"></i> 金流商回應 (Response)
              </h4>
              
              <div v-if="typeof parseLogData(log.fResponseData) === 'object' && log.fResponseData">
                <div
                  v-for="(value, key) in parseLogData(log.fResponseData)"
                  :key="key"
                  class="text-xs mb-3.5 flex flex-col border-b border-stone-100/50 pb-2.5 last:border-0 last:pb-0"
                >
                  <span class="text-stone-400 font-mono text-[9px] leading-none mb-1">{{ key }}</span>
                  <span class="font-bold text-stone-750 text-xs mb-1.5">{{ translateKey(key) }}</span>

                  <!-- info 巢狀資料優化 -->
                  <div v-if="typeof value === 'object' && value !== null" class="mt-2 pl-3 border-l-2 border-[#8E9A86] bg-[#8E9A86]/5 p-3 rounded-xl flex flex-col gap-2">
                    <div
                      v-for="(subVal, subKey) in value"
                      :key="subKey"
                      class="text-xs flex flex-col border-b border-stone-200/20 pb-2.5 last:border-0 last:pb-0"
                    >
                      <span class="text-stone-400 font-mono text-[8px] leading-none mb-1">{{ subKey }}</span>
                      <span class="font-bold text-stone-700 mb-1.5">{{ translateKey(subKey) }}</span>

                      <!-- payInfo 付款資訊 -->
                      <div v-if="subKey === 'payInfo' && Array.isArray(subVal)" class="mt-2 flex flex-col gap-3 font-sans">
                        <div
                          v-for="(pay, pIdx) in subVal"
                          :key="pIdx"
                          class="bg-white p-3.5 rounded-xl border border-stone-200/50 flex flex-col gap-2 shadow-xs"
                        >
                          <div class="text-[10px] font-bold text-[#8E9A86] border-b border-stone-100 pb-1.5 mb-1 flex items-center gap-1.5 font-serif">
                            <i class="pi pi-credit-card"></i> 實體付款明細 #{{ pIdx + 1 }}
                          </div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-stone-600">
                            <div>
                              <span class="text-stone-400">付款管道:</span>
                              <strong class="text-stone-850 ml-1.5">{{ pay.method || '未載明' }}</strong>
                            </div>
                            <div>
                              <span class="text-stone-400">交易金額:</span>
                              <strong class="text-[#8E9A86] ml-1.5 font-mono">${{ pay.amount?.toLocaleString() }}</strong>
                            </div>
                            <div v-if="pay.maskedCardNumber" class="col-span-1 md:col-span-2 mt-1">
                              <span class="text-stone-400">信用卡卡號:</span>
                              <strong class="font-mono bg-stone-50 px-1.5 py-0.5 rounded ml-1.5 text-stone-750 border border-stone-200/30">{{ pay.maskedCardNumber }}</strong>
                            </div>
                            <div v-if="pay.cardBrand">
                              <span class="text-stone-400">發卡組織:</span>
                              <strong class="text-stone-850 ml-1.5">{{ pay.cardBrand }}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- packages 產品資訊 -->
                      <div v-else-if="subKey === 'packages' && Array.isArray(subVal)" class="mt-2 flex flex-col gap-3 font-sans">
                        <div
                          v-for="(pkg, pIdx) in subVal"
                          :key="pIdx"
                          class="bg-white p-3.5 rounded-xl border border-stone-200/50 shadow-xs flex flex-col gap-2"
                        >
                          <div class="text-[10px] font-bold text-[#8E9A86] border-b border-stone-100 pb-1.5 mb-1 flex items-center gap-1.5 font-serif">
                            <i class="pi pi-box"></i> 包裹明細 #{{ pIdx + 1 }}
                          </div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-stone-600">
                            <div>
                              <span class="text-stone-400">包裹編號:</span>
                              <strong class="font-mono bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200/30 ml-1.5 text-stone-750">{{ pkg.id }}</strong>
                            </div>
                            <div>
                              <span class="text-stone-400">包裹金額:</span>
                              <strong class="text-amber-600 font-bold ml-1.5 font-mono">${{ pkg.amount?.toLocaleString() }}</strong>
                            </div>
                            <div class="col-span-1 md:col-span-2 mt-0.5">
                              <span class="text-stone-400">包裹名稱:</span>
                              <strong class="text-stone-800 ml-1.5">{{ pkg.name }}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- paymentUrl 跳轉網址 -->
                      <div v-else-if="subKey === 'paymentUrl' && typeof subVal === 'object' && subVal !== null" class="mt-2 flex flex-col gap-2 font-sans">
                        <div class="bg-white p-3.5 rounded-xl border border-stone-200/50 shadow-xs flex flex-col gap-2">
                          <div class="text-[10px] font-bold text-[#8E9A86] border-b border-stone-100 pb-1.5 mb-1.5 flex items-center gap-1.5 font-serif">
                            <i class="pi pi-link"></i> 支付網址導向
                          </div>
                          <div class="flex flex-col gap-2 text-xs">
                            <div v-if="subVal.web" class="flex flex-col md:flex-row md:items-center gap-2">
                              <span class="bg-sky-500/10 text-sky-600 border border-sky-500/20 px-2 py-0.5 rounded text-[9px] font-bold shrink-0 flex items-center gap-1">
                                <i class="pi pi-desktop"></i> 電腦網頁
                              </span>
                              <a :href="subVal.web" target="_blank" class="text-blue-600 hover:underline break-all font-mono text-[11px]">{{ subVal.web }}</a>
                            </div>
                            <div v-if="subVal.app" class="flex flex-col md:flex-row md:items-center gap-2 mt-1">
                              <span class="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold shrink-0 flex items-center gap-1">
                                <i class="pi pi-mobile"></i> 手機 App
                              </span>
                              <a :href="subVal.app" target="_blank" class="text-emerald-600 hover:underline break-all font-mono text-[11px]">{{ subVal.app }}</a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 後備 JSON -->
                      <div v-else-if="typeof subVal === 'object' && subVal !== null" class="mt-1 bg-white p-2.5 rounded border border-stone-200/40">
                        <pre class="text-[9px] text-stone-500 font-mono whitespace-pre-wrap leading-relaxed">{{ JSON.stringify(subVal, null, 2) }}</pre>
                      </div>

                      <!-- 純文字 -->
                      <span v-else class="text-stone-850 font-mono text-xs break-all leading-normal">{{ subVal }}</span>
                    </div>
                  </div>

                  <!-- 一般純文字欄位 (成功碼高亮) -->
                  <span
                    v-else
                    :class="{
                      'text-emerald-600 font-bold font-mono': value === 1 || value === '0000' || value === '1',
                      'text-rose-600 font-bold font-mono': value === 0 || value === '0',
                      'text-stone-700 font-mono': value !== 1 && value !== '0000' && value !== 0 && value !== '1' && value !== '0',
                    }"
                    class="leading-normal break-all text-xs"
                  >
                    {{ value }}
                  </span>
                </div>
              </div>
              <pre v-else class="text-xs text-stone-650 bg-stone-50 p-4 rounded-xl font-mono whitespace-pre-wrap overflow-auto max-h-[300px] border border-stone-200/30">{{ log.fResponseData }}</pre>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </Dialog>
</template>

<style scoped>
/* Accordion customize style */
:deep(.p-accordionpanel) {
  border-radius: 16px !important;
  margin-bottom: 0.75rem !important;
}

:deep(.p-accordionheader) {
  padding: 0.75rem 1rem !important;
  background-color: rgba(245, 245, 244, 0.4) !important;
  border-radius: 16px !important;
  border: none !important;
  cursor: pointer;
}

:deep(.p-accordioncontent) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border: none !important;
  padding: 1.25rem !important;
}
</style>
