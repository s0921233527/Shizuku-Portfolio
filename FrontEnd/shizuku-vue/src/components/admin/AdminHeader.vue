<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToast } from 'primevue/usetoast'
import * as signalR from '@microsoft/signalr'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()
const toast = useToast()

const isSidebarOpen = inject('isSidebarOpen')
const showUserMenu = ref(false)
const isConnected = ref(false)
let connection = null

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 監聽點擊外部關閉選單
const userMenuRef = ref(null)
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  connectHub()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (connection) {
    connection.stop()
  }
})

// 連接 SignalR Hub 監控即時通知狀態
const connectHub = async () => {
  try {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
    const backendOrigin = new URL(backendUrl).origin
    const hubUrl = `${backendOrigin}/adminNotificationHub`

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => adminStore.adminToken
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveAnomalyAlert', (title, message, severity) => {
      toast.add({
        severity: severity === 'danger' ? 'error' : 'warn',
        summary: title,
        detail: message,
        life: 8000
      })
    })

    await connection.start()
    await connection.invoke('JoinAdminNotification')
    isConnected.value = true
  } catch (err) {
    console.warn('[AdminHeader] SignalR 連線失敗，警報通知將改為 Toast 彈出模式。', err)
  }
}

// 登出
const handleLogout = () => {
  adminStore.logout()
  router.replace({ name: 'admin-login' })
}

// 根據目前路由名稱計算中文麵包屑
const breadcrumbs = computed(() => {
  const name = route.name
  const crumbs = [{ label: '首頁', icon: 'pi pi-home', to: { name: 'admin-dashboard' } }]
  
  if (name === 'admin-dashboard') {
    crumbs.push({ label: '儀表板' })
  } else if (name === 'admin-members' || name === 'admin-members-block') {
    crumbs.push({ label: '會員管理' })
    crumbs.push({ label: name === 'admin-members' ? '會員列表' : '黑名單列表' })
  } else if (name === 'admin-products' || name === 'admin-products-create' || name === 'admin-products-edit' || name === 'admin-inventory') {
    crumbs.push({ label: '商品管理' })
    if (name === 'admin-products') crumbs.push({ label: '商品列表' })
    else if (name === 'admin-products-create') crumbs.push({ label: '新增商品' })
    else if (name === 'admin-products-edit') crumbs.push({ label: '編輯商品' })
    else if (name === 'admin-inventory') crumbs.push({ label: '庫存管理' })
  } else if (name === 'admin-orders-all' || name === 'admin-orders-shipping' || name === 'admin-orders-anomaly') {
    crumbs.push({ label: '訂單管理' })
    if (name === 'admin-orders-all') crumbs.push({ label: '全站訂單管理' })
    else if (name === 'admin-orders-shipping') crumbs.push({ label: '出貨作業中心' })
    else if (name === 'admin-orders-anomaly') crumbs.push({ label: '異常訂單監控' })
  } else if (name === 'admin-payments-all' || name === 'admin-payments-revenue' || name === 'admin-payments-refund') {
    crumbs.push({ label: '金流管理' })
    if (name === 'admin-payments-all') crumbs.push({ label: '全站交易對帳' })
    else if (name === 'admin-payments-revenue') crumbs.push({ label: '營收數據視覺化' })
    else if (name === 'admin-payments-refund') crumbs.push({ label: '退款管理中心' })
  } else if (name === 'admin-customer-service') {
    crumbs.push({ label: '客服回覆' })
  } else if (name === 'admin-ticket-list') {
    crumbs.push({ label: '表單留言紀錄' })
  } else if (name === 'admin-home-banners') {
    crumbs.push({ label: '首頁管理' })
    crumbs.push({ label: '輪播圖設定' })
  } else if (name === 'admin-system-settings' || name === 'admin-system-logs') {
    crumbs.push({ label: '系統管理' })
    crumbs.push({ label: name === 'admin-system-settings' ? '安全設定' : '系統日誌' })
  }
  return crumbs
})
</script>

