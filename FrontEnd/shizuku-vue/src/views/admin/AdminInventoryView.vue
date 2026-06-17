<script setup>
import { ref, onMounted } from 'vue'
import { productApi } from '@/api/Product.js'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import InventoryDashboard from '@/components/admin/InventoryDashboard.vue'
import InventoryList from '@/components/admin/InventoryList.vue'
import PurchaseOrderList from '@/components/admin/PurchaseOrderList.vue'

const inventory = ref([])
const purchaseOrders = ref([])
const isLoading = ref(true)
const activeTab = ref('dashboard')
const router = useRouter()
const route = useRoute()
const inventoryReport = ref([])

async function loadData() {
  try {
    isLoading.value = true
    const [inventoryRes, purchaseRes, inventoryReportRes] = await Promise.all([
      productApi.getInventory(),
      productApi.getPurchaseOrders(),
      productApi.getInventoryReport(),
    ])
    inventory.value = inventoryRes.data.data ?? []
    purchaseOrders.value = purchaseRes.data.data ?? []
    inventoryReport.value = inventoryReportRes.data.data ?? []
  } catch (err) {
    console.error('載入失敗', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  //  如果有 tab 參數就切換到對應 Tab
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  await loadData()
})
</script>

<template>
  <div class="p-6 space-y-4">
    <!-- 標題 + Tab -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <h1 class="text-xl font-medium">庫存管理</h1>
        <div class="flex gap-1">
          <button
            v-for="tab in [
              { label: '總覽儀表板', value: 'dashboard' },
              { label: '庫存總覽', value: 'inventory' },
              { label: '庫存異動單管理', value: 'records' },
            ]"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-4 py-1.5 text-sm rounded-lg transition-colors',
              activeTab === tab.value
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-if="isLoading" class="text-center text-gray-400 py-20 text-sm">載入中...</div>

    <!-- Tab 內容 -->
    <template v-else>
      <InventoryDashboard v-if="activeTab === 'dashboard'" :inventory="inventory" />

      <InventoryList v-if="activeTab === 'inventory'" :inventory="inventoryReport" />

      <PurchaseOrderList v-if="activeTab === 'records'" :purchaseOrders="purchaseOrders" />
    </template>
  </div>
</template>
