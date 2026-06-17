<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 根據路由名稱來決定顯示什麼文字
const pageTitle = computed(() => {
    // 這裡的 'login', 'register', 'forgot-password' 
    // 請對應到你在 router/index.js 定義的 name 屬性
    switch (route.name) {
        case 'Login':
            return '登入';
        case 'Register':
            return '註冊';
        case 'ForgotPassword':
            return '忘記密碼';
        default:
            return ''; // 其他頁面不顯示，或者你可以設定預設文字
    }
});
</script>

<template>
    <div class="fixed top-0 left-0 w-full z-50 bg-[#FCFBF9]/80 backdrop-blur-md border-b border-stone-200/30 py-3 font-serif">
        <div class="flex justify-center items-center px-4 py-4 max-w-7xl mx-auto relative">
            <div class="absolute left-4 lg:left-8">
                <router-link to="/" class="cursor-pointer inline-block">
                    <img src="@/assets/img/shizuku_brand_logo.png" alt="Shizuku" class="h-10 md:h-12 w-auto object-contain inline-block" />
                </router-link>
            </div>

            <div class="flex justify-center gap-8 text-[15px] font-light tracking-[0.2em] text-stone-850 uppercase">
                {{ pageTitle }}
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 這裡放你的樣式 */
</style>