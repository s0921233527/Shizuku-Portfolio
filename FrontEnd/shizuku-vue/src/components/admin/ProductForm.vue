<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/Product.js'

const batchVariantPrice = ref('')
const batchVariantStock = ref('')

const photoFiles = ref([]) // 新上傳的檔案
const photoPreviews = ref([]) // 預覽 URL（包含已有的）

const router = useRouter()

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
const baseUrl = apiBase.replace(/\/api$/, '')

const props = defineProps({
  productId: { type: Number, default: null },
  isEdit: { type: Boolean, default: false },
})

// ── 基本資料 ──
const form = ref({
  fName: '',
  fCategoryId: null,
  fDescription: '',
  fStatus: 3,
})

// ── 規格列表 ──
const variants = ref([])

// ── 下拉選單資料 ──
const categories = ref([])
const colors = ref([])
const sizes = ref([])

// ── 規格摘要（computed）──
const totalStock = computed(() => variants.value.reduce((a, v) => a + (Number(v.fStock) || 0), 0))
const priceRange = computed(() => {
  const prices = variants.value.map((v) => Number(v.fPrice)).filter((p) => p > 0)
  if (prices.length === 0)
    return form.value.fPrice ? `NT$${Number(form.value.fPrice).toLocaleString()}` : '—'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max
    ? `NT$${min.toLocaleString()}`
    : `NT$${min.toLocaleString()} - NT$${max.toLocaleString()}`
})

const mainPhotoFile = ref(null)
const mainPhotoPreview = ref(null)

function onMainPhotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  mainPhotoFile.value = file
  mainPhotoPreview.value = URL.createObjectURL(file)
  e.target.value = ''
}

// 批次編輯價格與數量
function applyBatchVariant() {
  variants.value = variants.value.map((v) => ({
    ...v,
    ...(batchVariantPrice.value ? { fPrice: Number(batchVariantPrice.value) } : {}),
    ...(batchVariantStock.value ? { fStock: Number(batchVariantStock.value) } : {}),
  }))
}

// 圖片上傳
function onPhotoChange(e) {
  const files = Array.from(e.target.files)
  const remaining = 9 - photoPreviews.value.length
  const newFiles = files.slice(0, remaining)

  newFiles.forEach((file) => {
    // 這裡可以加入你之前的格式與大小檢核
    photoFiles.value.push(file)
    photoPreviews.value.push({
      url: URL.createObjectURL(file),
      isNew: true,
    })
  })
  e.target.value = ''
}

// 刪除圖片
function removePhoto(index) {
  const photo = photoPreviews.value[index]
  if (photo.isNew) {
    const newIndex = photoPreviews.value.slice(0, index).filter((p) => p.isNew).length
    photoFiles.value.splice(newIndex, 1)
  }
  photoPreviews.value.splice(index, 1)
}

// ── 新增一列規格 ──
function addVariant() {
  variants.value.push({
    fColorId: colors.value[0]?.fId ?? null,
    fSizeId: sizes.value[0]?.fId ?? null,
    fStock: 0,
    fPrice: form.value.fPrice ?? 0,
  })
}

// ── 刪除規格 ──
function removeVariant(index) {
  variants.value.splice(index, 1)
}

// ── 載入下拉選單資料 ──
async function loadDropdowns() {
  const res = await productApi.getDropdowns()
  const data = res.data.data
  categories.value = data.categories ?? []
  colors.value = data.colors ?? []
  sizes.value = data.sizes ?? []
}

