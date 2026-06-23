<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import type { sanpham } from '@/models/sanpham';

// Mở rộng interface để khớp với dữ liệu thực tế
interface SanPhamVoiChiTiet extends sanpham {
    hinhanhsps?: { duongdan: string; anhdaidien: number }[];
    diemtrungbinh?: number;
    tendmh?: string; // Tên danh mục hàng
}

const sps = ref<SanPhamVoiChiTiet[]>([]);

const loadSanphamNoibat = async () => {
    try {
        const response = await axios.get('/api/loadSanphamNoibat');
        sps.value = response.data || [];
    } catch (error) {
        console.error("Lỗi:", error);
    }
};

const getAnhByLoai = (sp: SanPhamVoiChiTiet, loai: number) => {
    if (!sp.hinhanhsps) return 'https://via.placeholder.com/160';

    const anh = sp.hinhanhsps.find(x => Number(x.anhdaidien) === loai);

    if (anh && anh.duongdan) {
        let path = anh.duongdan;

        // // Nếu DB lưu "//img/..." -> đổi thành "/img/..."
        // if (path.startsWith('//')) {
        //     path = path.substring(1);
        // }

        // // Đảm bảo phải có dấu / ở đầu để Vite hiểu là thư mục public
        // if (!path.startsWith('/')) {
        //     path = '/' + path;
        // }

        return path;
    }

    return 'https://via.placeholder.com/160';
};

// Hàm định dạng tiền tệ VNĐ
const formatCurrency = (value: number | undefined) => {
    if (!value) return '0';
    return value.toLocaleString('vi-VN');
};

onMounted(() => {
    loadSanphamNoibat();
});
</script>

<template>
    <div v-for="sp in sps" :key="sp.masp" class="product-container">
        <div class="product-default">
            <figure>
                <!-- URL thân thiện SEO: slugify tên sản phẩm -->
                <router-link :to="`/chitiet/${sp.tensp?.toLowerCase().replace(/\s+/g, '-')}_${sp.masp}`"
                    :title="sp.tensp" class="my-product-image">
                    <img :src="getAnhByLoai(sp, 1)" alt="product main" />
                    <img :src="getAnhByLoai(sp, 2)" alt="product hover" class="hover-image" />
                </router-link>

                <div class="label-group">
                    <div class="product-label label-hot">HOT</div>
                </div>
            </figure>

            <div class="product-details">
                <div class="category-wrap">
                    <div class="category-list">
                        <router-link :to="`/danhmuc?MaDmh=${sp.madmh}`" class="product-category">
                            {{ sp.tendmh || sp.madmh }}
                        </router-link>
                    </div>
                </div>

                <h3 class="product-title">
                    <router-link :to="`/chitiet/${sp.tensp?.toLowerCase()}_${sp.masp}`">
                        {{ sp.tensp }}
                    </router-link>
                </h3>

                <div class="ratings-container">
                    <div class="product-ratings">
                        <!-- Tính toán chiều rộng ngôi sao (DiemTrungBinh * 20) -->
                        <span class="ratings" :style="{ width: (sp.diemtrungbinh || 0) * 20 + '%' }"></span>
                        <span class="tooltiptext tooltip-top"></span>
                    </div>
                </div>

                <div class="price-box">
                    <span class="product-price">{{ formatCurrency(sp.gia) }} đ</span>
                </div>

                <div class="product-action">
                    <router-link :to="`/chitiet/${sp.tensp?.toLowerCase()}_${sp.masp}`" class="btn-icon btn-add-cart">
                        <i class="fa fa-arrow-right"></i>
                        <span>MUA HÀNG</span>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
