<script setup>
// 引入我們自己寫好的客服紀錄小零件
import AppCustomerTicketHistory from '@/components/customer/AppCustomerTicketHistory.vue';
</script>

<template>
  <main class="w-full bg-transparent p-0">
    
    <div class="flex justify-between items-center mb-8 border-b border-stone-200/50 pb-6">
      <div>
        <h2 class="text-xl font-light tracking-wider text-stone-850">客服紀錄</h2>
        <p class="text-stone-500 text-xs mt-1 font-light">查看您的歷史提問與專員回覆狀態</p>
      </div>
    </div>

    <AppCustomerTicketHistory />
    
  </main>
</template>

<style scoped>
/* 保持乾淨，不用寫多餘的 CSS */
</style>