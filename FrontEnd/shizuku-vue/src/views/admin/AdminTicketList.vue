<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const tickets = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('全部')

const isModalOpen = ref(false)
const selectedTicket = ref(null)
const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';

// 1. 撈取資料 API
const fetchTickets = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${apiBase}/CustomerApi/Admin/AllTickets`)
    if (response.data.success) {
      tickets.value = response.data.data
    }
  } catch (error) {
    console.error("API 呼叫失敗：", error)
  } finally {
    isLoading.value = false
  }
}

// 🟢 2. 新增：修改狀態 API (就是呼叫我們剛寫好的 PUT 方法)
const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    const apiUrl = `${apiBase}/CustomerApi/Admin/TicketStatus`
    const response = await axios.put(apiUrl, {
      ticketId: ticketId,
      newStatus: newStatus
    })

    if (response.data.success) {
      // 成功後，不重新整理網頁，直接用 Vue 的響應式把畫面上的狀態改掉！
      const targetTicket = tickets.value.find(t => t.id === ticketId)
      if (targetTicket) {
        targetTicket.status = newStatus
      }
      // 如果彈窗開著，連彈窗裡的狀態也一起改
      if (selectedTicket.value && selectedTicket.value.id === ticketId) {
        selectedTicket.value.status = newStatus
      }
      alert(`✅ 成功！${response.data.message}`)
    }
  } catch (error) {
    console.error("修改狀態失敗：", error)
    alert("更新失敗，請檢查網路或聯繫系統管理員。")
  }
}

onMounted(() => {
  fetchTickets()
})

const openTicketModal = (ticket) => {
  selectedTicket.value = ticket
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => { selectedTicket.value = null }, 200)
}

const filteredTickets = computed(() => {
  return tickets.value.filter(ticket => {
    const matchQuery = ticket.guestName.includes(searchQuery.value) || ticket.subject.includes(searchQuery.value)
    const matchStatus = selectedStatus.value === '全部' || ticket.status === selectedStatus.value
    return matchQuery && matchStatus
  })
})
</script>

<template>
  <div class="p-4 md:p-8 min-h-screen bg-slate-50/50">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 tracking-wide">表單留言紀錄</h2>
        <p class="text-sm text-slate-500 mt-1">管理與檢視顧客從前台送出的聯絡表單</p>
      </div>
      <button @click="fetchTickets" class="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm">
        <i class="pi pi-refresh" :class="{'animate-spin': isLoading}"></i> 重新整理
      </button>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="flex flex-wrap gap-2 w-full md:w-auto">
        <button @click="selectedStatus = '全部'" :class="selectedStatus === '全部' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">全部</button>
        <button @click="selectedStatus = '待處理'" :class="selectedStatus === '待處理' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">待處理</button>
        <button @click="selectedStatus = '處理中'" :class="selectedStatus === '處理中' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">處理中</button>
        <button @click="selectedStatus = '已處理'" :class="selectedStatus === '已處理' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">已處理</button>
      </div>
      <div class="relative w-full md:w-72">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input v-model="searchQuery" type="text" placeholder="搜尋姓名或主旨..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm">
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
              <th class="px-6 py-4 font-semibold">狀態</th>
              <th class="px-6 py-4 font-semibold">發問人</th>
              <th class="px-6 py-4 font-semibold">分類</th>
              <th class="px-6 py-4 font-semibold min-w-[200px]">主旨</th>
              <th class="px-6 py-4 font-semibold">建立時間</th>
              <th class="px-6 py-4 font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="isLoading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">載入資料中...</td>
            </tr>
            <tr v-else-if="filteredTickets.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">目前沒有符合條件的紀錄。</td>
            </tr>
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-slate-50/80 transition-colors group">
              <td class="px-6 py-4">
                <span :class="[
                  'px-2.5 py-1 text-xs font-bold rounded-full border',
                  ticket.status === '待處理' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                  ticket.status === '處理中' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  ticket.status === '已處理' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  'bg-slate-100 text-slate-600 border-slate-300' // 不予處理
                ]">
                  {{ ticket.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-slate-800">{{ ticket.guestName }}</div>
                <div class="text-xs text-slate-400 mt-0.5">{{ ticket.email }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <span class="bg-slate-100 px-2 py-1 rounded text-xs">{{ ticket.category }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-800 truncate max-w-[250px]">{{ ticket.subject }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                {{ ticket.createTime }}
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="openTicketModal(ticket)" class="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded text-sm font-medium transition opacity-0 group-hover:opacity-100 focus:opacity-100">
                  查看內容
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="closeModal" class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
      
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-bold text-slate-800">表單詳細內容</h3>
            <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs">#{{ selectedTicket?.id }}</span>
          </div>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="px-6 py-6 overflow-y-auto custom-scrollbar">
          <div class="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 border-b border-slate-100 pb-6">
            <div>
              <p class="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">發問人</p>
              <p class="text-sm font-medium text-slate-800">{{ selectedTicket?.guestName }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">目前的狀態</p>
              <p class="text-sm font-bold text-indigo-600">{{ selectedTicket?.status }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">建立時間</p>
              <p class="text-sm text-slate-600">{{ selectedTicket?.createTime }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">問題分類</p>
              <p class="text-sm text-slate-600">{{ selectedTicket?.category }}</p>
            </div>
          </div>

          <div>
            <p class="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">案件主旨</p>
            <p class="text-base font-bold text-slate-800 mb-6">{{ selectedTicket?.subject }}</p>
            
            <p class="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">詳細內容描述</p>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
              {{ selectedTicket?.content }}
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div class="flex gap-2">
            <button v-if="selectedTicket?.status !== '處理中'" @click="updateTicketStatus(selectedTicket.id, '處理中')" class="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium transition">
              標示處理中
            </button>
            <button v-if="selectedTicket?.status !== '已處理'" @click="updateTicketStatus(selectedTicket.id, '已處理')" class="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md text-sm font-medium transition">
              標示已處理
            </button>
            <button v-if="selectedTicket?.status !== '不予處理'" @click="updateTicketStatus(selectedTicket.id, '不予處理')" class="px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-md text-sm font-medium transition">
              不予處理
            </button>
          </div>

          <button @click="closeModal" class="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition shadow-sm w-full sm:w-auto">
            關閉視窗
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
</style>