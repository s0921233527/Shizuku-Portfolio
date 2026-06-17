import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/auth'
import { checkCheckoutItemsAPI } from '@/api/checkout'
import { createOrderAPI } from '@/api/order'
import { usePaymentWindow } from '@/composables/usePaymentWindow'
import { PAYMENT_METHOD } from '@/services/orderStatusManager'

export function useCheckout() {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const router = useRouter()
  const { openPaymentWindow } = usePaymentWindow()

  // 定義結果視窗的狀態
  const showResultModal = ref(false)
  const resultStatus = ref('success')
  const resultMessage = ref('')
  const shouldRedirectToOrders = ref(false)

  // 當彈出視窗 3 秒倒數結束時觸發
  const handleCountdownEnd = () => {
    showResultModal.value = false
    if (shouldRedirectToOrders.value) {
      cartStore.clearCart()
      router.push({ name: 'MemberOrders' })
    }
  }

  // 準備變數來接收使用者的輸入
  const form = ref({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    note: '',
    paymentMethodId: PAYMENT_METHOD.ECPAY,
  })

  const paymentOptions = ref([
    {
      id: PAYMENT_METHOD.ECPAY,
      name: '信用卡',
      icon: 'pi-credit-card',
      desc: '支援 Visa, Master, JCB｜滿 $1,500 免運',
    },
    {
      id: PAYMENT_METHOD.LINEPAY,
      name: 'LINE Pay',
      icon: 'pi-comment',
      desc: '可使用 LINE POINTS 折抵｜滿 $1,500 免運',
    },
    {
      id: PAYMENT_METHOD.COD,
      name: '貨到付款',
      icon: 'pi-box',
      desc: '全館滿 $1,500 免運，未滿加收 $60 運費',
    },
  ])

  // ========== 運費計算邏輯 ==========
  const FREE_SHIPPING_THRESHOLD = 1500
  const SHIPPING_FEE = 60

  const shippingFee = computed(() => {
    return cartStore.totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  })

  const finalTotal = computed(() => {
    return cartStore.totalPrice + shippingFee.value
  })

  // ========== 表單同步 ==========
  const handleFormUpdate = (newForm) => {
    form.value = newForm
  }

  const handleBack = () => {
    router.push({ name: 'cart' })
  }

  // ========== 送出訂單 ==========
  const submitOrder = async (paymentWindow) => {
    console.log('[useCheckout] submitOrder called. Received paymentWindow:', paymentWindow)
    
    // 1. 權限檢查
    if (!authStore.isLogin) {
      paymentWindow?.close()
      resultStatus.value = 'fail'
      resultMessage.value = '請先登入會員才能完成結帳！'
      showResultModal.value = true
      return
    }

    // 2. 欄位檢查
    if (!form.value.receiverName || !form.value.receiverPhone || !form.value.receiverAddress) {
      paymentWindow?.close()
      resultStatus.value = 'fail'
      resultMessage.value = '請填寫完整的收件人資訊喔！'
      showResultModal.value = true
      return
    }

    // 3. 顯示處理中動畫
    resultStatus.value = 'processing'
    resultMessage.value = '正在核對商品庫存與最新售價，請稍候...'
    showResultModal.value = true

    try {
      // 呼叫預檢 API 取得最新商品狀態
      const variantIds = cartStore.items.map((item) => item.id)
      const checkRes = await checkCheckoutItemsAPI(variantIds)

      // 驗證預檢 API 是否成功
      if (!checkRes || !checkRes.success) {
        paymentWindow?.close()
        resultStatus.value = 'fail'
        resultMessage.value = checkRes?.message || '商品庫存核對失敗，請稍後再試！'
        return
      }

      const latestInfos = checkRes.data
      if (!Array.isArray(latestInfos)) {
        paymentWindow?.close()
        resultStatus.value = 'fail'
        resultMessage.value = '系統回傳商品資訊格式不符，請聯絡客服。'
        return
      }

      // 逐筆比對庫存與售價
      for (const item of cartStore.items) {
        const latest = latestInfos.find((l) => l.variantId === item.id)

        if (!latest) {
          paymentWindow?.close()
          resultStatus.value = 'fail'
          resultMessage.value = `抱歉，找不到您選購的商品【${item.name}】規格，可能已被商家下架。`
          return
        }

        if (latest.currentStock < item.quantity) {
          paymentWindow?.close()
          resultStatus.value = 'fail'
          resultMessage.value = `抱歉，【${item.name}】庫存不足（僅剩 ${latest.currentStock} 件），請回購物車調整數量後再下單。`
          return
        }

        if (latest.latestPrice !== item.price) {
          paymentWindow?.close()
          resultStatus.value = 'fail'
          resultMessage.value = `商品【${item.name}】的售價已有所調整，請回購物車重新確認結帳金額。`
          return
        }
      }

      // 預檢通過，正式成立訂單
      resultMessage.value = '商品核對成功！正在為您成立訂單...'

      const formattedCartItems = cartStore.items.map((item) => ({
        variantId: item.id,
        quantity: item.quantity,
      }))

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768

      const requestPayload = {
        memberId: authStore.user.fId,
        receiverName: form.value.receiverName,
        receiverPhone: form.value.receiverPhone,
        receiverAddress: form.value.receiverAddress,
        note: form.value.note,
        paymentMethodId: form.value.paymentMethodId,
        cartItems: formattedCartItems,
        isMobile: isMobile,
      }

      // 呼叫後端下單 API
      const res = await createOrderAPI(requestPayload)
      console.info('下單回傳結果：', res)

      if (res.success && res.data) {
        if (res.data.paymentUrl) {
          // 信用卡/LINE Pay：開啟金流支付視窗
          openPaymentWindow(
            paymentWindow,
            res.data.paymentUrl,
            () => {
              resultStatus.value = 'success'
              resultMessage.value = '太棒了！您的訂單已付款成功，準備進入理貨程序！'
              shouldRedirectToOrders.value = true
              showResultModal.value = true
            },
            (errorMsg) => {
              resultStatus.value = 'fail'
              resultMessage.value = `${errorMsg} 訂單已順利成立，請至歷史訂單重新嘗試付款。`
              shouldRedirectToOrders.value = true
              showResultModal.value = true
            },
          )
        } else {
          // 貨到付款
          paymentWindow?.close()
          resultStatus.value = 'success'
          resultMessage.value = `訂單已順利成立！請於包裹送達時，準備好現金 NT$ ${finalTotal.value.toLocaleString()} 交付給配送人員。`
          shouldRedirectToOrders.value = true
          showResultModal.value = true
        }
      } else {
        paymentWindow?.close()
        resultStatus.value = 'fail'
        resultMessage.value = res.message || '訂單建立失敗，請稍後再試。'
        shouldRedirectToOrders.value = false
        showResultModal.value = true
      }
    } catch (error) {
      paymentWindow?.close()
      console.error('結帳程序發生異常錯誤：', error)
      resultStatus.value = 'fail'
      resultMessage.value = '系統連線發生錯誤或交易超時，請檢查網路後再試！'
      shouldRedirectToOrders.value = false
      showResultModal.value = true
    }
  }

  // 掛載時的登入守衛防禦與地址載入
  onMounted(async () => {
    if (!authStore.isLogin) {
      resultStatus.value = 'warn'
      resultMessage.value = '偵測到尚未登入，即將為您導向登入頁面...'
      showResultModal.value = true
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000)
      return
    }

    // 載入會員地址簿並自動帶入預設地址
    try {
      await authStore.fetchUserAddress()
      const defaultAddr = authStore.addressList.find((addr) => addr.fIsDefault)
      if (defaultAddr) {
        form.value.receiverName = defaultAddr.fReceiverName
        form.value.receiverPhone = defaultAddr.fReceiverPhone
        form.value.receiverAddress = `${defaultAddr.fCity}${defaultAddr.fArea}${defaultAddr.fAddressDetail}`
      }
    } catch (error) {
      console.error('載入會員預設地址失敗：', error)
    }
  })

  const cartItems = computed(() => cartStore.items)
  const cartTotal = computed(() => cartStore.totalPrice)
  const addressList = computed(() => authStore.addressList)

  return {
    form,
    showResultModal,
    resultStatus,
    resultMessage,
    shouldRedirectToOrders,
    paymentOptions,
    shippingFee,
    finalTotal,
    handleFormUpdate,
    handleBack,
    submitOrder,
    handleCountdownEnd,
    cartItems,
    cartTotal,
    addressList,
  }
}
