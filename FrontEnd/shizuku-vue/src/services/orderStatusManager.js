/*
 * 訂單與金流狀態機 (Finite State Machine) 管理器
 */

// 1. 訂單狀態常數
export const ORDER_STATUS = {
  PENDING: 1, // 未付款
  PAID: 2, // 已付款 (準備出貨)
  SHIPPING: 3, // 已出貨 (配送中)
  DELIVERED: 4, // 已送達 (完成)
  CANCELLED: 5, // 已取消
  PENDING_REFUND: 6, // 待退款
  REFUNDED: 7, // 已退款
}

// 2. 金流交易狀態常數 (對齊 C# 交易記錄 fStatus)
export const PAYMENT_STATUS = {
  UNPAID: 0, // 未付款
  SUCCESS: 1, // 付款成功
  FAILED: 2, // 交易失敗
  REFUNDED: 3, // 已退款
}

// 3. 付款方式常數 (對齊 C# PaymentMethod)
export const PAYMENT_METHOD = {
  ECPAY: 1, // 綠界信用卡 / 金融卡
  LINEPAY: 2, // LINE Pay
  COD: 3, // 貨到付款
}

// 訂單狀態 UI 對照表
const statusMap = {
  [ORDER_STATUS.PENDING]: { text: '未付款', color: '#f59e0b', icon: 'pi pi-clock' },
  [ORDER_STATUS.PAID]: { text: '已付款', color: '#3b82f6', icon: 'pi pi-shopping-bag' },
  [ORDER_STATUS.SHIPPING]: { text: '已出貨', color: '#6366f1', icon: 'pi pi-truck' },
  [ORDER_STATUS.DELIVERED]: { text: '已送達', color: '#10b981', icon: 'pi pi-check-circle' },
  [ORDER_STATUS.CANCELLED]: { text: '已取消', color: '#ef4444', icon: 'pi pi-times-circle' },
  [ORDER_STATUS.PENDING_REFUND]: {
    text: '待退款',
    color: '#a855f7',
    icon: 'pi pi-spinner pi-spin',
  }, // 紫色旋轉圖示
  [ORDER_STATUS.REFUNDED]: { text: '已退款', color: '#64748b', icon: 'pi pi-backward' }, // 灰色退回圖示
}

// 金流交易狀態 UI 對照表
const paymentStatusMap = {
  [PAYMENT_STATUS.UNPAID]: { label: '未付款', severity: 'warning', icon: 'pi pi-clock' },
  [PAYMENT_STATUS.SUCCESS]: { label: '付款成功', severity: 'success', icon: 'pi pi-check-circle' },
  [PAYMENT_STATUS.FAILED]: { label: '交易失敗', severity: 'danger', icon: 'pi pi-times-circle' },
  [PAYMENT_STATUS.REFUNDED]: { label: '已退款', severity: 'info', icon: 'pi pi-undo' },
}

// 付款方式 UI 對照表
const paymentMethodMap = {
  [PAYMENT_METHOD.ECPAY]: {
    text: '綠界金流',
    color: '#10b981',
    icon: 'pi pi-credit-card',
    severity: 'success',
  },
  [PAYMENT_METHOD.LINEPAY]: {
    text: 'LINE Pay',
    color: '#06c755',
    icon: 'pi pi-comment',
    severity: 'info',
  },
  [PAYMENT_METHOD.COD]: {
    text: '貨到付款',
    color: '#3b82f6',
    icon: 'pi pi-truck',
    severity: 'contrast',
  },
}

/**
 * 訂單合法的狀態轉移路徑
 * Key: 目前狀態, Value: 允許轉向的狀態陣列
 */
const validTransitions = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING_REFUND],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.PENDING_REFUND], // 已送達後可申請退款
  [ORDER_STATUS.CANCELLED]: [], // 已取消為終點狀態
  [ORDER_STATUS.PENDING_REFUND]: [ORDER_STATUS.REFUNDED], // 待退款可核准至已退款
  [ORDER_STATUS.REFUNDED]: [], // 已退款為終點狀態
}

export const orderStatusManager = {
  // 取得訂單狀態顯示資訊
  getStatusInfo(status) {
    return statusMap[status] || { text: '未知', color: '#9ca3af', icon: 'pi pi-question' }
  },

  // 取得付款方式顯示資訊
  getPaymentMethodInfo(methodId) {
    return (
      paymentMethodMap[methodId] || {
        text: '未知付款方式',
        color: '#9ca3af',
        icon: 'pi pi-question',
        severity: 'secondary',
      }
    )
  },

  // 取得金流交易狀態顯示資訊
  getPaymentStatusInfo(status) {
    return paymentStatusMap[status] || { label: '未知', severity: 'info', icon: 'pi pi-question' }
  },

  // 驗證狀態轉移是否合法
  isValidTransition(current, next) {
    if (current === next) return true
    const allowed = validTransitions[current] || []
    return allowed.includes(next)
  },

  // 取得時間軸所需的節點數據
  getTimelineSteps(currentStatus) {
    const steps = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PAID,
      ORDER_STATUS.SHIPPING,
      ORDER_STATUS.DELIVERED,
    ]

    return steps.map((status) => {
      const info = this.getStatusInfo(status)
      const isCompleted = status <= currentStatus && currentStatus !== ORDER_STATUS.CANCELLED
      const isCurrent = status === currentStatus

      return {
        status,
        label: info.text,
        icon: info.icon,
        color: isCompleted ? info.color : '#e5e7eb', // 未完成則變灰色
        active: isCurrent,
        completed: isCompleted,
      }
    })
  },
}
