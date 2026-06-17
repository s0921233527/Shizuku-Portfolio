<script setup>
import AppNav from '@/components/common/AppNav.vue'
import AppFooter from '@/components/common/AppFooter.vue';
</script>

<template>
  <nav>
    <AppNav />
  </nav>
  <main>
    <RouterView />
  </main>

  <footer>
    <AppFooter />
  </footer>
</template>
