<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { useChatAdminStore } from '@/stores/chatAdmin';

const adminStore = useAdminStore();
const chatAdminStore = useChatAdminStore();
const inputMessage = ref('');
const messagesContainer = ref(null);

//  畫面優化：改為「標籤」與「內文」分離的設計，並加上小圖示提升辨識度
const quickReplies = ref([
  { label: "👋 招呼", text: "您好，請問有什麼能為您服務？" },
  { label: "🔍 查詢中", text: "您的問題我們已經收到，正在為您查詢中，請稍候。" },
  { label: "🙇‍♂️ 久等了", text: "不好意思讓您久等了！" },
  { label: "📦 問訂單", text: "請問您的訂單編號是多少呢？" },
  { label: "✅ 有現貨", text: "這個商品目前有現貨喔，歡迎直接下單！" },
  { label: "💖 結語", text: "感謝您的詢問，祝您有美好的一天！" }
]);

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';

onMounted(async () => {
  await chatAdminStore.initConnection(adminStore.adminName);
  scrollToBottom();
});

const selectGuest = async (memberId) => {
  chatAdminStore.currentMemberId = memberId;
  const guest = chatAdminStore.activeGuests[memberId];
  guest.unreadCount = 0;

  if (!guest.hasLoadedHistory) {
    try {
      const response = await fetch(`${apiBase}/ChatApi/GetHistory/${memberId}`);
      if (response.ok) {
        const apiResult = await response.json();
        if (apiResult.success && apiResult.data) {
          guest.messages = apiResult.data.map(m => ({ 
              sender: m.type, 
              realSenderName: m.senderName, 
              text: m.text, 
              time: m.time 
          })); 
          guest.hasLoadedHistory = true;
        }
      }
    } catch (err) {
      console.error("歷史紀錄載入失敗:", err);
    }
  }
  scrollToBottom();
};

//  點擊時，把物件裡的 .text 完整帶入輸入框
const insertQuickReply = (text) => {
  inputMessage.value = text;
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !chatAdminStore.currentMemberId) return;
  
  const success = await chatAdminStore.sendMessageToMember(adminStore.adminName, inputMessage.value);
  
  if (success) {
    inputMessage.value = ''; 
    scrollToBottom();        
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    }, 100);
  });
};

watch(
  () => chatAdminStore.activeGuests[chatAdminStore.currentMemberId]?.messages?.length,
  () => {
    scrollToBottom();
  }
);
</script>

<template>
  <div class="flex h-[calc(100vh-8rem)] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md text-gray-800 w-full">
    
    <div class="w-1/4 border-r border-gray-200 flex flex-col bg-gray-50">
      <div class="p-4 bg-gray-800 text-white font-bold text-center tracking-widest">
        線上會員
      </div>
      <div class="flex-grow overflow-y-auto">
        <div v-if="Object.keys(chatAdminStore.activeGuests).length === 0" class="p-10 text-center text-gray-400 text-sm">
          暫無會員連線
        </div>
        <div v-for="(guest, memberId) in chatAdminStore.activeGuests" :key="memberId"
             @click="selectGuest(memberId)"
             :class="['p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-200 flex justify-between items-center transition-all', 
                      chatAdminStore.currentMemberId == memberId ? 'bg-blue-50 border-l-4 border-l-blue-600' : '']">
          <div class="flex flex-col">
            <span class="font-bold text-gray-700">會員：{{ guest.realName }}</span>
            <span class="text-xs" :class="guest.isOnline ? 'text-green-600 font-bold' : 'text-gray-400'">
              {{ guest.isOnline ? '線上' : '離線' }}
            </span>
          </div>
          <span v-if="guest.unreadCount > 0" class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
            {{ guest.unreadCount }}
          </span>
        </div>
      </div>
    </div>

    <div class="w-3/4 flex flex-col bg-white">
      <div v-if="chatAdminStore.currentMemberId" class="flex flex-col h-full">
        <div class="p-4 bg-white border-b border-gray-200 font-bold text-gray-800 flex justify-between items-center shadow-sm z-10">
          <span>正在與 會員：{{ chatAdminStore.activeGuests[chatAdminStore.currentMemberId].realName }} 對話</span>
        </div>
        
        <div class="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50" ref="messagesContainer">
          <div v-for="(msg, index) in chatAdminStore.activeGuests[chatAdminStore.currentMemberId].messages" :key="index" 
               :class="['flex flex-col', msg.sender === 'Admin' ? 'items-end' : 'items-start']">
            <span class="text-[11px] text-gray-400 mb-1">
              {{ msg.sender === 'Admin' ? `客服 (${msg.realSenderName})` : chatAdminStore.activeGuests[chatAdminStore.currentMemberId].realName }} · {{ msg.time }}
            </span>
            <div :class="['px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow-sm', 
                        msg.sender === 'Admin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800']">
              {{ msg.text }}
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 bg-white flex flex-col gap-3">
          
          <div class="flex flex-wrap gap-2 pb-1">
            <button v-for="(reply, index) in quickReplies" :key="index"
                    @click="insertQuickReply(reply.text)"
                    class="whitespace-nowrap px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] rounded-full border border-blue-200 transition-colors shadow-sm">
              {{ reply.label }}
            </button>
          </div>

          <div class="flex gap-2">
            <input v-model="inputMessage" @keyup.enter="sendMessage"
                   type="text" class="flex-grow border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                   placeholder="請輸入回覆訊息..." />
            <button @click="sendMessage" class="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              發送
            </button>
          </div>
        </div>
      </div>

      <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        <p class="tracking-widest">請從左側點擊會員開始對談</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移除原本的 scrollbar-hide 因為我們現在用自動換行了 */
</style>