<script setup>
import { ref, onMounted, nextTick } from 'vue';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const messages = ref([]);
const inputMessage = ref('');
const messagesContainer = ref(null);
const connectionStatus = ref('連線中...');
const isConnected = ref(false);
let connection = null;

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';
const hubUrl = apiBase.replace(/\/api$/, '') + '/chatHub';

onMounted(async () => {
  if (!authStore.isLogin) return;
  const memberId = authStore.user?.fId || authStore.user?.fMemberId || 0;

  try {
    const response = await fetch(`${apiBase}/ChatApi/GetHistory/${memberId}`);
    if (response.ok) {
      const apiResult = await response.json();
      if (apiResult.success && apiResult.data) {
        //  關鍵：如果是 Admin 發的，強制顯示 '線上客服'，否則顯示客人自己的名字
        messages.value = apiResult.data.map(m => ({
          sender: m.type === 'Admin' ? '線上客服' : m.senderName,
          text: m.text,
          isMe: m.isMe,
          time: m.time
        }));
        scrollToBottom();
      }
    }
  } catch (err) {
    console.error("歷史紀錄載入失敗: ", err);
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build();

  //  收到客服即時回覆時，直接忽略 adminName，強制顯示 '線上客服'
  connection.on("ReceiveFromAdmin", (adminName, message) => {
    const timeString = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messages.value.push({ sender: '線上客服', text: message, isMe: false, time: timeString });
    scrollToBottom();
  });

  try {
    await connection.start();
    await connection.invoke("JoinAsMember", memberId);
    
    connectionStatus.value = '已連線';
    isConnected.value = true;
    if (messages.value.length === 0) {
        messages.value.push({ sender: '系統', text: `您好，${authStore.userName}！客服連線成功。請輸入您想詢問的問題。`, isMe: false, isSystem: true });
    }
  } catch (err) {
    connectionStatus.value = '連線失敗，請重新整理';
  }
});

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !isConnected.value) return;
  const memberId = authStore.user?.fId || authStore.user?.fMemberId || 0;
  try {
    await connection.invoke("SendMessageToAdmin", memberId, authStore.userName, inputMessage.value);
    const timeString = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messages.value.push({ sender: authStore.userName, text: inputMessage.value, isMe: true, time: timeString });
    inputMessage.value = '';
    scrollToBottom();
  } catch (err) {
    console.error("發送失敗: ", err);
  }
};

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }, 100);
};
</script>

<template>
  <div v-if="authStore.isLogin" class="bg-[#FAF8F5]/85 border border-stone-200/40 shadow-xs flex flex-col h-[550px] animate-fade-in rounded-3xl backdrop-blur-md overflow-hidden font-serif">
    <div class="bg-[#8E9A86] text-[#FCFBF9] p-4.5 font-light tracking-widest text-center flex justify-between items-center shrink-0 shadow-xs font-serif">
      <span class="text-base tracking-wider font-serif">真人即時連線服務</span>
      <span class="text-xs font-light tracking-wider flex items-center gap-1.5" :class="isConnected ? 'text-[#FCFBF9]' : 'text-stone-300'">
        <span class="w-1.5 h-1.5 rounded-full inline-block" :class="isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"></span>
        {{ connectionStatus }}
      </span>
    </div>
    
    <div class="flex-grow p-6 overflow-y-auto space-y-4 bg-[#FAF8F5]/45" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['flex flex-col', msg.isMe ? 'items-end' : 'items-start', msg.isSystem ? 'items-center mt-4 mb-6' : '']">
        
        <div v-if="msg.isSystem" class="bg-stone-200/40 border border-stone-200/50 text-stone-600 text-xs px-4.5 py-2.5 rounded-full tracking-wide font-light">
          {{ msg.text }}
        </div>
        <template v-else>
            <span class="text-[10px] text-stone-400 mb-1 font-serif font-light">
                {{ msg.sender }} <span class="ml-1.5 text-[9px] font-sans opacity-85">{{ msg.time }}</span>
            </span>
            <div :class="['px-5 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-xs leading-relaxed font-light', 
                         msg.isMe ? 'bg-[#8E9A86] text-white rounded-tr-none' : 'bg-white border border-stone-200/40 text-stone-855 rounded-tl-none']">
              {{ msg.text }}
            </div>
        </template>
      </div>
    </div>

    <div class="p-4 border-t border-stone-200/30 bg-white/60 shrink-0">
      <div class="flex gap-2">
        <input v-model="inputMessage" @keyup.enter="sendMessage" :disabled="!isConnected"
               type="text" class="flex-grow border border-stone-200/60 px-4 py-2.5 rounded-full bg-white/80 focus:outline-none focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86]/20 text-sm font-serif text-stone-800 placeholder-stone-400 disabled:bg-stone-100 disabled:cursor-not-allowed"
               placeholder="請輸入訊息..." />
        <button @click="sendMessage" :disabled="!isConnected" 
                class="bg-[#8E9A86] text-[#FCFBF9] px-8 py-2.5 rounded-full text-sm font-light hover:bg-[#7D8876] transition-colors shadow-xs shrink-0 font-serif cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed">
          傳送
        </button>
      </div>
    </div>
  </div>

  <div v-else class="bg-[#FAF8F5]/85 border border-stone-200/40 shadow-xs flex flex-col h-[550px] items-center justify-center p-8 text-center animate-fade-in rounded-3xl backdrop-blur-md font-serif">
    <svg class="w-16 h-16 text-[#8E9A86]/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
    <h3 class="text-xl font-light text-stone-850 tracking-widest mb-2 font-serif">會員專屬服務</h3>
    <p class="text-sm text-stone-500 mb-6 font-serif font-light leading-relaxed max-w-sm">真人即時客服僅提供給已登入之會員使用，以提供更精準的協助。</p>
    <RouterLink :to="{ name: 'Login' }" class="bg-[#8E9A86] text-[#FCFBF9] px-8 py-3.5 rounded-full text-sm font-light tracking-widest hover:bg-[#7D8876] transition-all shadow-xs font-serif cursor-pointer">
      前往登入
    </RouterLink>
  </div>
</template>