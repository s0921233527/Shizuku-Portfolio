<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { productApi } from '@/api/Product.js'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  categoryId: {
    type: Number,
    default: null,
  },
})

import { getImageUrl } from '@/utils/imageHelper'
const products = ref([])
const isLoading = ref(true)
const keyword = ref('')
const sortOrder = ref('latest')

const sortedProducts = computed(() => {
  const list = [...(products.value ?? [])]
  if (sortOrder.value === 'priceAsc') return list.sort((a, b) => a.fMinPrice - b.fMinPrice)
  if (sortOrder.value === 'priceDesc') return list.sort((a, b) => b.fMinPrice - a.fMinPrice)
  if (sortOrder.value === 'hot') return list.sort((a, b) => b.fId - a.fId)
  return list
})

//做分頁12/頁
const currentPage = ref(1)
const pageSize = 12

const totalCount = computed(() => sortedProducts.value.length)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedProducts.value.slice(start, start + pageSize)
})
// 排序或分類變更時回到第一頁
watch(sortOrder, () => {
  currentPage.value = 1
})
watch(
  () => props.categoryId,
  () => {
    currentPage.value = 1
  },
)

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 取得目前有效的分類 ID（props 優先，其次才是網址）
function getActiveCategoryId() {
  // props 有明確設定（包含 null）就用 props
  if (props.categoryId !== undefined) return props.categoryId

  const fromRoute = route.query.categoryId
  if (fromRoute) return Number(fromRoute)

  return null
}

