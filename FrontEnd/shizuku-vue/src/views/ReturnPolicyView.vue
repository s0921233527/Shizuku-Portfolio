<script setup>
import AppReturnContent from '@/components/policy/AppReturnContent.vue';
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<template>
  <div class="max-w-4xl mx-auto px-6 pt-36 pb-20 font-serif text-stone-850 animate-fade-in">
    
    <div class="mb-12 text-center">
      <h1 class="text-2xl font-light text-stone-850 tracking-[0.2em] uppercase font-serif">Return & Exchange</h1>
      <p class="text-xs text-[#8E9A86] mt-2 tracking-widest font-light">退換貨說明</p>
      <div class="w-12 h-[1px] bg-[#8E9A86]/60 mx-auto mt-5"></div>
    </div>

    <AppReturnContent />

  </div>
</template>

