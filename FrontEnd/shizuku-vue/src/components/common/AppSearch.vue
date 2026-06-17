<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const isOpen = ref(false)
const searchContainer = ref(null)

const quickSearches = [
  { name: '洋裝', keyword: '洋裝' },
  { name: '上身', keyword: '上身' },
  { name: '下身', keyword: '下身' },
]

const handleSearch = () => {
  const queryVal = keyword.value.trim()
  router.push({ path: '/all', query: queryVal ? { keyword: queryVal } : {} })
  isOpen.value = false
  keyword.value = '' // 送出後重設搜尋框
}

const triggerQuickSearch = (kw) => {
  router.push({ path: '/all', query: { keyword: kw } })
  isOpen.value = false
  keyword.value = ''
}

// 點擊外部自動收合選單
const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="searchContainer" class="relative inline-block font-serif">
    <!-- 搜尋放大鏡觸發按鈕 -->
    <button
      class="flex items-center gap-1 hover:text-[#8E9A86] transition-colors cursor-pointer"
      @click="isOpen = !isOpen"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
    </button>

    <!-- 搜尋下拉面板 -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-3 w-80 bg-[#FCFBF9]/95 backdrop-blur-md border border-stone-200/50 shadow-xl rounded-2xl p-4.5 z-50 font-serif animate-fade-in"
    >
      <!-- 上方搜尋輸入框 -->
      <div class="relative flex items-center mb-3">
        <svg
          class="absolute left-3.5 w-4 h-4 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜尋商品..."
          class="w-full pl-10 pr-8 py-2 text-sm bg-white/80 border border-stone-200/60 rounded-full focus:outline-none focus:ring-1 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] text-stone-800 placeholder-stone-400 transition-colors font-serif"
          @keyup.enter="handleSearch"
        />
        <!-- 清除按鈕 -->
        <button
          v-if="keyword"
          @click="keyword = ''"
          class="absolute right-3.5 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- 下方熱門大分類快速鍵 -->
      <div class="pt-3 border-t border-stone-200/40">
        <div class="px-1 text-[11px] font-medium text-stone-400 mb-2 tracking-wider">熱門搜尋</div>
        <div class="flex flex-wrap gap-2 px-1">
          <button
            v-for="item in quickSearches"
            :key="item.name"
            @click="triggerQuickSearch(item.keyword)"
            class="px-3.5 py-1.5 text-[11px] bg-white/80 border border-stone-200/40 hover:bg-[#8E9A86]/10 hover:text-[#8E9A86] hover:border-[#8E9A86]/35 text-stone-650 rounded-full transition-all duration-200 cursor-pointer font-serif"
          >
            {{ item.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