// ── 編輯模式：載入現有資料 ──
async function loadProduct() {
  if (!props.isEdit || !props.productId) return

  const [productRes, variantRes, imagesRes] = await Promise.all([
    productApi.getById(props.productId),
    productApi.getVariants(props.productId),
    productApi.getImages(props.productId),
  ])

  const p = productRes.data.data
  form.value = {
    fName: p.fName,
    fCategoryId: p.fCategoryId,
    fDescription: p.fDescription,
    fStatus: p.fStatus,
  }

  if (p.fImage) {
    mainPhotoPreview.value = baseUrl + p.fImage
  }

  const allImages = imagesRes.data.data ?? []
  photoPreviews.value = allImages.map((img) => ({
    url: baseUrl + img,
    isNew: false,
  }))

  variants.value = (variantRes.data.data ?? []).map((v) => {
    const colorId = colors.value.find((c) => c.fName === v.fColor)?.fId ?? null
    const sizeId = sizes.value.find((s) => s.fName === v.fSize)?.fId ?? null
    return {
      fId: v.fId,
      fColorId: colorId,
      fSizeId: sizeId,
      fStock: v.fStock,
      fPrice: v.fPrice ?? 0,
    }
  })
}

onMounted(async () => {
  await loadDropdowns()
  await loadProduct()
  if (!props.isEdit) addVariant()
})

