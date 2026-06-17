<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api'
const API_BASE_URL = apiBase.replace(/\/api$/, '')

const isAccountOpen = ref(true);

const toggleSection = (section) => {
    if (section.children) {
        isAccountOpen.value = !isAccountOpen.value;
    } else {
        console.log('跳轉到:', section.title);
    }
};

const menuItems = [
    {
        title: '我的帳戶',
        icon: 'pi pi-user',
        children: [
            { name: '個人檔案', routeName: 'MemberProfile' },
            { name: '銀行帳號 / 信用卡', routeName: 'MemberPayMentmetod' },
            { name: '地址', routeName: 'MemberAddress' },
            { name: '通知設置', routeName: 'MemberNotificationSet' },
            { name: '隱私設定', routeName: 'MemberPrivacySetting' }
        ]
    },
    { title: '訂單列表', icon: 'pi pi-list', routeName: 'MemberOrders' },
    { title: '客服紀錄', icon: 'pi pi-envelope', routeName: 'MemberTickets' },
    { title: '我的優惠券', icon: 'pi pi-ticket', routeName: 'MemberVouchers' },
    { title: '我的點數', icon: 'pi pi-wallet', routeName: 'MemberPointsDashboard' },
];
</script>

<template>
    <div class="font-serif">
        <!-- 桌上型電腦版側邊欄 (md 以上正常顯示) -->
        <aside class="hidden md:block bg-transparent border-r border-stone-200/30 pr-6 font-serif w-full">
            <!-- 會員頭像資訊區 -->
            <div class="flex items-center gap-3.5 mb-8 px-2">
                <div
                    class="w-12 h-12 bg-[#8E9A86]/10 rounded-full flex items-center justify-center text-[#8E9A86] shadow-sm overflow-hidden border border-stone-200/40">
                    <img v-if="authStore.user?.fImage"
                        :src="authStore.user.fImage.startsWith('http') ? authStore.user.fImage : `${API_BASE_URL}/uploads/avatars/${authStore.user.fImage}`"
                        class="w-full h-full object-cover" />
                    <i v-else class="pi pi-user text-xl"></i>
                </div>
                <div>
                    <h3 class="font-medium text-stone-850 tracking-wide text-sm">{{ authStore.userName }}</h3>
                    <p class="text-xs text-[#8E9A86] mt-0.5 font-light">會員等級: {{ authStore.userLevel }}</p>
                </div>
            </div>

            <!-- 導覽連結清單 -->
            <nav class="space-y-1.5">
                <div v-for="section in menuItems" :key="section.title">

                    <!-- 摺疊式父節點 -->
                    <div v-if="section.children" @click="toggleSection(section)"
                        class="flex items-center justify-between py-2.5 px-3 rounded-lg text-stone-600 hover:bg-[#8E9A86]/5 hover:text-[#8E9A86] cursor-pointer transition-all">
                        <div class="flex items-center gap-3">
                            <i :class="[section.icon, 'text-base text-stone-400 group-hover:text-[#8E9A86]']"></i>
                            <span class="font-light text-sm tracking-wider">{{ section.title }}</span>
                        </div>
                        <i
                            :class="['pi text-[10px] text-stone-400 transition-transform', isAccountOpen ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
                    </div>

                    <!-- 單一跳轉連結 -->
                    <router-link v-else :to="{ name: section.routeName }"
                        class="flex items-center py-2.5 px-3 rounded-lg text-stone-600 hover:bg-[#8E9A86]/5 hover:text-[#8E9A86] cursor-pointer transition-all"
                        active-class="bg-[#8E9A86]/10 !text-[#8E9A86] font-medium">
                        <div class="flex items-center gap-3">
                            <i :class="[section.icon, 'text-base']"></i>
                            <span class="font-light text-sm tracking-wider">{{ section.title }}</span>
                        </div>
                    </router-link>

                    <!-- 子連結區塊 -->
                    <div v-if="section.children && isAccountOpen" class="mt-1 mb-2 ml-3 border-l border-stone-200/50">
                        <ul class="space-y-1 ml-3">
                            <router-link v-for="child in section.children" :key="child.name" :to="{ name: child.routeName }"
                                class="block py-2 px-3 rounded-lg text-xs text-stone-500 hover:text-[#8E9A86] hover:bg-[#8E9A86]/5 transition-all"
                                active-class="bg-[#8E9A86]/10 !text-[#8E9A86] font-medium">
                                {{ child.name }}
                            </router-link>
                        </ul>
                    </div>
                </div>
            </nav>
        </aside>
    </div>
</template>