<template>
  <div class="w-full sticky top-0 z-30 flex flex-col">
    <!-- 唯讀警告橫幅 -->
    <div v-if="adminStore.adminUser?.isReadOnly" class="w-full bg-amber-50 text-amber-700 border-b border-amber-200/50 py-2 px-6 text-xs font-semibold text-center tracking-wider select-none flex items-center justify-center gap-1.5 shadow-sm">
      <i class="pi pi-exclamation-triangle text-amber-500"></i>
      <span>目前正使用測試（唯讀）帳號登入。系統僅供瀏覽，不開放任何新增、修改或刪除功能。</span>
    </div>

    <header class="w-full h-16 bg-white/80 backdrop-blur-md border-b border-stone-200/60 flex items-center justify-between px-6 shadow-xs select-none">
      <!-- 左側：漢堡選單 + 麵包屑 -->
      <div class="flex items-center space-x-3">
        <!-- 手機端漢堡按鈕 -->
        <button 
          @click="isSidebarOpen = !isSidebarOpen"
          class="md:hidden p-2 text-stone-600 hover:text-[#8E9A86] hover:bg-stone-100/50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          title="打開導覽選單"
        >
          <i class="pi pi-bars text-lg"></i>
        </button>

        <div class="flex items-center space-x-2.5 text-xs font-serif text-stone-500">
        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
          <!-- 箭頭 -->
          <span v-if="idx > 0" class="text-stone-300 text-[10px] font-sans">/</span>
          
          <!-- 連結或文字 -->
          <router-link v-if="crumb.to" :to="crumb.to" class="flex items-center gap-1 hover:text-[#8E9A86] transition-colors font-medium">
            <i v-if="crumb.icon" :class="crumb.icon" class="text-[11px]"></i>
            <span>{{ crumb.label }}</span>
          </router-link>
          <span v-else class="flex items-center gap-1 text-stone-850 font-bold">
            <i v-if="crumb.icon" :class="crumb.icon" class="text-[11px] text-[#8E9A86]"></i>
            <span>{{ crumb.label }}</span>
          </span>
        </template>
      </div>
      </div>

      <!-- 右側：控制區 -->
      <div class="flex items-center space-x-4">
        <!-- 即時通知鈴鐺 -->
        <div 
          class="relative p-2.5 text-stone-500 hover:text-[#8E9A86] rounded-full hover:bg-stone-50 transition-all duration-200 cursor-pointer"
          title="系統警報即時通知連線狀態"
        >
          <i class="pi pi-bell text-base"></i>
          <!-- 運作中綠色指示燈 -->
          <span 
            v-if="isConnected" 
            class="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border border-white rounded-full"
            title="即時監控已連線"
          ></span>
          <span 
            v-else 
            class="absolute top-2 right-2 w-2 h-2 bg-stone-300 border border-white rounded-full animate-pulse"
            title="已切換為被動警報模式"
          ></span>
        </div>

        <!-- 分隔線 -->
        <span class="w-[1px] h-4 bg-stone-200"></span>

        <!-- 會員下拉選單 -->
        <div class="relative" ref="userMenuRef">
          <button 
            @click="toggleUserMenu"
            class="flex items-center space-x-2.5 py-1 px-1.5 rounded-full hover:bg-stone-50 transition-all duration-200 cursor-pointer"
          >
            <!-- 頭像 -->
            <div class="w-8 h-8 rounded-full bg-[#8E9A86]/10 border border-[#8E9A86]/20 flex items-center justify-center text-[#8E9A86] font-bold text-sm tracking-wide shadow-xs">
              {{ adminStore.adminName?.charAt(0) ?? 'A' }}
            </div>
            <!-- 名字 -->
            <span class="text-xs font-bold text-stone-750 hidden sm:inline-block">
              {{ adminStore.adminName }}
            </span>
            <i class="pi pi-chevron-down text-[9px] text-stone-400 hidden sm:inline-block transition-transform duration-200" :class="{ 'rotate-180': showUserMenu }"></i>
          </button>

          <!-- 下拉內容 -->
          <transition name="menu-fade">
            <div 
              v-if="showUserMenu"
              class="absolute right-0 mt-2.5 w-48 bg-white border border-stone-200/70 rounded-2xl shadow-lg py-2.5 z-40 text-xs font-serif overflow-hidden"
            >
              <div class="px-4 py-2 text-stone-500">
                <p class="font-bold text-stone-800">{{ adminStore.adminName }}</p>
                <p class="text-[10px] text-stone-400 mt-0.5">系統管理員</p>
              </div>
              
              <div class="h-[1px] bg-stone-100 my-1.5"></div>
              
              <button 
                @click="handleLogout"
                class="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-2 cursor-pointer font-medium text-stone-650"
              >
                <i class="pi pi-sign-out text-[11px]"></i>
                <span>安全登出</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>
  </div>
</template>

<style scoped>
.menu-fade-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-fade-leave-active {
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-fade-enter-from {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(2px) scale(0.98);
}
</style>
