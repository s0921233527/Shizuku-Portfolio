<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import DatePicker from 'primevue/datepicker' // 引入 PrimeVue 的 DatePicker
import { useToast } from 'primevue/usetoast'
import { getSystemLogs } from '@/api/adminSystem'

const toast = useToast()

const levelWeights = {
    'Debug': 1,
    'Information': 2,
    'Warning': 3,
    'Error': 4
}

// 接收來自 API 的所有日誌資料快取
const mockLogs = ref([])

const loading = ref(false)
const detailsDialogVisible = ref(false)
const selectedLog = ref(null)

// 追蹤分頁狀態
const firstRowIndex = ref(0) // 當前畫面顯示的第一筆資料索引
const rows = ref(10)         // 每頁顯示幾筆

// 載入狀態控制
const loadedCount = ref(0)   // 目前本地已經快取了多少筆資料
const chunkSize = 100        // 每次固定向後端要 100 筆
const hasMoreData = ref(true) // 後端是否還有資料

const filters = ref({
    global: '',
    level: 'Information',
    dateRange: null // 新增時間範圍欄位，預設為 null。格式會是 [Date, Date]
})

const logLevels = ref([
    { label: 'Debug (除錯)', value: 'Debug' },
    { label: 'Information (資訊)', value: 'Information' },
    { label: 'Warning (警告)', value: 'Warning' },
    { label: 'Error (錯誤)', value: 'Error' }
])

const getSeverity = (level) => {
    if (level === 'Debug') return 'secondary'
    if (level === 'Information') return 'info'
    if (level === 'Warning') return 'warn'
    if (level === 'Error') return 'danger'
    return 'secondary'
}

// 動態虛擬總筆數：只要後端還有資料，就欺騙分頁器「還有下一頁可以按」
const virtualTotalRecords = computed(() => {
    if (!hasMoreData.value) {
        return mockLogs.value.length
    }
    return mockLogs.value.length + rows.value
})

// 從 API 獲取日誌資料
const fetchLogs = async (skip, take) => {
    loading.value = true
    try {
        const res = await getSystemLogs({ skip, take })

        if (res.data && res.data.success) {
            const newData = res.data.data || []

            // 將新撈到的資料拼接到原本的陣列後方
            mockLogs.value = [...mockLogs.value, ...newData]
            loadedCount.value = mockLogs.value.length

            // 如果後端回傳的筆數小於預期拿取的數量，代表後面已經乾了
            if (newData.length < take) {
                hasMoreData.value = false
            }
        } else {
            toast.add({
                severity: 'error',
                summary: '載入失敗',
                detail: res.data?.message || '伺服器回傳異常',
                life: 3000
            })
        }
    } catch (error) {
        const errorData = error.response?.data
        toast.add({
            severity: 'error',
            summary: '系統錯誤',
            detail: errorData?.message || error.message || '無法連線至伺服器',
            life: 4000
        })
    } finally {
        loading.value = false
    }
}

// 當使用者點擊下一頁或切換每頁筆數時觸發
const onPageChange = async (event) => {
    firstRowIndex.value = event.first
    rows.value = event.rows

    // 計算使用者點過去的那一頁，最後一筆資料的索引是多少
    const lastIndexNeeded = event.first + event.rows

    // 如果需要的索引超出了目前本地已經下載的總數，且後端還有資料
    if (lastIndexNeeded > loadedCount.value && hasMoreData.value) {
        toast.add({
            severity: 'info',
            summary: '動態載入',
            detail: '正在調取後續 100 筆系統日誌...',
            life: 1500
        })

        // 帶入當前已加載的數量作為 skip，繼續往後抓 100 筆
        await fetchLogs(loadedCount.value, chunkSize)
    }
}

// 元件掛載時自動讀取第一段 100 筆
onMounted(() => {
    fetchLogs(0, chunkSize)
})

const filteredLogs = computed(() => {
    // 1. 先進行關鍵字、層級與時間範圍的過濾
    const filtered = mockLogs.value.filter(log => {
        // 關鍵字過濾
        if (filters.value.global) {
            const keyword = filters.value.global.toLowerCase()
            if (!log.message?.toLowerCase().includes(keyword)) return false
        }

        // 層級過濾
        if (filters.value.level) {
            const selectedWeight = levelWeights[filters.value.level] || 0
            const currentLogWeight = levelWeights[log.level] || 0
            if (currentLogWeight < selectedWeight) return false
        }

        // 時間範圍過濾
        if (filters.value.dateRange && filters.value.dateRange.length === 2) {
            const [start, end] = filters.value.dateRange
            if (start && end) {
                const logTime = new Date(log.timestamp).getTime()
                const startTime = new Date(start).getTime()
                const endTime = new Date(end).getTime()

                // 檢查日誌時間是否在選取的範圍之內
                if (logTime < startTime || logTime > endTime) return false
            }
        }
        return true
    })

    // 2. 因為開啟了 lazy 模式，必須由我們手動切割當前頁面要看到的 10 筆
    return filtered.slice(firstRowIndex.value, firstRowIndex.value + rows.value)
})

const viewLogDetails = (log) => {
    selectedLog.value = log
    detailsDialogVisible.value = true
}

// 重新整理：必須完全重置所有狀態，從頭撈起
const handleRefresh = async () => {
    mockLogs.value = []
    loadedCount.value = 0
    firstRowIndex.value = 0
    hasMoreData.value = true

    await fetchLogs(0, chunkSize)
    toast.add({ severity: 'success', summary: '同步完成', detail: '已重新載入最新系統日誌', life: 2000 })
}

