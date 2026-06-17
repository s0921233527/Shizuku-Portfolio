<script setup>
import MemberSidebar from '../components/member/MemberSidebar.vue';
</script>

<template>
    <div class="min-h-screen bg-[#FCFBF9] text-stone-850 font-serif pb-20 pt-28">
        <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
            <MemberSidebar class="hidden md:block w-64 flex-shrink-0" />

            <div class="flex-1 min-w-0 bg-white/80 border border-stone-200/50 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md">
                <router-view />
            </div>
        </div>
    </div>
</template>