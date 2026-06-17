<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  visible: Boolean,
  status: String, // 'success' | 'fail' | 'warn' | 'processing'
  message: String,
})

// 定義發射事件，當倒數結束時通知外層元件
const emit = defineEmits(['update:visible', 'countdown-end'])

const countdown = ref(3)
let timer = null

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 監聽 visible 與 status 屬性，當狀態是成功或失敗時才開始倒數
watch([() => props.visible, () => props.status], ([newVisible, newStatus]) => {
  clearTimer() // 先清空之前的計時器

  if (newVisible && (newStatus === 'success' || newStatus === 'fail' || newStatus === 'warn')) {
    countdown.value = 3
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearTimer()
        emit('countdown-end') // 倒數結束，觸發跳轉事件
      }
    }, 1000)
  }
})

onUnmounted(() => {
  clearTimer()
})
</script>

<template>
  <!-- 黑色半透明遮罩：優化為輕量級 backdrop-blur-md 搭配實色，與首頁遮罩風格一致 -->
  <div
    v-if="visible"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-md transition-opacity duration-200"
  >
    <!-- 高質感硬體加速卡片本體 -->
    <div
      class="bg-[#FCFBF9]/95 p-10 rounded-[2rem] shadow-xl border border-stone-200/50 max-w-sm w-full text-center transform translate-z-0 will-change-transform animate-fade-in-up mx-4 relative overflow-hidden font-serif"
    >
      <!-- 狀態 1：處理中狀態 (Processing) -->
      <div v-if="status === 'processing'" class="flex flex-col items-center py-4">
        <div
          class="relative w-20 h-20 mb-6 flex items-center justify-center will-change-transform translate-z-0"
        >
          <div class="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
          <!-- 採用專屬寫在 scoped 內的 GPU 3D 硬體加速旋轉動畫 -->
          <div
            class="absolute inset-0 border-4 border-transparent border-t-[#8E9A86] rounded-full animate-spin-gpu translate-z-0"
          ></div>
          <i class="pi pi-sync text-2xl text-[#8E9A86] animate-pulse-lite"></i>
        </div>
        <h2 class="text-xl font-light text-stone-850 mb-3 tracking-wider">訂單處理中</h2>
        <p class="text-stone-500 text-xs font-light leading-relaxed max-w-[240px]">{{ message }}</p>
      </div>

      <!-- 狀態 2：成功狀態 (Success) -->
      <div v-else-if="status === 'success'" class="flex flex-col items-center py-4">
        <!-- 擴散心跳脈衝 Check Icon (優化 GPU 動畫) -->
        <div
          class="relative w-20 h-20 mb-6 flex items-center justify-center will-change-transform translate-z-0"
        >
          <div
            class="absolute w-16 h-16 bg-[#8E9A86]/10 rounded-full animate-ping-lite z-0"
          ></div>
          <div
            class="w-14 h-14 bg-[#8E9A86] text-white rounded-full flex items-center justify-center shadow-md shadow-[#8E9A86]/10 z-10"
          >
            <i class="pi pi-check text-xl font-light"></i>
          </div>
        </div>

        <span
          class="text-[10px] font-light text-[#8E9A86] uppercase tracking-widest bg-[#8E9A86]/10 px-2.5 py-1 rounded-full mb-3"
        >
          Completed
        </span>
        <h2 class="text-xl font-light text-stone-850 mb-2 tracking-wider">付款成功！</h2>
        <p class="text-stone-500 text-xs font-light leading-relaxed mb-6 max-w-[240px]">{{ message }}</p>

        <!-- 極致 60 FPS 進度條 -->
        <div class="w-full bg-stone-100 rounded-full h-1 mb-4 overflow-hidden translate-z-0">
          <div
            class="bg-[#8E9A86] h-1 rounded-full animate-progress-gpu will-change-transform"
            :style="{ animationDuration: '3s' }"
          ></div>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <span
            class="text-xl font-mono font-light text-[#8E9A86] animate-bounce-lite leading-none"
            :key="countdown"
          >
            {{ countdown }}
          </span>
          <span class="text-xs font-light text-stone-400">秒後為您轉跳訂單列表...</span>
        </div>
      </div>

      <!-- 狀態 3：失敗狀態 (Fail) -->
      <div v-else-if="status === 'fail'" class="flex flex-col items-center py-4">
        <!-- 震動警告 Times Icon (優化 GPU 動畫) -->
        <div
          class="relative w-20 h-20 mb-6 flex items-center justify-center animate-shake-gpu will-change-transform translate-z-0"
        >
          <div class="absolute inset-0 bg-red-500/5 rounded-full scale-105"></div>
          <div
            class="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md shadow-red-100/10 z-10"
          >
            <i class="pi pi-times text-xl font-light"></i>
          </div>
        </div>

        <span
          class="text-[10px] font-light text-red-500 uppercase tracking-widest bg-red-500/5 px-2.5 py-1 rounded-full mb-3"
        >
          Failed
        </span>
        <h2 class="text-xl font-light text-stone-850 mb-2 tracking-wider">付款失敗</h2>
        <p
          class="text-red-500 text-xs font-light bg-red-500/5 px-4 py-2.5 rounded-xl border border-red-100/50 mb-6 max-w-xs leading-normal"
        >
          {{ message }}
        </p>

        <!-- 極致 60 FPS 進度條 -->
        <div class="w-full bg-stone-100 rounded-full h-1 mb-4 overflow-hidden translate-z-0">
          <div
            class="bg-red-500 h-1 rounded-full animate-progress-gpu will-change-transform"
            :style="{ animationDuration: '3s' }"
          ></div>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <span
            class="text-xl font-mono font-light text-red-500 animate-bounce-lite leading-none"
            :key="countdown"
          >
            {{ countdown }}
          </span>
          <span class="text-xs font-light text-stone-400">秒後關閉視窗...</span>
        </div>
      </div>

      <!-- 狀態 4：警告/未登入狀態 (Warn) -->
      <div v-else-if="status === 'warn'" class="flex flex-col items-center py-4">
        <div
          class="relative w-20 h-20 mb-6 flex items-center justify-center will-change-transform translate-z-0"
        >
          <div
            class="w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md shadow-amber-100/10 z-10 animate-pulse-lite"
          >
            <i class="pi pi-exclamation-triangle text-lg font-light"></i>
          </div>
        </div>

        <span
          class="text-[10px] font-light text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2.5 py-1 rounded-full mb-3"
        >
          Warning
        </span>
        <h2 class="text-xl font-light text-stone-850 mb-2 tracking-wider">請先登入</h2>
        <p class="text-stone-500 text-xs font-light leading-relaxed mb-6 max-w-[240px]">{{ message }}</p>

        <!-- 極致 60 FPS 進度條 -->
        <div class="w-full bg-stone-100 rounded-full h-1 mb-4 overflow-hidden translate-z-0">
          <div
            class="bg-amber-50 h-1 rounded-full animate-progress-gpu will-change-transform"
            :style="{ animationDuration: '3s' }"
          ></div>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <span
            class="text-xl font-mono font-light text-amber-500 animate-bounce-lite leading-none"
            :key="countdown"
          >
            {{ countdown }}
          </span>
          <span class="text-xs font-light text-stone-400">秒後為您轉跳登入頁面...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 開啟 3D 硬體加速的卡片淡入動畫 */
