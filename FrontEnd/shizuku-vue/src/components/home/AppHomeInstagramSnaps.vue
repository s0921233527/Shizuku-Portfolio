<template>
  <!-- 8. Instagram Snap Grid: 社群穿搭牆 -->
  <section class="max-w-7xl mx-auto px-6 py-24">
    <div class="flex flex-col items-center mb-16 text-center">
      <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase font-serif">Social Snap</span>
      <h2 class="text-2xl md:text-3xl font-light tracking-[0.2em] text-stone-855 mt-2 font-serif">穿搭靈感 @ Instagram</h2>
      <div class="w-8 h-[1px] bg-[#8E9A86] mt-4"></div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
      <div
        v-for="snap in igSnaps"
        :key="snap.id"
        class="group relative overflow-hidden rounded-2xl aspect-square border border-stone-200/30 cursor-pointer"
      >
        <img
          :src="snap.image"
          alt="Instagram Outfit Snap"
          class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
        />
        <!-- Hover Overlay -->
        <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
          <i class="pi pi-instagram text-xl mb-1.5"></i>
          <span class="text-[10px] tracking-widest font-light font-sans">#shizukustyle</span>
          <span class="text-[9px] mt-1 text-stone-250 flex items-center gap-1 font-sans">
            <i class="pi pi-heart-fill text-[8px] text-rose-450"></i> {{ snap.likes }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Instagram 穿搭牆資料
const igSnaps = [
  { id: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600', likes: 1248 },
  { id: 2, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600', likes: 852 },
  { id: 3, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600', likes: 1402 },
  { id: 4, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600', likes: 978 },
  { id: 5, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600', likes: 1120 },
  { id: 6, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600', likes: 1354 }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+TC:wght@300;450;500&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>
