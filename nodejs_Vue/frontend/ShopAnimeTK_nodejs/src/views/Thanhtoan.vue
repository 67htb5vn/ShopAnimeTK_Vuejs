<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import axios from 'axios'
import type { diachi } from '@/models/diachi'
import { useThanhtoanStore } from '@/stores/Thanhtoan'
import Diachi from '@/components/Thanhtoan/Diachi.vue'
import Donhangdathang from '@/components/Giohang/Donhangdathang.vue'
import Donhangchuyenkhoan from '@/components/Giohang/Donhangchuyenkhoan.vue'

const thanhtoanStore = useThanhtoanStore()
const checkoutForm = ref<HTMLFormElement>()
const paymentMethod = ref('bank')
const transferOpen = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const note = ref('')

const provinces = [
    'Hà Nội', 'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Cần Thơ', 'Đà Nẵng',
    'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Tĩnh', 'Hải Phòng',
    'Thành phố Hồ Chí Minh', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn',
    'Lào Cai', 'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sơn La', 'Tây Ninh', 'Thái Nguyên', 'Thanh Hóa', 'Thành phố Huế', 'Tuyên Quang', 'Vĩnh Long'
]

const shippingAddress = reactive<diachi>({
    ten: '', sodienthoai: '', tinh_tp: 'Hà Nội', diachinha: ''
})

const setAddress = (address: diachi) => Object.assign(shippingAddress, address)

const normalizedProvince = computed(() => shippingAddress.tinh_tp
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
    .toLowerCase()
)

const shippingFee = computed(() => normalizedProvince.value === 'ha noi' ? 0 : 25_000)
const subtotal = computed(() => thanhtoanStore.products.reduce(
    (total, item) => total + Number(item.gia ?? 0) * Number(item.soluong ?? 0), 0
))
const discount = computed(() => Math.round(subtotal.value * Number(thanhtoanStore.promotion?.mucgiam ?? 0)))
const grandTotal = computed(() => Math.max(0, subtotal.value - discount.value + shippingFee.value))

const saveCheckoutAddress = () => axios.post('/api/checkout-address', shippingAddress, {
    withCredentials: true
})

const completeOrder = () => {
    transferOpen.value = false
    successMessage.value = 'Thông tin đặt hàng đã được xác nhận.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const placeOrder = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!checkoutForm.value?.checkValidity()) {
        checkoutForm.value?.reportValidity()
        return
    }

    try {
        await saveCheckoutAddress()
        if (paymentMethod.value === 'bank') transferOpen.value = true
        else completeOrder()
    } catch (error) {
        errorMessage.value = 'Không thể lưu thông tin giao hàng. Vui lòng thử lại.'
        console.error(error)
    }
}
</script>

<template>
    <main class="main checkout-page">
        <div class="container checkout-container">
            <ul class="checkout-progress-bar d-flex justify-content-center flex-wrap">
                <li><router-link to="/Giohang">Giỏ hàng</router-link></li>
                <li class="active"><router-link to="/Thanhtoan">Thanh toán</router-link></li>
            </ul>

            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

            <div v-if="thanhtoanStore.products.length === 0" class="empty-checkout">
                <h3>Chưa có sản phẩm được chọn để thanh toán</h3>
                <router-link to="/Giohang" class="btn btn-primary">Quay lại giỏ hàng</router-link>
            </div>

            <template v-else>
                <Diachi :model-value="shippingAddress" :provinces="provinces" @update:model-value="setAddress" />

                <form ref="checkoutForm" class="row" @submit.prevent="placeOrder">
                    <div class="col-lg-7">
                        <ul class="checkout-steps">
                            <li>
                                <h2 class="step-title">Địa chỉ giao hàng</h2>
                                <div class="row">
                                    <div class="col-md-6 form-group">
                                        <label>Họ tên <abbr class="required">*</abbr></label>
                                        <input v-model.trim="shippingAddress.ten" class="form-control" placeholder="Tên người nhận" required>
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label>Số điện thoại <abbr class="required">*</abbr></label>
                                        <input v-model.trim="shippingAddress.sodienthoai" class="form-control" placeholder="0xxxxxxxxx" pattern="0[0-9]{9}" required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Tỉnh/Thành phố <abbr class="required">*</abbr></label>
                                    <select v-model="shippingAddress.tinh_tp" class="form-control" required>
                                        <option v-for="province in provinces" :key="province" :value="province">{{ province }}</option>
                                    </select>
                                    <small class="shipping-note">
                                        {{ shippingFee === 0 ? 'Giao hàng tại Hà Nội: miễn phí' : 'Giao hàng ngoài Hà Nội: 25.000đ' }}
                                    </small>
                                </div>

                                <div class="form-group">
                                    <label>Địa chỉ chi tiết <abbr class="required">*</abbr></label>
                                    <input v-model.trim="shippingAddress.diachinha" class="form-control" placeholder="Số nhà, đường, xã/phường..." required>
                                </div>

                                <div class="form-group">
                                    <label>Lời nhắn (không bắt buộc)</label>
                                    <textarea v-model.trim="note" class="form-control" placeholder="Yêu cầu riêng gửi người giao hàng..."></textarea>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="col-lg-5">
                        <Donhangdathang
                            v-model="paymentMethod"
                            :products="thanhtoanStore.products"
                            :promotion="thanhtoanStore.promotion"
                            :shipping-fee="shippingFee"
                            @place-order="placeOrder"
                        />
                    </div>
                </form>
            </template>
        </div>

        <Donhangchuyenkhoan
            :open="transferOpen"
            :total="grandTotal"
            @close="transferOpen = false"
            @confirm="completeOrder"
        />
    </main>
</template>

<style scoped>
.checkout-page { padding-bottom: 5rem; }
.empty-checkout { padding: 5rem 1rem; text-align: center; }
.checkout-steps { padding: 0; list-style: none; }
.step-title { margin-bottom: 2rem; }
.required { color: #dc3545; text-decoration: none; }
.shipping-note { display: block; margin-top: 0.6rem; color: #08c; }
textarea.form-control { min-height: 100px; }
@media (max-width: 991px) { .col-lg-5 { margin-top: 2rem; } }
</style>
