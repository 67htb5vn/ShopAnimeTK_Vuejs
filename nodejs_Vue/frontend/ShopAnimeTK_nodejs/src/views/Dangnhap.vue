<style>
@import "@/assets/css/bootstrap.min.css";
@import "@/assets/css/style.min.css";
@import "@/assets/vendor/fontawesome-free/css/all.min.css";
</style>

<script setup lang="ts">
import { usePortoScripts } from '@/composable/usePortoScripts'

const myShopScripts = [
    '/js/jquery.min.js',
    '/js/bootstrap.bundle.min.js',
    '/js/plugins.min.js',
    '/js/main.min.js'
]

// Truyền mảng của Shop vào đây
usePortoScripts(myShopScripts)

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const taikhoan = ref('')
const matkhau = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

const error = ref('')

const login = async () => {
    try {
        error.value = ''

        await api.post('/api/login', {
            taikhoan: taikhoan.value,
            matkhau: matkhau.value,
            rememberMe: rememberMe.value
        })

        router.push('/')
    } catch (err: any) {
        error.value =
            err.response?.data?.message
    }
}
</script>
<!-- < script data - cfasync="false" src="../../cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js">
    </script> -->
<template>
    <div class="page-wrapper">
        <main class="main">
            <div class="page-header">
                <div class="container d-flex flex-column align-items-center">
                    <nav aria-label="breadcrumb" class="breadcrumb-nav">
                        <div class="container">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><a href="demo4.html">Home</a></li>
                                <li class="breadcrumb-item"><a href="category.html">Shop</a></li>
                                <li class="breadcrumb-item active" aria-current="page">
                                    My Account
                                </li>
                            </ol>
                        </div>
                    </nav>

                    <h1>My Account</h1>
                </div>
            </div>

            <div class="container login-container">
                <div class="row justify-content-center">
                    <div class="col-lg-10 mx-auto">
                        <div class="row justify-content-center">
                            <div class="col-md-6">
                                <div class="heading mb-1">
                                    <h2 class="title">Login</h2>
                                </div>
                                <!-- Thông báo lỗi -->
                                <div v-if="error" class="alert alert-danger">
                                    {{ error }}
                                </div>

                                <form @submit.prevent="login">
                                    <label for="login-email">
                                        Tên đăng nhập
                                        <span class="required">*</span>
                                    </label>
                                    <input v-model="taikhoan" class="form-control mb-3" placeholder="Tài khoản" />

                                    <label for="login-password">
                                        Mật khẩu
                                        <span class="required">*</span>
                                    </label>
                                    <div class="position-relative mb-3">
                                        <input v-model="matkhau" :type="showPassword ? 'text' : 'password'"
                                            class="form-control" placeholder="Mật khẩu" />

                                        <button type="button" @click="showPassword = !showPassword"
                                            class="btn position-absolute"
                                            style="right: 10px; top: 50%; transform: translateY(-50%); border: none; background: transparent;padding: 0;">
                                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                        </button>
                                    </div>
                                    <div class="form-footer">
                                        <div class="custom-control custom-checkbox mb-0">
                                            <input v-model="rememberMe" type="checkbox" class="custom-control-input"
                                                id="remember">
                                            <label class="custom-control-label mb-0" for="remember">
                                                Ghi nhớ đăng nhập
                                            </label>
                                        </div>

                                        <a :href="`/Quenmatkhau`" class="forget-password text-dark form-footer-right">
                                            Quên mật khẩu
                                        </a>
                                    </div>
                                    <button type="submit" class="btn btn-dark w-100">
                                        ĐĂNG NHẬP
                                    </button>
                                    <p class="text-center mt-3">
                                        Chưa có tài khoản?
                                        <a :href="`/Dangky`" class="fw-bold text-dark"
                                            style=" text-decoration:underline">
                                            Đăng ký ngay
                                        </a>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main><!-- End .main -->
    </div>
</template>