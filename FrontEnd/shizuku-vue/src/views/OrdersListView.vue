<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { getMemberOrdersAPI } from '@/api/order'
import OrderItemCard from '@/components/order/OrderItemCard.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const ordersList = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    if (!authStore.isLogin) {
      router.push({ name: 'Login' })
      return
    }

    const res = await getMemberOrdersAPI(authStore.user.fId)

    if (res.success && Array.isArray(res.data)) {
      ordersList.value = res.data.map((order) => ({
        id: order.orderNo,
        total: order.totalAmount,
        status: order.statusText,
        date: order.createdAt ? order.createdAt.split('T')[0] : '',
        createdAt: order.createdAt, // 傳遞原始時間戳用於倒數計時
      }))
    } else {
      console.warn('取得訂單失敗或資料格式不符：', res.message)
    }
  } catch (error) {
    console.error('取得訂單失敗：', error)
  } finally {
    isLoading.value = false
  }
})

// ========== 狀態篩選 Tab ==========
const STATUS_TABS = [
  { label: '全部', value: 'all', icon: 'pi pi-list' },
  { label: '未付款', value: '未付款', icon: 'pi pi-clock' },
  { label: '已付款', value: '已付款', icon: 'pi pi-shopping-bag' },
  { label: '出貨中', value: '出貨中', icon: 'pi pi-truck' },
  { label: '已送達', value: '已送達', icon: 'pi pi-check-circle' },
  { label: '退款', value: 'refund', icon: 'pi pi-undo' },
  { label: '已取消', value: '已取消', icon: 'pi pi-times-circle' },
]

const activeTab = ref('all')

const setTab = (value) => {
  activeTab.value = value
  limit.value = 10  // 切換 Tab 時重置顯示數量
}

// ========== 篩選 + 排序 + 分頁 ==========
const limit = ref(10)

const filteredOrders = computed(() => {
  let result = [...ordersList.value].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (activeTab.value === 'all') return result
  if (activeTab.value === 'refund') {
    return result.filter(o => o.status === '待退款' || o.status === '已退款')
  }
  return result.filter(o => o.status === activeTab.value)
})

const displayedOrders = computed(() => filteredOrders.value.slice(0, limit.value))

const loadMore = () => { limit.value += 10 }

const hasMore = computed(() => limit.value < filteredOrders.value.length)

// 各狀態的數量 badge
const countByStatus = computed(() => {
  const map = {}
  STATUS_TABS.forEach(tab => {
    if (tab.value === 'all') {
      map.all = ordersList.value.length
    } else if (tab.value === 'refund') {
      map.refund = ordersList.value.filter(o => o.status === '待退款' || o.status === '已退款').length
    } else {
      map[tab.value] = ordersList.value.filter(o => o.status === tab.value).length
    }
  })
  return map
})

const goToShop = () => {
  router.push({ name: 'Product' })
}
</script>

