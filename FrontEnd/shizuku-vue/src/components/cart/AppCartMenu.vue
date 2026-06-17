<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import Menu from 'primevue/menu'
const menu = ref()
const cartStore = useCartStore()

const router = useRouter()

const toggle = (event) => {
  menu.value.toggle(event)
}

// 建立一個去購物車的函式
const goToCart = () => {
  router.push({ name: 'cart' })
  // 切換頁面後，把原本打開的下拉小選單給隱藏起來
  menu.value.hide()
}
import { getImageUrl } from '@/utils/imageHelper'
</script>

<template>
  <div class="inline-block font-serif">
    <button class="flex items-center gap-1.5 hover:text-[#8E9A86] transition-colors" @click="toggle">
      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        ></path>
      </svg>
      <span class="text-xs font-semibold font-serif">{{ cartStore.totalItems }}</span>
    </button>

    <Menu
      ref="menu"
      id="overlay_menu"
      :model="cartStore.items"
      :popup="true"
      class="w-80 p-3 !bg-[#FCFBF9] !border !border-stone-200/50 !shadow-xl !rounded-2xl font-serif"
    >
      <template #start v-if="cartStore.items.length === 0">
        <div class="py-8 px-4 text-center text-stone-400 text-sm font-light">
          <i class="pi pi-shopping-cart text-3xl block mb-2.5 opacity-55 text-[#8E9A86]"></i>
          目前未加入商品
        </div>
      </template>

      <template #item="{ item }">
        <div
          @click.stop
          class="flex items-center gap-3 p-2 hover:bg-stone-100/60 rounded-xl transition-colors group"
        >
          <img :src="getImageUrl(item.image)" alt="商品縮圖" class="w-14 h-14 object-cover rounded-xl border border-stone-200/30 flex-shrink-0" />

          <div class="flex flex-col flex-1">
            <span class="text-sm font-medium text-stone-800">{{ item.name }}</span>
            <span class="text-[10px] text-stone-400 mt-0.5 font-serif">{{ item.color }} / {{ item.size }}</span>
            
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs font-semibold text-stone-500 font-serif">NT$ {{ (item.price * item.quantity).toLocaleString() }}</span>
              
              <div class="flex items-center gap-3 bg-white border border-stone-200 rounded-full px-2 py-0.5">
                <button 
                  @click.stop="item.quantity > 1 ? item.quantity-- : null" 
                  class="text-stone-400 hover:text-stone-700 font-bold transition-colors"
                >
                  -
                </button>
                <span class="text-xs font-bold text-stone-800 w-3 text-center">{{ item.quantity }}</span>
                <button 
                  @click.stop="item.quantity++" 
                  class="text-stone-400 hover:text-stone-700 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            @click.stop="cartStore.removeFromCart(item.id)"
            class="p-2 text-stone-300 hover:text-rose-500 transition-colors"
            title="刪除商品"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>
        </div>
      </template>

      <template #end v-if="cartStore.items.length > 0">
        <div class="p-2 mt-2 border-t border-stone-200/50">
          <button
            @click="goToCart"
            class="w-full bg-[#8E9A86] text-white py-2 rounded-full text-sm font-bold tracking-[0.15em] hover:bg-[#7D8A75] transition-colors"
          >
            檢視購物車
          </button>
        </div>
      </template>
    </Menu>
  </div>
</template>
