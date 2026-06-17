<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { productApi } from '@/api/Product.js'
import { useProductCart } from '@/composables/useProductCart'

const relatedProducts = ref([])
const route = useRoute()
const product = ref(null)
const variants = ref([])
// const relatedProducts = ref([
//   { fId: 1, fName: '日系透膚輕薄針織衫', fPrice: 1280, fImage: null },
//   { fId: 2, fName: '法式復古碎花無袖洋裝', fPrice: 1880, fImage: null },
//   { fId: 3, fName: '簡約純棉V領休閒上衣', fPrice: 890, fImage: null },
//   { fId: 4, fName: '挺版牛津襯衫 天藍色', fPrice: 1580, fImage: null },
//   { fId: 5, fName: '寬版連帽上衣 墨綠色', fPrice: 1880, fImage: null },
//   { fId: 6, fName: '丹寧牛仔外套 水洗藍', fPrice: 890, fImage: null },
// ])
const isLoading = ref(true)

import { getImageUrl } from '@/utils/imageHelper'
const productImages = ref([])

const placeholderImages = [
  'https://placehold.co/800x800/d5e6f3/333/png?text=800*800',
  'https://placehold.co/800x800/d5e6f3/333/png?text=800*800',
  'https://placehold.co/800x800/d5e6f3/333/png?text=800*800',
]

const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)
const openSection = ref('description')

// 使用 composable 管理購物車與庫存狀態
const { currentStock, handleAddToCart } = useProductCart(
  product,
  variants,
  selectedColor,
  selectedSize,
  quantity,
)

const currentPrice = computed(() => {
  if (!selectedColor.value || !selectedSize.value) {
    return product.value?.fMinPrice ?? product.value?.fPrice
  }
  const variant = variants.value.find(
    (v) => v.fColor === selectedColor.value && v.fSize === selectedSize.value,
  )
  return variant?.fPrice ?? product.value?.fPrice
})

const toggleSection = (section) => {
  openSection.value = openSection.value === section ? null : section
}

const availableColors = computed(() => {
  const colors = []
  const seen = new Set()
  variants.value.forEach((v) => {
    if (!seen.has(v.fColor)) {
      seen.add(v.fColor)
      colors.push(v.fColor)
    }
  })
  return colors
})

const availableSizes = computed(() => {
  return variants.value.filter((v) => v.fColor === selectedColor.value).map((v) => v.fSize)
})

function selectColor(color) {
  selectedColor.value = color
  const firstSize = variants.value.filter((v) => v.fColor === color).map((v) => v.fSize)[0]
  selectedSize.value = firstSize ?? ''
}