<template>
  <div class="min-h-screen bg-[#FCFBF9] py-16 px-6 pt-36 font-serif text-stone-850">
    <div class="max-w-4xl mx-auto">
      <!-- 標題區塊 -->
      <div class="border-b border-stone-200/50 pb-4 mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <RouterLink :to="{ name: 'home' }" class="text-xs text-stone-400 hover:text-[#8E9A86] transition-colors inline-flex items-center gap-1.5 mb-4">
            <span>&lt;</span> 回首頁
          </RouterLink>
          <h1 class="text-2xl font-light text-stone-850 tracking-wider font-serif flex items-center gap-2">
            <i class="pi pi-receipt text-[#8E9A86] text-xl"></i> 我的訂單
          </h1>
        </div>
        <p class="text-stone-500 font-light text-xs">
          查看您在 Shizuku 的所有交易紀錄與配送狀態
        </p>
      </div>

      <!-- 1. 加載中 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
        <i class="pi pi-spin pi-spinner text-3xl text-[#8E9A86]"></i>
        <p class="text-stone-400 font-light text-xs tracking-widest animate-pulse">
          正在為您讀取交易紀錄...
        </p>
      </div>

      <div v-else>
        <!-- 2. 狀態篩選 Tab 列 -->
        <div class="mb-6 overflow-x-auto scrollbar-thin">
          <div class="flex gap-2 min-w-max pb-2.5">
            <button
              v-for="tab in STATUS_TABS"
              :key="tab.value"
              @click="setTab(tab.value)"
              :class="[
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all duration-250 whitespace-nowrap border cursor-pointer font-light tracking-wide',
                activeTab === tab.value
                  ? 'bg-[#8E9A86] text-white border-[#8E9A86] shadow-sm'
                  : 'bg-stone-50/40 text-stone-500 border-stone-200/80 hover:border-[#8E9A86] hover:text-[#8E9A86] hover:bg-[#8E9A86]/5',
              ]"
            >
              <i :class="[tab.icon, 'text-[10px]']"></i>
              {{ tab.label }}
              <span
                v-if="countByStatus[tab.value] > 0"
                :class="[
                  'ml-0.5 text-[9px] px-1.5 py-0.25 rounded-full font-light',
                  activeTab === tab.value
                    ? 'bg-white/25 text-white'
                    : 'bg-stone-200/60 text-stone-500',
                ]"
              >
                {{ countByStatus[tab.value] }}
              </span>
            </button>
          </div>
        </div>

        <!-- 3. 空狀態 (Empty State) -->
        <div
          v-if="ordersList.length === 0"
          class="bg-[#FAF8F5]/85 border border-stone-200/40 p-12 text-center rounded-3xl backdrop-blur-md shadow-xs flex flex-col items-center justify-center gap-6"
        >
          <div class="w-16 h-16 rounded-full bg-[#8E9A86]/10 flex items-center justify-center text-[#8E9A86]">
            <i class="pi pi-shopping-bag text-2xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-light text-stone-850">您目前還沒有任何訂單喔！</h3>
            <p class="text-stone-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed font-light">
              生活需要儀式感，現在就去挑選一些讓自己感到幸福的精緻商品吧！
            </p>
          </div>
          <Button
            label="立即去逛逛"
            icon="pi pi-compass"
            class="px-8 py-3 bg-[#8E9A86] hover:bg-[#7D8876] border-none text-white text-xs tracking-widest uppercase transition-all duration-300 rounded-full font-medium cursor-pointer shadow-sm"
            @click="goToShop"
          />
        </div>

        <!-- 4. 篩選後的空狀態 -->
        <div
          v-else-if="filteredOrders.length === 0"
          class="bg-[#FAF8F5]/80 border border-stone-200/40 rounded-2xl p-10 text-center shadow-xs backdrop-blur-md"
        >
          <i class="pi pi-filter-slash text-3xl text-stone-300 mb-4 block"></i>
          <p class="text-stone-500 text-sm font-light">此分類目前沒有訂單</p>
          <button
            @click="setTab('all')"
            class="mt-4 text-xs text-[#8E9A86] hover:text-[#7D8876] font-light underline cursor-pointer"
          >
            查看全部訂單
          </button>
        </div>

        <!-- 5. 訂單清單 -->
        <div v-else class="flex flex-col gap-4">
          <div class="order-list-transition">
            <OrderItemCard
              v-for="order in displayedOrders"
              :key="order.id"
              :order="order"
            />
          </div>

          <!-- 顯示更多 -->
          <div class="mt-8 flex flex-col items-center gap-3">
            <Button
              v-if="hasMore"
              label="顯示更多訂單"
              icon="pi pi-chevron-down"
              class="px-8 py-3 bg-white/80 hover:bg-[#8E9A86]/5 text-stone-700 border border-stone-200/80 hover:border-[#8E9A86]/50 font-light rounded-full shadow-xs transition-all text-xs cursor-pointer"
              @click="loadMore"
            />
            <p v-else class="text-stone-400 font-light text-xs tracking-wide mt-4">
              已顯示此分類的所有訂單
            </p>
          </div>
        </div>
      </div>

      <!-- 頁尾提示 -->
      <p class="text-center text-stone-400/80 text-[10px] mt-16 leading-relaxed font-light">
        僅顯示近半年的訂單紀錄，若需查詢更早之前的訂單請聯絡客服。
      </p>
    </div>
  </div>
</template>

<style scoped>
.pi-spinner-two {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
