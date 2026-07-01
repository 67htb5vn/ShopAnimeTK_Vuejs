<script setup lang="ts">
import type { DetailProduct } from '@/models/detailProduct'
import { getProductImagePaths, handleProductImageError } from '@/utils/productImage'

const props = defineProps<{ product: DetailProduct; compact?: boolean }>()
const images = getProductImagePaths(props.product)
const productLink = `/chitiet/${encodeURIComponent(`${props.product.tensp.toLowerCase()}_${props.product.masp}`)}`
const money = (value: number) => Number(value || 0).toLocaleString('vi-VN')
</script>

<template>
    <article class="detail-product-card" :class="{ compact }">
        <figure>
            <router-link :to="productLink" class="product-image-link">
                <img :src="images.main" :alt="product.tensp" @error="handleProductImageError">
                <img v-if="!compact && images.hover !== images.main" class="hover-image" :src="images.hover"
                    :alt="product.tensp" @error="handleProductImageError">
            </router-link>
        </figure>
        <div class="product-info">
            <router-link v-if="!compact" :to="`/Danhmuchang?MaDmh=${product.madmh}`" class="category">
                {{ product.tendmh || product.madmh }}
            </router-link>
            <h3><router-link :to="productLink">{{ product.tensp }}</router-link></h3>
            <div class="rating-row" :title="`${Number(product.diemtrungbinh || 0).toFixed(1)} / 5 sao`">
                <span class="stars"><span :style="{ width: `${Math.min(100, Number(product.diemtrungbinh || 0) * 20)}%` }">★★★★★</span></span>
            </div>
            <strong class="price">{{ money(product.gia) }} VND</strong>
        </div>
    </article>
</template>

<style scoped>
.detail-product-card { min-width: 0; background: #fff; }
figure { position: relative; margin: 0 0 1.2rem; overflow: hidden; }
.product-image-link { display: block; position: relative; width: 100%; aspect-ratio: 1; }
figure img { display: block; width: 100%; height: 100%; object-fit: contain; background: #fff; }
.hover-image { position: absolute; inset: 0; opacity: 0; transition: opacity .25s; }
.product-image-link:hover .hover-image { opacity: 1; }
.category { display: block; margin-bottom: .4rem; color: #999; font-size: 11px; text-transform: uppercase; }
h3 { min-height: 38px; margin: 0 0 .6rem; font-size: 14px; line-height: 1.35; }
h3 a { color: #222529; }
.rating-row { margin-bottom: .6rem; }
.stars { position: relative; display: inline-block; color: #d8d8d8; font-size: 12px; letter-spacing: 1px; }
.stars::before { content: '★★★★★'; }
.stars > span { position: absolute; inset: 0 auto 0 0; overflow: hidden; color: #fd5b5a; white-space: nowrap; }
.price { color: #222529; font-size: 15px; }

.compact { display: grid; grid-template-columns: 74px 1fr; gap: 1.2rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee; }
.compact figure { width: 74px; height: 74px; margin: 0; }
.compact .product-image-link { width: 74px; height: 74px; }
.compact h3 { min-height: 0; margin-bottom: .4rem; font-size: 13px; }
.compact .rating-row { margin-bottom: .3rem; }
.compact .price { font-size: 13px; }
</style>
