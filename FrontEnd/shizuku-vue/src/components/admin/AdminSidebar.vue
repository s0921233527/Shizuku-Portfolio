<script setup>
import Divider from 'primevue/divider'
import { ref, inject } from 'vue'

defineOptions({
  inheritAttrs: false
})

const isSidebarOpen = inject('isSidebarOpen')

const menuItems = ref([
  {
    label: '首頁管理',
    icon: 'pi pi-window-maximize',
    open: false,
    children: [
      {
        label: '輪播圖設定',
        icon: 'pi pi-images',
        to: { name: 'admin-home-banners' },
      },
    ],
  },

  {
    label: '會員管理',
    icon: 'pi pi-users',
    open: false,
    children: [
      { label: '會員列表', icon: 'pi pi-list', to: { name: 'admin-members' } },
      { label: '黑名單列表', icon: 'pi pi-ban', to: { name: 'admin-members-block' } },
    ],
  },

  {
    label: '商品管理',
    icon: 'pi pi-box',
    open: false,
    children: [
      { label: '商品列表', icon: 'pi pi-list', to: { name: 'admin-products' } },
      { label: '庫存管理', icon: 'pi pi-warehouse', to: { name: 'admin-inventory' } },
    ],
  },

  {
    label: '訂單管理',
    icon: 'pi pi-shopping-bag',
    open: false,
    children: [
      { label: '全站訂單管理', icon: 'pi pi-list',                to: { name: 'admin-orders-all' } },
      { label: '出貨作業中心', icon: 'pi pi-box',                 to: { name: 'admin-orders-shipping' } },
      { label: '異常訂單監控', icon: 'pi pi-exclamation-triangle', to: { name: 'admin-orders-anomaly' } },
    ],
  },

  {
    label: '金流管理',
    icon: 'pi pi-credit-card',
    open: false,
    children: [
      { label: '全站交易對帳',   icon: 'pi pi-credit-card', to: { name: 'admin-payments-all' } },
      { label: '營收數據視覺化', icon: 'pi pi-chart-line',  to: { name: 'admin-payments-revenue' } },
      { label: '退款管理中心',   icon: 'pi pi-undo',        to: { name: 'admin-payments-refund' } },
    ],
  },

  { label: '客服回覆', icon: 'pi pi-comments', to: { name: 'admin-customer-service' } },
  { label: '表單留言紀錄', icon: 'pi pi-envelope', to: { name: 'admin-ticket-list' } },

  {
    label: '系統管理',
    icon: 'pi pi-cog',
    open: false,
    children: [
      {
        label: '安全設定',
        icon: 'pi pi-shield',
        to: { name: 'admin-system-settings' },
      },
      {
        label: '系統日誌',
        icon: 'pi pi-file',
        to: { name: 'admin-system-logs' },
      },
    ],
  },
])

const toggleItem = (clickedItem) => {
  menuItems.value.forEach(item => {
    if (item.children) {
      if (item === clickedItem) {
        item.open = !item.open
      } else {
        item.open = false
      }
    }
  })
}

const closeAllSubmenus = () => {
  menuItems.value.forEach(item => {
    if (item.children) {
      item.open = false
    }
  })
}


</script>

<template>
  <!-- 背景遮罩 (手機端才顯示) -->
  <transition name="fade">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/40 z-30 md:hidden"
      @click="isSidebarOpen = false"
    />
  </transition>

  <aside
    v-bind="$attrs"
    class="w-64 min-h-screen flex flex-col bg-gradient-to-b from-[#20251F] via-[#161A15] to-[#0E100D] overflow-hidden shadow-2xl select-none border-r border-[#8E9A86]/10 fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 md:translate-x-0"
    :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <!-- 品牌淡色高亮背景 -->
    <div class="absolute top-[-60px] left-[-60px] w-72 h-72 bg-[#8E9A86]/5 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute bottom-[-40px] right-[-40px] w-60 h-60 bg-[#8E9A86]/5 rounded-full blur-3xl pointer-events-none" />

    <!-- 標頭 Logo 區 -->
    <div class="relative z-10 px-6 py-7 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8.5 h-8.5 bg-[#8E9A86]/10 border border-[#8E9A86]/25 rounded-xl flex items-center justify-center">
          <i class="pi pi-sparkles text-[#8E9A86] text-sm" />
        </div>

        <div>
          <h1 class="text-sm font-serif font-black tracking-[0.1em] text-white">
            SHIZUKU
          </h1>
          <p class="text-[9px] font-sans tracking-widest text-[#8E9A86]/80 uppercase mt-0.5">
            Admin Console
          </p>
        </div>
      </div>

      <!-- 手機端關閉按鈕 -->
      <button
        @click="isSidebarOpen = false"
        class="md:hidden p-1.5 text-[#8E9A86] hover:text-white hover:bg-[#8E9A86]/20 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
        title="關閉導覽選單"
      >
        <i class="pi pi-times text-base"></i>
      </button>
    </div>

    <Divider class="!my-0 !border-[#8E9A86]/10" />

    <!-- 選單列表區 -->
    <nav class="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto font-serif">

      <template v-for="item in menuItems" :key="item.label">

        <!-- 有子選單的項目 -->
        <div v-if="item.children">

          <button @click="toggleItem(item)"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-400 hover:bg-[#8E9A86]/10 hover:text-white transition-all duration-200 cursor-pointer text-xs font-medium">
            <i :class="item.icon" class="text-xs" />

            <span class="tracking-wide">
              {{ item.label }}
            </span>

            <i class="pi pi-chevron-down ml-auto text-[9px] transition-transform duration-200 text-stone-500"
              :class="{ 'rotate-180 text-white': item.open }" />
          </button>

          <!-- 子選單 -->
          <div v-show="item.open" class="ml-3.5 mt-1 flex flex-col gap-1 border-l border-[#8E9A86]/10 pl-2">
            <router-link v-for="child in item.children" :key="child.label" :to="child.to" custom
              v-slot="{ navigate, isActive }">

              <button @click="navigate" class="w-full flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-xs"
                :class="isActive ? 'bg-[#8E9A86] text-white font-semibold shadow-md shadow-[#8E9A86]/15' : 'text-stone-400 hover:bg-[#8E9A86]/10 hover:text-white'">
                <i :class="child.icon" class="text-[10px]" />
                <span class="tracking-wide">{{ child.label }}</span>
              </button>

            </router-link>
          </div>

        </div>

        <!-- 無子選單的項目 -->
        <router-link v-else :to="item.to" custom v-slot="{ navigate, isActive }">

          <button @click="closeAllSubmenus(); navigate()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-xs"
            :class="isActive ? 'bg-[#8E9A86] text-white font-semibold shadow-md shadow-[#8E9A86]/15' : 'text-stone-400 hover:bg-[#8E9A86]/10 hover:text-white'">
            <i :class="item.icon" class="text-xs" />
            <span class="tracking-wide">{{ item.label }}</span>
          </button>

        </router-link>

      </template>

    </nav>



  </aside>
</template>

<style scoped>
/* 針對 Webkit 核心優化滾動條樣式 */
nav::-webkit-scrollbar {
  width: 4px;
}
nav::-webkit-scrollbar-thumb {
  background: rgba(142, 154, 134, 0.15);
  border-radius: 4px;
}
nav::-webkit-scrollbar-thumb:hover {
  background: rgba(142, 154, 134, 0.3);
}

/* 遮罩過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>