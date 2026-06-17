<script setup>
import { ref, onMounted, watch } from 'vue'
import { getRevenueStatsAPI } from '@/api/adminOrder'
import Chart from 'primevue/chart'
import Skeleton from 'primevue/skeleton'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'

const loading = ref(true)
const stats = ref(null)

// 日期篩選相關
const dates = ref(null)
const periodOptions = [
  { label: '今日', value: 'today' },
  { label: '近 7 日', value: '7d' },
  { label: '近 30 日', value: '30d' },
  { label: '本年', value: 'year' },
]
const selectedPeriod = ref('7d')

const lineChartData = ref(null)
const lineChartOptions = ref(null)
const pieChartData = ref(null)
const pieChartOptions = ref(null)

const setPeriod = (p) => {
  const end = new Date()
  let start = new Date()
  if (p === 'today') start.setHours(0, 0, 0, 0)
  else if (p === '7d') start.setDate(end.getDate() - 6)
  else if (p === '30d') start.setDate(end.getDate() - 29)
  else if (p === 'year') start = new Date(end.getFullYear(), 0, 1)
  dates.value = [start, end]
  loadData()
}

const loadData = async () => {
  if (!dates.value || !dates.value[0]) return
  loading.value = true
  const start = dates.value[0].toISOString()
  const end = dates.value[1] ? dates.value[1].toISOString() : start
  try {
    const res = await getRevenueStatsAPI(start, end)
    if (res.success) {
      stats.value = res.data
      initCharts(res.data)
    }
  } catch (err) {
    console.error('Failed to load revenue stats', err)
  } finally {
    loading.value = false
  }
}

watch(selectedPeriod, (newVal) => {
  if (newVal) setPeriod(newVal)
})

const initCharts = (data) => {
  // 對齊品牌灰綠色 #8E9A86 及其漸變色
  lineChartData.value = {
    labels: data.dailyStats.map((s) => s.date),
    datasets: [
      {
        label: '銷售金額',
        data: data.dailyStats.map((s) => s.amount),
        fill: true,
        borderColor: '#8E9A86',
        backgroundColor: 'rgba(142, 154, 134, 0.06)',
        tension: 0.4,
      },
    ],
  }
  lineChartOptions.value = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { display: false }, ticks: { color: '#8c8581', font: { family: 'serif', size: 10 } } }, 
      y: { grid: { color: '#f5f5f4' }, ticks: { color: '#8c8581', font: { family: 'mono', size: 10 } } } 
    },
  }
  
  // 圓餅圖採用莫蘭迪品牌灰綠色階搭配
  pieChartData.value = {
    labels: data.paymentStats.map((p) => p.method),
    datasets: [
      {
        data: data.paymentStats.map((p) => p.amount),
        backgroundColor: ['#8E9A86', '#A9B5A0', '#C2CCA8', '#E2E8D5'],
        borderWidth: 1,
        borderColor: '#FAF8F5'
      },
    ],
  }
  pieChartOptions.value = {
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'right',
        labels: { color: '#57534e', font: { family: 'serif', size: 11 } }
      } 
    },
    cutout: '70%',
  }
}

const formatCurrency = (v) =>
  new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(v || 0)

