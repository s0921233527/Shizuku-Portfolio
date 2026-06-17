<template>
  <!-- 首頁日系溫柔柔和光影輪播圖 -->
  <section class="relative w-full h-[550px] md:h-[780px] bg-[#FAF8F5] overflow-hidden group">
    <div v-if="banners.length > 0" class="relative w-full h-full">
      <Transition mode="out-in" name="fade">
        <div :key="currentIndex" class="absolute inset-0">
          <!-- 圖片微放大並加上緩慢呼吸動畫效果 -->
          <img
            :src="resolveImageUrl(banners[currentIndex].fImage)"
            :alt="banners[currentIndex].fTitle"
            class="w-full h-full object-cover object-center scale-102 animate-slow-pan"
          />
          <!-- 柔和的日系光影遮罩，呈現呼吸感 -->
          <div class="absolute inset-0 bg-stone-900/15 md:bg-gradient-to-r md:from-stone-950/35 md:via-transparent md:to-transparent"></div>

          <!-- 文字內容排版：靠左排版，優雅襯線體雜誌排版感 -->
          <div class="absolute inset-0 flex flex-col justify-center items-start px-8 sm:px-16 lg:px-24 max-w-4xl text-left">
            <span class="text-xs md:text-sm font-medium text-[#FAF8F5]/90 uppercase tracking-[0.3em] font-serif">
              {{ banners[currentIndex].fSubtitle }}
            </span>
            <h1 class="text-3xl md:text-5xl lg:text-6xl font-light text-white mt-4 tracking-[0.15em] leading-tight font-serif">
              {{ banners[currentIndex].fTitle }}
            </h1>
            <p class="text-sm md:text-base text-stone-100/90 mt-5 max-w-md font-light leading-relaxed tracking-widest font-serif">
              {{ banners[currentIndex].fDescription }}
            </p>
            <div class="mt-8 flex gap-4">
              <RouterLink
                to="/all"
                class="border border-white/80 bg-white/10 hover:bg-[#8E9A86] hover:border-[#8E9A86] hover:shadow-md hover:shadow-[#8E9A86]/20 text-white px-9 py-3 text-xs tracking-[0.25em] uppercase transition-all duration-300 rounded-full backdrop-blur-xs font-medium font-serif"
              >
                探索企劃
              </RouterLink>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 左右日系極簡箭頭控制項 -->
    <button
      @click="prevSlide"
      class="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-stone-950/10 backdrop-blur-xs text-white hover:bg-[#8E9A86] hover:text-white hover:border-[#8E9A86] hover:shadow-md hover:shadow-[#8E9A86]/10 transition-all duration-300 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 cursor-pointer"
      aria-label="Previous slide"
    >
      <i class="pi pi-angle-left text-lg"></i>
    </button>
    <button
      @click="nextSlide"
      class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-stone-950/10 backdrop-blur-xs text-white hover:bg-[#8E9A86] hover:text-white hover:border-[#8E9A86] hover:shadow-md hover:shadow-[#8E9A86]/10 transition-all duration-300 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 cursor-pointer"
      aria-label="Next slide"
    >
      <i class="pi pi-angle-right text-lg"></i>
    </button>

    <!-- 底部細條指示器 -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4.5 z-10">
      <button
        v-for="(banner, index) in banners"
        :key="banner.fId"
        @click="selectSlide(index)"
        :class="[
          'h-1 rounded-full transition-all duration-500 cursor-pointer',
          index === currentIndex ? 'bg-[#8E9A86] w-10 shadow-xs shadow-[#8E9A86]/50' : 'bg-white/40 w-5 hover:bg-white/70'
        ]"
        :aria-label="'Go to slide ' + (index + 1)"
      ></button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getHomeBanners } from '@/api/adminHome';

const currentIndex = ref(0);
let timer = null;
const banners = ref([]);

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';
const API_BASE_URL = apiBase.replace(/\/api$/, '');

const resolveImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http') || imgUrl.startsWith('data:')) {
    return imgUrl;
  }
  if (imgUrl.startsWith('/img/')) {
    return imgUrl;
  }
  return `${API_BASE_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
};

const nextSlide = () => {
  if (banners.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % banners.value.length;
  resetTimer();
};

const prevSlide = () => {
  if (banners.value.length === 0) return;
  currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length;
  resetTimer();
};

const selectSlide = (index) => {
  currentIndex.value = index;
  resetTimer();
};

const startTimer = () => {
  timer = setInterval(nextSlide, 6000); // 6 秒自動播放
};

const resetTimer = () => {
  clearInterval(timer);
  startTimer();
};

onMounted(async () => {
  try {
    const response = await getHomeBanners();
    if (response.data.success) {
      banners.value = response.data.data.sort((a, b) => a.fSortOrder - b.fSortOrder);
    }
  } catch (err) {
    console.error('前台載入輪播圖失敗:', err);
  }
  startTimer();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
/* 漸變動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 呼吸/微平移動畫 */
@keyframes slowPan {
  0% {
    transform: scale(1.01) translateY(0);
  }
  50% {
    transform: scale(1.04) translateY(-1%);
  }
  100% {
    transform: scale(1.01) translateY(0);
  }
}

.animate-slow-pan {
  animation: slowPan 25s ease-in-out infinite;
}
</style>