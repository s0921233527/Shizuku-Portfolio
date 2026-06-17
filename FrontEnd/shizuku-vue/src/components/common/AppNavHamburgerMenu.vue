<script setup>
import Drawer from 'primevue/drawer'
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { productApi } from '@/api/Product.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const visible = defineModel('visible')

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
const API_BASE_URL = apiBase.replace(/\/api$/, '')

const isMemberSectionOpen = ref(false)
const isStyleSectionOpen = ref(false)
const styleCategories = ref([])

onMounted(async () => {
  try {
    const res = await productApi.getDropdowns()
    const categories = res.data?.data?.categories ?? []

    const filterKey = '風格搭配-'

    styleCategories.value = categories
      .filter((c) => c.fFullName && c.fFullName.startsWith(filterKey))
      .map((c) => ({
        id: c.fId,
        name: c.fFullName.replace(filterKey, ''),
      }))

    console.log('行動端風格分類載入成功:', styleCategories.value.length)
  } catch (err) {
    console.error('行動端風格分類載入失敗', err)
  }
})

const navItems = [
  { label: '首頁', name: 'home', icon: 'pi pi-home' },
  { label: '所有商品', name: 'ProductView', icon: 'pi pi-shopping-bag' },
]

const memberMenuItems = [
  { name: '個人檔案', routeName: 'MemberProfile', icon: 'pi pi-user' },
  { name: '銀行帳號 / 信用卡', routeName: 'MemberPayMentmetod', icon: 'pi pi-credit-card' },
  { name: '收件地址管理', routeName: 'MemberAddress', icon: 'pi pi-map-marker' },
  { name: '通知設置', routeName: 'MemberNotificationSet', icon: 'pi pi-bell' },
  { name: '隱私設定', routeName: 'MemberPrivacySetting', icon: 'pi pi-shield' },
  { name: '訂單列表', routeName: 'MemberOrders', icon: 'pi pi-list' },
  { name: '客服紀錄', routeName: 'MemberTickets', icon: 'pi pi-envelope' },
  { name: '我的優惠券', routeName: 'MemberVouchers', icon: 'pi pi-ticket' },
  { name: '我的點數', routeName: 'MemberPointsDashboard', icon: 'pi pi-wallet' },
]

// 當選單打開時，如果當前是會員中心相關頁面，自動展開會員子選單
watch(visible, (isOpen) => {
  if (isOpen && authStore.isLogin) {
    const memberRoutes = memberMenuItems.map(item => item.routeName)
    if (memberRoutes.includes(route.name)) {
      isMemberSectionOpen.value = true
    }
  }
})

const navigateTo = (routeName, query = null) => {
  visible.value = false
  if (query) {
    router.push({ name: routeName, query })
  } else {
    router.push({ name: routeName })
  }
}

const goToCategory = (id) => {
  visible.value = false
  router.push({ name: 'ProductView', query: { categoryId: id } })
}

const handleAuthAction = () => {
  visible.value = false
  if (authStore.isLogin) {
    router.push({ name: 'MemberProfile' })
  } else {
    router.push({ name: 'Login' })
  }
}

