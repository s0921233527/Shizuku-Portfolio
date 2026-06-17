<script setup>
import ProductAllitem from '@/components/product/ProductAllitem.vue'
import ProductSidebar from '@/components/product/ProductSidebar.vue'
import ProductPageHeader from '@/components/product/ProductPageHeader.vue'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { productApi } from '@/api/Product'

const route = useRoute()
const selectedCategoryId = ref(null)
const selectedCategoryName = ref(null)   // 子分類名稱，例如「T恤」
const selectedParentName = ref(null)   // 父分類名稱，例如「上身」
const categoriesData = ref([])

// ✨ 同步根據 categoryId 查出分類名稱
function updateCrumbSync(categoryId) {
    if (!categoryId) {
        selectedCategoryName.value = null
        selectedParentName.value = null
        return
    }

    const found = categoriesData.value.find(c => c.fId === Number(categoryId))
    if (found) {
        // ✨ 一般子分類：上身-T恤 → 父:上身 子:T恤
        const parts = found.fFullName.split('-')
        selectedParentName.value = parts[0] ?? null
        selectedCategoryName.value = parts[1] ?? parts[0]
    } else {
        // ✨ 找不到代表是父分類（現貨專區/限時特價）
        // 用 categoryId 對應名稱
        const nameMap = {
            17: '現貨專區',
            18: '限時特價'
        }
        selectedParentName.value = null
        selectedCategoryName.value = nameMap[Number(categoryId)] ?? `分類 ${categoryId}`
    }
}

// 初次掛載時下載並快取分類列表
onMounted(async () => {
    try {
        const res = await productApi.getDropdowns()
        categoriesData.value = res.data.data.categories ?? []
        // 下載完成後再次同步更新，確保初次進入特定分類時麵包屑正確
        updateCrumbSync(route.query.categoryId)
    } catch (err) {
        console.error('分類名稱快取載入失敗', err)
    }
})

// ✨ 監聽網址變化（Nav 點擊會改網址）
watch(() => route.query.categoryId, (newId) => {
    selectedCategoryId.value = newId ? Number(newId) : null
    updateCrumbSync(newId)
}, { immediate: true })

// ✨ Sidebar 點擊直接給名稱，不用查 API
function onCategorySelected(id, childName, parentName) {
    selectedCategoryId.value = id
    selectedCategoryName.value = childName ?? null
    selectedParentName.value = parentName ?? null
}
</script>

<template>
    <main class="pt-24 bg-[#FCFBF9] text-stone-850 min-h-screen font-serif">

        <ProductPageHeader title="All Shop" :parentCrumb="selectedParentName"
            :currentCrumb="selectedCategoryName ?? 'All Products'" />

        <div class="flex flex-col md:flex-row max-w-[1400px] mx-auto px-4 gap-8 pt-1">
            <aside class="w-full md:w-64 sticky shrink-0 mt-28">
                <ProductSidebar @categorySelected="onCategorySelected" />
            </aside>
            <section class="flex-1 min-w-0">
                <ProductAllitem :categoryId="selectedCategoryId" />
            </section>
        </div>
    </main>
</template>