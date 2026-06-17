import { ref } from 'vue'
import { getPaymentTransactionsForAdminAPI } from '@/api/adminPayment'
import { orderStatusManager } from '@/services/orderStatusManager'

export function usePaymentAdmin() {
  const transactions = ref([])
  const loading = ref(false)

  // 抓取交易列表
  const fetchTransactions = async () => {
    loading.value = true
    try {
      const res = await getPaymentTransactionsForAdminAPI()
      if (res && res.success) {
        transactions.value = res.data || []
      }
    } catch (err) {
      console.error('抓取金流資料失敗', err)
    } finally {
      loading.value = false
    }
  }

  const getStatusInfo = (status) => {
    // 100% 委派給狀態機統一管理，徹底剷除本地對照表
    return orderStatusManager.getPaymentStatusInfo(status)
  }

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString() : 'N/A')

  const getPaymentMethodIcon = (methodName) => {
    if (!methodName) return 'pi pi-credit-card'
    const name = methodName.toUpperCase()
    if (name.includes('LINE')) return 'pi pi-mobile text-green-500'
    if (name.includes('APPLE')) return 'pi pi-apple text-gray-900'
    return 'pi pi-credit-card text-blue-500'
  }

  return {
    transactions,
    loading,
    fetchTransactions,
    getStatusInfo,
    formatDate,
    getPaymentMethodIcon,
  }
}
