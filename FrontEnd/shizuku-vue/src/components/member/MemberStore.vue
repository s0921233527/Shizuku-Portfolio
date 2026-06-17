<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

// 假資料：使用者目前的點數
const userPoints = ref('0')

const authStore = useAuthStore()

userPoints.value = authStore.userPoints.toLocaleString();


// 假資料：8個 Shizuku 品牌專屬點數商品
const pointsProducts = ref([
    {
        id: 1,
        name: 'Shizuku 霧黑雙層不鏽鋼隨行杯',
        points: 12000,
        originalPrice: 580,
        image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 2,
        name: 'Shizuku 刺繡 LOGO 水洗棉質老帽',
        points: 10000,
        originalPrice: 450,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 3,
        name: 'Shizuku 日系職人手工陶瓷咖啡濾夾組',
        points: 18000,
        originalPrice: 850,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 4,
        name: 'Shizuku 經典極簡亞麻重磅帆布袋',
        points: 8000,
        originalPrice: 350,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 5,
        name: 'Shizuku 靜謐森林 品牌香氛蠟燭',
        points: 15000,
        originalPrice: 680,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 6,
        name: 'Shizuku 經典刺繡雙條紋純棉長襪 (二入組)',
        points: 5000,
        originalPrice: 220,
        image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=500&q=80'
    }
])
</script>

<template>
    <div class="min-h-screen bg-[#FCFBF9] text-stone-850 pb-24 pt-24 select-none font-serif">
        <!-- 點數商城雅緻標題 -->
        <div class="text-center py-16">
            <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] font-serif uppercase">Points Mall</span>
            <h1 class="text-2xl md:text-3xl font-light tracking-[0.25em] text-stone-800 font-serif mt-2">點數兌換專區</h1>
            <div class="w-8 h-[1px] bg-[#8E9A86] mx-auto mt-4"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- 點數資訊卡片：暖砂色背景與大圓角 -->
            <div
                class="border border-stone-200/60 rounded-2xl p-6 mb-16 max-w-md mx-auto bg-[#FAF8F5] flex justify-between items-center shadow-xs">
                <div>
                    <p class="text-xs text-stone-500 tracking-wider mb-1 font-serif">您的可用點數</p>
                    <p class="text-2xl font-bold tracking-wide text-[#8E9A86] font-serif">
                        {{ userPoints.toLocaleString() }} <span class="text-xs font-normal text-stone-500">P</span>
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] text-stone-400 tracking-wide font-serif">將於 2026/12/31 到期</p>
                </div>
            </div>

            <!-- 商品網格 -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
                <div v-for="product in pointsProducts" :key="product.id" class="group cursor-pointer block">
                    <!-- 圖片容器：極簡微圓角與自然光影 -->
                    <div class="relative overflow-hidden mb-5 bg-[#FAF8F5] aspect-[3/4] rounded-2xl border border-stone-200/30 transition-all duration-500">
                        <img :src="product.image" :alt="product.name"
                            class="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103" />
                        
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
                    <h3
                        class="text-sm text-stone-600 mb-1.5 tracking-wide truncate group-hover:text-[#8E9A86] transition-colors font-serif text-center px-1">
                        {{ product.name }}
                    </h3>

                    <!-- 點數資訊 -->
                    <div class="text-center font-serif">
                        <span class="text-sm font-semibold tracking-wider text-[#8E9A86]">
                            {{ product.points.toLocaleString() }} P
                        </span>
                        <span class="text-[10px] text-stone-400 line-through ml-2 tracking-wider">
                            原價 NT$ {{ product.originalPrice }}
                        </span>
                    </div>

                    <!-- 兌換按鈕 -->
                    <div class="mt-4 text-center">
                        <button
                            class="text-[11px] tracking-widest border border-stone-200/85 hover:border-[#8E9A86]/50 rounded-full px-5 py-2 hover:bg-[#8E9A86]/5 text-stone-650 hover:text-[#8E9A86] transition-all duration-300 shadow-xs font-bold font-serif">
                            立即兌換
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 保持乾淨俐落的日系極簡風 */
</style>