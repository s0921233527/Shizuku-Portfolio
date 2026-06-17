<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const tickets = ref([]);
const expandedId = ref(null);
const isLoading = ref(true);

const getMemberId = () => {
  const userData = localStorage.getItem('memberUser');
  if (userData) {
    const user = JSON.parse(userData);
    //  終極修正：只抓流水號，避開 "M001"
    const exactId = user.fId || user.FId || user.id || user.Id || 0;
    return parseInt(exactId) || null;
  }
  return null;
};

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';

onMounted(async () => {
  const memberId = getMemberId(); 
  
  if (!memberId) {
    isLoading.value = false;
    return; 
  }

  try {
    const response = await axios.get(`${apiBase}/CustomerApi/History/${memberId}`);
    if (response.data.success) {
      tickets.value = response.data.data;
    }
  } catch (err) {
    console.error("無法載入提問歷史紀錄:", err);
  } finally {
    isLoading.value = false;
  }
});

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>

<template>
  <div class="bg-transparent p-0 w-full font-serif">
    <div v-if="isLoading" class="text-center py-16 text-stone-450 text-xs tracking-wider font-light">
      <i class="pi pi-spin pi-spinner text-sm text-[#8E9A86] mr-2"></i>載入紀錄中，請稍候...
    </div>
    <div v-else-if="tickets.length === 0" class="text-center py-12 text-stone-400 border border-dashed border-stone-200 rounded-xl font-light text-xs">
      目前尚無任何表單留言紀錄。
    </div>

    <div v-else class="space-y-4">
      <div v-for="ticket in tickets" :key="ticket.id" class="border border-stone-200/60 rounded-xl overflow-hidden bg-white/40 shadow-xs hover:border-[#8E9A86] transition-all duration-300">
        
        <div @click="toggleExpand(ticket.id)" class="p-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-[#8E9A86]/5 gap-2">
          <div class="flex items-center gap-3">
            <span :class="['px-2.5 py-0.5 text-[10px] rounded-full whitespace-nowrap font-light', 
                           ticket.status === 1 ? 'bg-stone-100 text-stone-600' : 'bg-[#8E9A86]/10 text-[#8E9A86]']">
              {{ ticket.status === 1 ? '● 已結案' : '● 處理中' }}
            </span>
            <span class="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-light whitespace-nowrap">{{ ticket.category }}</span>
            <span class="font-medium text-stone-850 text-sm tracking-wide line-clamp-1">{{ ticket.subject }}</span>
          </div>
          <span class="text-xs text-stone-400 font-light font-sans whitespace-nowrap">{{ ticket.createTime }}</span>
        </div>

        <div v-if="expandedId === ticket.id" class="p-5 bg-stone-50/40 border-t border-stone-200/30 space-y-4 text-xs animate-fade-in">
          <div class="bg-white/50 border border-stone-200/60 p-4 rounded-xl">
            <p class="text-[10px] font-medium text-stone-400 mb-2 tracking-wider">您的提問內容：</p>
            <p class="text-stone-750 whitespace-pre-line font-light leading-relaxed">{{ ticket.content }}</p>
          </div>
          
          <div class="text-xs text-center py-3.5 text-stone-500 bg-stone-100/50 rounded-lg border border-stone-200/30 flex flex-col gap-1 font-light">
            <span v-if="ticket.status === 0">⏳ 專員已收到您的提問，將於 1-2 個工作天內回覆。</span>
            <span v-else>✅ 此案件已處理完畢。</span>
            <span>詳細解答請留意您的註冊信箱 (Email)。</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>