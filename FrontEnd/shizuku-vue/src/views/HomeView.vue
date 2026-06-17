<script setup>
import { onMounted } from 'vue';
import HeroCarousel from '@/components/home/AppHeroCarousel.vue';
import HomeBrandConcept from '@/components/home/AppHomeBrandConcept.vue';
import HomeBrandCommitments from '@/components/home/AppHomeBrandCommitments.vue';
import HomeEditorial from '@/components/home/AppHomeEditorial.vue';
import HomeStyleFeatures from '@/components/home/AppHomeStyleFeatures.vue';
import HomeProducts from '@/components/home/AppHomeProducts.vue';
import HomeReviews from '@/components/home/AppHomeReviews.vue';
import HomeInstagramSnaps from '@/components/home/AppHomeInstagramSnaps.vue';
import HomeNewsletter from '@/components/home/AppHomeNewsletter.vue';

onMounted(() => {
  window.scrollTo(0, 0);
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});
</script>

<template>
  <main class="w-full bg-[#FCFBF9] text-stone-850 pb-0 pt-[60px] md:pt-[52px] lg:pt-[56px] overflow-hidden">
    <!-- 1. 首頁高級輪播 Banner -->
    <HeroCarousel />

    <!-- 2. 品牌理念故事 -->
    <HomeBrandConcept />

    <!-- 3. 品牌四大服務承諾 -->
    <HomeBrandCommitments />  

    <!-- 4. 穿搭型錄特輯 -->
    <HomeEditorial />

    <!-- 5. 風格穿搭企劃特輯 -->
    <HomeStyleFeatures />

    <!-- 6. 熱銷商品排行 -->
    <HomeProducts />

    <!-- 7. 買家口碑好評 -->
    <HomeReviews />

    <!-- 8. Instagram 社群穿搭牆 -->
    <HomeInstagramSnaps />

    <!-- 9. 電子報訂閱 -->
    <HomeNewsletter />
  </main>
</template>



