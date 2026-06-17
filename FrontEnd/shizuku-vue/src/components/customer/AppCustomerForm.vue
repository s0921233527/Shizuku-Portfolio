<script setup>
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // 引入組長寫的權限 Store

const authStore = useAuthStore();

// 表單資料綁定
const formData = reactive({
  memberId: 0,
  name: '', 
  email: '',
  categoryId: '', 
  subject: '',
  description: ''
});

const categories = ref([]);
const isSubmitting = ref(false);
const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';

// 取得分類下拉選單資料
const fetchCategories = async () => {
  try {
    const apiUrl = `${apiBase}/CustomerApi/Categories`;
    const response = await axios.get(apiUrl);
    categories.value = response.data.data; 
  } catch (error) {
    console.error("取得分類失敗：", error);
  }
};

// 送出表單
const submitForm = async () => {
  isSubmitting.value = true;
  try {
    const apiUrl = `${apiBase}/CustomerApi/Submit`;
    const response = await axios.post(apiUrl, formData);
    
    if (response.data.success) {
      alert(response.data.message); 
      
      // 送出成功後，只清空問題，保留客人的姓名與信箱
      formData.categoryId = '';
      formData.subject = '';
      formData.description = '';
    }
  } catch (error) {
    console.error("API 呼叫失敗：", error);
    if (error.response && error.response.data && error.response.data.message) {
      alert("錯誤：" + error.response.data.message);
    } else {
      alert("系統發生錯誤，送出失敗。請檢查網路狀態或聯繫客服。");
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 網頁載入時觸發
onMounted(() => {
  fetchCategories();

  const userData = localStorage.getItem('memberUser');
  if (userData) {
    const user = JSON.parse(userData);
    
    //  終極修正：只抓「流水號」的欄位，並且強制轉換為數字 (避開 M001)
    const exactId = user.fId || user.FId || user.id || user.Id || 0;
    formData.memberId = parseInt(exactId) || 0;
    
    formData.email = user.fEmail || user.FEmail || user.email || '';
    formData.name = user.fName || user.FName || user.name || ''; 
  } 
  else if (authStore.isLogin && authStore.user) {
    // 備用方案
    const u = authStore.user;
    const exactId = u.fId || u.FId || u.id || u.Id || 0;
    formData.memberId = parseInt(exactId) || 0;
    
    formData.email = u.fEmail || u.FEmail || u.email || '';
    formData.name = u.fName || u.FName || u.name || '';
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<template>
  <div class="animate-fade-in font-serif">
    <div class="bg-[#FAF8F5]/85 border border-stone-200/40 p-5 mb-6 flex justify-between items-center rounded-2xl backdrop-blur-md">
      <h2 class="text-lg font-medium tracking-widest text-[#8E9A86] font-serif">客服信箱</h2>
      <span class="text-xs text-stone-500 font-serif font-light"><span class="text-rose-500/80 mr-1">※</span>必須項目</span>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6 bg-white/80 p-6 md:p-10 border border-stone-200/40 rounded-3xl backdrop-blur-md shadow-xs">
      
      <div class="grid grid-cols-1 md:grid-cols-4 md:gap-4 items-center border-b border-stone-100/80 pb-6">
        <label class="font-medium text-stone-850 mb-2 md:mb-0 font-serif">姓名 <span class="text-rose-500/80">※</span></label>
        <div class="md:col-span-3">
          <input type="text" v-model="formData.name" required class="w-full max-w-md border border-stone-200/60 p-2.5 rounded-xl bg-white/60 focus:outline-none focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86]/20 transition-all font-serif text-stone-800 placeholder-stone-400" placeholder="請輸入您的姓名" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 md:gap-4 items-center border-b border-stone-100/80 pb-6">
        <label class="font-medium text-stone-850 mb-2 md:mb-0 font-serif">電子郵件地址 <span class="text-rose-500/80">※</span></label>
        <div class="md:col-span-3">
          <input type="email" v-model="formData.email" required class="w-full max-w-md border border-stone-200/60 p-2.5 rounded-xl bg-white/60 focus:outline-none focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86]/20 transition-all font-serif text-stone-800 placeholder-stone-400" placeholder="請輸入您的電子郵件地址" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 md:gap-4 items-center border-b border-stone-100/80 pb-6">
        <label class="font-medium text-stone-850 mb-2 md:mb-0 font-serif">問題分類 <span class="text-rose-500/80">※</span></label>
        <div class="md:col-span-3">
          <select v-model="formData.categoryId" required class="w-full max-w-md border border-stone-200/60 p-2.5 rounded-xl bg-white/60 focus:outline-none focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86]/20 transition-all font-serif text-stone-800">
            <option value="" disabled>請選擇問題分類</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 md:gap-4 items-center border-b border-stone-100/80 pb-6">
        <label class="font-medium text-stone-850 mb-2 md:mb-0 font-serif">案件主旨 <span class="text-rose-500/80">※</span></label>
        <div class="md:col-span-3">
          <input type="text" v-model="formData.subject" required class="w-full border border-stone-200/60 p-2.5 rounded-xl bg-white/60 focus:outline-none focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86]/20 transition-all font-serif text-stone-800 placeholder-stone-400" placeholder="請簡單描述您的問題" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 md:gap-4 items-start border-b border-stone-100/80 pb-6">
        <label class="font-medium text-stone-850 mb-2 md:mb-0 pt-2 font-serif">詳細描述 <span class="text-rose-500/80">※</span></label>
        <div class="md:col-span-3">
          <textarea v-model="formData.description" required rows="5" class="w-full border border-stone-200/60 p-2.5 rounded-xl bg-white/60 focus:outline-none focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86]/20 transition-all font-serif text-stone-800 placeholder-stone-400" placeholder="請詳細說明您遇到的狀況..."></textarea>
        </div>
      </div>

      <div class="text-center pt-6">
        <button type="submit" :disabled="isSubmitting" class="bg-[#8E9A86] text-white px-16 py-3.5 rounded-full font-medium tracking-wider hover:bg-[#7D8876] transition-all duration-300 disabled:opacity-50 font-serif cursor-pointer shadow-sm">
          {{ isSubmitting ? '傳送中...' : '確認送出' }}
        </button>
      </div>

    </form>
  </div>
</template>