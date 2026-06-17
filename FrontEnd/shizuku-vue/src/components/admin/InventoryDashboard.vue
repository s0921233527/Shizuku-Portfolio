<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { orderApi } from '@/api/order' //熱銷商品api

const salesStats = ref([])
const props = defineProps({
  inventory: { type: Array, default: () => [] },
})

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
const baseUrl = apiBase.replace(/\/api$/, '')
const defaultImg = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800'

const donutChartRef = ref(null)
const barChartRef = ref(null)
let donutChart = null
let barChart = null

const totalStock = computed(() => props.inventory.reduce((a, p) => a + (p.fTotalStock ?? 0), 0))
const lowStockCount = computed(
  () =>
    props.inventory.flatMap((p) => p.fVariants ?? []).filter((v) => v.fStock > 0 && v.fStock <= 5)
      .length,
)
const outOfStockCount = computed(
  () => props.inventory.flatMap((p) => p.fVariants ?? []).filter((v) => v.fStock === 0).length,
)
const avgProfit = computed(() => {
  const items = props.inventory
    .flatMap((p) => p.fVariants ?? [])
    .filter((v) => v.fCostPrice > 0 && v.fPrice > 0)
  if (items.length === 0) return 0
  const total = items.reduce((a, v) => a + ((v.fPrice - v.fCostPrice) / v.fPrice) * 100, 0)
  return Math.round(total / items.length)
})

const lowStockList = computed(() =>
  props.inventory
    .flatMap((p) =>
      (p.fVariants ?? [])
        .filter((v) => v.fStock <= 5)
        .map((v) => ({ ...v, fProductName: p.fProductName, fImage: p.fImage })),
    )
    .sort((a, b) => a.fStock - b.fStock)
    .slice(0, 5),
)

function stockStatusClass(status) {
  if (status === '售完') return 'bg-red-50 text-red-500'
  if (status === '低庫存') return 'bg-amber-50 text-amber-500'
  return 'bg-green-50 text-green-600'
}

