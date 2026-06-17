import { ref, onUnmounted } from 'vue'
import { ORDER_STATUS } from '@/services/orderStatusManager'

/**
 * 訂單付款倒數計時 Composable
 * @param {Ref} orderData 訂單詳情響應式變數
 * @returns {Object} timeLeft 剩餘時間字串, startCountdown 啟動方法, clearCountdown 銷毀方法
 */
export function useOrderCountdown(orderData) {
  const timeLeft = ref('')
  let timer = null

  const clearCountdown = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const startCountdown = () => {
    clearCountdown()

    // 只有在「未付款」狀態且有資料才需要倒數
    if (!orderData.value || orderData.value.status !== ORDER_STATUS.PENDING) {
      timeLeft.value = ''
      return
    }

    const updateTimer = () => {
      const created = new Date(orderData.value.createdAt)
      const deadline = new Date(created.getTime() + 10 * 60 * 1000) // 建立時間 + 10 分鐘
      const now = new Date()
      const diff = deadline - now

      if (diff <= 0) {
        timeLeft.value = '已逾時'
        clearCountdown()
        return
      }

      const minutes = Math.floor(diff / 1000 / 60)
      const seconds = Math.floor((diff / 1000) % 60)
      timeLeft.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    updateTimer() // 立即更新一次
    timer = setInterval(updateTimer, 1000)
  }

  onUnmounted(() => {
    clearCountdown()
  })

  return {
    timeLeft,
    startCountdown,
    clearCountdown
  }
}
