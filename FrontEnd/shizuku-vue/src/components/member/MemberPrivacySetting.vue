<script setup>
import { ref } from 'vue';

const sessions = ref([
    { device: 'Windows 10 · Chrome', location: 'Kaohsiung, TW', current: true },
    //{ device: 'iPhone 15 · Safari', location: 'Kaohsiung, TW', current: false },
]);

const is2FAEnabled = ref(false);

const revokeSession = (device) => {
    console.log(`登出裝置: ${device}`);
};
</script>

<template>
    <div class="w-full bg-transparent p-0 font-serif">
        <div class="mb-8 border-b border-stone-200/50 pb-6">
            <h2 class="text-xl font-light text-stone-850 tracking-wider">隱私與安全設定</h2>
            <p class="text-stone-500 text-xs mt-1 font-light">管理您的登入裝置、帳號安全性以及資料保護</p>
        </div>

        <div class="bg-stone-50/20 p-6 rounded-xl border border-stone-200/60 mb-6">
            <h3 class="text-sm font-medium text-stone-850 mb-6 flex items-center gap-2 border-b border-stone-200/30 pb-3">
                <i class="pi pi-desktop text-[#8E9A86]"></i> 目前登入裝置
            </h3>
            <div class="space-y-4">
                <div v-for="session in sessions" :key="session.device"
                    class="flex items-center justify-between p-4 bg-stone-50/50 rounded-lg border border-stone-200/30">
                    <div>
                        <p class="font-normal text-sm text-stone-800">{{ session.device }}
                            <span v-if="session.current"
                                class="ml-2 text-xs bg-[#8E9A86]/10 text-[#8E9A86] px-2 py-0.5 rounded font-light">目前裝置</span>
                        </p>
                        <p class="text-xs text-stone-500 font-light mt-1">{{ session.location }}</p>
                    </div>
                    <button v-if="!session.current" @click="revokeSession(session.device)"
                        class="text-xs text-red-500 hover:text-red-700 font-light cursor-pointer hover:underline">登出</button>
                </div>
            </div>
        </div>

        <div class="bg-stone-50/20 p-6 rounded-xl border border-stone-200/60 mb-6">
            <h3 class="text-sm font-medium text-stone-850 mb-6 flex items-center gap-2 border-b border-stone-200/30 pb-3">
                <i class="pi pi-shield text-[#8E9A86]"></i> 帳號安全
            </h3>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-normal text-sm text-stone-800">雙重驗證 (2FA)</p>
                    <p class="text-xs text-stone-400 mt-1 font-light">啟用後，登入時需進行額外驗證。</p>
                </div>
                <button @click="is2FAEnabled = !is2FAEnabled"
                    :class="['w-12 h-6 rounded-full transition-colors duration-300 relative', is2FAEnabled ? 'bg-[#8E9A86]' : 'bg-stone-200', 'cursor-pointer']">
                    <span
                        :class="['absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300', is2FAEnabled ? 'translate-x-6' : '']"></span>
                </button>
            </div>
        </div>

        <div class="bg-red-500/5 p-6 rounded-xl border border-red-200/40">
            <h3 class="text-sm font-medium text-red-800 mb-4 flex items-center gap-2">
                <i class="pi pi-exclamation-triangle text-red-600"></i> 帳號控制
            </h3>
            <p class="text-xs text-stone-500 mb-6 font-light leading-relaxed">刪除帳號將會移除所有歷史訂單與會員資料，此動作無法復原。</p>
            <button
                class="w-full py-2.5 border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-500/5 rounded-full transition-all duration-300 font-light text-xs tracking-wider cursor-pointer">
                申請永久刪除帳號
            </button>
        </div>
    </div>
</template>