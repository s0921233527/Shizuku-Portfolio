<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()

const totalPoints = ref('50');
const expiringSoon = ref(0);

totalPoints.value = authStore.userPoints.toLocaleString();

// 模擬資料
const pointsHistory = ref([
    { id: 1, type: 'order', title: '完成訂單 #12345', amount: +50, date: '2026-04-28' },
    { id: 2, type: 'use', title: '兌換折價券', amount: -100, date: '2026-04-20' },
]);
</script>

<template>
  <div class="w-full bg-transparent p-0 font-serif">
    <!-- 標題區塊 -->
    <div class="mb-8 border-b border-stone-200/50 pb-6">
      <h2 class="text-xl font-light text-stone-850 tracking-wider">點數中心</h2>
      <p class="text-stone-500 text-xs mt-1 font-light">管理您的紅利點數與累積紀錄</p>
    </div>

    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <!-- 點數資訊卡片 -->
      <div class="bg-[#8E9A86] rounded-xl p-6 text-white flex flex-col justify-between shadow-sm">
        <p class="text-[#FCFBF9]/80 text-xs font-light mb-1">可用點數</p>
        <h3 class="text-3xl font-light mb-4">{{ totalPoints }} <span class="text-sm font-light">pts</span></h3>
        <div class="flex justify-between items-end">
          <p class="text-xs text-[#FCFBF9]/70 font-light">即將到期：{{ expiringSoon }} pts</p>
          <router-link to="/point-store"
            class="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-light tracking-wider transition cursor-pointer">
            前往商城
          </router-link>
        </div>
      </div>

      <!-- 快速累積點數指引 -->
      <div class="bg-[#8E9A86]/5 rounded-xl p-6 border border-[#8E9A86]/10 flex flex-col justify-between">
        <h4 class="font-medium text-stone-850 text-sm mb-4">如何快速累積點數？</h4>
        <div class="space-y-3 font-light">
          <div class="flex items-center gap-3 text-xs text-stone-600">
            <i class="pi pi-check-circle text-[#8E9A86]"></i> 每日簽到 (+5 pts)
          </div>
          <div class="flex items-center gap-3 text-xs text-stone-600">
            <i class="pi pi-check-circle text-[#8E9A86]"></i> 完成訂單 (消費金額 1%)
          </div>
          <div class="flex items-center gap-3 text-xs text-stone-600">
            <i class="pi pi-check-circle text-[#8E9A86]"></i> 評論商品 (+20 pts)
          </div>
        </div>
      </div>
    </div>

    <!-- 點數歷史記錄 -->
    <div class="mt-10">
      <h3 class="text-sm font-medium text-stone-800 mb-4">點數紀錄</h3>
      <div class="overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="text-stone-400 text-xs border-b border-stone-200/50">
              <th class="pb-3 font-light">項目</th>
              <th class="pb-3 font-light">日期</th>
              <th class="pb-3 font-light text-right">變動</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pointsHistory" :key="item.id" class="border-b border-stone-200/30 last:border-0 font-light">
              <td class="py-4 text-stone-700 text-sm">{{ item.title }}</td>
              <td class="py-4 text-stone-500 text-xs font-sans">{{ item.date }}</td>
              <td
                :class="['py-4 text-right text-sm', item.amount > 0 ? 'text-[#8E9A86] font-medium' : 'text-stone-500']"
              >
                {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 漸層卡片微調 */
.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
}
</style>