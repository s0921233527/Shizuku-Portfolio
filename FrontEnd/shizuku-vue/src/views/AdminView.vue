<script setup>
import { ref, provide, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import Toast from 'primevue/toast'

const route = useRoute()
const isSidebarOpen = ref(false)
const showBackToTop = ref(false)
const contentContainerRef = ref(null)

provide('isSidebarOpen', isSidebarOpen)

// 當路由切換（換頁）時，自動收合手機版側邊欄，且將捲動位置歸零
watch(() => route.path, () => {
  isSidebarOpen.value = false
  if (contentContainerRef.value) {
    contentContainerRef.value.scrollTop = 0
  }
})

const handleScroll = (e) => {
  if (e.target) {
    showBackToTop.value = e.target.scrollTop > 300
  }
}

const scrollToTop = () => {
  if (contentContainerRef.value) {
    contentContainerRef.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <div class="flex h-screen w-full relative overflow-hidden bg-[#FAF8F5]">
    <!-- 全站後台通知 Toast 容器 -->
    <Toast position="top-right" />

    <!-- 左側 Sidebar -->
    <AdminSidebar class="flex-shrink-0" />

    <!-- 右側主要區塊 -->
    <main class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      <!-- 頂部導覽列 -->
      <AdminHeader />

      <!-- 子頁面渲染區 (滾動容器) -->
      <div 
        ref="contentContainerRef"
        @scroll="handleScroll"
        class="flex-1 w-full p-4 sm:p-6 overflow-y-auto scroll-smooth"
      >
        <router-view />
      </div>
    </main>

    <!-- 回頂部按鈕 -->
    <transition name="fade">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[#8E9A86] hover:bg-[#7d8b75] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer group border border-white/25"
        title="回頂部"
      >
        <i class="pi pi-arrow-up text-xs group-hover:animate-bounce"></i>
      </button>
    </transition>
  </div>
</template>

<style scoped>
/* 回頂部按鈕漸變與微縮放動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
