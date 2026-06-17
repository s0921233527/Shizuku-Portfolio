<template>
  <!-- 9. Newsletter: 電子報訂閱區 (日系溫柔灰綠色) -->
  <section class="bg-[#E2E7E1] py-24 px-6 text-center text-stone-800 relative">
    <div class="max-w-2xl mx-auto relative z-10">
      <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase block mb-4 font-serif">Newsletter</span>
      <h2 class="text-2xl md:text-3xl font-light tracking-[0.1em] mb-4 text-stone-900 font-serif">加入 Shizuku 時尚會員計劃</h2>
      <p class="text-stone-600 text-xs md:text-sm leading-relaxed tracking-wider mb-8 font-light font-serif">
        訂閱我們的電子報，搶先獲得全新企劃商品上市消息、會員專屬折扣與穿搭提案。
      </p>

      <!-- 訂閱表單 -->
      <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          v-model="email"
          type="email"
          placeholder="請輸入您的 Email 地址"
          class="flex-1 bg-white border border-stone-250/60 focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] rounded-full px-6 py-3.5 text-xs text-stone-800 placeholder-stone-400 outline-none transition-all font-sans"
          required
          :disabled="subscribeStatus === 'success'"
        />
        <button
          type="submit"
          class="bg-stone-800 hover:bg-[#8E9A86] active:bg-[#7D8876] text-white text-xs font-medium tracking-widest uppercase rounded-full px-8 py-3.5 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 font-serif"
          :disabled="subscribeStatus === 'submitting' || subscribeStatus === 'success'"
        >
          <span v-if="subscribeStatus === 'submitting'">處理中...</span>
          <span v-else-if="subscribeStatus === 'success'">已成功訂閱</span>
          <span v-else>訂閱最新企劃</span>
        </button>
      </form>

      <p v-if="subscribeStatus === 'success'" class="text-[#8E9A86] text-xs mt-4 animate-fade-in font-medium font-serif">
        感謝您的訂閱！我們已將迎新優惠代碼發送至您的信箱。
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('');
const subscribeStatus = ref('');

const handleSubscribe = () => {
  if (!email.value) return;
  subscribeStatus.value = 'submitting';
  setTimeout(() => {
    subscribeStatus.value = 'success';
    email.value = '';
  }, 1000);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}

/* 簡單的動畫效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
