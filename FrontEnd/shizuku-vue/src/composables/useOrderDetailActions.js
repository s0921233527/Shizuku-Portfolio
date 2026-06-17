import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { repayOrderAPI, cancelOrderApi } from '@/api/order'
import { usePaymentWindow } from '@/composables/usePaymentWindow'

/**
 * 訂單詳情互動操作 Composable (重新付款與取消訂單)
 * @param {string|number} orderId 訂單識別編號
 * @returns {Object} 包含所有狀態與方法
 */
export function useOrderDetailActions(orderId, onSuccess) {
  const toast = useToast()
  const { preOpenWindow, openPaymentWindow } = usePaymentWindow()

  // 付款狀態反饋 Overlay 控制
  const showResultModal = ref(false)
  const resultStatus = ref('success')
  const resultMessage = ref('')

  // 處理重新付款引導金流流程 (符合 ApiResponse 規範)
  const handleRepay = async (paymentMethodId, preOpenedWindow = null) => {
    // 預先使用或開啟空白視窗，繞過瀏覽器對非同步 window.open 的阻擋 (貨到付款為 3 與行動端不需要)
    let paymentWindow = preOpenedWindow
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    if (paymentMethodId !== 3 && !isMobile && (!paymentWindow || paymentWindow.closed)) {
      paymentWindow = preOpenWindow()
    }

    try {
      resultStatus.value = 'processing'
      resultMessage.value = '請稍候，即將為您轉跳至付款頁面...'
      showResultModal.value = true

      // 調用 API 發送付款變更請求
      const res = await repayOrderAPI(orderId, paymentMethodId, isMobile)

      // 標準 ApiResponse 成功狀態檢查
      if (res && res.success) {
        if (res.data && res.data.paymentUrl) {
          // 若有第三方金流連結，啟動高級去耦金流窗口
          openPaymentWindow(
            paymentWindow,
            res.data.paymentUrl,
            () => {
              resultStatus.value = 'success'
              resultMessage.value = '太棒了！您的訂單已付款成功。'
              showResultModal.value = true
              if (onSuccess) onSuccess()
            },
            (errorMsg) => {
              resultStatus.value = 'fail'
              resultMessage.value = errorMsg || '付款失敗，請重試。'
              showResultModal.value = true
              if (onSuccess) onSuccess()
            }
          )
        } else {
          // 無連結時代表為貨到付款
          paymentWindow?.close()
          resultStatus.value = 'success'
          resultMessage.value = '已將您的付款方式更改為「貨到付款」，訂單已準備出貨！'
          showResultModal.value = true
          if (onSuccess) onSuccess()
        }
      } else {
        // ApiResponse.Success 為 false
        paymentWindow?.close()
        resultStatus.value = 'fail'
        resultMessage.value = (res && res.message) || '無法產生付款連結，請聯絡客服。'
        showResultModal.value = true
      }
    } catch (error) {
      paymentWindow?.close()
      console.error('重新付款金流處理失敗：', error)
      resultStatus.value = 'fail'
      resultMessage.value = '系統連線發生錯誤，無法啟動金流。'
      showResultModal.value = true
    }
  }

  // 處理取消訂單請求 (符合 ApiResponse 規範)
  const handleCancel = async () => {
    try {
      const res = await cancelOrderApi(orderId)

      // 標準 ApiResponse 成功狀態檢查
      if (res && res.success) {
        toast.add({
          severity: 'success',
          summary: '訂單取消成功',
          detail: '此筆訂單已被成功取消。',
          life: 2000
        })
        if (onSuccess) {
          await onSuccess()
        } else {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } else {
        // ApiResponse.Success 為 false
        toast.add({
          severity: 'error',
          summary: '取消訂單失敗',
          detail: (res && res.message) || '發生未知錯誤，請聯絡客服人員。',
          life: 3000
        })
      }
    } catch (error) {
      console.error('取消訂單 API 呼叫失敗：', error)
      toast.add({
        severity: 'error',
        summary: '系統連線錯誤',
        detail: '無法與伺服器取得連線，請檢查您的網路狀態。',
        life: 3000
      })
    }
  }

  const handleCountdownEnd = () => {
    showResultModal.value = false
    window.location.href = '/member/MemberOrders'
  }

  return {
    showResultModal,
    resultStatus,
    resultMessage,
    handleRepay,
    handleCancel,
    handleCountdownEnd
  }
}