const handleLogout = () => {
  authStore.logout()
  visible.value = false
  router.push({ name: 'home' })
}
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full md:w-80 !bg-[#FCFBF9] border-l border-stone-100">
    <template #header>
      <div class="flex items-baseline gap-2 px-2 cursor-pointer font-serif" @click="navigateTo('home')">
        <span class="text-2xl font-medium tracking-[0.2em] text-stone-850 uppercase">
          shizuku
        </span>
        <span class="text-[10px] text-[#8E9A86] tracking-widest pb-0.5">しずく</span>
      </div>
    </template>

    <ul class="flex flex-col gap-2 mt-6">
      <li
        v-for="item in navItems"
        :key="item.label"
        class="cursor-pointer transition-all duration-200 hover:bg-[#8E9A86]/5 rounded-xl group"
        @click="navigateTo(item.name)"
      >
        <div class="flex items-center gap-4 px-4 py-3.5">
          <i :class="[item.icon, item.iconColor || 'text-stone-400 group-hover:text-[#8E9A86]']" class="text-lg transition-colors"></i>
          <span
            class="text-[15px] font-medium tracking-[0.15em] uppercase font-serif transition-colors"
            :class="item.color || 'text-stone-700 group-hover:text-[#8E9A86]'"
          >
            {{ item.label }}
          </span>
        </div>
      </li>

      <!-- 風格搭配摺疊選單 -->
      <li class="cursor-pointer transition-all duration-200 rounded-xl group px-1">
        <div 
          @click="isStyleSectionOpen = !isStyleSectionOpen"
          class="flex items-center justify-between px-3 py-3.5 hover:bg-[#8E9A86]/5 rounded-xl transition-all"
        >
          <div class="flex items-center gap-4">
            <i class="pi pi-sparkles text-stone-400 group-hover:text-[#8E9A86] text-lg transition-colors" :class="{ '!text-[#8E9A86]': isStyleSectionOpen }"></i>
            <span class="text-[15px] font-medium tracking-[0.15em] text-stone-750 group-hover:text-[#8E9A86] uppercase font-serif" :class="{ '!text-[#8E9A86]': isStyleSectionOpen }">
              風格搭配
            </span>
          </div>
          <i 
            class="pi text-[10px] text-stone-400 transition-transform duration-350"
            :class="isStyleSectionOpen ? 'pi-chevron-down rotate-180 text-[#8E9A86]' : 'pi-chevron-right'"
          ></i>
        </div>

        <!-- 風格搭配子選單項目 -->
        <div v-show="isStyleSectionOpen" class="pl-5 pr-1 py-1.5 space-y-1 bg-[#8E9A86]/3 rounded-xl mt-1.5 border border-stone-200/20">
          <div v-if="styleCategories.length === 0" class="px-3 py-2 text-xs text-stone-400 font-sans">
            暫無分類資料
          </div>
          <a 
            v-for="cat in styleCategories" 
            :key="cat.id" 
            @click="goToCategory(cat.id)"
            class="flex items-center gap-3 py-2 px-3 rounded-lg text-stone-600 hover:text-[#8E9A86] hover:bg-[#8E9A86]/5 transition-all cursor-pointer font-sans"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-[#8E9A86]"></span>
            <span class="text-[13px] font-light tracking-wider">{{ cat.name }}</span>
          </a>
        </div>
      </li>

      <!-- 現貨專區 -->
      <li
        class="cursor-pointer transition-all duration-200 hover:bg-[#8E9A86]/5 rounded-xl group"
        @click="navigateTo('ProductView', { categoryId: 17 })"
      >
        <div class="flex items-center gap-4 px-4 py-3.5">
          <i class="pi pi-check-circle text-stone-400 group-hover:text-[#8E9A86] text-lg transition-colors"></i>
          <span class="text-[15px] font-medium tracking-[0.15em] uppercase font-serif text-stone-700 group-hover:text-[#8E9A86] transition-colors">
            現貨專區
          </span>
        </div>
      </li>

      <!-- 限時特價 -->
      <li
        class="cursor-pointer transition-all duration-200 hover:bg-[#8E9A86]/5 rounded-xl group"
        @click="navigateTo('ProductView', { categoryId: 18 })"
      >
        <div class="flex items-center gap-4 px-4 py-3.5">
          <i class="pi pi-tag text-red-350 group-hover:text-red-450 text-lg transition-colors"></i>
          <span class="text-[15px] font-medium tracking-[0.15em] uppercase font-serif text-red-400 group-hover:text-red-500 transition-colors">
            限時特價
          </span>
        </div>
      </li>

      <hr class="border-stone-200/50 my-5" />

      <!-- 已登入：會員資訊與子選單 -->
      <template v-if="authStore.isLogin">
        <!-- 會員頭像簡短資訊卡 -->
        <li class="px-2 mb-3">
          <div class="flex items-center gap-3.5 bg-[#8E9A86]/5 border border-stone-200/40 p-3.5 rounded-2xl">
            <div class="w-10 h-10 bg-[#8E9A86]/10 rounded-full flex items-center justify-center text-[#8E9A86] overflow-hidden border border-stone-200/30 flex-shrink-0 animate-fade-in">
              <img v-if="authStore.user?.fImage"
                :src="authStore.user.fImage.startsWith('http') ? authStore.user.fImage : `${API_BASE_URL}/uploads/avatars/${authStore.user.fImage}`"
                class="w-full h-full object-cover" />
              <i v-else class="pi pi-user text-base"></i>
            </div>
            <div class="min-w-0">
              <h4 class="font-medium text-stone-800 text-sm truncate tracking-wide font-sans">{{ authStore.userName }}</h4>
              <p class="text-[10px] text-[#8E9A86] mt-0.5 font-light">會員等級: {{ authStore.userLevel }}</p>
            </div>
          </div>
        </li>

        <!-- 會員設定摺疊區塊 -->
        <li class="cursor-pointer transition-all duration-200 rounded-xl group px-1">
          <div 
            @click="isMemberSectionOpen = !isMemberSectionOpen"
            class="flex items-center justify-between px-3 py-3 hover:bg-[#8E9A86]/5 rounded-xl transition-all"
          >
            <div class="flex items-center gap-4">
              <i class="pi pi-cog text-stone-400 group-hover:text-[#8E9A86] text-base transition-colors"></i>
              <span class="text-[14px] font-medium tracking-[0.15em] text-stone-750 group-hover:text-[#8E9A86] uppercase font-serif">
                會員中心設定
              </span>
            </div>
            <i 
              class="pi text-[10px] text-stone-400 transition-transform duration-350"
              :class="isMemberSectionOpen ? 'pi-chevron-down rotate-180 text-[#8E9A86]' : 'pi-chevron-right'"
            ></i>
          </div>

          <!-- 子選單項目 -->
          <div v-show="isMemberSectionOpen" class="pl-5 pr-1 py-1.5 space-y-1 bg-[#8E9A86]/3 rounded-xl mt-1.5 border border-stone-200/20">
            <router-link 
              v-for="item in memberMenuItems" 
              :key="item.routeName" 
              :to="{ name: item.routeName }"
              @click="visible = false"
              class="flex items-center gap-3 py-2 px-3 rounded-lg text-stone-600 hover:text-[#8E9A86] hover:bg-[#8E9A86]/5 transition-all cursor-pointer"
              active-class="bg-[#8E9A86]/10 !text-[#8E9A86] font-medium"
            >
              <i :class="[item.icon, 'text-sm text-stone-400']"></i>
              <span class="text-[13px] font-light tracking-wider">{{ item.name }}</span>
            </router-link>
          </div>
        </li>
      </template>

      <!-- 未登入：登入 / 註冊 按鈕 -->
      <li v-else class="px-2">
        <button
          @click="handleAuthAction"
          class="w-full bg-[#8E9A86] hover:bg-[#7D8876] text-white px-4 py-3 rounded-xl text-sm font-medium tracking-widest hover:shadow-md hover:shadow-[#8E9A86]/10 transition-all font-serif cursor-pointer"
        >
          登入 / 註冊
        </button>
      </li>

      <!-- 已登入：登出按鈕 -->
      <li v-if="authStore.isLogin" class="px-2 mt-4">
        <button
          @click="handleLogout"
          class="w-full bg-[#FCFBF9] border border-stone-200 text-stone-500 px-4 py-3 rounded-xl text-sm font-medium tracking-widest hover:bg-[#8E9A86]/5 hover:text-[#8E9A86] hover:border-[#8E9A86]/20 transition-all font-sans cursor-pointer"
        >
          登出
        </button>
      </li>
    </ul>
  </Drawer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>

