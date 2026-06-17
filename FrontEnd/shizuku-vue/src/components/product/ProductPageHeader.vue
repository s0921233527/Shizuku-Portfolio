<script setup>
defineProps({
    title:         { type: String, default: 'All Shop' },
    parentCrumb:   { type: String, default: null },
    currentCrumb:  { type: String, default: 'All Products' }
})
</script>

<template>
    <div class="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <h1 class="text-4xl md:text-5xl font-light tracking-[0.4em] uppercase text-stone-800 font-serif mb-6">
            {{ title }}
        </h1>
        <div class="text-xs md:text-sm text-stone-400 uppercase tracking-[0.25em] font-serif">
            <RouterLink to="/" class="hover:text-[#8E9A86] transition-colors">Home</RouterLink>
            <span class="mx-3 text-stone-300">/</span>
            <template v-if="parentCrumb">
                <span class="text-stone-400">{{ parentCrumb }}</span>
                <span class="mx-3 text-stone-300">/</span>
            </template>
            <span class="text-[#8E9A86] font-medium">{{ currentCrumb }}</span>
        </div>
    </div>
</template>