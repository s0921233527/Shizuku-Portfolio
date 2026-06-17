/**
 * 後台管理員即時通知 Composable
 *
 * @param {object} toast - PrimeVue useToast() 實例
 * @param {string} targetCategory - 要接收的通知分類：'payment' | 'order' | 'all'
 */
import * as signalR from '@microsoft/signalr'
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'

export function useAdminNotification(toast, targetCategory = 'all') {
  const connection = ref(null)
  const isConnected = ref(false)

  const connect = async () => {
    try {
      const adminStore = useAdminStore()
      // 直接讀取 .env 配置
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
      const backendOrigin = new URL(backendUrl).origin
      const hubUrl = `${backendOrigin}/adminNotificationHub`

      connection.value = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => adminStore.adminToken
        })
        .withAutomaticReconnect()
        .build()

      // 監聽異常警報推播事件（後端多傳一個 category 欄位）
      connection.value.on('ReceiveAnomalyAlert', (title, message, severity, category) => {
        // 依 category 過濾：只接收屬於自己控制中心的通知
        if (targetCategory !== 'all' && category !== targetCategory) return

        toast.add({
          severity: severity === 'danger' ? 'error' : 'warn',
          summary: title,
          detail: message,
          life: 12000,
        })
      })

      // 斷線重連時自動重新加入群組
      connection.value.onreconnected(async () => {
        console.info(`[AdminNotification:${targetCategory}] 連線已恢復，重新加入群組`)
        await connection.value.invoke('JoinAdminNotification')
      })

      await connection.value.start()
      await connection.value.invoke('JoinAdminNotification')
      isConnected.value = true
      console.info(`[AdminNotification:${targetCategory}] 即時通知連線成功`)
    } catch (err) {
      console.error(`[AdminNotification:${targetCategory}] 連線失敗:`, err)
    }
  }

  const disconnect = async () => {
    if (connection.value) {
      await connection.value.stop()
      isConnected.value = false
    }
  }

  return { connect, disconnect, isConnected }
}
