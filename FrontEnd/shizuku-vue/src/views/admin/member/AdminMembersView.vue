<script setup>
import { ref, onMounted } from 'vue'
import { getAdminMemberList } from '@/api/adminMember' // 引入 API 函式
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'



// 狀態管理
const members = ref([])
const loading = ref(true)
const globalFilterValue = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// 取得資料
const fetchMembers = async () => {
  try {
    loading.value = true
    const response = await getAdminMemberList()
    if (response.data && response.data.success) {
      members.value = response.data.data
    }
  } catch (error) {
    console.error('讀取會員清單失敗:', error)
  } finally {
    loading.value = false
  }
}

// 轉換會員等級視覺樣式
const getLevelSeverity = (level) => {
  switch (level) {
    case 0: return 'contrast'
    case 1: return 'success'
    case 2: return 'info'
    case 3: return 'warn'
    case 4: return 'danger'
    default: return 'secondary'
  }
}

const getLevelName = (level) => {
  switch (level) {
    case 0: return '尚未驗證'
    case 1: return '一般會員'
    case 2: return '黃金會員'
    case 3: return '鑽石會員'
    case 4: return 'VIP會員'
    default: return '未知等級'
  }
}

// 格式化註冊時間
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchMembers()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- 頁頭標題區塊 -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-wide">會員管理</h1>
        <p class="text-sm text-slate-500 mt-1">管理系統內的所有會員帳號，可進行狀態檢視與名單篩選。</p>
      </div>

      <!-- 右側工具列：搜尋、重整 -->
      <div class="flex items-center gap-3">
        <IconField iconPosition="left" class="w-full md:w-64">
          <InputIcon class="pi pi-search" />
          <InputText v-model="globalFilterValue.value" placeholder="搜尋姓名、信箱、編號..."
            class="w-full !rounded-xl !pl-10 !py-2.5 !border-slate-200 focus:!border-indigo-500 text-sm" />
        </IconField>

        <button @click="fetchMembers" :disabled="loading"
          class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-all duration-200 shadow-sm">
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          <span>重新整理</span>
        </button>
      </div>
    </div>

    <!-- 資料表格區塊 -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <DataTable :value="members" :loading="loading" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
        :globalFilterFields="['fMemberId', 'fName', 'fEmail', 'fPhone']" v-model:filters="globalFilterValue" stripedRows
        class="p-datatable-sm" emptyMessage="找不到符合條件的會員資料">
        <!-- 會員編號 -->
        <Column field="fMemberId" header="會員編號" sortable class="!py-4">
          <template #body="slotProps">
            <span class="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
              {{ slotProps.data.fMemberId || '-' }}
            </span>
          </template>
        </Column>

        <!-- 姓名 -->
        <Column field="fName" header="姓名" sortable>
          <template #body="slotProps">
            <span class="font-medium text-slate-800">{{ slotProps.data.fName || '未填寫' }}</span>
          </template>
        </Column>

        <!-- 電子信箱 -->
        <Column field="fEmail" header="電子信箱" sortable>
          <template #body="slotProps">
            <span class="text-slate-600 text-sm">{{ slotProps.data.fEmail }}</span>
          </template>
        </Column>

        <!-- 手機號碼 -->
        <Column field="fPhone" header="手機號碼">
          <template #body="slotProps">
            <span class="text-slate-600 text-sm">{{ slotProps.data.fPhone || '-' }}</span>
          </template>
        </Column>

        <!-- 會員等級 -->
        <Column field="fLevel" header="等級" sortable>
          <template #body="slotProps">
            <Tag :severity="getLevelSeverity(slotProps.data.fLevel)" :value="getLevelName(slotProps.data.fLevel)"
              class="!text-xs !px-2.5 !py-1 !rounded-full" />
          </template>
        </Column>

        <!-- 帳號狀態 -->
        <Column field="fIsActive" header="帳號狀態" sortable>
          <template #body="slotProps">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full"
                :class="slotProps.data.fIsActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'"></span>
              <span class="text-sm font-medium"
                :class="slotProps.data.fIsActive ? 'text-emerald-600' : 'text-slate-400'">
                {{ slotProps.data.fIsActive ? '已啟用' : '已停用' }}
              </span>
            </span>
          </template>
        </Column>

        <!-- 註冊時間 -->
        <Column field="fCreatedTime" header="註冊時間" sortable>
          <template #body="slotProps">
            <span class="text-xs text-slate-500">{{ formatDate(slotProps.data.fCreatedTime) }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
/* 深度整合選取器覆寫 PrimeVue 內建樣式，使其契合整體後台風格 */
:deep(.p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc !important;
}

:deep(.p-paginator) {
  border: none;
  background-color: transparent;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>