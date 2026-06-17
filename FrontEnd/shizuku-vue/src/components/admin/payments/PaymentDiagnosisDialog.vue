<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import { getPaymentTransactionLogsForAdminAPI } from '@/api/adminPayment'
import { paymentErrorParser } from '@/services/paymentErrorParser'

const props = defineProps({
  visible: Boolean,
  transaction: Object,
})

const emit = defineEmits(['update:visible'])
const loading = ref(false)
const diagnosisResult = ref(null)

const fetchAndDiagnose = async () => {
  if (!props.transaction) return
  loading.value = true
  try {
    const res = await getPaymentTransactionLogsForAdminAPI(props.transaction.fId)
    let logs = []
    if (res && res.success) {
      // API 層已在網路防線洗淨 $values，表現層元件只需接收標準陣列
      logs = res.data || []
    }

    // 尋找最後一筆有回應資料的紀錄來進行診斷
    const lastResponseLog = [...logs].reverse().find((log) => log.fResponseData)
    if (lastResponseLog) {
      const rawData = JSON.parse(lastResponseLog.fResponseData)
      diagnosisResult.value = paymentErrorParser.autoDiagnose(rawData)
    } else {
      diagnosisResult.value = {
        msg: '尚無通訊回應',
        suggestion: '目前金流商尚未回傳任何資料，請確認支付流程是否已啟動。',
        isSuccess: false,
      }
    }
  } catch (e) {
    diagnosisResult.value = {
      msg: '資料解析失敗',
      suggestion: '日誌資料格式異常，無法自動診斷。',
      isSuccess: false,
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) fetchAndDiagnose()
  },
)
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    header="診斷報告"
    modal
    :style="{ width: '450px' }"
    class="diagnosis-dialog"
  >
    <div v-if="loading" class="py-8 text-center">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
      <p class="text-gray-500">正在進行深度診斷...</p>
    </div>

    <div v-else-if="diagnosisResult" class="space-y-6">
      <!-- 診斷狀態卡片 -->
      <div
        :class="
          diagnosisResult.isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        "
        class="p-6 rounded-2xl border-2 text-center"
      >
        <i
          :class="
            diagnosisResult.isSuccess
              ? 'pi pi-check-circle text-green-500'
              : 'pi pi-exclamation-triangle text-red-500'
          "
          class="text-5xl mb-4"
        ></i>
        <h3
          class="text-xl font-black mb-1"
          :class="diagnosisResult.isSuccess ? 'text-green-800' : 'text-red-800'"
        >
          {{ diagnosisResult.msg }}
        </h3>
        <p class="text-sm opacity-70">交易單號：{{ transaction?.fTransactionNo }}</p>
      </div>

      <!-- 建議操作區 -->
      <div class="bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h4
          class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"
        >
          <i class="pi pi-lightbulb"></i> 建議後續操作
        </h4>
        <p class="text-gray-700 leading-relaxed">
          {{ diagnosisResult.suggestion }}
        </p>
      </div>

      <div class="flex justify-end pt-2">
        <button
          @click="emit('update:visible', false)"
          class="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          關閉報告
        </button>
      </div>
    </div>
  </Dialog>
</template>
