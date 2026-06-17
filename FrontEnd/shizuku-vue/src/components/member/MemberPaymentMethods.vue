<script setup>
import { ref } from 'vue';

// 狀態管理：預設為空陣列，代表還沒有資料
const creditCards = ref([]);
const bankAccounts = ref([]);

const addCard = () => {
    console.log('打開新增信用卡視窗');
};

const addBankAccount = () => {
    console.log('打開新增銀行帳號視窗');
};
</script>

<template>
    <div class="w-full bg-transparent p-0 font-serif">
        <div class="mb-8 border-b border-stone-200/50 pb-6">
            <h2 class="text-xl font-light text-stone-850 tracking-wider">支付方式管理</h2>
            <p class="text-stone-500 text-xs mt-1 font-light">管理您的信用卡與銀行綁定帳號，提升結帳便利性</p>
        </div>

        <section class="bg-stone-50/20 p-6 rounded-xl border border-stone-200/60 mb-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-sm font-medium text-stone-800 flex items-center gap-2">
                    <i class="pi pi-credit-card text-[#8E9A86]"></i>
                    信用卡 / 金融卡
                </h3>
                <button 
                    @click="addCard"
                    class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-full text-xs font-light tracking-wider transition duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <i class="pi pi-plus text-[10px]"></i> 新增信用卡
                </button>
            </div>

            <div v-if="creditCards.length === 0" class="py-12 text-center border border-dashed border-stone-200 rounded-lg font-light">
                <i class="pi pi-credit-card text-3xl text-stone-300 mb-2"></i>
                <p class="text-stone-400 text-xs tracking-wider">目前沒有綁定的信用卡</p>
            </div>
            <div v-else>
            </div>
        </section>

        <section class="bg-stone-50/20 p-6 rounded-xl border border-stone-200/60">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-sm font-medium text-stone-800 flex items-center gap-2">
                    <i class="pi pi-building text-[#8E9A86]"></i>
                    銀行帳號
                </h3>
                <button 
                    @click="addBankAccount"
                    class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-4 py-2 rounded-full text-xs font-light tracking-wider transition duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <i class="pi pi-plus text-[10px]"></i> 新增銀行帳號
                </button>
            </div>

            <div v-if="bankAccounts.length === 0" class="py-12 text-center border border-dashed border-stone-200 rounded-lg font-light">
                <i class="pi pi-building text-3xl text-stone-300 mb-2"></i>
                <p class="text-stone-400 text-xs tracking-wider">目前沒有綁定的銀行帳號</p>
            </div>
            <div v-else>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* 這裡可以放針對此頁面的特殊調整 */
.shadow-sm {
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}
</style>