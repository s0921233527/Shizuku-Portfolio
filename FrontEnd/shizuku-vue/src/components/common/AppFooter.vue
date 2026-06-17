<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'

const newsletterEmail = ref('')
</script>

<template>
  <!-- 溫柔日系燕麥色電商頁尾 -->
  <footer class="bg-[#F5F2EB] border-t border-stone-200/60 pt-20 pb-12 mt-auto font-serif text-stone-500">
    <div class="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
      
      <!-- 頁尾四大網格導覽 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        <!-- 品牌簡介 -->
        <div class="flex flex-col gap-5">
          <div class="flex items-end gap-2.5">
            <span class="text-xl font-medium tracking-[0.25em] text-stone-800 uppercase">
              shizuku
            </span>
            <span class="text-[9px] text-[#8E9A86] tracking-widest pb-0.5">しずく</span>
          </div>

          <p class="text-stone-500 text-xs leading-loose tracking-[0.15em] font-light">
            「如水滴般純粹，包容生活的所有姿態。」<br /><br />
            SHIZUKU 誕生於台灣。我們褪去繁複裝飾，回歸剪裁的本質與材質的溫度。致力於提供如水般透明、無負擔的高品質日系質感日常衣著。
          </p>

          <div>
            <RouterLink
              :to="{ name: 'about' }"
              class="inline-block mt-1 text-[10px] text-stone-800 font-semibold tracking-widest border-b border-stone-850 pb-0.5 hover:text-[#8E9A86] hover:border-[#8E9A86] transition-colors"
            >
              閱讀完整品牌故事 &gt;
            </RouterLink>
          </div>
        </div>

        <!-- 購物指南 -->
        <div class="lg:pl-8">
          <h4 class="text-xs font-semibold text-stone-800 tracking-[0.3em] uppercase mb-6">購物指南</h4>
          <ul class="flex flex-col gap-3.5 text-xs text-stone-500 tracking-widest font-light">
            <li>
              <RouterLink
                :to="{ name: 'guide' }"
                class="hover:text-[#8E9A86] transition-colors block"
              >
                如何購買 (Shopping Guide)
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'shippingPolicy' }"
                class="hover:text-[#8E9A86] transition-colors block"
              >
                運送政策 (Shipping)
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'returnPolicy' }"
                class="hover:text-[#8E9A86] transition-colors block"
              >
                退換貨說明 (Return)
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'faq' }"
                class="hover:text-[#8E9A86] cursor-pointer transition-colors block"
              >
                常見問題 FAQ
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- 會員服務 -->
        <div class="lg:pl-8">
          <h4 class="text-xs font-semibold text-stone-800 tracking-[0.3em] uppercase mb-6">會員服務</h4>
          <ul class="flex flex-col gap-3.5 text-xs text-stone-500 tracking-widest font-light">
            <li>
              <RouterLink
                :to="{ name: 'customer' }"
                class="hover:text-[#8E9A86] cursor-pointer transition-colors block"
              >
                聯絡我們 (Contact Us)
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'privacyPolicy' }"
                class="hover:text-[#8E9A86] transition-colors block"
              >
                隱私權政策 (Privacy)
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{ name: 'termsOfService' }"
                class="hover:text-[#8E9A86] transition-colors block"
              >
                服務條款 (Terms)
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- 社群追蹤 -->
        <div>
          <h4 class="text-xs font-semibold text-stone-800 tracking-[0.3em] uppercase mb-6">追蹤我們</h4>
          <div class="flex gap-3">
            <Button
              icon="pi pi-facebook"
              iconClass="!text-xl"
              severity="secondary"
              rounded
              variant="text"
              as="a"
              href="#"
              class="!text-stone-550 hover:!text-[#8E9A86] hover:!bg-[#8E9A86]/5 hover:!border-[#8E9A86]/30 transition-colors !w-10 !h-10 flex items-center justify-center border border-stone-250 bg-[#FCFBF9]"
            />
            <Button
              icon="pi pi-instagram"
              iconClass="!text-xl"
              severity="secondary"
              rounded
              variant="text"
              as="a"
              href="#"
              class="!text-stone-550 hover:!text-[#8E9A86] hover:!bg-[#8E9A86]/5 hover:!border-[#8E9A86]/30 transition-colors !w-10 !h-10 flex items-center justify-center border border-stone-250 bg-[#FCFBF9]"
            />
            <Button
              icon="pi pi-youtube"
              iconClass="!text-xl"
              severity="secondary"
              rounded
              variant="text"
              as="a"
              href="#"
              class="!text-stone-550 hover:!text-[#8E9A86] hover:!bg-[#8E9A86]/5 hover:!border-[#8E9A86]/30 transition-colors !w-10 !h-10 flex items-center justify-center border border-stone-250 bg-[#FCFBF9]"
            />
          </div>
        </div>
      </div>

      <!-- 分隔線與底部宣告 -->
      <div class="border-t border-stone-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-stone-450">
        <p class="text-[10px] tracking-widest mx-auto md:mx-0 font-light">
          © 2026 SHIZUKU FASHION GROUP. ALL RIGHTS RESERVED.
        </p>
        <div class="flex items-center justify-center gap-6 w-full md:w-auto text-stone-300">
          <i class="pi pi-paypal text-lg"></i>
          <i class="pi pi-apple text-lg"></i>
          <i class="pi pi-credit-card text-lg"></i>
        </div>
      </div>
      
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>
