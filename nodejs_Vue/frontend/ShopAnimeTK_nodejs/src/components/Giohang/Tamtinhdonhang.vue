<script setup lang="ts">
import { computed } from 'vue'
import type { khuyenmai } from '@/models/khuyenmai'

const props = defineProps<{
    tamTinh: number
    khuyenMai: khuyenmai | null
}>()

const emit = defineEmits<{
    xoaKhuyenMai: []
    thanhToan: []
}>()

const tienGiam = computed(() => {
    if (!props.khuyenMai) return 0
    return Math.round(props.tamTinh * Number(props.khuyenMai.mucgiam ?? 0))
})

const tongDonHang = computed(() => Math.max(0, props.tamTinh - tienGiam.value))

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND'
}).format(value)
</script>

<template>
    <div class="cart-summary">
        <h3 class="text-center">ĐƠN HÀNG</h3>

        <table class="table table-totals">
            <tbody>
                <tr>
                    <td>Tạm tính</td>
                    <td>{{ formatCurrency(tamTinh) }}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="promotion-row">
                            <h4>Khuyến mãi</h4>
                            <div v-if="khuyenMai" class="promotion-selected">
                                <div>
                                    <strong>{{ khuyenMai.makm }}</strong>
                                    <span>{{ khuyenMai.tenkm }}</span>
                                </div>
                                <button
                                    type="button"
                                    class="btn-remove-promotion"
                                    title="Hủy khuyến mãi"
                                    @click="emit('xoaKhuyenMai')"
                                >×</button>
                            </div>
                            <span v-else class="promotion-empty">Chưa áp dụng voucher</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td><h4>Tiền giảm</h4></td>
                    <td class="discount">-{{ formatCurrency(tienGiam) }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>Tổng đơn hàng</td>
                    <td>{{ formatCurrency(tongDonHang) }}</td>
                </tr>
            </tfoot>
        </table>

        <div class="checkout-methods">
            <button type="button" class="btn btn-block btn-dark" :disabled="tamTinh <= 0" @click="emit('thanhToan')">
                Thanh toán <i class="fa fa-arrow-right"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.table-totals td:last-child { text-align: right; }

.promotion-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    width: 100%;
}

.promotion-row h4 {
    flex: 0 0 auto;
    margin: 0;
    text-align: left;
}

.promotion-empty {
    margin-left: auto;
    color: #777;
    text-align: right;
}

.promotion-selected {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    margin-left: auto;
    text-align: right;
}

.promotion-selected span {
    display: block;
    margin-top: 0.2rem;
    color: #777;
    font-size: 1.2rem;
}

.btn-remove-promotion {
    border: 0;
    background: transparent;
    color: #dc3545;
    font-size: 2rem;
    cursor: pointer;
}

.discount { color: #dc3545; }
</style>
