<script setup lang="ts">
import DetailSanphamCard from './DetailSanphamCard.vue'
import type { DetailProduct } from '@/models/detailProduct'
defineProps<{ products: DetailProduct[] }>()
</script>

<template>
    <template v-if="products.length">
        <DetailSanphamCard v-for="product in products" :key="product.masp" :product="product" />
    </template>
    <p v-else class="empty-products">Chưa có sản phẩm liên quan.</p>
</template>

<style scoped>
.empty-products { padding: 2rem 0; color: #777; text-align: center; }
</style>