onMounted(() => setPeriod('7d'))
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5]">
    <!-- 統一的頁面標題列 -->
    <div class="px-4 sm:px-8 pt-8 pb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[#20251F] tracking-tight">營收數據視覺化</h1>
        <p class="text-sm text-stone-400 mt-0.5 font-serif">將交易數據量化與圖示化，即時分析交易額（GMV）趨勢與支付管道分布</p>
      </div>
    </div>

    <!-- 營收數據核心內容區 -->
    <div class="px-4 sm:px-8 pb-8 space-y-6">
      <!-- 1. 緊湊工具列 -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white/80 p-3 px-5 rounded-2xl border border-stone-200/40 shadow-sm backdrop-blur-md">
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold text-stone-600 font-serif tracking-wider uppercase">分析區間</span>
          <SelectButton
            v-model="selectedPeriod"
            :options="periodOptions"
            optionLabel="label"
            optionValue="value"
            unselectable
            class="font-serif custom-select-btn"
          />
        </div>
        <div class="flex items-center gap-3">
          <DatePicker
            v-model="dates"
            selectionMode="range"
            :manualInput="false"
            placeholder="自定義範圍"
            class="custom-cal font-sans"
            @hide="loadData"
            :pt="{
              input: { class: 'border border-stone-200 bg-white rounded-xl pl-3 pr-3 py-1.5 text-xs text-stone-750 focus:outline-none focus:ring-2 focus:ring-[#8E9A86]/20 focus:border-[#8E9A86] w-[180px]' }
            }"
          />
          <button
            @click="loadData"
            class="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-[#8E9A86] hover:bg-stone-50 border-0 transition-all cursor-pointer bg-transparent"
            :class="{ 'animate-spin': loading }"
          >
            <i class="pi pi-refresh text-xs"></i>
          </button>
        </div>
      </div>

      <!-- 2. KPI 卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <template v-if="loading">
          <div v-for="i in 3" :key="i">
            <Skeleton height="90px" borderRadius="16px" />
          </div>
        </template>
        
        <template v-else>
          <!-- 總交易額 (GMV) -->
          <div class="modern-kpi kpi-[#8E9A86]">
            <div class="kpi-content">
              <span class="kpi-label">總交易額 (GMV)</span>
              <div class="kpi-value font-mono">{{ formatCurrency(stats?.totalGMV) }}</div>
            </div>
            <div class="kpi-icon">
              <i class="pi pi-wallet"></i>
            </div>
            <div class="kpi-badge">REVENUE</div>
          </div>

          <!-- 訂單總量 -->
          <div class="modern-kpi kpi-sky">
            <div class="kpi-content">
              <span class="kpi-label">交易訂單總量</span>
              <div class="kpi-value font-mono">{{ stats?.totalOrders }} <span class="unit font-serif">筆</span></div>
            </div>
            <div class="kpi-icon">
              <i class="pi pi-shopping-bag"></i>
            </div>
            <div class="kpi-badge">VOLUME</div>
          </div>

          <!-- 平均客單價 (AOV) -->
          <div class="modern-kpi kpi-amber">
            <div class="kpi-content">
              <span class="kpi-label">平均客單價 (AOV)</span>
              <div class="kpi-value font-mono">{{ formatCurrency(stats?.aov) }}</div>
            </div>
            <div class="kpi-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <div class="kpi-badge">QUALITY</div>
          </div>
        </template>
      </div>

      <!-- 3. 圖表與數據明細區塊 -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <!-- 折線圖 + 明細表 -->
        <div class="lg:col-span-3 chart-box flex flex-col bg-white/90 border border-stone-200/50 rounded-3xl p-5 shadow-sm backdrop-blur-md">
          <div class="flex justify-between items-center mb-4 border-b border-stone-100 pb-3 font-serif">
            <h3 class="text-xs font-semibold text-stone-500 uppercase tracking-widest">銷售趨勢分析</h3>
            <span class="text-[10px] text-stone-400 font-light">Historical Sales Chart</span>
          </div>
          
          <div class="h-[220px] w-full">
            <Chart
              type="line"
              :data="lineChartData"
              :options="lineChartOptions"
              v-if="lineChartData"
              class="h-full w-full"
            />
          </div>

          <!-- 每日明細簡表 -->
          <div class="mt-5 border-t border-stone-200/30 pt-4 font-serif">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-stone-400 font-medium tracking-wider uppercase border-b border-stone-100/50 pb-2">
                  <th class="pb-2">交易日期</th>
                  <th class="pb-2 text-right">訂單量</th>
                  <th class="pb-2 text-right">當日營收</th>
                </tr>
              </thead>
              <tbody class="text-stone-700 font-light divide-y divide-stone-100/30">
                <tr
                  v-for="item in [...(stats?.dailyStats || [])].reverse().slice(0, 5)"
                  :key="item.date"
                  class="hover:bg-stone-50/30 transition-all"
                >
                  <td class="py-2.5 font-serif">{{ item.date }}</td>
                  <td class="py-2.5 text-right font-mono">{{ item.count }}</td>
                  <td class="py-2.5 text-right font-mono font-bold text-stone-850">{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 圓餅圖 + 佔比列表 -->
        <div class="lg:col-span-2 chart-box flex flex-col bg-white/90 border border-stone-200/50 rounded-3xl p-5 shadow-sm backdrop-blur-md">
          <div class="flex justify-between items-center mb-4 border-b border-stone-100 pb-3 font-serif">
            <h3 class="text-xs font-semibold text-stone-500 uppercase tracking-widest">支付管道佔比</h3>
            <span class="text-[10px] text-stone-400 font-light">Payment Methods</span>
          </div>
          
          <div class="h-[180px] flex items-center justify-center">
            <Chart
              type="doughnut"
              :data="pieChartData"
              :options="pieChartOptions"
              v-if="pieChartData"
              class="h-full w-full"
            />
          </div>

          <!-- 支付佔比明細 -->
          <div class="mt-5 border-t border-stone-200/30 pt-4 font-serif">
            <div class="space-y-3">
              <div
                v-for="(item, idx) in stats?.paymentStats"
                :key="idx"
                class="flex justify-between items-center"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-2.5 h-2.5 rounded-full border border-stone-100"
                    :style="{ backgroundColor: ['#8E9A86', '#A9B5A0', '#C2CCA8', '#E2E8D5'][idx] }"
                  ></div>
                  <span class="text-xs text-stone-600 font-serif">{{ item.method }}</span>
                </div>
                <div class="text-xs font-mono font-bold text-stone-850">
                  {{ formatCurrency(item.amount) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modern-kpi {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  border: 1px solid rgba(120, 113, 108, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
  transition: all 0.3s ease;
  font-serif: true;
}

.modern-kpi:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.03);
}

.kpi-content {
  z-index: 1;
}

.kpi-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  color: #78716c;
}

.kpi-value {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #1c1917;
}

.kpi-value .unit {
  font-size: 11px;
  font-weight: 500;
  margin-left: 2px;
  color: #78716c;
}

.kpi-icon {
  font-size: 1.5rem;
  opacity: 0.15;
  transition: all 0.4s;
  color: #8E9A86;
}

.modern-kpi:hover .kpi-icon {
  transform: scale(1.1) rotate(-5deg);
  opacity: 0.3;
}

.kpi-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  font-size: 8px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.4;
}

