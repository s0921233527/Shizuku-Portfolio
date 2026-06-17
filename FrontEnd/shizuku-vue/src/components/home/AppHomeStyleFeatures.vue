<template>
  <!-- 5. Style Categories: 三欄式風格大圖牆 -->
  <section class="max-w-7xl mx-auto px-6 py-24">
    <div class="flex flex-col items-center mb-16 text-center">
      <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase font-serif">Style Features</span>
      <h2 class="text-2xl md:text-3xl font-light tracking-[0.2em] text-stone-855 mt-2 font-serif">風格穿搭企劃</h2>
      <div class="w-8 h-[1px] bg-[#8E9A86] mt-4"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <RouterLink
        v-for="cat in styleCategories"
        :key="cat.id"
        :to="cat.categoryId ? { path: '/all', query: { categoryId: cat.categoryId } } : '/all'"
        class="group block relative overflow-hidden rounded-3xl aspect-[4/5] border border-stone-200/30 transition-all duration-500"
      >
        <!-- 背景圖與縮放 -->
        <img
          :src="cat.image"
          :alt="cat.name"
          class="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-103"
        />
        <!-- 磨砂覆蓋層 -->
        <div class="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/25 transition-colors duration-300"></div>

        <!-- 文字疊加區 -->
        <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
          <span class="text-[9px] tracking-[0.25em] font-medium uppercase opacity-90 text-[#FAF8F5] font-serif">{{ cat.title }}</span>
          <h3 class="text-lg md:text-xl font-light mt-1 tracking-wide font-serif">{{ cat.name }}</h3>
          <p class="text-xs text-stone-200/90 font-light mt-2 tracking-wider truncate font-serif">{{ cat.desc }}</p>
          <div class="w-5 h-[1px] bg-white/70 mt-4 group-hover:w-16 group-hover:bg-[#8E9A86] transition-all duration-300"></div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'

// 風格特輯的靜態分類大圖資料 (日系襯線體)
const styleCategories = [
  {
    id: 1,
    title: 'NATURAL LINEN',
    name: '日常棉麻系列',
    desc: '天然棉麻質地，輕透涼爽的日常感受',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    categoryId: 17
  },
  {
    id: 2,
    title: 'COZY KNITWEAR',
    name: '溫暖針織系列',
    desc: '輕柔貼合肌膚的精細針織工藝',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    categoryId: 18
  },
  {
    id: 3,
    title: 'ELEGANT DRESSES',
    name: '極簡洋裝特輯',
    desc: '免去繁複搭配，一件穿出優雅從容',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    categoryId: null // 導向所有商品
  }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>
