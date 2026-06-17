<script setup>
import { ref, onMounted } from 'vue'
import { getTopProductsAPI } from '@/api/order.js'
import { getImageUrl } from '@/utils/imageHelper'

// 預設靜態商品資料 (作為 API 讀取中、無數據或讀取失敗時的備用資料)
const fallbackProducts = [
  { productId: 1, productName: '日系透膚輕薄針織衫', price: 1280, imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800', isHot: true, isNew: false },
  { productId: 2, productName: '高腰顯瘦垂墜寬褲', price: 1580, imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800', isHot: false, isNew: true },
  { productId: 3, productName: '法式復古碎花無袖洋裝', price: 1880, imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800', isHot: true, isNew: false },
  { productId: 4, productName: '簡約純棉V領休閒上衣', price: 890, imageUrl: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800', isHot: false, isNew: true },
  { productId: 5, productName: '落肩純棉短T (淺米色)', price: 1280, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop', isHot: false, isNew: false },
  { productId: 6, productName: '挺版牛津襯衫 (天藍色)', price: 1580, imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop', isHot: false, isNew: false },
  { productId: 7, productName: '寬版連帽上衣 (墨綠色)', price: 1880, imageUrl: 'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?q=80&w=600&auto=format&fit=crop', isHot: false, isNew: false },
  { productId: 8, productName: '丹寧牛仔外套 (水洗藍)', price: 890, imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=600&auto=format&fit=crop', isHot: false, isNew: false },
]

const products = ref([])
const isLoading = ref(true)

const fetchTopProducts = async () => {
  try {
    isLoading.value = true
    const res = await getTopProductsAPI()
    if (res.success && res.data && res.data.length > 0) {
      products.value = res.data
    } else {
      products.value = fallbackProducts
    }
  } catch (error) {
    console.error('取得熱銷商品失敗:', error)
    products.value = fallbackProducts
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTopProducts()
})
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-24 bg-transparent">
    <!-- 日系雅緻都會標題區 -->
    <div class="flex flex-col items-center mb-16 text-center">
      <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] font-serif uppercase">Top Recommendations</span>
      <h2 class="text-2xl md:text-3xl font-light tracking-[0.2em] text-stone-850 font-serif mt-2">熱銷排行推薦</h2>
      <div class="w-8 h-[1px] bg-[#8E9A86] mt-4"></div>
    </div>

    <!-- 載入中骨架畫面 (Skeleton) -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
      <div v-for="n in 8" :key="n" class="animate-pulse">
        <div class="bg-stone-200/50 aspect-[3/4] mb-4 rounded-2xl"></div>
        <div class="h-4 bg-stone-200/50 rounded w-3/4 mx-auto mb-2.5"></div>
        <div class="h-4 bg-stone-200/50 rounded w-1/4 mx-auto"></div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
      <RouterLink
        v-for="item in products"
        :key="item.productId"
        :to="'/product/' + item.productId"
        class="group cursor-pointer block transition-all duration-300"
      >
        <!-- 圖片容器：極簡微圓角與自然光影 -->
        <div class="relative overflow-hidden mb-5 bg-[#FAF8F5] aspect-[3/4] rounded-2xl border border-stone-200/30 transition-all duration-500">
          <!-- 標記 (Badges) -->
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
            <span
              v-if="item.isHot"
              class="px-3 py-0.5 text-[9px] tracking-[0.2em] font-medium text-white bg-[#8E9A86] rounded-full shadow-xs select-none uppercase font-serif"
            >
              HOT
            </span>
            <span
              v-if="item.isNew"
              class="px-3 py-0.5 text-[9px] tracking-[0.2em] font-medium text-white bg-stone-500 rounded-full shadow-xs select-none uppercase font-serif"
            >
              NEW
            </span>
          </div>

          <!-- 商品圖片 -->
          <img
            :src="getImageUrl(item.imageUrl)"
            :alt="item.productName"
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
          />

          <!-- 滑入顯示細節按鈕：暖白磨砂感與灰綠文字 -->
          <div
            class="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <span class="px-6 py-2.5 bg-[#FCFBF9]/95 text-[#8E9A86] border border-[#8E9A86]/30 text-xs tracking-[0.25em] rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 font-medium font-serif hover:bg-[#8E9A86] hover:text-white hover:border-[#8E9A86]">
              詳細資訊
            </span>
          </div>
        </div>

        <!-- 資訊區：置中排版 -->
        <div class="text-center px-2">
          <h3 class="text-sm text-stone-600 mb-1.5 tracking-wide truncate group-hover:text-[#8E9A86] transition-colors font-serif">
            {{ item.productName }}
          </h3>
          <p class="text-sm font-medium text-stone-850 tracking-wider font-serif">
            NT$ {{ Number(item.price).toLocaleString() }}
          </p>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
