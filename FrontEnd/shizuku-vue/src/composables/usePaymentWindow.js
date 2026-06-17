export function usePaymentWindow() {
  // 預先打開一個空白子視窗，繞過瀏覽器對非同步 window.open 的阻擋
  const preOpenWindow = () => {
    return window.open('about:blank', '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes')
  }

  // 接收四個參數：預開視窗、金流網址、成功回呼、失敗回呼
  const openPaymentWindow = (paymentWindow, paymentUrl, onSuccess, onFail) => {
    console.log('[usePaymentWindow] openPaymentWindow called.', {
      paymentWindow,
      paymentUrl
    })
    // 解決後端如果因為環境變數沒配好而回傳 localhost 的問題：
    // 自動將 localhost 的後端 API 位址替換為真正的 VITE_API_BASE_URL
    let finalUrl = paymentUrl
    const envApiBase = import.meta.env.VITE_API_BASE_URL
    if (paymentUrl.includes('localhost:7197')) {
      try {
        // 安全清洗並取出真實後端域名，防範環境變數帶有單雙引號，且若變數為空則使用預設 Render 域名
        const cleanBase = (envApiBase || 'https://shizuku-backend.onrender.com/api').replace(/['"]/g, '')
        const realOrigin = new URL(cleanBase).origin
        finalUrl = paymentUrl.replace(/https?:\/\/localhost:7197/, realOrigin)
        console.log('[usePaymentWindow] Replaced localhost URL. Final URL:', finalUrl)
      } catch (err) {
        console.warn('解析 VITE_API_BASE_URL 發生異常，套用預設 Render 域名防禦：', err)
        finalUrl = paymentUrl.replace(/https?:\/\/localhost:7197/, 'https://shizuku-backend.onrender.com')
        console.log('[usePaymentWindow] Replaced localhost with fallback. Final URL:', finalUrl)
      }
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    if (isMobile) {
      console.log('[usePaymentWindow] Mobile device detected. Redirecting current tab directly to:', finalUrl)
      window.location.href = finalUrl
      return
    }

    let activeWindow = paymentWindow
    console.log('[usePaymentWindow] activeWindow state:', {
      isNull: !activeWindow,
      isClosed: activeWindow ? activeWindow.closed : true
    })

    if (!activeWindow || activeWindow.closed) {
      console.log('[usePaymentWindow] Window is null or closed, attempting new window.open (popup)...')
      activeWindow = window.open(finalUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes')
      console.log('[usePaymentWindow] New window reference:', activeWindow)
      
      // 終極安全機制：如果新分頁依然被瀏覽器阻擋，直接在當前分頁進行轉向，確保金流流程不中斷！
      if (!activeWindow) {
        console.warn('[usePaymentWindow] 新分頁開啟失敗，啟動當前頁面重導向安全防禦機制。')
        window.location.href = finalUrl
        return
      }
    } else {
      console.log('[usePaymentWindow] Pre-opened window exists. Redirecting to finalUrl...')
      activeWindow.location.href = finalUrl
      console.log('[usePaymentWindow] Redirected window to finalUrl.')
    }

    let paymentComplete = false

    const receiveMessage = (event) => {
      // 直接讀取 .env 配置
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
      const backendOrigin = new URL(backendUrl).origin

      // 安全性檢查：只接受來自我們自己或後端的訊息
      if (event.origin !== window.location.origin && event.origin !== backendOrigin) return

      if (event.data === 'PAYMENT_SUCCESS') {
        paymentComplete = true
        window.removeEventListener('message', receiveMessage)
        onSuccess() // 觸發元件傳進來的成功邏輯
      } else if (event.data === 'PAYMENT_FAILED') {
        paymentComplete = true
        window.removeEventListener('message', receiveMessage)
        onFail('付款取消或失敗。') // 觸發元件傳進來的失敗邏輯
      }
    }

    window.addEventListener('message', receiveMessage)

    // 每秒檢查使用者是否把視窗按叉叉關掉了
    const checkWindowClosed = setInterval(() => {
      if (activeWindow && activeWindow.closed) {
        clearInterval(checkWindowClosed)
        if (!paymentComplete) {
          window.removeEventListener('message', receiveMessage)
          onFail('您已關閉付款視窗。付款未完成。')
        }
      }
    }, 1000)
  }

  // 將方法拋出給外部元件使用
  return { preOpenWindow, openPaymentWindow }
}
