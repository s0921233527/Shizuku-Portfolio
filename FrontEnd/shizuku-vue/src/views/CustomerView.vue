<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // 引入組長寫的登入狀態

import AppCustomerForm from '@/components/customer/AppCustomerForm.vue';
import AppCustomerChatbot from '@/components/customer/AppCustomerChatbot.vue';
import AppCustomerLiveChat from '@/components/customer/AppCustomerLiveChat.vue';

const currentView = ref('menu');
const router = useRouter();
const authStore = useAuthStore(); // 取得 Store 實體

// 專門處理點擊「真人客服」按鈕的方法
const handleLiveChatClick = () => {
  if (!authStore.isLogin) {
    alert("親愛的顧客您好，使用真人客服前請先登入會員！");
    router.push({ name: 'Login' }); // 踢去組長的登入頁
    return;
  }
  currentView.value = 'livechat';
};

// 專門處理點擊「表單回覆」按鈕的方法
const handleFeedbackClick = () => {
  if (!authStore.isLogin) {
    alert("親愛的顧客您好，為了方便您日後追蹤客服進度，填寫表單前請先登入會員！");
    router.push({ name: 'Login' }); // 踢去組長的登入頁
    return;
  }
  currentView.value = 'feedback';
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 pt-36 pb-20 font-serif text-stone-850">
    
    <div class="border-b border-stone-200/50 pb-4 mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
      <div>
        <RouterLink :to="{ name: 'home' }" class="text-xs text-stone-400 hover:text-[#8E9A86] transition-colors inline-flex items-center gap-1.5 mb-4">
          <span>&lt;</span> 回首頁
        </RouterLink>
        <h1 class="text-2xl font-light text-stone-850 tracking-wider font-serif">聯絡 SHIZUKU 台灣</h1>
      </div>
      
      <button 
        v-if="currentView !== 'menu'" 
        @click="currentView = 'menu'" 
        class="text-xs text-[#8E9A86] hover:text-[#7D8876] transition-colors flex items-center gap-1 cursor-pointer"
      >
        <span>&lt; 返回客服選單</span>
      </button>
    </div>

    <div v-if="currentView === 'menu'" class="bg-[#FAF8F5]/85 border border-stone-200/40 p-6 md:p-12 rounded-3xl animate-fade-in shadow-xs backdrop-blur-md">
      <h2 class="text-lg font-medium text-stone-800 mb-8 tracking-wider text-center font-serif">智能客服與表單回覆</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div @click="currentView = 'chatbot'" class="bg-white/80 border border-stone-200/50 p-8 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-[#8E9A86]/60 rounded-2xl transition-all group h-full">
          <div class="flex items-center gap-2 mb-4">
            <span class="bg-[#8E9A86]/15 text-[#8E9A86] text-[10px] font-medium px-2.5 py-0.5 rounded-full font-serif">FAQ</span>
            <h3 class="text-base font-semibold tracking-wider text-stone-800 group-hover:text-[#8E9A86] transition-colors font-serif">快速問答機器人</h3>
          </div>
          <p class="text-xs text-stone-500 text-center font-light leading-relaxed">輸入關鍵字，24 小時為您快速解答常見問題。</p>
        </div>

        <div @click="handleLiveChatClick" class="bg-white/80 border border-stone-200/50 p-8 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-[#8E9A86]/60 rounded-2xl transition-all group h-full">
          <div class="flex items-center gap-2.5 mb-4 text-stone-500 group-hover:text-[#8E9A86] transition-colors">
            <svg class="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            <h3 class="text-base font-semibold tracking-wider text-stone-800">真人客服</h3>
          </div>
          <p class="text-xs text-stone-500 text-center font-light leading-relaxed">即時與專人連線，解決您的疑難雜症。</p>
        </div>

        <div @click="handleFeedbackClick" class="bg-white/80 border border-stone-200/50 p-8 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-[#8E9A86]/60 rounded-2xl transition-all group h-full">
          <div class="flex items-center gap-2.5 mb-4 text-stone-500 group-hover:text-[#8E9A86] transition-colors">
            <svg class="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            <h3 class="text-base font-semibold tracking-wider text-stone-800">表單回覆</h3>
          </div>
          <p class="text-xs text-stone-500 text-center font-light leading-relaxed">留下您的寶貴意見，我們將儘速處理。</p>
        </div>

      </div>
    </div>

    <AppCustomerForm v-if="currentView === 'feedback'" />
    <AppCustomerChatbot v-if="currentView === 'chatbot'" />
    <AppCustomerLiveChat v-if="currentView === 'livechat'" />

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>