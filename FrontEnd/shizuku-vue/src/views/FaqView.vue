<script setup>
import AppFaqSearch from '@/components/faq/AppFaqSearch.vue';
import AppFaqList from '@/components/faq/AppFaqList.vue';
</script>

<template>
  <!-- 🌟 這裡把 py-16 換成 pt-40 pb-20，就不會被 Nav 擋住了 -->
  <div class="max-w-4xl mx-auto px-6 pt-36 pb-20 font-serif text-stone-850 animate-fade-in">
    
   

    <AppFaqSearch />

    <AppFaqList />

  </div>
</template>

<style scoped>
.animate-fade-in { 
  animation: fadeIn 0.8s ease-out forwards; 
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>