<script setup>
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

<template>  <!-- 品牌故事 Banner -->
  <div class="mb-16 text-center animate-fade-in font-serif">
    <div class="overflow-hidden mb-10 rounded-3xl border border-stone-200/30 shadow-xs">
      <img 
        src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2000&auto=format&fit=crop" 
        alt="SHIZUKU Concept" 
        class="w-full h-[350px] md:h-[460px] object-cover filter grayscale hover:grayscale-0 transition-all duration-1000 transform hover:scale-103"
      />
    </div>
    <h1 class="text-3xl md:text-4xl font-light text-stone-850 tracking-[0.3em] uppercase mb-3 font-serif">Shizuku</h1>
    <p class="text-[#8E9A86] tracking-[0.5em] text-xs font-light">し ず く</p>
  </div>
</template>

