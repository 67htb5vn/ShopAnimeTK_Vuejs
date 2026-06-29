<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import type { sanpham } from '@/models/sanpham'

interface ProductImage {
    duongdan?: string
    anhdaidien?: number
}

interface SanPhamVoiChiTiet extends sanpham {
    hinhanhsps?: ProductImage[]
    diemtrungbinh?: number
    sodanhgia?: number
    tendmh?: string
}

const placeholderImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
        <rect width="100%" height="100%" fill="#f4f4f4"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              fill="#999" font-family="Arial" font-size="22">Chưa có ảnh</text>
    </svg>
`)}`

const sps = ref<SanPhamVoiChiTiet[]>([])

const cleanCode = (value?: string) => value?.trim() ?? ''

const productLink = (product: SanPhamVoiChiTiet) => {
    const slug = product.tensp
        ?.trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'san-pham'
    return `/chitiet/${slug}_${cleanCode(product.masp)}`
}

const normalizeImagePath = (path?: string) => {
    const value = path?.trim().replace(/\\/g, '/').replace(/^~\//, '/')
    if (!value) return ''
    if (/^(https?:|data:|blob:)/i.test(value)) return value
    return value.startsWith('/') ? value : `/${value}`
}

const getProductImages = (product: SanPhamVoiChiTiet) => {
    const images = (product.hinhanhsps || [])
        .map((image) => ({ ...image, path: normalizeImagePath(image.duongdan) }))
        .filter((image) => image.path)

    const main = images.find((image) => Number(image.anhdaidien) === 1)?.path
        || images[0]?.path
        || placeholderImage
    const hover = images.find((image) => Number(image.anhdaidien) === 2)?.path
        || images.find((image) => image.path !== main)?.path
        || main

    return { main, hover }
}

const handleImageError = (event: Event) => {
    const image = event.target as HTMLImageElement
    if (image.src !== placeholderImage) image.src = placeholderImage
}

const ratingWidth = (product: SanPhamVoiChiTiet) =>
    `${Math.min(100, Math.max(0, Number(product.diemtrungbinh || 0) * 20))}%`

const ratingText = (product: SanPhamVoiChiTiet) =>
    Number(product.diemtrungbinh || 0).toFixed(1)

const formatCurrency = (value?: number) => Number(value ?? 0).toLocaleString('vi-VN')

const loadSanphamNoibat = async () => {
    try {
        const response = await axios.get('/api/loadSanphamNoibat')
        const products = Array.isArray(response.data) ? response.data : []
        // Lọc thêm ở client để dữ liệu cache cũ cũng không làm lộ hai danh mục này.
        sps.value = products.filter((product) =>
            !['DMH002', 'DMH003'].includes(cleanCode(product.madmh))
        )
    } catch (error) {
        console.error('Không thể tải sản phẩm nổi bật:', error)
    }
}

onMounted(loadSanphamNoibat)
</script>

<template>
    <div v-for="sp in sps" :key="cleanCode(sp.masp)" class="product-container">
        <div class="product-default">
            <figure class="featured-product-figure">
                <router-link :to="productLink(sp)" :title="sp.tensp" class="my-product-image">
                    <img :src="getProductImages(sp).main" :alt="sp.tensp || 'Sản phẩm'" @error="handleImageError">
                    <img
                        :src="getProductImages(sp).hover"
                        :alt="`${sp.tensp || 'Sản phẩm'} - ảnh phụ`"
                        class="hover-image"
                        @error="handleImageError"
                    >
                </router-link>

                <div class="label-group">
                    <div class="product-label label-hot">HOT</div>
                </div>
            </figure>

            <div class="product-details">
                <div class="category-wrap">
                    <div class="category-list">
                        <router-link
                            :to="`/Danhmuchang?MaDmh=${cleanCode(sp.madmh)}`"
                            class="product-category"
                        >
                            {{ sp.tendmh || cleanCode(sp.madmh) }}
                        </router-link>
                    </div>
                </div>

                <h3 class="product-title">
                    <router-link :to="productLink(sp)">{{ sp.tensp }}</router-link>
                </h3>

                <div class="product-rating-row">
                    <div class="ratings-container">
                        <div class="product-ratings">
                            <span class="ratings" :style="{ width: ratingWidth(sp) }"></span>
                            <span class="tooltiptext tooltip-top"></span>
                        </div>
                    </div>
                    <span class="rating-value">{{ ratingText(sp) }}/5</span>
                    <span class="rating-count">({{ sp.sodanhgia || 0 }} đánh giá)</span>
                </div>

                <div class="price-box">
                    <span class="product-price">{{ formatCurrency(sp.gia) }} đ</span>
                </div>

                <div class="product-action">
                    <router-link :to="productLink(sp)" class="btn-icon btn-add-cart">
                        <i class="fa fa-arrow-right"></i>
                        <span>MUA HÀNG</span>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.featured-product-figure {
    position: relative;
    overflow: hidden;
    background: #fff;
}

.my-product-image {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: #f8f8f8;
}

.my-product-image img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    object-fit: contain;
    object-position: center;
    background: #fff;
    transition: opacity 0.3s ease;
}

.my-product-image .hover-image {
    opacity: 0;
}

.my-product-image:hover .hover-image {
    opacity: 1;
}

.product-rating-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    min-height: 24px;
}

.product-rating-row .ratings-container {
    margin: 0;
}

.rating-value {
    color: #222529;
    font-size: 1.2rem;
    font-weight: 600;
}

.rating-count {
    color: #999;
    font-size: 1.1rem;
}
</style>
