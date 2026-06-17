<template>
  <!-- 4. Editorial Story: 雜誌感穿搭特輯 (Lookbook) -->
  <section class="bg-[#F5F2EB]/20 py-24 px-6 border-y border-stone-200/30">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      <!-- 左側：不對稱穿搭企劃大圖 -->
      <div class="md:col-span-7 relative group overflow-hidden rounded-3xl border border-stone-200/40 shadow-xs aspect-[4/3] md:aspect-[16/10]">
        <img
          src="/img/shizuku_editorial_green.png"
          alt="Linen Editorial Wear"
          class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102"
        />
        <div class="absolute inset-0 bg-stone-900/5 group-hover:bg-transparent transition-colors duration-300"></div>
      </div>
      <!-- 右側：日系溫柔敘事與引導按鈕 -->
      <div class="md:col-span-5 flex flex-col justify-center items-start md:pl-8 lg:pl-12">
        <span class="text-xs text-[#8E9A86] font-medium tracking-[0.25em] uppercase font-serif">Weekly Editorial</span>
        <h3 class="text-2xl md:text-3xl font-light text-stone-800 tracking-[0.15em] mt-4 leading-snug font-serif">
          綠意靜謐：<br>天絲麻系列特輯
        </h3>
        <div class="w-8 h-[1px] bg-[#8E9A86] my-6"></div>
        <p class="text-xs md:text-sm text-stone-500 leading-loose tracking-[0.2em] font-light mb-8 font-serif">
          在陽光穿透窗櫺的清晨，穿上溫和柔軟的天絲麻襯衫。<br>
          帶有天然草木氣息的鼠尾草綠，在微風中輕輕呼吸，<br>
          洗滌都會喧囂，讓一整天的穿搭都過得輕盈而透亮。
        </p>
        <RouterLink
          to="/all"
          class="group inline-flex items-center gap-4 text-xs font-medium text-stone-800 tracking-[0.2em] uppercase border-b border-stone-800 pb-1.5 hover:text-[#8E9A86] hover:border-[#8E9A86] transition-colors font-serif"
        >
          探索此特輯
          <i class="pi pi-arrow-right text-xs transform group-hover:translate-x-1.5 transition-transform"></i>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>
