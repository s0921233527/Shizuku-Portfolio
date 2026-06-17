<script setup>
import { useRoute } from 'vue-router'
import { usePaymentConfirmation } from '@/composables/usePaymentConfirmation'

const route = useRoute()

// 引入高去耦、單一職責的支付確認組合式函數 (SoC / SRP)
const {
  status,
  errorMessage,
  countdownSeconds,
  closeWindow
} = usePaymentConfirmation(route)
</script>

<template>
  <!-- 完美優化：以與首頁一致的暖白色背景 (#FCFBF9) 與明體 (serif) 起筆，烘托極簡人文調性 -->
  <div class="min-h-screen flex items-center justify-center bg-[#FCFBF9] py-12 px-4 relative overflow-hidden font-serif">
    
    <!-- 優質輕量級硬體加速卡片本體 -->
    <div class="bg-white/80 p-10 rounded-[2rem] shadow-xl border border-stone-200/50 max-w-md w-full text-center relative overflow-hidden z-10 translate-z-0 backdrop-blur-md will-change-transform">
      
      <!-- 狀態 1：處理中 (Processing) -->
      <div v-if="status === 'processing'" class="flex flex-col items-center py-6">
        <!-- 精緻旋轉載入圈圈 (開啟 3D GPU 加速) -->
        <div class="relative w-20 h-20 mb-8 flex items-center justify-center translate-z-0 will-change-transform">
          <div class="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-[#8E9A86] rounded-full animate-spin translate-z-0 will-change-transform"></div>
          <i class="pi pi-lock text-2xl text-[#8E9A86]"></i>
        </div>

        <h2 class="text-xl font-light text-stone-850 mb-3 tracking-wider">正在連線請款中...</h2>
        <p class="text-stone-500 text-xs font-light max-w-xs leading-relaxed">
          正在與銀行進行安全加密驗證，請勿關閉或重新整理此視窗，以確保交易完整。
        </p>
      </div>

      <!-- 狀態 2：付款成功 (Success) -->
      <div v-else-if="status === 'success'" class="flex flex-col items-center">
        
        <!-- 頂級擴散心跳脈衝 Check Icon (優化 GPU 渲染開銷) -->
        <div class="relative w-20 h-20 mb-6 flex items-center justify-center translate-z-0 will-change-transform">
          <div class="absolute w-16 h-16 bg-[#8E9A86]/10 rounded-full animate-ping-lite z-0"></div>
          <div class="w-14 h-14 bg-[#8E9A86] text-white rounded-full flex items-center justify-center shadow-md shadow-[#8E9A86]/10 z-10">
            <i class="pi pi-check text-xl font-light"></i>
          </div>
        </div>

        <span class="text-[10px] font-light text-[#8E9A86] uppercase tracking-widest bg-[#8E9A86]/10 px-3 py-1 rounded-full mb-3">
          Transaction Completed
        </span>
        <h2 class="text-xl font-light text-stone-850 mb-3 tracking-wider">付款成功！</h2>
        
        <!-- 動態倒數跳動數字 -->
        <div class="flex items-center gap-2 bg-stone-50/50 px-4 py-2 rounded-xl border border-stone-200/30 mb-8">
          <span class="text-xs font-light text-stone-400">視窗將於</span>
          <span class="text-lg font-mono font-light text-[#8E9A86] animate-bounce-lite leading-none" :key="countdownSeconds">
            {{ countdownSeconds }}
          </span>
          <span class="text-xs font-light text-stone-400">秒後自動關閉</span>
        </div>

        <button 
          @click="closeWindow" 
          class="w-full bg-[#8E9A86] hover:bg-[#7d8b75] text-white py-4 rounded-full font-light tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
        >
          <span>立即關閉</span>
          <i class="pi pi-sign-out text-sm"></i>
        </button>
      </div>

      <!-- 狀態 3：付款失敗 (Fail) -->
      <div v-else-if="status === 'fail'" class="flex flex-col items-center">
        
        <!-- 頂級震動警告 Times Icon (優化 GPU 動畫) -->
        <div class="relative w-20 h-20 mb-6 flex items-center justify-center animate-shake-gpu translate-z-0 will-change-transform">
          <div class="absolute inset-0 bg-red-500/5 rounded-full scale-105"></div>
          <div class="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md shadow-red-100/10 z-10">
            <i class="pi pi-times text-xl font-light"></i>
          </div>
        </div>

        <span class="text-[10px] font-light text-red-500 uppercase tracking-widest bg-red-500/5 px-3 py-1 rounded-full mb-3">
          Transaction Failed
        </span>
        <h2 class="text-xl font-light text-stone-850 mb-2 tracking-wider">付款失敗</h2>
        <p class="text-red-500 text-xs font-light bg-red-500/5 px-4 py-2.5 rounded-xl border border-red-100/50 mb-8 max-w-xs leading-normal">
          {{ errorMessage || '請款失敗，請確認扣款餘額。' }}
        </p>

        <button 
          @click="closeWindow" 
          class="w-full bg-stone-100 hover:bg-[#8E9A86]/5 text-stone-600 hover:text-[#8E9A86] border border-stone-200/40 hover:border-[#8E9A86]/30 py-4 rounded-full font-light tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>關閉視窗</span>
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 輕量級 ping 動畫：只動 transform-scale，降低 GPU 像素重繪負擔 */
.animate-ping-lite {
  animation: pingLite 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes pingLite {
  0% { transform: scale(1); opacity: 0.5; }
  70%, 100% { transform: scale(1.4); opacity: 0; }
}

/* 3D 硬體加速的失敗震動動畫 */
.animate-shake-gpu {
  animation: shakeGpu 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shakeGpu {
  10%, 90% { transform: translate3d(-1.5px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
  40%, 60% { transform: translate3d(3px, 0, 0); }
}

/* 輕量級 bounce 數字跳動動畫 */
.animate-bounce-lite {
  animation: bounceLite 0.4s ease-out;
}
@keyframes bounceLite {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* 強制將物件上推至單獨的 GPU 合成層 */
.translate-z-0 {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.will-change-transform {
  will-change: transform;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
