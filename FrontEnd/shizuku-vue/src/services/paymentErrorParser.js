/*
 * 金流錯誤轉譯服務 (Payment Error Parser)
 * 將不同金流廠商 (LINE Pay, ECPay) 的原始錯誤代碼轉譯為診斷建議
 */

const ERROR_MAP = {
  // LINE Pay 錯誤代碼 (常用)
  LINE_PAY: {
    1101: { msg: '買家授權失敗', suggestion: '請引導買家確認 LINE Pay 錢包餘額或綁定卡片狀態。' },
    1102: {
      msg: '交易金額不符',
      suggestion: '請檢查系統訂單金額與發送給 LINE Pay 的金額是否一致。',
    },
    1150: { msg: '無此交易紀錄', suggestion: '金流商查無此單，請確認 Transaction ID 是否正確。' },
    1152: { msg: '該訂單已處理完成', suggestion: '此筆交易已扣款或已取消，無需重複操作。' },
    1159: { msg: '交易處理中', suggestion: '買家可能尚未在手機上確認付款，請稍候再查。' },
    9000: { msg: '金流商系統維護中', suggestion: 'LINE Pay 服務暫時不穩定，請稍後再試。' },
    default: { msg: '未知通訊錯誤', suggestion: '請聯繫技術支援，並提供 Raw Data 給開發者分析。' },
  },
  // 綠界 ECPay 錯誤代碼 (常用)
  EC_PAY: {
    10100073: {
      msg: '收單行授權失敗',
      suggestion: '發卡銀行拒絕交易，通常是餘額不足、卡片過期或海外限制。',
    },
    10100058: { msg: '特店代號不存在', suggestion: '請檢查後台綠界 MerchantID 設定。' },
    10200047: {
      msg: '檢查碼 (CheckMacValue) 錯誤',
      suggestion: '請確認 HashKey 或 HashIV 設定是否與綠界後台一致。',
    },
    1030006: {
      msg: '重複的 MerchantTradeNo',
      suggestion: '該訂單編號已在綠界端建立過，請更換單號。',
    },
    default: { msg: '金流處理異常', suggestion: '請檢查綠界廠商管理後台之詳細回傳訊息。' },
  },
}

export const paymentErrorParser = {
  /**
   * 進行診斷
   * @param {string} provider - 'LINE_PAY' | 'EC_PAY'
   * @param {string|number} rawCode - 原始錯誤代碼
   * @returns {Object} { msg: '簡述', suggestion: '建議' }
   */
  diagnose(provider, rawCode) {
    const code = String(rawCode)
    const pMap = ERROR_MAP[provider] || {}

    // 成功代碼判定
    if (code === '0000' || code === '1') {
      return { msg: '交易成功', suggestion: '無異常。', isSuccess: true }
    }

    const diagnosis = pMap[code] || pMap['default']
    return { ...diagnosis, isSuccess: false }
  },

  /**
   * 自動識別廠商並診斷 (根據資料欄位特徵)
   * @param {Object} responseData - JSON 解析後的回應資料
   */
  autoDiagnose(responseData) {
    if (!responseData) return null

    // 判斷 LINE Pay (特徵有 returnCode)
    if (responseData.returnCode !== undefined) {
      return this.diagnose('LINE_PAY', responseData.returnCode)
    }

    // 判斷 綠界 (特徵有 RtnCode)
    if (responseData.RtnCode !== undefined) {
      return this.diagnose('EC_PAY', responseData.RtnCode)
    }

    return null
  },
}
