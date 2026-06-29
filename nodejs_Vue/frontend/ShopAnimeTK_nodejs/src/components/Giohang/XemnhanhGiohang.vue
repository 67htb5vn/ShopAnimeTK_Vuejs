<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import type { sanpham } from '@/models/sanpham';
import type { sanphamgiohang } from '@/models/sanphamgiohang';
import { useGiohangStore } from '@/stores/XemnhanhGiohang'
import { normalizeProductImagePath, productPlaceholderImage, handleProductImageError } from '@/utils/productImage'

const giohangStore = useGiohangStore()
const isLoggedIn = ref(false)
const Xoasp = ref<sanphamgiohang>()

const cartImage = (path?: string) => normalizeProductImagePath(path) || productPlaceholderImage

const formatCurrency = (value: number | undefined) => {
    if (!value) return '0';
    return value.toLocaleString('vi-VN');
};

const loadGiohang = async () => {
    try {
        const res = await axios.get('/api/checkauth', {
            withCredentials: true
        })

        isLoggedIn.value = res.data.loggedIn

        if (isLoggedIn.value) {
            await giohangStore.loadGiohang()
            console.log(giohangStore.giohangs)
        }

    } catch (error) {
        console.error("Lỗi:", error);
    }
};

const xoaSp = async (masp: string) => {

    await giohangStore.xoaGiohang(masp)
}

onMounted(() => {
    loadGiohang()
});
</script>
<template>
    <div v-if="isLoggedIn">
        <div id="prepare">
            <div class="dropdown-cart-products">

                <div v-for="spgh in giohangStore.giohangs">
                    <div class="product">
                        <div class="product-details">
                            <h4 class="product-title">
                                <router-link :to="`/chitiet/${spgh.tensp?.toLowerCase()}_${spgh.masp}`">{{
                                    spgh.tensp }}</router-link>
                            </h4>
                            <span class="cart-product-info">
                                <span class="cart-product-qty">{{ spgh.soluong }}</span> × {{ formatCurrency(spgh.gia)
                                }}
                            </span>
                        </div>
                        <!-- End .product-details -->

                        <figure class="product-image-container">
                            <router-link :to="`/chitiet/${spgh.tensp?.toLowerCase()}_${spgh.masp}`"
                                class="product-image">
                                <img :src="cartImage(spgh.duongdan)" :alt="spgh.tensp || 'Sản phẩm'"
                                    width="80" height="80" @error="handleProductImageError">
                            </router-link>

                            <a href="javascript:;" class="btn-remove" title="Xóa sản phẩm"
                                @click="spgh.masp && xoaSp(spgh.masp)">
                                <span>×</span>
                            </a>
                        </figure>
                    </div>
                </div>

                <!-- End .product -->


            </div>

            <div class="dropdown-cart-total">
                <span>Thành tiền:</span>
                <span class="cart-total-price float-right"> {{formatCurrency(giohangStore.giohangs.reduce((sum, x) =>
                    sum + (x.thanhtien || 0), 0))}}</span>
            </div>
        </div>
    </div>
    <div v-else>
        ko load dược người dùng
    </div>
</template>
