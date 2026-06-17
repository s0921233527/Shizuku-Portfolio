<script setup>
import { ref, nextTick } from 'vue';
// 這裡假設你已經有 axios，如果沒有請自行換成 fetch 或你原本呼叫 API 的方式
import axios from 'axios'; 

const messages = ref([
  { 
    sender: '自助問答小幫手', 
    text: '您好！我是 SHIZUKU 智能小幫手。請問有什麼我可以幫忙的嗎？您可以直接點擊下方按鈕快速發問。' 
  }
]);
const inputMessage = ref('');
const messagesContainer = ref(null);
const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';

// 這裡的文字必須跟你資料庫 tChatbotFaq 裡面的 fKeyword 完全一模一樣
const quickKeywords = ['運費', '退換貨', '門市', '付款方式'];

const sendMessage = async (text) => {
  const messageToSend = text || inputMessage.value;
  if (!messageToSend.trim()) return;

  // 1. 把客人的訊息推到畫面上
  messages.value.push({ sender: '我', text: messageToSend });
  inputMessage.value = '';
  await scrollToBottom();

  try {
    // 2. 配合你的 C# Controller，改用 POST 發送，並包裝成 JSON 物件
    const response = await axios.post(`${apiBase}/CustomerApi/bot`, {
      Message: messageToSend 
    });
    
    // 3. 配合組長規定的 ApiResponse 格式，必須多加一層 .data 才能拆開包裝拿到裡面的 reply
    messages.value.push({ sender: '智能客服', text: response.data.data.reply });
  } catch (error) {
    console.error("API 呼叫失敗", error);
    messages.value.push({ sender: '智能客服', text: '不好意思，系統連線異常，請稍後再試。' });
  }
  
  await scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};
</script>

<template>
  <div class="bg-[#FAF8F5]/85 border border-stone-200/40 shadow-xs flex flex-col h-[550px] animate-fade-in rounded-3xl backdrop-blur-md overflow-hidden font-serif">
    
    <div class="bg-[#8E9A86] text-[#FCFBF9] p-4.5 font-light tracking-widest text-center text-lg shrink-0 shadow-xs font-serif">
      SHIZUKU 自助問答小幫手
    </div>
    
    <div class="flex-grow p-6 overflow-y-auto space-y-4 bg-[#FAF8F5]/45" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['flex flex-col', msg.sender === '我' ? 'items-end' : 'items-start']">
        <span class="text-[10px] text-stone-400 mb-1 font-serif font-light">{{ msg.sender }}</span>
        <div :class="['px-5 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-xs leading-relaxed', 
                    msg.sender === '我' ? 'bg-[#8E9A86] text-white rounded-tr-none font-light' : 'bg-white/95 border border-stone-200/40 text-stone-850 rounded-tl-none font-light']">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <div class="px-4.5 py-3 bg-[#FAF8F5]/70 border-t border-stone-200/30 flex gap-2.5 overflow-x-auto whitespace-nowrap items-center shadow-inner shrink-0 font-serif">
      <span class="text-xs font-medium text-stone-500 font-serif">常見問題：</span>
      <button 
        v-for="keyword in quickKeywords" 
        :key="keyword"
        @click="sendMessage(keyword)"
        class="text-xs font-medium text-stone-600 bg-white/85 border border-stone-200/40 hover:bg-[#8E9A86]/10 hover:text-[#8E9A86] hover:border-[#8E9A86]/35 px-4 py-2 rounded-full shadow-xs transition-all duration-200 shrink-0 font-serif cursor-pointer"
      >
        {{ keyword }}
      </button>
    </div>

    <div class="p-4 border-t border-stone-200/30 bg-white/60 shrink-0">
      <div class="flex gap-2">
        <input v-model="inputMessage" @keyup.enter="sendMessage()" 
               type="text" class="flex-grow border border-stone-200/60 px-4 py-2.5 rounded-full bg-white/80 focus:outline-none focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86]/20 text-sm font-serif text-stone-800 placeholder-stone-400"
               placeholder="或手動輸入您的問題..." />
        <button @click="sendMessage()" class="bg-[#8E9A86] text-[#FCFBF9] px-8 py-2.5 rounded-full text-sm font-light hover:bg-[#7D8876] transition-colors shadow-xs shrink-0 font-serif cursor-pointer">
          發送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 隱藏卷軸但保留滑動功能，讓按鈕區塊更好看 */
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>