const resetFilters = () => {
    filters.value.global = ''
    filters.value.level = 'Information'
    filters.value.dateRange = null // 重置時間範圍
    firstRowIndex.value = 0 // 重置篩選時建議回第一頁
}

const formatDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleString('zh-TW', { hour12: false })
}
</script>

<template>
    <div class="p-6 max-w-7xl mx-auto space-y-6">
        <Toast position="top-right" />

        <!-- 頁頭區塊 -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-800 tracking-wide">系統日誌查詢</h1>
                <p class="text-sm text-slate-500 mt-1">
                    追蹤全站執行個體與安全性事件日誌。
                </p>
            </div>

            <div class="flex items-center gap-3">
                <button @click="handleRefresh" :disabled="loading"
                    class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-all duration-200 shadow-sm">
                    <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
                    <span>重新整理</span>
                </button>
            </div>
        </div>

        <!-- 篩選面板 -->
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <!-- 調整響應式佈局 grid-cols-1 到 md:grid-cols-4 以容納時間元件 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-slate-500">日誌關鍵字</label>
                    <IconField>
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="filters.global" placeholder="輸入日誌訊息內容搜尋"
                            class="w-full !rounded-xl text-sm" />
                    </IconField>
                </div>

                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-slate-500">顯示層級 (包含更高等級日誌)</label>
                    <Select v-model="filters.level" :options="logLevels" optionLabel="label" optionValue="value"
                        placeholder="選擇層級" class="w-full custom-select" />
                </div>

                <!-- 新增：時間範圍選取欄位 -->
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-slate-500">時間範圍 (起 ~ 迄)</label>
                    <DatePicker v-model="filters.dateRange" selectionMode="range" :showTime="true" hourFormat="24"
                        placeholder="選擇起迄時間" class="w-full custom-datepicker" showIcon iconDisplay="input" />
                </div>

                <div>
                    <button @click="resetFilters"
                        class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors">
                        重置預設條件
                    </button>
                </div>
            </div>
        </div>

        <!-- 資料表格 -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <DataTable :value="filteredLogs" paginator :rows="rows" :first="firstRowIndex" :loading="loading"
                :lazy="true" :totalRecords="virtualTotalRecords" @page="onPageChange"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 20]"
                currentPageReportTemplate="顯示第 {first} 至 {last} 筆，目前本地已快取 {totalRecords} 筆日誌" class="custom-table"
                responsiveLayout="scroll">

                <template #empty>
                    <div class="p-12 text-center text-slate-400 italic">
                        查無任何符合條件的系統日誌。
                    </div>
                </template>

                <!-- 1. 時間欄位 -->
                <Column field="timestamp" header="時間" sortable class="w-48 font-mono text-xs text-slate-600">
                    <template #body="slotProps">
                        {{ formatDateTime(slotProps.data.timestamp) }}
                    </template>
                </Column>

                <!-- 2. 層級欄位 -->
                <Column field="level" header="層級" sortable class="w-32">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.level" :severity="getSeverity(slotProps.data.level)"
                            class="!rounded-lg font-semibold tracking-wide text-[11px]" />
                    </template>
                </Column>

                <!-- 3. 日誌訊息欄位 -->
                <Column field="message" header="日誌訊息">
                    <template #body="slotProps">
                        <div class="max-w-xl truncate text-sm text-slate-700">
                            {{ slotProps.data.message }}
                        </div>
                    </template>
                </Column>

                <!-- 4. 查看操作欄位 -->
                <Column header="操作" class="w-24 text-center">
                    <template #body="slotProps">
                        <button @click="viewLogDetails(slotProps.data)"
                            class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-lg transition-colors">
                            查看
                        </button>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- 詳細內容對話框 -->
        <Dialog v-model:visible="detailsDialogVisible" modal header="日誌詳細內容明細" :style="{ width: '40rem' }"
            class="custom-dialog">
            <div v-if="selectedLog" class="space-y-4 pt-2">
                <div class="flex flex-wrap items-center gap-4 text-xs">
                    <div class="bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
                        <span class="font-semibold mr-1">記錄時間：</span>
                        <span class="font-mono">{{ formatDateTime(selectedLog.timestamp) }}</span>
                    </div>
                    <div>
                        <Tag :value="selectedLog.level" :severity="getSeverity(selectedLog.level)"
                            class="!rounded-lg font-bold px-3 py-1 text-xs" />
                    </div>
                </div>

                <!-- 完整日誌訊息內文 -->
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">完整日誌訊息</h3>
                    <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {{ selectedLog.message }}
                    </p>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
/* 保持你原本漂亮的樣式不變 */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #f8fafc;
    color: #475569;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #f8fafc !important;
}

:deep(.custom-select .p-select-label) {
    font-size: 0.875rem !important;
    border-radius: 0.75rem !important;
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
}

:deep(.p-select) {
    border-radius: 0.75rem !important;
    border-color: #e2e8f0 !important;
}

:deep(.p-paginator) {
    background-color: #ffffff !important;
    border-top: 1px solid #f1f5f9 !important;
    padding: 0.75rem !important;
    font-size: 0.875rem;
}

:deep(.custom-dialog .p-dialog-header) {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.25rem 1.5rem;
}

:deep(.custom-dialog .p-dialog-content) {
    padding: 1.5rem;
}

/* 新增：使 DatePicker 樣式呼應整體的圓角風格 */
:deep(.custom-datepicker .p-inputtext) {
    border-radius: 0.75rem !important;
    border-color: #e2e8f0 !important;
    font-size: 0.875rem !important;
    padding: 0.5rem 0.75rem !important;
}
</style>