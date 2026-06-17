<script setup>
import { ref, onMounted } from 'vue'
import { productApi } from '@/api/Product.js'
import { useRouter } from 'vue-router'
import AppCartMenu from '@/components/cart/AppCartMenu.vue'
import AppNavHamburgerMenu from './AppNavHamburgerMenu.vue'
import AppSearch from './AppSearch.vue'
import { useAuthStore } from '@/stores/auth'

const styleCategories = ref([])
const showStyleMenu = ref(false)
const showSaleMenu = ref(false)
const isHamburgerMenuOpen = ref(false)
let hideTimer = null

const authStore = useAuthStore()
const router = useRouter()

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
const API_BASE_URL = apiBase.replace(/\/api$/, '')

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

    console.log('載入成功，風格分類數量:', styleCategories.value.length)
  } catch (err) {
    console.error('分類載入失敗', err)
  }
})

function showMenu(type) {
  clearTimeout(hideTimer)
  showStyleMenu.value = type === 'style'
  showSaleMenu.value = type === 'sale'
}

function hideMenu() {
  hideTimer = setTimeout(() => {
    showStyleMenu.value = false
    showSaleMenu.value = false
  }, 150)
}

function goToCategory(id) {
  showStyleMenu.value = false
  showSaleMenu.value = false
  router.push({ path: '/all', query: { categoryId: id } })
}

const handleLogout = () => {
  authStore.logout()
  alert('您已成功登出')
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="fixed top-0 left-0 w-full z-50 bg-[#FCFBF9]/92 backdrop-blur-md transition-all duration-300">
    <div class="w-full px-6 lg:px-12 flex items-center justify-between py-2.5 md:py-3">
      <!-- 左側 Logo (放大版) -->
      <div class="flex-1 flex justify-start overflow-visible">
        <router-link to="/" class="cursor-pointer inline-block overflow-visible">
          <img src="@/assets/img/shizuku_brand_logo.png" alt="Shizuku" class="h-6 md:h-7 lg:h-8 w-auto object-contain inline-block scale-[3] transition-transform duration-300 hover:scale-[1.42] origin-left" />
        </router-link>
      </div>

      <!-- 中間選單：字體稍微變大，字距與間距加寬 -->
      <ul
        class="hidden lg:flex justify-center items-center gap-5 xl:gap-10 text-[13px] xl:text-[14px] font-medium tracking-[0.18em] xl:tracking-[0.25em] text-stone-600 font-serif uppercase flex-shrink-0">
        <li>
          <router-link to="/" class="hover:text-[#8E9A86] cursor-pointer transition-colors duration-200" active-class="!text-[#8E9A86]">首頁</router-link>
        </li>
        <li class="cursor-pointer">
          <RouterLink to="/all" class="hover:text-[#8E9A86] transition-colors duration-200"
            active-class="!text-[#8E9A86]">
            所有商品
          </RouterLink>
        </li>

        <!-- 風格搭配下拉選單 -->
        <li class="relative animate-nav-item py-1" @mouseenter="showMenu('style')" @mouseleave="hideMenu()">
          <span class="hover:text-[#8E9A86] cursor-pointer select-none transition-colors duration-200">風格搭配 ▽</span>
          <div v-show="showStyleMenu" @mouseenter="showMenu('style')" @mouseleave="hideMenu()"
            class="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-48 bg-[#FCFBF9]/95 backdrop-blur-md border border-stone-150 shadow-lg rounded-2xl py-3.5 z-50 animate-fade-in">
            <div v-if="styleCategories.length === 0" class="px-5 py-2 text-xs text-stone-400 font-sans">
              暫無分類資料
            </div>

            <a v-for="cat in styleCategories" :key="cat.id" @click="goToCategory(cat.id)"
              class="block px-6 py-3 text-[13px] font-medium text-stone-650 hover:text-[#8E9A86] hover:bg-[#8E9A86]/5 cursor-pointer transition-colors duration-200 font-sans">
              {{ cat.name }}
            </a>
          </div>
        </li>

        <li>
          <a @click="router.push({ path: '/all', query: { categoryId: 17 } })"
            class="hover:text-[#8E9A86] cursor-pointer transition-colors duration-200">
            現貨專區
          </a>
        </li>

        <li>
          <a @click="router.push({ path: '/all', query: { categoryId: 18 } })"
            class="hover:text-red-400 cursor-pointer transition-colors duration-200 text-red-400 font-medium">
            限時特價
          </a>
        </li>
        <li v-if="authStore.isLogin && authStore.userLevel !== null && authStore.userLevel > 0">
          <router-link :to="{ name: 'point-store' }"
            class="hover:text-[#8E9A86] cursor-pointer transition-colors duration-200" active-class="!text-[#8E9A86]">點數商城</router-link>
        </li>
      </ul>

      <!-- 右側控制區域：間距變寬，元件微調 -->
      <div class="flex-1 flex justify-end items-center gap-4 xl:gap-7 text-stone-550 flex-shrink-0">
        <!-- 搜尋元件 -->
        <AppSearch class="hover:text-[#8E9A86] transition-colors duration-200 transform hover:scale-105" />

        <!-- 購物車選單 -->
        <AppCartMenu class="hover:text-[#8E9A86] transition-colors duration-200 transform hover:scale-105" />

        <!-- 會員資訊與登出 -->
        <template v-if="authStore.isLogin">
          <div class="flex items-center gap-3 bg-[#FAF8F5] border border-stone-200 p-1 pr-3 rounded-full shadow-xs">
            <router-link :to="{ name: 'MemberProfile' }" class="flex items-center gap-2 group">
              <div
                class="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-white overflow-hidden group-hover:bg-[#8E9A86] transition-colors border border-stone-200">
                <img v-if="authStore.user?.fImage"
                  :src="authStore.user.fImage.startsWith('http') ? authStore.user.fImage : `${API_BASE_URL}/uploads/avatars/${authStore.user.fImage}`"
                  class="w-full h-full object-cover" />

                <svg v-else class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <span class="hidden xl:block text-xs font-semibold text-stone-750 tracking-wide font-sans">{{
                authStore.userName
              }}</span>
            </router-link>
            <div class="w-[1px] h-2.5 bg-stone-300"></div>
            <button @click="handleLogout"
              class="text-xs font-medium text-rose-450 hover:text-rose-600 transition-colors px-0.5 cursor-pointer font-sans">
              登出
            </button>
          </div>
        </template>

        <template v-else>
          <router-link :to="{ name: 'Login' }"
            class="hidden lg:block border border-stone-200 hover:border-[#8E9A86] px-5 py-2 rounded-xl text-[13px] font-medium text-stone-600 hover:text-[#8E9A86] transition-all duration-300 bg-[#FCFBF9] hover:shadow-sm hover:shadow-[#8E9A86]/5 font-serif tracking-widest">
            登入 / 註冊
          </router-link>
        </template>

        <!-- 手機版選單 -->
        <button class="lg:hidden hover:text-[#8E9A86] transition-colors cursor-pointer transform hover:scale-105" @click="isHamburgerMenuOpen = true" aria-label="Open menu">
          <svg class="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <AppNavHamburgerMenu v-model:visible="isHamburgerMenuOpen" />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 6px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>