onMounted(async () => {
  try {
    isLoading.value = true
    const id = route.params.id

    // Promise.all同步獲取商品資料、規格與圖片
    const [productRes, variantRes, imagesRes, relatedRes] = await Promise.all([
      productApi.getById(id),
      productApi.getVariants(id),
      productApi.getImages(id),
      productApi.getRelated(id),
    ])

    relatedProducts.value = relatedRes.data.data ?? []
    product.value = productRes.data.data
    variants.value = variantRes.data.data ?? []
    productImages.value = (imagesRes.data.data ?? []).map((img) =>
      getImageUrl(img)
    )
    // 自動預設選取第一個顏色與尺寸
    if (availableColors.value.length > 0) {
      selectedColor.value = availableColors.value[0]
      const firstSize = variants.value
        .filter((v) => v.fColor === selectedColor.value)
        .map((v) => v.fSize)[0]

      if (firstSize) selectedSize.value = firstSize
    }
  } catch (err) {
    console.error('商品載入失敗', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="isLoading" class="pt-32 text-center text-stone-400 font-serif tracking-widest">載入中...</div>

  <div v-else-if="product" class="pt-32 pb-20 bg-[#FCFBF9] text-stone-850 font-serif">
    <div class="max-w-[1300px] mx-auto px-6">
      <div class="flex flex-col md:flex-row gap-16 items-start">
        <!-- 左側多張圖片 -->
        <div class="flex-1 space-y-2">
          <template v-if="productImages.length > 0">
            <div v-for="(img, index) in productImages" :key="index">
              <img :src="img" :alt="product.fName" class="w-full h-auto object-cover" />
            </div>
          </template>
          <template v-else>
            <div v-for="(img, index) in placeholderImages" :key="index">
              <img :src="img" :alt="product.fName" class="w-full h-auto object-cover" />
            </div>
          </template>
        </div>

        <!-- 右側資訊 -->
        <div
          class="md:w-[360px] shrink-0 sticky top-32 max-h-[calc(100vh-96px)] overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div class="space-y-1.5 text-left">
            <h1 class="text-xl font-normal text-gray-800 leading-snug">
              {{ product.fName }}
            </h1>
            <div class="flex justify-between items-center text-xs text-gray-400 pt-1">
              <span>商品編號 {{ product.fProduct }}</span>
            </div>
          </div>

          <div class="text-left py-2 border-t border-gray-100">
            <p class="text-3xl font-bold text-gray-900 mt-1">
              NT$ {{ currentPrice?.toLocaleString() }}
            </p>
          </div>

          <div class="space-y-5 text-left text-sm">
            <!-- 顏色選擇 -->
            <div class="flex items-start gap-3">
              <span class="w-10 shrink-0 pt-1 text-gray-500">顏色</span>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="color in availableColors"
                  :key="color"
                  @click="selectColor(color)"
                  :class="[
                    'px-3 h-7 border text-xs font-medium tracking-wider transition-colors',
                    selectedColor === color
                      ? 'border-[#8E9A86] bg-[#8E9A86] text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-[#8E9A86]/55',
                  ]"
                >
                  {{ color }}
                </button>
              </div>
            </div>

            <!-- 尺寸選擇 -->
            <div class="flex items-start gap-3">
              <span class="w-10 shrink-0 pt-1 text-gray-500">尺寸</span>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="size in availableSizes"
                  :key="size"
                  @click="selectedSize = size"
                  :class="[
                    'w-12 h-7 border text-xs font-medium tracking-wider transition-colors',
                    selectedSize === size
                      ? 'border-[#8E9A86] bg-[#8E9A86] text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-[#8E9A86]/55',
                  ]"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- 庫存顯示 -->
            <div v-if="selectedColor && selectedSize" class="text-xs text-gray-400">
              <span v-if="currentStock > 0">庫存：{{ currentStock }} 件</span>
              <span v-else class="text-red-400">此規格已售完</span>
            </div>
          </div>

          <!-- 數量 + 加入購物車 -->
          <div class="pt-6 border-t border-gray-100 space-y-4">
            <div class="flex items-center gap-3">
              <span class="w-12 text-stone-500 text-sm">數量</span>
              <div class="flex items-center border border-stone-200 rounded-full overflow-hidden bg-white h-10">
                <button
                  @click="quantity > 1 ? quantity-- : null"
                  class="w-10 h-full text-stone-400 hover:text-stone-700"
                >
                  -
                </button>
                <input
                  type="number"
                  v-model="quantity"
                  class="w-12 h-full text-center text-sm font-bold outline-none"
                />
                <button
                  @click="quantity < currentStock ? quantity++ : null"
                  class="w-10 h-full text-stone-400 hover:text-stone-700"
                >
                  +
                </button>
              </div>
            </div>
            
            <button
              @click="handleAddToCart"
              :disabled="!selectedColor || !selectedSize || currentStock === 0"
              class="w-full bg-[#8E9A86] hover:bg-[#7D8A75] text-white h-11 text-sm font-bold tracking-[0.3em] uppercase rounded-full shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ currentStock === 0 ? '已售完' : '加入購物車' }}
            </button>
          </div>

          <!-- 手風琴區塊 -->
          <div class="pt-6 border-t border-gray-100">
            <!-- 尺寸表 -->
            <div class="border-b border-gray-100">
              <div
                @click="toggleSection('size')"
                class="flex justify-between items-center cursor-pointer hover:text-black py-2 text-sm"
              >
                <span class="font-medium">尺寸表</span>
                <span class="text-lg">{{ openSection === 'size' ? '−' : '+' }}</span>
              </div>
              <div v-show="openSection === 'size'" class="pb-4 text-xs text-gray-500">
                <table class="w-full text-center border-collapse">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="border border-gray-200 py-2 px-3">尺寸</th>
                      <th class="border border-gray-200 py-2 px-3">胸寬</th>
                      <th class="border border-gray-200 py-2 px-3">衣長</th>
                      <th class="border border-gray-200 py-2 px-3">肩寬</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, i) in [
                        { size: 'S', chest: 46, length: 62, shoulder: 37 },
                        { size: 'M', chest: 48, length: 63, shoulder: 38 },
                        { size: 'L', chest: 50, length: 64, shoulder: 39 },
                        { size: 'XL', chest: 52, length: 65, shoulder: 40 },
                        { size: 'F', chest: 50, length: 63, shoulder: 38 },
                      ]"
                      :key="row.size"
                      :class="i % 2 === 1 ? 'bg-gray-50' : ''"
                    >
                      <td class="border border-gray-200 py-2 px-3">{{ row.size }}</td>
                      <td class="border border-gray-200 py-2 px-3">{{ row.chest }}</td>
                      <td class="border border-gray-200 py-2 px-3">{{ row.length }}</td>
                      <td class="border border-gray-200 py-2 px-3">{{ row.shoulder }}</td>
                    </tr>
                  </tbody>
                </table>
                <p class="text-[10px] text-gray-400 mt-3">
                  ※ 由於生產過程不同，可能會有 1-2cm 的誤差。
                </p>
              </div>
            </div>
            <!-- 商品說明 -->
            <div class="border-b border-gray-100">
              <div
                @click="toggleSection('description')"
                class="flex justify-between items-center cursor-pointer hover:text-black py-2 text-sm"
              >
                <span class="font-medium">商品說明</span>
                <span class="text-lg">{{ openSection === 'description' ? '−' : '+' }}</span>
              </div>
              <div
                v-show="openSection === 'description'"
                class="pb-4 text-xs text-gray-500 leading-relaxed"
              >
                <p>{{ product.fDescription ?? '暫無商品說明' }}</p>
              </div>
            </div>

            <!-- Model 資訊 -->
            <div class="border-b border-gray-100">
              <div
                @click="toggleSection('model')"
                class="flex justify-between items-center cursor-pointer hover:text-black py-2 text-sm"
              >
                <span class="font-medium">Model 資訊</span>
                <span class="text-lg">{{ openSection === 'model' ? '−' : '+' }}</span>
              </div>
              <div v-show="openSection === 'model'" class="pb-4 text-xs text-gray-500 space-y-1">
                <p>身高：162 cm</p>
                <p>體重：45 kg</p>
                <p>胸圍：78 cm</p>
                <p>腰圍：60 cm</p>
                <p>臀圍：85 cm</p>
                <p>穿著尺寸：M</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 相關商品 -->
      <div class="mt-32 border-t border-stone-200/50 pt-16 pb-32">
        <div class="text-center mb-12">
          <h2 class="text-stone-500 tracking-[0.25em] text-sm font-light font-serif">\ 我想妳應該會喜歡 /</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10">
          <RouterLink
            v-for="item in relatedProducts"
            :key="item.fId"
            :to="'/product/' + item.fId"
            class="group cursor-pointer block"
          >
            <div class="aspect-[3/4] overflow-hidden bg-[#FAF8F5] rounded-2xl border border-stone-200/30 mb-3 transition-all duration-500">
              <img
                :src="getImageUrl(item.fImage)"
                :alt="item.fName"
                class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
            </div>
            <div class="px-1 text-center">
              <h3 class="text-xs text-stone-600 font-medium line-clamp-1 leading-relaxed group-hover:text-[#8E9A86] transition-colors font-serif">
                {{ item.fName }}
              </h3>
              <p class="text-xs font-semibold text-stone-850 tracking-wider font-serif mt-1">
                NT$ {{ (item.fMinPrice ?? item.fPrice)?.toLocaleString() }}
              </p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="pt-32 text-center text-gray-400">找不到此商品</div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
