<script setup>
// 未來搜尋的邏輯會寫在這裡
</script>

  <!-- 常見問題搜尋內容 -->

<template>
  <div class="mb-16 font-serif">
    <h1 class="text-2xl text-center font-medium text-stone-850 mb-8 tracking-[0.12em]">有什麼我們能為您服務的嗎？</h1>
    
    <div class="flex max-w-2xl mx-auto border border-stone-200/50 bg-[#FAF8F5]/80 backdrop-blur-md rounded-full p-1 pl-3 shadow-xs items-center">
      <input 
        type="text" 
        placeholder="搜尋關鍵字..." 
        class="flex-grow py-2.5 px-3 text-stone-700 focus:outline-none bg-transparent placeholder-stone-400 text-sm font-serif"
      />
      <button class="bg-[#8E9A86] hover:bg-[#7D8876] text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer mr-0.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

