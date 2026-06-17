<template>
  <!-- 7. Customer Reviews: 顧客口碑好評語錄 -->
  <section class="bg-[#FAF8F5]/80 py-24 px-6 border-t border-stone-200/30">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col items-center mb-16 text-center">
        <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase font-serif">User Voice</span>
        <h2 class="text-2xl md:text-3xl font-light tracking-[0.2em] text-stone-855 mt-2 font-serif">顧客口碑好評</h2>
        <div class="w-8 h-[1px] bg-[#8E9A86] mt-4"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-[#FCFBF9] p-8 rounded-3xl border border-stone-200/40 flex flex-col justify-between"
        >
          <div>
            <!-- 評價星星 -->
            <div class="flex gap-1 mb-4 text-[#8E9A86]">
              <i v-for="star in review.rating" :key="star" class="pi pi-star-fill text-[10px]"></i>
            </div>
            <p class="text-stone-650 text-xs md:text-sm leading-relaxed tracking-wide mb-6 font-serif">
              「{{ review.comment }}」
            </p>
          </div>
          <div class="flex justify-between items-center border-t border-stone-100 pt-4 font-serif">
            <span class="text-xs font-medium text-stone-850">{{ review.name }}</span>
            <span class="text-[10px] px-2.5 py-1 bg-[#F0F2EE] text-[#8E9A86] rounded-lg font-medium">{{ review.tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// 口碑好評語錄
const reviews = [
  {
    id: 1,
    name: 'Yuki K.',
    rating: 5,
    tag: '棉麻系列愛好者',
    comment: '買了天絲棉麻襯衫，真的非常親膚透氣，在炎熱的夏天穿也完全不悶熱，剪裁俐落很有日系都會感。'
  },
  {
    id: 2,
    name: 'Mina L.',
    rating: 5,
    tag: '回購率 100%',
    comment: '版型超級修飾身材！高腰垂墜寬褲穿起來腿很長，洗過好幾次也沒有起毛球或縮水，已經推坑給同事們了。'
  },
  {
    id: 3,
    name: 'Haru T.',
    rating: 5,
    tag: '忠實粉絲推薦',
    comment: '極簡洋裝系列是一件出門的救星！材質有微微的光澤感，不論是休閒野餐還是出席正式場合，都非常有氣氣質。'
  }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>
