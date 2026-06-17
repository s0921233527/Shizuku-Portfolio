import { ref, onMounted, onUnmounted } from 'vue'
import { confirmPaymentAPI } from '@/api/order'

/**
 * 支付最終扣款確認與視窗關閉管理 Composable (SoC / SRP)
 * @param {Object} route Vue Router 的當前路由對象
 * @returns {Object} 暴露給 View 的狀態與方法
 */
export function usePaymentConfirmation(route) {
  const status = ref('processing') // 狀態機：processing (請款中), success (付款成功), fail (交易失敗)
  const errorMessage = ref('')
  const countdownSeconds = ref(3)
  let countdownTimer = null

  // 跨視窗通訊輔助：向父視窗發送訊息
  const notifyParent = (msg) => {
    if (window.opener) {
      window.opener.postMessage(msg, window.location.origin)
    }
  }

  // 執行視窗關閉倒數
  const startCloseCountdown = () => {
    countdownSeconds.value = 3
    countdownTimer = setInterval(() => {
      countdownSeconds.value--
      if (countdownSeconds.value <= 0) {
        clearInterval(countdownTimer)
        closeWindow()
      }
    }, 1000)
  }

  // 手動或自動關閉彈出視窗的方法
  const closeWindow = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
    if (window.opener) {
      window.close()
    } else {
      // 如果不是以彈窗開啟（例如在當前分頁中直接支付），則導向回會員訂單列表
      window.location.href = '/member/MemberOrders'
    }
  }

  onMounted(async () => {
    // 1. 解析網址參數
    const transactionId = route.query.transactionId
    const orderId = route.query.orderId
    const from = route.query.from

    // 2. 綠界 (ECPay) 旁路流程處理：綠界在背景已扣款完畢，直接回報成功並關閉
    if (from === 'ecpay') {
      status.value = 'success'
      notifyParent('PAYMENT_SUCCESS')
      startCloseCountdown()
      return
    }

    // 3. LINE Pay 請款最終確認流程
    if (!transactionId || !orderId) {
      status.value = 'fail'
      errorMessage.value = '網址參數不完整，無法執行最終扣款確認。'
      notifyParent('PAYMENT_FAILED')
      return
    }

    try {
      // 呼叫後端最終請款 API (對齊 C# 後端 Controller)
      const res = await confirmPaymentAPI({
        transactionId: transactionId,
        orderId: orderId
      })

      // 4. 嚴格對接標準 ApiResponse 規範
      if (res && res.success) {
        status.value = 'success'
        notifyParent('PAYMENT_SUCCESS')
        startCloseCountdown()
      } else {
        // 處理後端 Success 屬性回傳為 false 的異常狀態
        status.value = 'fail'
        errorMessage.value = (res && res.message) || '交易授權請款失敗，請聯絡發卡銀行。'
        notifyParent('PAYMENT_FAILED')
      }
    } catch (error) {
      console.error('請款確認 API 呼叫異常：', error)
      status.value = 'fail'
      errorMessage.value = '與伺服器連線請款失敗，請檢查網路狀態。'
      notifyParent('PAYMENT_FAILED')
    }
  })

  onUnmounted(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
  })

  return {
    status,
    errorMessage,
    countdownSeconds,
    closeWindow
  }
}