.animate-fade-in-up {
  animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translate3d(0, 20px, 0) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

/* 輕量級 ping 動畫：只動 transform-scale，降低 GPU 像素重繪負擔 */
.animate-ping-lite {
  animation: pingLite 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes pingLite {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  70%,
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* GPU 60 FPS 旋轉動畫：保證 100% 獨立且絲滑轉動 */
.animate-spin-gpu {
  animation: spinGpu 0.8s linear infinite;
  will-change: transform;
}

@keyframes spinGpu {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 輕量級 pulse：避免 opacity 動畫引發全層重繪 */
.animate-pulse-lite {
  animation: pulseLite 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulseLite {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.85;
  }
}

/* 輕量級 bounce 數字跳動動畫 */
.animate-bounce-lite {
  animation: bounceLite 0.4s ease-out;
}
@keyframes bounceLite {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* GPU 60 FPS 合成層進度條動畫：使用 scaleX 避開 Layout/Reflow */
.animate-progress-gpu {
  animation: progressGpu linear forwards;
  transform-origin: left;
}

@keyframes progressGpu {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

/* 3D 硬體加速的失敗震動動畫 */
.animate-shake-gpu {
  animation: shakeGpu 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shakeGpu {
  10%,
  90% {
    transform: translate3d(-1.5px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(3px, 0, 0);
  }
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