async function save() {
  console.log('save 被呼叫！') // ← 第一行，最上面
  console.log('form：', form.value)
  console.log('variants：', variants.value)
  if (!form.value.fName) {
    alert('請填寫商品名稱')
    return
  }
  if (!form.value.fCategoryId) {
    alert('請選擇分類')
    return
  }
  if (variants.value.some((v) => !v.fPrice || v.fPrice <= 0)) {
    alert('請填寫所有規格的售價')
    return
  }
  const minPrice = Math.min(...variants.value.map((v) => Number(v.fPrice)))

  try {
    // 更新基本資料
    if (props.isEdit) {
      const productRes = await productApi.getById(props.productId)
      const currentProduct = productRes.data.data
      const existingVariants = variants.value.filter((v) => v.fId)
      const newVariants = variants.value.filter((v) => !v.fId)
      await productApi.update(props.productId, {
        fId: props.productId,
        fName: form.value.fName,
        fProduct: currentProduct.fProduct,
        fPrice: minPrice,
        fStatus: form.value.fStatus,
        fCategoryId: form.value.fCategoryId,
        fDescription: form.value.fDescription,
      })
      if (existingVariants.length > 0) {
        await productApi.updateVariants(
          props.productId,
          variants.value.map((v) => ({
            fId: v.fId,
            fStock: Number(v.fStock),
            fPrice: Number(v.fPrice),
          })),
        )
      }
      //新增新規格
      if (newVariants.length > 0) {
        await productApi.addVariants(
          props.productId,
          newVariants.map((v) => ({
            fColorId: v.fColorId,
            fSizeId: v.fSizeId,
            fStock: Number(v.fStock),
            fPrice: Number(v.fPrice),
          })),
        )
      }
      //上傳新主圖(有換才上傳)
      if (mainPhotoFile.value) {
        await productApi.uploadImage(props.productId, mainPhotoFile.value)
      }
      //上傳新增其他圖片
      for (const file of photoFiles.value) {
        await productApi.uploadImageExtra(props.productId, file)
      }
    } else {
      console.log('開始新增商品...')
      console.log('送出資料：', {
        fName: form.value.fName,
        fPrice: minPrice,
        fCategoryId: form.value.fCategoryId,
        fStatus: form.value.fStatus,
        variants: variants.value,
      })

      const res = await productApi.create({
        fName: form.value.fName,
        fPrice: minPrice,
        fCategoryId: form.value.fCategoryId,
        fDescription: form.value.fDescription,
        fStatus: form.value.fStatus,
        variants: variants.value.map((v) => ({
          fColorId: v.fColorId,
          fSizeId: v.fSizeId,
          fStock: Number(v.fStock),
          fPrice: Number(v.fPrice),
        })),
      })

      console.log('新增結果：', res.data)

      if (res.data.data?.fId) {
        const newId = res.data.data.fId
        console.log('商品 ID：', newId)

        if (mainPhotoFile.value) {
          console.log('上傳主圖...')
          await productApi.uploadImage(newId, mainPhotoFile.value)
        }

        console.log('其他圖片數量：', photoFiles.value.length)
        for (const file of photoFiles.value) {
          await productApi.uploadImageExtra(newId, file)
        }
      } else {
        console.warn('沒有取得新商品 ID', res.data)
      } // ← if/else 結束
    } // ← else 結束

    router.push({ name: 'admin-products' })
  } catch (err) {
    console.error('儲存失敗', err)
    console.error('錯誤詳細：', err.response?.data)
    alert('儲存失敗，請再試一次')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4">
    <!-- 商品圖片 -->
    <div class="bg-white border border-gray-100 rounded-xl p-5">
      <h3 class="text-sm font-medium mb-4 pb-3 border-b border-gray-100">商品圖片</h3>
      <!-- 主圖 -->
      <div class="mb-4">
        <p class="text-xs text-gray-500 mb-2">
          主圖 <span class="text-red-400">*</span>
          <span class="text-gray-300 ml-1">（顯示於前台列表和行銷頁面）</span>
        </p>
        <div class="flex gap-3">
          <!-- 已上傳主圖 -->
          <div v-if="mainPhotoPreview" class="relative w-24 h-24">
            <img
              :src="mainPhotoPreview"
              class="w-full h-full object-cover rounded-lg border border-gray-100"
            />
            <button
              @click="((mainPhotoPreview = null), (mainPhotoFile = null))"
              class="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center"
              aria-label="移除主圖"
            >
              <i class="pi pi-times" style="font-size: 9px"></i>
            </button>
          </div>

          <!-- 上傳主圖按鈕 -->
          <label
            v-else
            class="w-24 h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <input type="file" accept="image/*" class="hidden" @change="onMainPhotoChange" />
            <i class="pi pi-image text-gray-300 mb-1" style="font-size: 20px"></i>
            <span class="text-[10px] text-gray-300">上傳主圖</span>
          </label>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-4">
        <p class="text-xs text-gray-500 mb-2">
          其他圖片
          <span class="text-gray-300 ml-1">（最多 9 張）</span>
        </p>

        <div class="grid grid-cols-4 gap-2">
          <div v-for="(photo, index) in photoPreviews" :key="index" class="relative aspect-square">
            <img
              :src="photo.url"
              class="w-full h-full object-cover rounded-lg border border-gray-100"
            />
            <button
              @click="removePhoto(index)"
              class="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center"
              aria-label="移除圖片"
            >
              <i class="pi pi-times" style="font-size: 9px"></i>
            </button>
          </div>

          <label
            v-if="photoPreviews.length < 9"
            class="aspect-square border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <input type="file" accept="image/*" multiple class="hidden" @change="onPhotoChange" />
            <i class="pi pi-plus text-gray-300 mb-1" style="font-size: 14px" aria-hidden="true"></i>
            <span class="text-[10px] text-gray-300">{{ photoPreviews.length }}/9</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 基本資料 -->
    <div class="bg-white border border-gray-100 rounded-xl p-5">
      <h3 class="text-sm font-medium mb-4 pb-3 border-b border-gray-100">基本資料</h3>
      <div class="space-y-4">
        <div>
          <label class="text-xs text-gray-500 mb-1.5 block"
            >商品名稱 <span class="text-red-400">*</span></label
          >
          <input
            v-model="form.fName"
            type="text"
            placeholder="請輸入商品名稱"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500 mb-1.5 block"
              >分類 <span class="text-red-400">*</span></label
            >
            <select
              v-model="form.fCategoryId"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
            >
              <option :value="null">選擇分類</option>
              <option v-for="cat in categories" :key="cat.fId" :value="cat.fId">
                {{ cat.fFullName }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1.5 block">商品狀態</label>
            <select
              v-model="form.fStatus"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
            >
              <option :value="1">上架中</option>
              <option :value="2">下架</option>
              <option :value="3">尚未刊登</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1.5 block">商品描述</label>
          <textarea
            v-model="form.fDescription"
            rows="4"
            placeholder="請輸入商品描述..."
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 resize-none"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 規格設定 -->
    <div class="bg-white border border-gray-100 rounded-xl p-5">
      <h3 class="text-sm font-medium mb-4 pb-3 border-b border-gray-100">規格設定</h3>
      <div>
        <div class="px-3 py-2 bg-gray-50 text-xs text-gray-400">
          售價依各規格設定，前台將顯示最低規格價格
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3 border border-gray-100">
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1">
          <input
            type="number"
            v-model="batchVariantStock"
            placeholder="數量"
            class="flex-1 px-3 py-2 text-xs focus:outline-none bg-white"
          />
        </div>
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1">
          <span class="px-3 py-2 bg-white text-gray-400 text-xs border-r border-gray-200">NT$</span>

          <input
            type="number"
            v-model="batchVariantPrice"
            placeholder="價格"
            class="flex-1 px-3 py-2 text-xs focus:outline-none bg-white"
          />
        </div>
        <button
          @click="applyBatchVariant"
          class="shrink-0 px-4 py-2 text-xs border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
        >
          全部套用
        </button>
      </div>

      <table class="w-full text-xs border-collapse">
        <thead>
          <tr class="bg-gray-50">
            <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
              顏色
            </th>
            <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
              尺寸
            </th>
            <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
              庫存
            </th>
            <th class="px-3 py-2 text-left text-gray-500 font-medium border-b border-gray-100">
              規格售價
            </th>
            <th class="px-3 py-2 border-b border-gray-100" style="width: 36px"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(variant, index) in variants"
            :key="index"
            class="border-b border-gray-50 last:border-0"
          >
            <td class="px-2 py-2">
              <select
                v-model="variant.fColorId"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md bg-white"
              >
                <option v-for="c in colors" :key="c.fId" :value="c.fId">{{ c.fName }}</option>
              </select>
            </td>
            <td class="px-2 py-2">
              <select
                v-model="variant.fSizeId"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md bg-white"
              >
                <option v-for="s in sizes" :key="s.fId" :value="s.fId">{{ s.fName }}</option>
              </select>
            </td>
            <td class="px-2 py-2">
              <input
                v-model="variant.fStock"
                type="number"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-center"
              />
            </td>
            <td class="px-2 py-2">
              <div class="flex items-center border border-gray-200 rounded-md overflow-hidden">
                <span class="px-2 py-1.5 bg-gray-50 text-gray-400 text-xs border-r border-gray-200"
                  >NT$</span
                >
                <input v-model="variant.fPrice" type="number" class="flex-1 px-2 py-1.5" />
              </div>
            </td>
            <td class="px-2 py-2 text-center">
              <button @click="removeVariant(index)" class="text-gray-300 hover:text-red-400">
                <i class="pi pi-trash" style="font-size: 13px"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        @click="addVariant"
        class="mt-3 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:text-indigo-500"
      >
        <i class="pi pi-plus" style="font-size: 12px"></i>新增規格
      </button>
    </div>
    <!-- 規格摘要 -->
    <div class="bg-white border border-gray-100 rounded-xl p-5">
      <h3 class="text-sm font-medium mb-4 pb-3 border-b border-gray-100">規格摘要</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-400">規格數量</span>
          <span class="font-medium">{{ variants.length }} 筆</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">總庫存</span>
          <span class="font-medium">{{ totalStock }} 件</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">價格區間</span>
          <span class="font-medium">{{ priceRange }}</span>
        </div>
      </div>
    </div>

    <!-- ✨ 取消與儲存按鈕 -->
    <div class="flex justify-center gap-4 pt-2 pb-8">
      <button
        @click="router.push({ name: 'admin-products' })"
        class="px-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        取消
      </button>
      <button
        @click="save"
        class="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        {{ isEdit ? '更新商品' : '儲存商品' }}
      </button>
    </div>
  </div>
</template>
