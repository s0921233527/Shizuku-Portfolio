<script setup>
import { ref } from 'vue';

// 模擬資料結構：將設定檔拆分，便於未來擴充
const emailSettings = ref([
    { id: 'email_security', title: '帳戶安全通知', desc: '包含登入提醒、密碼變更及重要帳號異動，無法關閉。', enabled: true, disabled: true },
    { id: 'email_order', title: '訂單狀態更新', desc: '通知訂單付款、出貨及配送進度。', enabled: true },
    { id: 'email_marketing', title: '優惠與活動資訊', desc: '接收最新的促銷活動與個人化推薦。', enabled: false },
    { id: 'email_survey', title: '使用者滿意度問卷', desc: '協助我們改善服務，偶爾發送問卷邀請。', enabled: true },
]);

const smsSettings = ref([
    { id: 'sms_security', title: '帳戶安全簡訊', desc: '緊急安全通知，為保障您的帳號安全。', enabled: true, disabled: true },
    { id: 'sms_marketing', title: '獨家優惠簡訊', desc: '接收第一手的限時折扣與閃購活動。', enabled: true },
]);

const toggleSetting = (item) => {
    if (item.disabled) return;
    item.enabled = !item.enabled;
    console.log(`Setting ${item.id} changed to: ${item.enabled}`);
};
</script>

<template>
    <div class="w-full bg-transparent p-0 font-serif">
        <div class="mb-8 border-b border-stone-200/50 pb-6">
            <h2 class="text-xl font-light text-stone-850 tracking-wider">通知設定</h2>
            <p class="text-stone-500 text-xs mt-1 font-light">自訂您接收通知的方式與類型，隨時掌握重要動態</p>
        </div>

        <div class="bg-stone-50/20 p-6 rounded-xl border border-stone-200/60 mb-6">
            <h3 class="text-sm font-medium text-stone-850 mb-6 flex items-center gap-2 border-b border-stone-200/30 pb-3">
                <i class="pi pi-envelope text-[#8E9A86]"></i> Email 通知
            </h3>
            <div class="space-y-6">
                <div v-for="item in emailSettings" :key="item.id" class="flex items-center justify-between">
                    <div>
                        <p class="font-normal text-sm text-stone-800">{{ item.title }}</p>
                        <p class="text-xs text-stone-450 mt-0.5 font-light">{{ item.desc }}</p>
                    </div>
                    <button @click="toggleSetting(item)" :class="['w-12 h-6 rounded-full transition-colors duration-300 relative',
                        item.enabled ? 'bg-[#8E9A86]' : 'bg-stone-200',
                        item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']">
                        <span :class="['absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300',
                            item.enabled ? 'translate-x-6' : '']"></span>
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-stone-50/20 p-6 rounded-xl border border-stone-200/60">
            <h3 class="text-sm font-medium text-stone-850 mb-6 flex items-center gap-2 border-b border-stone-200/30 pb-3">
                <i class="pi pi-comment text-[#8E9A86]"></i> 簡訊通知
            </h3>
            <div class="space-y-6">
                <div v-for="item in smsSettings" :key="item.id" class="flex items-center justify-between">
                    <div>
                        <p class="font-normal text-sm text-stone-800">{{ item.title }}</p>
                        <p class="text-xs text-stone-450 mt-0.5 font-light">{{ item.desc }}</p>
                    </div>
                    <button @click="toggleSetting(item)" :class="['w-12 h-6 rounded-full transition-colors duration-300 relative',
                        item.enabled ? 'bg-[#8E9A86]' : 'bg-stone-200',
                        item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']">
                        <span :class="['absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300',
                            item.enabled ? 'translate-x-6' : '']"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 這裡不需要特別寫額外的 CSS，全部用 Tailwind 的 utility class 完成 */
</style>