function buildCharts() {
  const normal = props.inventory
    .flatMap((p) => p.fVariants ?? [])
    .filter((v) => v.fStock > 5).length
  const low = lowStockCount.value
  const soldOut = outOfStockCount.value

  if (donutChartRef.value) {
    if (donutChart) donutChart.destroy()
    donutChart = new Chart(donutChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['正常庫存', '低庫存', '售完'],
        datasets: [
          {
            data: [normal, low, soldOut],
            backgroundColor: ['#1D9E75', '#BA7517', '#E24B4A'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: '65%',
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  const categoryMap = {}
  props.inventory.forEach((p) => {
    const cat = p.fProduct?.split('-')[0] ?? '其他'
    const stock = p.fTotalStock ?? 0
    categoryMap[cat] = (categoryMap[cat] ?? 0) + stock
  })

  if (barChartRef.value) {
    if (barChart) barChart.destroy()
    barChart = new Chart(barChartRef.value, {
      type: 'bar',
      data: {
        labels: Object.keys(categoryMap),
        datasets: [
          {
            label: '庫存量',
            data: Object.values(categoryMap),
            backgroundColor: '#4F46E5',
            borderRadius: 4,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
          x: { grid: { display: false } },
        },
      },
    })
  }
}

watch(
  () => props.inventory,
  () => {
    buildCharts()
  },
  { deep: true },
)

async function loadSalesStats() {
  try {
    const res = await orderApi.getSalesStats()
    salesStats.value = res.data.data ?? []
  } catch (err) {
    console.error('銷量統計載入失敗', err)
  }
}

onMounted(() => {
  buildCharts()
  loadSalesStats()
})
</script>

<template>
  <div class="space-y-4">
    <!-- 統計卡片 -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <div class="bg-gray-50 rounded-xl p-4">
        <p class="text-xs text-gray-400 mb-1">總庫存量</p>
        <p class="text-2xl font-medium">{{ totalStock.toLocaleString() }}</p>
        <p class="text-xs text-gray-300 mt-1">件商品庫存</p>
      </div>
      <div class="bg-gray-50 rounded-xl p-4">
        <p class="text-xs text-gray-400 mb-1">低庫存警示</p>
        <p class="text-2xl font-medium text-amber-500">{{ lowStockCount }}</p>
        <p class="text-xs text-gray-300 mt-1">筆規格不足 5 件</p>
      </div>
      <div class="bg-gray-50 rounded-xl p-4">
        <p class="text-xs text-gray-400 mb-1">售完規格</p>
        <p class="text-2xl font-medium text-red-400">{{ outOfStockCount }}</p>
        <p class="text-xs text-gray-300 mt-1">筆規格已售完</p>
      </div>
      <div class="bg-gray-50 rounded-xl p-4">
        <p class="text-xs text-gray-400 mb-1">平均毛利率</p>
        <p class="text-2xl font-medium text-green-500">{{ avgProfit }}%</p>
        <p class="text-xs text-gray-300 mt-1">全商品平均</p>
      </div>
    </div>

    <!-- 圖表 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <h3 class="text-sm font-medium mb-4">庫存狀態分布</h3>
        <div class="flex items-center gap-6">
          <div style="height: 120px; width: 120px; position: relative">
            <canvas ref="donutChartRef"></canvas>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-green-600"></div>
              <span class="text-xs text-gray-500">正常庫存</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-amber-600"></div>
              <span class="text-xs text-gray-500">低庫存</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <span class="text-xs text-gray-500">售完</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <h3 class="text-sm font-medium mb-4">各分類庫存量</h3>
        <div style="height: 120px; position: relative">
          <canvas ref="barChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- 熱銷排行 + 低庫存警示 並排 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- 熱銷商品排行 -->
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <h3 class="text-sm font-medium mb-3 pb-3 border-b border-gray-100">熱銷商品排行</h3>
        <div v-if="salesStats.length === 0" class="text-center text-gray-300 py-6 text-sm">
          尚無銷售資料
        </div>
        <div v-else class="space-y-0">
          <div
            v-for="(item, index) in salesStats"
            :key="item.variantId"
            class="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
          >
            <span
              :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                index === 0
                  ? 'bg-amber-50 text-amber-600'
                  : index === 1
                    ? 'bg-gray-100 text-gray-500'
                    : index === 2
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-400 text-xs',
              ]"
            >
              {{ index + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 truncate">{{ item.productName }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.color }} / {{ item.size }}</p>
            </div>
            <div class="w-20 shrink-0">
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-indigo-400 rounded-full"
                  :style="{
                    width: (item.totalQuantitySold / salesStats[0].totalQuantitySold) * 100 + '%',
                  }"
                ></div>
              </div>
            </div>
            <span class="text-xs font-medium text-gray-700 shrink-0 w-12 text-right">
              {{ item.totalQuantitySold }} 件
            </span>
            <span class="text-xs text-gray-400 shrink-0 w-8 text-right">
              {{
                Math.round(
                  (item.totalQuantitySold /
                    salesStats.reduce((a, v) => a + v.totalQuantitySold, 0)) *
                    100,
                )
              }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 低庫存警示 -->
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <h3 class="text-sm font-medium mb-3 pb-3 border-b border-gray-100">低庫存警示</h3>
        <div v-if="lowStockList.length === 0" class="text-center text-gray-300 py-6 text-sm">
          目前無低庫存商品
        </div>
        <div v-else class="space-y-0">
          <div
            v-for="item in lowStockList"
            :key="item.fVariantId"
            class="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
          >
            <img
              :src="
                product.fImage
                  ? product.fImage.startsWith('http')
                    ? product.fImage
                    : baseUrl + product.fImage
                  : defaultImg
              "
              class="w-8 h-8 object-cover rounded-lg border border-gray-100 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 truncate">{{ item.fProductName }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.fColor }} / {{ item.fSize }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="item.fStock === 0 ? 'bg-red-400' : 'bg-amber-400'"
                  :style="{ width: Math.min((item.fStock / 5) * 100, 100) + '%' }"
                ></div>
              </div>
              <span
                class="text-xs font-medium w-8 text-right"
                :class="item.fStock === 0 ? 'text-red-400' : 'text-amber-500'"
              >
                {{ item.fStock }} 件
              </span>
            </div>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-xs shrink-0',
                stockStatusClass(item.fStockStatus),
              ]"
            >
              {{ item.fStockStatus }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