async function fetchProducts() {
  try {
    isLoading.value = true
    const categoryId = getActiveCategoryId()
    const res = await productApi.getList(keyword.value, categoryId)
    products.value = res.data.data ?? []
  } catch (err) {
    console.error('商品載入失敗', err)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

// 監聽網址的 keyword 變化
watch(
  () => route.query.keyword,
  (newVal) => {
    keyword.value = newVal || ''
    fetchProducts()
  },
)

// 監聽 props 的 categoryId 變化（Sidebar 點擊）
watch(
  () => props.categoryId,
  () => {
    fetchProducts()
  },
)

onMounted(() => {
  if (route.query.keyword) {
    keyword.value = route.query.keyword
  }
  fetchProducts()
})
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 py-8 text-center font-serif bg-transparent">
    <!-- 工具列：項目計數與排序 -->
    <div
      class="max-w-[1400px] mx-auto px-4 mb-10 flex justify-between items-center text-sm border-b border-stone-200/50 pb-5"
    >
      <span class="text-stone-500 tracking-wider">顯示 {{ sortedProducts.length }} 個項目</span>
      <select
        v-model="sortOrder"
        class="outline-none bg-white cursor-pointer text-xs border border-stone-200/80 rounded-xl px-4 py-2 text-stone-700 tracking-wider focus:border-[#8E9A86] transition-colors"
      >
        <option value="latest">依最新項目排序</option>
        <option value="hot">依熱銷度</option>
        <option value="priceAsc">依價格排序：低至高</option>
        <option value="priceDesc">依價格排序：高至低</option>
      </select>
    </div>

    <!-- 商品列表區塊 -->
    <div class="flex-1 min-w-0 relative">
      <!-- 載入中遮罩（切換分類時保持商品可見，但呈現半透明，避免高度塌陷與閃爍） -->
      <div
        v-if="isLoading && products.length > 0"
        class="absolute inset-0 bg-[#FCFBF9]/40 backdrop-blur-[1px] z-10 flex justify-center"
      >
        <div class="text-stone-400 tracking-widest h-fit pt-20">載入中...</div>
      </div>

      <!-- 初次載入且無商品時顯示的載入狀態 -->
      <div v-if="isLoading && products.length === 0" class="text-stone-400 py-20 tracking-widest">
        載入中...
      </div>

      <!-- 商品列表與無商品提示 -->
      <template v-else>
        <div v-if="products.length === 0" class="text-stone-400 py-20 tracking-widest">
          暫無商品
        </div>

        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 transition-opacity duration-300"
          :class="{ 'opacity-40 pointer-events-none': isLoading }"
        >
          <div v-for="product in pagedProducts" :key="product.fId" class="group cursor-pointer block">
            <RouterLink :to="'/product/' + product.fId" class="block">
              <!-- 商品圖片：極簡微圓角與自然光影 -->
              <div class="relative overflow-hidden mb-5 bg-[#FAF8F5] aspect-[3/4] rounded-2xl border border-stone-200/30 transition-all duration-500">
                <!-- 標記 (Badges) -->
                <div class="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
                  <span
                    class="px-3 py-0.5 text-[9px] tracking-[0.2em] font-medium text-white bg-stone-500 rounded-full shadow-xs select-none uppercase font-serif"
                  >
                    NEW
                  </span>
                </div>
                <img
                  :src="getImageUrl(product.fImage)"
                  :alt="product.fName"
                  class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                />

                <!-- 滑入顯示細節按鈕 -->
                <div
                  class="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                >
                  <span class="px-6 py-2.5 bg-[#FCFBF9]/95 text-[#8E9A86] border border-[#8E9A86]/30 text-xs tracking-[0.25em] rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 font-medium font-serif">
                    詳細資訊
                  </span>
                </div>
              </div>

              <!-- 商品名稱 -->
              <h3 class="text-sm text-stone-600 mb-1.5 tracking-wide truncate group-hover:text-[#8E9A86] transition-colors font-serif text-center px-1">
                {{ product.fName }}
              </h3>

              <!-- 商品價格 -->
              <p class="text-sm font-medium text-stone-850 tracking-wider font-serif text-center">
                NT$ {{ (product.fMinPrice ?? product.fPrice).toLocaleString() }}
              </p>
            </RouterLink>

            <!-- 操作按鈕 -->
            <button
              @click="$router.push('/product/' + product.fId)"
              class="mt-4 w-full border border-stone-200/85 hover:border-[#8E9A86]/50 rounded-full py-2 flex items-center justify-center gap-2 hover:bg-[#8E9A86]/5 text-stone-650 hover:text-[#8E9A86] transition-all duration-300 shadow-xs"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span class="text-[11px] tracking-widest font-bold font-serif">查看商品</span>
            </button>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 分頁列 -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-16 font-serif">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-9 h-9 flex items-center justify-center border border-stone-200/60 text-stone-400 hover:border-[#8E9A86] hover:text-[#8E9A86] hover:bg-[#8E9A86]/5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-stone-400 disabled:hover:border-stone-200/60 transition-all cursor-pointer disabled:cursor-not-allowed"
        aria-label="上一頁"
      >
        ‹
      </button>

      <template v-for="page in totalPages" :key="page">
        <button
          v-if="
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          "
          @click="changePage(page)"
          :class="[
            'w-9 h-9 flex items-center justify-center border text-sm transition-all',
            currentPage === page
              ? 'bg-[#8E9A86] text-white border-[#8E9A86] rounded-full font-medium scale-105 cursor-default'
              : 'border-stone-200/60 text-stone-500 hover:border-[#8E9A86] hover:text-[#8E9A86] hover:bg-[#8E9A86]/5 rounded-full cursor-pointer',
          ]"
        >
          {{ page }}
        </button>
        <span
          v-else-if="page === currentPage - 2 || page === currentPage + 2"
          class="text-stone-300 text-sm px-1"
          >...</span
        >
      </template>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-9 h-9 flex items-center justify-center border border-stone-200/60 text-stone-400 hover:border-[#8E9A86] hover:text-[#8E9A86] hover:bg-[#8E9A86]/5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-stone-400 disabled:hover:border-stone-200/60 transition-all cursor-pointer disabled:cursor-not-allowed"
        aria-label="下一頁"
      >
        ›
      </button>
    </div>

    <!-- 顯示目前頁數 -->
    <p class="text-xs text-stone-400 text-center mt-5 font-serif tracking-wider">
      第 {{ currentPage }} 頁，共 {{ totalPages }} 頁（{{ totalCount }} 件商品）
    </p>
  </div>
</template>
