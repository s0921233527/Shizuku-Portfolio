<script setup>
import AppGuideFlow from '@/components/guide/AppGuideFlow.vue';
import AppGuidePayment from '@/components/guide/AppGuidePayment.vue';
import AppGuideShipping from '@/components/guide/AppGuideShipping.vue';
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 pt-36 pb-20 font-serif text-stone-850 animate-fade-in">
    
    <div class="mb-16 text-center animate-fade-in">
      <h1 class="text-3xl font-light text-stone-850 tracking-[0.25em] uppercase font-serif">Shopping Guide</h1>
      <p class="text-[#8E9A86] tracking-[0.3em] text-xs font-light mt-2 uppercase">購物指南</p>
      <div class="w-12 h-[1px] bg-[#8E9A86]/60 mx-auto mt-5"></div>
    </div>

    <div class="space-y-24">
      <AppGuideFlow />
      <AppGuidePayment />
      <AppGuideShipping />
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { 
  animation: fadeIn 0.8s ease-out forwards; 
}
.animate-fade-in-up { 
  opacity: 0; 
  animation: fadeInUp 0.8s ease-out forwards; 
}

/* 🌟 幫這裡補上了 translateY，讓它也有高級漂浮感 */
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes fadeInUp { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}
</style>