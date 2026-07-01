<style>
@import "@/assets/css/bootstrap.min.css";
/* @import "@/assets/css/demo1.css"; */
@import "@/assets/css/demo1.min.css";
@import "@/assets/vendor/simple-line-icons/css/simple-line-icons.min.css";
@import "@/assets/css/bootstrap.min.css";
@import "@/assets/vendor/fontawesome-free/css/all.min.css";
@import "@/assets/css/style.min.css";

.badge-primary {
    background-color: #6f42c1;
}

.header-bottom {
    background-color: #fff !important;
}

.logo-img {
    width: 180px !important;
    height: 70px !important;
    max-width: none !important;
    /* tắt max-width của Bootstrap */
    object-fit: contain !important;
    display: block;
}

.widget-dashboard .nav-link.account-active {
    color: #08c !important;
    font-weight: 700;
    background: #f4f9fc;
    border-left: 3px solid #08c;
    padding-left: 12px;
}
</style>

<script setup lang="ts">
import DanhmuchangMenu from '@/components/Danhmuchang/DanhmuchangMenu.vue';
import HoathinhMenu from '@/components/Hoathinh/HoathinhMenu.vue';
import HoathinhSearch from '@/components/Hoathinh/HoathinhSearch.vue';
import XemnhanhGiohang from '@/components/Giohang/XemnhanhGiohang.vue';
import { useGiohangStore } from '@/stores/XemnhanhGiohang';
import { usePortoScripts } from '@/composable/usePortoScripts'

const myShopScripts = [
    '/js/jquery.min.js',
    '/js/bootstrap.bundle.min.js',
    '/js/plugins.min.js',
    '/js/nouislider.min.js',
    '/js/main.min.js',
]

// Truyền mảng của Shop vào đây
usePortoScripts(myShopScripts)

import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import type { nguoidung } from '@/models/nguoidung';

const isLoggedIn = ref(false)
const user = ref<nguoidung | null>(null)
const router = useRouter()
const route = useRoute()
const giohangStore = useGiohangStore()
const mahh = ref('')
const search = ref('')

const logout = async () => {
    try {
        await axios.post('/api/logout', {}, {
            withCredentials: true
        })

        isLoggedIn.value = false
        user.value = null

        router.push('/Dangnhap')
        // window.location.href = '/Dangnhap'
    }
    catch (err) {
        console.log(err)
    }
}

const onSearch = () => {
    router.push({
        path: '/search',
        query: {
            search: search.value,
            MaHh: mahh.value
        }
    })
}

onMounted(async () => {
    try {
        const res = await axios.get('/api/checkauth', {
            withCredentials: true
        })

        isLoggedIn.value = res.data.loggedIn
        user.value = res.data.user
    }
    catch (err) {
        isLoggedIn.value = false
    }
})

