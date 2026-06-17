<script setup>
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 1.2s ease-out forwards;
  opacity: 0;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<template>   <!-- 品牌故事內容 -->
  <div class="max-w-2xl mx-auto text-center space-y-10 text-stone-600 leading-loose tracking-widest animate-fade-in-up font-serif font-light">
    
    <p class="text-lg font-medium text-stone-850">「如水滴般純粹，包容生活的所有姿態。」</p>

    <p>
      SHIZUKU 誕生於台灣，<br>
      我們相信，最貼近肌膚的衣物，應該如同水一般，<br>
      自然、透明、毫無負擔。
    </p>

    <p>
      在這個喧囂的時代，我們刻意褪去繁複的裝飾，<br>
      回歸剪裁的本質與材質的溫度。<br>
      每一件單品，都是經過反覆打磨的日常經典。
    </p>

    <p>
      不是為了在人群中喧嘩，<br>
      而是為了讓你在每一次穿上的瞬間，<br>
      都能感受到最純粹的舒適與自信。
    </p>

    <p class="pt-8 border-t border-stone-200/50 text-xs text-[#8E9A86] uppercase tracking-widest font-light">
      Design for everyday life.
    </p>

  </div>
</template>
