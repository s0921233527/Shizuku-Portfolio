<template>
  <!-- 3. Brand Commitments: 品牌服務特質承諾 -->
  <section class="py-20 px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div
        v-for="(item, i) in commitments"
        :key="i"
        class="flex flex-col items-center text-center p-8 bg-[#FCFBF9] border border-stone-200/40 rounded-2xl transition-all duration-300 hover:bg-[#FAF8F5]/80"
      >
        <div class="w-12 h-12 rounded-full bg-[#F0F2EE] text-[#8E9A86] flex items-center justify-center mb-5">
          <i :class="['pi', item.icon, 'text-lg']"></i>
        </div>
        <h3 class="text-sm font-medium text-stone-800 tracking-wider mb-3 font-serif">{{ item.title }}</h3>
        <p class="text-xs text-stone-500 leading-relaxed font-light tracking-wide px-2 font-serif">
          {{ item.desc }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
// 品牌四大承諾資料
const commitments = [
  {
    icon: 'pi-shopping-bag',
    title: '全館滿額免運',
    desc: '全館單筆訂單消費滿 NT$1,500 即享免運優惠，隨時隨地輕鬆購物。'
  },
  {
    icon: 'pi-refresh',
    title: '7 天安心鑑賞',
    desc: '提供完善的退換貨保障，讓您在家也能自在試穿，買得放心、穿得舒心。'
  },
  {
    icon: 'pi-send',
    title: '極速物流配送',
    desc: '現貨商品於 48 小時內快速出貨，細緻整燙與安全包裝，將美好第一時間送達。'
  },
  {
    icon: 'pi-shield',
    title: '原廠品質保證',
    desc: '嚴選日本進口天絲棉與亞麻材質，注重車工細節與版型修飾，保證極致親膚。'
  }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>
