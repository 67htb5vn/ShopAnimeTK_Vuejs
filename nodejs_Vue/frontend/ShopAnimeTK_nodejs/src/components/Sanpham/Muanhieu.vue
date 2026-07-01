<script setup lang="ts">
import DetailSanphamCard from './DetailSanphamCard.vue'
import type { DetailProduct } from '@/models/detailProduct'
defineProps<{ products: DetailProduct[] }>()
</script>
<template><div><DetailSanphamCard v-for="product in products" :key="product.masp" :product="product" compact /></div></template>