</script>
<template>
    <div class="page-wrapper">
        <header class="header home">
            <div class="header-top bg-primary text-uppercase">
                <div class="container">
                    <div class="header-right header-dropdowns ml-0 ml-sm-auto">
                        <p class="top-message mb-0 d-none d-sm-block">Chào mừng đến với Tôm Ká!</p>
                        <div class="header-dropdown dropdown-expanded mr-3">
                            <a href="#"></a>
                            <div class="header-menu">
                                <ul>
                                    <li><router-link to="/Taikhoan">
                                            Tài khoản
                                        </router-link></li>
                                    <li><router-link to="/Taikhoan/Donhang">
                                            Lịch sử đơn hàng
                                        </router-link></li>
                                    <li><router-link to="/Giohang">
                                            Giỏ hàng
                                        </router-link></li>
                                </ul>
                            </div>
                            <!-- End .header-menu -->
                        </div>
                        <!-- End .header-dropown -->
                    </div>
                    <!-- End .header-right -->
                </div>
                <!-- End .container -->
            </div>
            <!-- End .header-top -->

            <div class="header-middle text-dark">
                <div class="container">
                    <div class="header-left col-lg-2 w-auto pl-0">
                        <button class="mobile-menu-toggler mr-2" type="button">
                            <i class="fas fa-bars"></i>
                        </button>
                        <a href="/HomeUser" class="logo">
                            <img src="@/assets/images/logo2.png" class="logo-img" alt="Porto Logo">
                        </a>
                    </div>
                    <!-- End .header-left -->

                    <div class="header-right w-lg-max pl-2">
                        <div class="header-search header-icon header-search-inline header-search-category w-lg-max">
                            <a href="#" class="search-toggle" role="button"><i class="icon-search-3"></i></a>
                            <form @submit.prevent="onSearch">
                                <div class="header-search-wrapper">
                                    <input type="search" class="form-control" v-model="search" placeholder="Tìm kiếm..."
                                        required />
                                    <div class="select-custom">
                                        <select v-model="mahh">
                                            <option value="">Tất cả hoạt hình</option>
                                            <HoathinhSearch></HoathinhSearch>
                                        </select>
                                    </div>
                                    <!-- End .select-custom -->
                                    <button class="btn icon-magnifier" type="submit"></button>
                                </div>
                                <!-- End .header-search-wrapper -->
                            </form>
                        </div>
                        <!-- End .header-search -->

                        <div class="header-contact d-none d-lg-flex align-items-center pr-xl-5 mr-5 mr-xl-3 ml-5">
                            <i class="icon-phone-2"></i>
                            <h6 class="pt-1 line-height-1">Gọi ngay<a href="#" class="d-block text-dark ls-10 pt-1">+123
                                    5678 890</a></h6>
                        </div>
                        <div v-if="isLoggedIn" class="d-flex align-items-center gap-3">
                            <router-link to="/Taikhoan" class="header-icon header-icon-user">
                                <i class="icon-user-2"></i>
                            </router-link>

                            <div class="dropdown cart-dropdown">
                                <a href="#" title="Giỏ hàng" id="dropdown-cart-products"
                                    class="dropdown-toggle dropdown-arrow cart-toggle" role="button"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                    data-display="static">
                                    <i class="minicart-icon"></i>
                                    <span class="cart-count badge-circle">
                                        {{ giohangStore.tongSoLuong }}
                                    </span>
                                </a>

                                <div class="cart-overlay"></div>

                                <div class="dropdown-menu mobile-cart">
                                    <a href="#" title="Đóng" class="btn-close"></a>

                                    <div class="dropdownmenu-wrapper custom-scrollbar">
                                        <div class="dropdown-cart-header">Giỏ hàng</div>
                                        <!-- End .dropdown-cart-header -->
                                        <XemnhanhGiohang />
                                        <!-- End .dropdown-cart-total -->


                                        <div class="dropdown-cart-action">
                                            <router-link to="/Giohang" class="btn btn-dark btn-block">
                                                Thanh toán
                                            </router-link>
                                        </div>
                                        <!-- End .dropdown-cart-total -->
                                    </div>
                                    <!-- End .dropdownmenu-wrapper -->
                                </div>
                                <!-- End .dropdown-menu -->
                            </div>
                            <!-- End .dropdown -->
                        </div>

                        <div v-else class="d-flex align-items-center gap-3">
                            <a :href="`/Dangnhap`" class="header-icon header-icon-user"><i class="icon-user-2"></i></a>

                            <div class="dropdown cart-dropdown">
                                <a href="#" title="Cart" class="dropdown-toggle dropdown-arrow cart-toggle"
                                    role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                    data-display="static">
                                    <i class="minicart-icon"></i>
                                    <span class="cart-count badge-circle">3</span>
                                </a>

                                <div class="cart-overlay"></div>

                                <div class="dropdown-menu mobile-cart">
                                    <a href="#" title="Close (Esc)" class="btn-close"></a>

                                    <div class="dropdownmenu-wrapper custom-scrollbar">
                                        <div class="dropdown-cart-header">Shopping Cart</div>
                                        <!-- End .dropdown-cart-header -->

                                        <div class="dropdown-cart-products">

                                            <!-- End .product -->
                                        </div>
                                        <!-- End .cart-product -->
                                        <!-- End .dropdown-cart-total -->
                                    </div>
                                    <!-- End .dropdownmenu-wrapper -->
                                </div>
                                <!-- End .dropdown-menu -->
                            </div>
                        </div>
                    </div>
                    <!-- End .header-right -->
                </div>
                <!-- End .container -->
            </div>
            <!-- End .header-middle -->
            <div class="header-bottom sticky-header d-none d-lg-block" data-sticky-options="{'mobile': false}">
                <div class="container">
                    <nav class="main-nav w-100">
                        <ul class="menu">
                            <li>
                                <router-link :to="`/`">
                                    Trang chủ
                                </router-link>
                            </li>
                            <li>
                                <a href="#">Danh mục hàng</a>
                                <ul>
                                    <DanhmuchangMenu></DanhmuchangMenu>
                                </ul>
                            </li>
                            <li>
                                <a href="#">Hoạt hình</a>
                                <ul>
                                    <HoathinhMenu></HoathinhMenu>
                                </ul>
                            </li>

                            <li><a href="#">Liên hệ</a></li>
                        </ul>
                    </nav>
                </div>
                <!-- End .container -->
            </div>
            <!-- End .header-bottom -->
        </header>
        <!-- End .header -->
        <main class="main">
            <div class="container account-container custom-account-container">
                <div class="row">
                    <div class="sidebar widget widget-dashboard mb-lg-0 mb-3 col-lg-3 order-0">
                        <h2 class="text-uppercase">Tài khoản của tôi</h2>
                        <ul class="nav nav-tabs list flex-column mb-0" role="tablist">
                            <li class="nav-item">
                                <router-link to="/Taikhoan" class="nav-link" :class="{ 'account-active': route.name === 'Taikhoan' }" id="edit-tab" aria-controls="edit"
                                    aria-selected="false" style="text-transform:none;">
                                    Thông tin tài khoản
                                </router-link>
                            </li>

                            <li class="nav-item">
                                <router-link to="/Taikhoan/Donhang" class="nav-link" :class="{ 'account-active': String(route.name || '').startsWith('Hoadon') }" id="order-tab" aria-controls="order"
                                    aria-selected="true" style="text-transform:none;">
                                    Đơn hàng của tôi
                                </router-link>
                            </li>

                            <li class="nav-item">
                                <a href="javascript:void(0);" data-toggle="modal" data-target="#logoutModal">Đăng
                                    xuất</a>
                            </li>
                        </ul>
                    </div>

                    <!--Tôi có thể render tại đây rồi xem tổng thể cái này như layout được ko-->
                    <div class="col-lg-9 order-lg-last order-1 tab-content">
                        <router-view />
                    </div><!-- End .tab-content -->
                </div><!-- End .row -->
            </div><!-- End .container -->

            <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog"
                aria-labelledby="exampleModalLabelLogout" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabelLogout">Ôii Không!</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>Bạn chắc chắn muốn đăng xuất?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Hủy</button>

                            <button type="button" class="btn btn-primary" @click="logout">Đăng xuất</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-5"></div><!-- margin -->
        </main><!-- End .main -->

        <footer class="footer bg-dark">
            <div class="footer-middle">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-3 col-sm-6">
                            <div class="widget">
                                <h4 class="widget-title">Thông tin liên hệ</h4>
                                <ul class="contact-info">
                                    <li>
                                        <span class="contact-info-label">Địa chỉ:</span>123 Đường Street,Hà Nội,
                                        Việt Nam
                                    </li>
                                    <li>
                                        <span class="contact-info-label">Điện thoại:</span><a href="#">
                                            (123)
                                            456-7890
                                        </a>
                                    </li>
                                    <li>
                                        <span class="contact-info-label">Email:</span> <a
                                            href="https://portotheme.com/cdn-cgi/l/email-protection#f994989095b99c81989489959cd79a9694"><span
                                                class="__cf_email__"
                                                data-cfemail="3855595154785d40595548545d165b5755">[email&#160;protected]</span></a>
                                    </li>
                                    <li>
                                        <span class="contact-info-label">Ngày làm việc/Giờ làm:</span> Thứ 2 - Thứ 7
                                        / 9:00 AM - 8:00 PM
                                    </li>
                                </ul>

                                <!-- End .social-icons -->
                            </div>
                            <!-- End .widget -->
                        </div>
                        <!-- End .col-lg-3 -->

                        <div class="col-lg-3 col-sm-6">
                            <div class="widget">
                                @await Html.PartialAsync("~/Views/Shared/Common/Service.cshtml")
                            </div>
                            <!-- End .widget -->
                        </div>
                        <!-- End .col-lg-3 -->

                        <div class="col-lg-3 col-sm-6">
                            <div class="widget">
                                <h4 class="widget-title">Tag phổ biến</h4>

                                <div class="tagcloud">
                                    @await Component.InvokeAsync("TagFooter")
                                </div>
                            </div>
                            <!-- End .widget -->
                        </div>
                        <!-- End .col-lg-3 -->

                        <div class="col-lg-3 col-sm-6">
                            <div class="widget widget-newsletter">
                                <h4 class="widget-title">Theo dõi tin tức</h4>
                                <p>
                                    Thường xuyên truy cập trang ShopAnimeTK để có thông tin mới nhất về sản phẩm sự
                                    kiện, khuyến mãi và ưu đãi.
                                </p>

                            </div>
                            <!-- End .widget -->
                        </div>
                        <!-- End .col-lg-3 -->
                    </div>
                    <!-- End .row -->
                </div>
                <!-- End .container -->
            </div>
            <!-- End .footer-middle -->

            <div class="container">
                <div class="footer-bottom">
                    <div class="container d-sm-flex align-items-center">
                        <div class="footer-left">
                            <span class="footer-copyright">© Porto eCommerce. 2021. All Rights Reserved</span>
                        </div>

                        <div class="footer-right ml-auto mt-1 mt-sm-0">
                            <div class="payment-icons">
                                <span class="payment-icon visa"
                                    style="background-image: url(@/assets/images/payments/payment-visa.svg)"></span>
                                <span class="payment-icon paypal"
                                    style="background-image: url(@/assets/images/payments/payment-paypal.svg)"></span>
                                <span class="payment-icon stripe"
                                    style="background-image: url(@/assets/images/payments/payment-stripe.png)"></span>
                                <span class="payment-icon verisign"
                                    style="background-image:  url(@/assets/images/payments/payment-verisign.svg)"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- End .footer-bottom -->
            </div>
            <!-- End .container -->
        </footer>
        <!-- End .footer -->
    </div>
    <!-- End .page-wrapper -->
</template>
