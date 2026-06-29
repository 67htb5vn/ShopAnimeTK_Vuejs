<script setup lang="ts">
import { computed } from 'vue'
import type { sanphamgiohang } from '@/models/sanphamgiohang'
import type { khuyenmai } from '@/models/khuyenmai'

const props = defineProps<{
    products: sanphamgiohang[]
    promotion: khuyenmai | null
    shippingFee: number
    modelValue: string
    loading?: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    placeOrder: []
}>()

const subtotal = computed(() => props.products.reduce(
    (total, item) => total + Number(item.gia ?? 0) * Number(item.soluong ?? 0), 0
))
const discount = computed(() => Math.round(subtotal.value * Number(props.promotion?.mucgiam ?? 0)))
const total = computed(() => Math.max(0, subtotal.value - discount.value + props.shippingFee))

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND'
}).format(value)
</script>

<template>
    <div class="order-summary">
        <h3>ĐƠN HÀNG</h3>
        <table class="table table-mini-cart">
            <thead><tr><th colspan="2">Sản phẩm</th></tr></thead>
            <tbody>
                <tr v-for="item in products" :key="item.masp">
                    <td class="product-col">
                        <h3 class="product-title">{{ item.tensp }} <strong class="product-qty">× {{ item.soluong }}</strong></h3>
                    </td>
                    <td class="price-col">{{ formatCurrency(Number(item.gia ?? 0) * Number(item.soluong ?? 0)) }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr class="cart-subtotal"><td><h4>Tạm tính</h4></td><td>{{ formatCurrency(subtotal) }}</td></tr>
                <tr class="cart-subtotal">
                    <td><h4>Khuyến mãi <small v-if="promotion">({{ promotion.makm }})</small></h4></td>
                    <td class="discount">-{{ formatCurrency(discount) }}</td>
                </tr>
                <tr class="order-shipping">
                    <td><h4>Phí giao hàng</h4></td>
                    <td>{{ shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee) }}</td>
                </tr>
                <tr class="order-total"><td><h4>Tổng tiền</h4></td><td class="total-price">{{ formatCurrency(total) }}</td></tr>
            </tfoot>
        </table>

        <div class="payment-methods">
            <h4>Phương thức thanh toán</h4>
            <label class="payment-option">
                <input type="radio" name="payment" value="bank" :checked="modelValue === 'bank'" @change="emit('update:modelValue', 'bank')">
                Chuyển khoản ngân hàng
            </label>
            <label class="payment-option">
                <input type="radio" name="payment" value="cod" :checked="modelValue === 'cod'" @change="emit('update:modelValue', 'cod')">
                Thanh toán khi nhận hàng
            </label>
        </div>

        <button type="button" class="btn btn-dark btn-place-order" :disabled="loading" @click="emit('placeOrder')">
            {{ loading ? 'Đang xử lý...' : 'Đặt hàng' }}
        </button>
    </div>
</template>

<style scoped>
.price-col, tfoot td:last-child { text-align: right; }
.discount { color: #dc3545; }
.total-price { color: #08c; font-size: 1.8rem; font-weight: 700; }
.payment-option { display: block; margin: 1rem 0; cursor: pointer; }
.payment-option input { margin-right: 0.7rem; }
.btn-place-order { width: 100%; margin-top: 1.5rem; }
</style>
