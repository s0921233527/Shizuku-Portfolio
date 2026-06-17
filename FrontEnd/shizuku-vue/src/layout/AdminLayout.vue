<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route  = useRoute()

const menuItems = [
    { name: 'AdminDashboard', label: '數據總覽', icon: 'ti-layout-dashboard' },
    { name: 'AdminProducts',  label: '商品管理', icon: 'ti-shirt'            },
    { name: 'AdminInventory', label: '庫存管理', icon: 'ti-package'          },
]
</script>

<template>
    <div class="flex min-h-screen bg-gray-50">

        <!-- 左側選單 -->
        <aside class="w-56 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-40 flex flex-col">

            <!-- Logo -->
            <div class="px-6 py-5 border-b border-gray-100">
                <RouterLink to="/" class="text-lg font-light tracking-widest">
                    SHIZUKU
                </RouterLink>
                <p class="text-[10px] text-gray-400 mt-0.5 tracking-wider">後台管理系統</p>
            </div>

            <!-- 選單 -->
            <nav class="flex-1 px-3 py-4 space-y-1">
                <RouterLink v-for="item in menuItems" :key="item.name"
                            :to="{ name: item.name }"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            :class="route.name === item.name ? 'bg-gray-100 text-gray-900 font-medium' : ''">
                    <i :class="['ti', item.icon, 'text-base']" aria-hidden="true"></i>
                    {{ item.label }}
                </RouterLink>
            </nav>

            <!-- 底部 -->
            <div class="px-4 py-4 border-t border-gray-100">
                <RouterLink to="/"
                            class="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="ti ti-arrow-left text-sm" aria-hidden="true"></i>
                    回到前台
                </RouterLink>
            </div>

        </aside>

        <!-- 右側內容區 -->
        <main class="flex-1 ml-56 p-8">
            <RouterView />
        </main>

    </div>
</template>