<script setup>
import { ref, computed } from 'vue';

const activeTab = ref('全部');
const tabs = ['全部', '折扣券', '點數回饋', '免運券'];

// 模擬 8 筆優惠券資料 (全數為服飾相關)
const vouchers = ref([
    { id: 1, type: 'discount', title: '夏季新品 9折', desc: '全館指定服飾系列適用 | 低消 $1,000', event: '新品上市', expiry: '2026.05.31', type_text: '商城折扣券', count: 2 },
    { id: 2, type: 'points', title: '6% 點數回饋', desc: '結帳金額 6% 回饋 | 低消 $1,500', event: '會員日', expiry: '2026.05.15', type_text: 'Shizuku 點數', count: 1 },
    { id: 3, type: 'discount', title: '滿額折 $200', desc: '服飾類單筆滿 $2,500 現折 $200', event: '限時折扣', expiry: '2026.05.10', type_text: '全館優惠', count: 1 },
    { id: 4, type: 'shipping', title: '全館免運費', desc: '不限金額 | 僅限超商取貨', event: '免運活動', expiry: '2026.06.01', type_text: '運費補貼', count: 3 },
    { id: 5, type: 'discount', title: '襯衫類 85折', desc: '指定長袖/短袖襯衫適用', event: '商務專區', expiry: '2026.05.20', type_text: '分類專屬', count: 1 },
    { id: 6, type: 'points', title: '評論加碼 20 pts', desc: '購買後完成評論即可獲得', event: '好評活動', expiry: '2026.05.30', type_text: 'Shizuku 點數', count: 5 },
    { id: 7, type: 'shipping', title: '免運券 (宅配)', desc: '滿 $1,500 宅配免運', event: 'VIP專享', expiry: '2026.06.15', type_text: '運費補貼', count: 1 },
    { id: 8, type: 'discount', title: '下單即享 95折', desc: '不限品項 | 首購限定', event: '新人見面禮', expiry: '2026.12.31', type_text: '全館優惠', count: 1 },
]);

// 篩選邏輯：對應 Tab 切換
const filteredVouchers = computed(() => {
    if (activeTab.value === '全部') return vouchers.value;

    const typeMap = {
        '折扣券': 'discount',
        '點數回饋': 'points',
        '免運券': 'shipping'
    };

    return vouchers.value.filter(v => v.type === typeMap[activeTab.value]);
});

const registerVoucher = () => {
    console.log('註冊優惠券');
};
</script>

<template>
    <div class="w-full bg-transparent p-0 font-serif">
        <div class="flex justify-between items-center mb-8 border-b border-stone-200/50 pb-6">
            <h2 class="text-xl font-light text-stone-850 tracking-wider">我的優惠券夾</h2>
            <router-link to="/vouchers/history" class="text-xs text-[#8E9A86] hover:text-[#7d8b75] hover:underline flex items-center gap-1.5 font-light transition-colors">
                <i class="pi pi-clock text-[10px]"></i> 檢視歷史紀錄
            </router-link>
        </div>

        <div class="bg-stone-50/20 p-5 rounded-xl border border-stone-200/60 mb-8 flex items-center gap-4">
            <label class="text-stone-750 text-sm font-light shrink-0 tracking-wider">新增優惠券</label>
            <input type="text" placeholder="請輸入優惠代碼"
                class="flex-grow px-4 py-2 bg-white/60 border border-stone-200/80 rounded-full focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-sm text-stone-800 transition font-sans" />
            <button @click="registerVoucher"
                class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-6 py-2 rounded-full text-sm font-light tracking-widest transition cursor-pointer shadow-xs">儲存</button>
        </div>

        <div class="border-b border-stone-200/50 mb-8 flex items-center gap-6">
            <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="['pb-3 text-xs tracking-wider transition-colors relative cursor-pointer font-light',
                activeTab === tab ? 'text-[#8E9A86] font-medium' : 'text-stone-500 hover:text-[#8E9A86]']">
                {{ tab }}
                <span v-if="activeTab === tab"
                    class="absolute bottom-0 left-0 w-full h-[2px] bg-[#8E9A86] rounded-full"></span>
            </button>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
            <div v-for="voucher in filteredVouchers" :key="voucher.id" class="relative group">

                <div v-if="voucher.count > 1"
                    class="absolute -top-2 -right-2 bg-stone-850 text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10 shadow-sm font-sans">
                    x{{ voucher.count }}
                </div>

                <div
                    class="flex h-36 bg-white/40 border border-stone-200/60 rounded-2xl overflow-hidden shadow-xs hover:border-[#8E9A86] transition-all duration-300">
                    <div
                        class="w-1/3 bg-gradient-to-br from-[#8E9A86] to-[#7d8b75] text-white p-5 flex flex-col justify-between items-center relative">
                        <div class="absolute right-[-6px] top-0 h-full w-[12px] flex flex-col justify-around z-10">
                            <div v-for="i in 8" :key="i" class="w-[12px] h-[12px] bg-[#FCFBF9] rounded-full"></div>
                        </div>

                        <div class="text-center">
                            <i :class="['pi text-xl text-stone-100',
                                voucher.type === 'discount' ? 'pi-percentage' :
                                    voucher.type === 'points' ? 'pi-wallet' : 'pi-car']"></i>
                            <p class="text-[10px] font-light text-stone-100 mt-2 tracking-wider">{{ voucher.type_text }}</p>
                        </div>
                    </div>

                    <div class="flex-grow p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-1">
                                <h4 class="font-medium text-base text-stone-850 tracking-wide truncate">{{ voucher.title }}</h4>
                                <span v-if="voucher.event"
                                    class="text-[10px] bg-[#8E9A86]/10 text-[#8E9A86] font-light px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">{{
                                    voucher.event }}</span>
                            </div>
                            <p class="text-xs text-stone-500 font-light line-clamp-1">{{ voucher.desc }}</p>
                        </div>

                        <div
                            class="flex justify-between items-center text-[10px] text-stone-400 mt-3 pt-3 border-t border-stone-200/30">
                            <span class="font-sans font-light"><i class="pi pi-clock mr-1"></i> {{ voucher.expiry }} 到期</span>
                            <button class="text-[#8E9A86] hover:text-[#7d8b75] font-medium transition hover:underline cursor-pointer">立即使用</button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredVouchers.length === 0" class="col-span-2 py-16 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl font-light text-xs">
                目前沒有相關的優惠券
            </div>
        </div>
    </div>
</template>