/* 莫蘭迪 KPI 色系微染色卡 */
.kpi-\[\#8E9A86\] { background: linear-gradient(135deg, #f7f9f6 0%, #ffffff 100%); border-left: 4px solid #8E9A86; }
.kpi-\[\#8E9A86\] .kpi-label, .kpi-\[\#8E9A86\] .kpi-icon, .kpi-\[\#8E9A86\] .kpi-badge { color: #8E9A86; }
.kpi-\[\#8E9A86\] .kpi-badge { background: rgba(142, 154, 134, 0.12); }

.kpi-sky { background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); border-left: 4px solid #0284c7; }
.kpi-sky .kpi-label, .kpi-sky .kpi-icon, .kpi-sky .kpi-badge { color: #0284c7; }
.kpi-sky .kpi-badge { background: #e0f2fe; }

.kpi-amber { background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); border-left: 4px solid #d97706; }
.kpi-amber .kpi-label, .kpi-amber .kpi-icon, .kpi-amber .kpi-badge { color: #d97706; }
.kpi-amber .kpi-badge { background: #fef3c7; }

/* SelectButton customization */
:deep(.p-selectbutton) {
  border-radius: 12px !important;
  overflow: hidden;
  border: 1px solid #e7e5e4 !important;
  background: #f5f5f4 !important;
  display: inline-flex;
}

:deep(.p-selectbutton .p-button) {
  border: none !important;
  background: transparent !important;
  color: #78716c !important;
  font-weight: 600;
  font-size: 11px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.p-selectbutton .p-button.p-highlight) {
  background: #8E9A86 !important;
  color: white !important;
  box-shadow: 0 2px 6px rgba(142, 154, 134, 0.2) !important;
}
</style>
