<script setup>
import { useRoute } from 'vue-router'
import ProductForm from '@/components/admin/ProductForm.vue'

const route = useRoute()
const productId = Number(route.params.id)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="text-gray-400 hover:text-gray-600">
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-xl font-medium">編輯商品</h1>
    </div>
    <ProductForm :productId="productId" :isEdit="true" />
  </div>
</template>
