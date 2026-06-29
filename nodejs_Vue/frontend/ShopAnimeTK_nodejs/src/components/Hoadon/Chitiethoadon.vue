<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface OrderLine { masp: string; tensp?: string; gia: number; soluong: number }
interface OrderStatus { mahd: string; matt: string; ngaycapnhat: string; tentrangthai: string }
interface OrderDetail {
    mahd: string
    ngaylap: string
    diachi: string
    thanhtien: number
    htthanhtoan: string
    makm?: string
    details: OrderLine[]
    statuses: OrderStatus[]
    subtotal: number
    discount: number
    shippingFee: number
}

const route = useRoute()
const router = useRouter()
const order = ref<OrderDetail>()
const loading = ref(true)
const errorMessage = ref('')

const address = computed(() => order.value?.diachi?.split('_') || [])
const latestStatus = computed(() => order.value?.statuses?.[0])
const receiverAddress = computed(() => address.value.slice(3).join('_'))
const money = (value?: number) => `${Number(value || 0).toLocaleString('vi-VN')} VND`
const date = (value?: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '—'
const time = (value?: string) => value ? new Date(value).toLocaleTimeString('vi-VN') : '—'
const badgeClass = (status: string) => ({
    TT001: 'pending', TT002: 'preparing', TT003: 'shipping', TT004: 'complete', TT005: 'cancelled'
}[status] || 'cancelled')

onMounted(async () => {
    try {
        const response = await axios.get(`/api/orders/${route.params.mahd}`, { withCredentials: true })
        order.value = response.data
    } catch (error: any) {
        if (error.response?.status === 401) return router.push('/Dangnhap')
        errorMessage.value = error.response?.data?.message || 'Không thể tải chi tiết đơn hàng.'
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <section class="order-detail">
        <router-link to="/Taikhoan/Donhang" class="back-link">« Quay lại</router-link>
        <div v-if="loading" class="state-message">Đang tải chi tiết đơn hàng...</div>
        <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <template v-else-if="order">
            <h3 class="account-sub-title"><i class="sicon-social-dropbox"></i> Chi tiết đơn hàng</h3>

            <div class="order-meta">
                <div><span>Mã đơn hàng</span><strong>{{ order.mahd }}</strong></div>
                <div><span>Người nhận</span><strong>{{ address[0] }}</strong></div>
                <div><span>Thời gian</span><strong>{{ date(order.ngaylap) }}</strong></div>
                <div><span>Thanh toán</span><strong>{{ money(order.thanhtien) }}</strong></div>
                <div><span>Phương thức</span><strong>{{ order.htthanhtoan }}</strong></div>
            </div>

            <div class="order-card">
                <table>
                    <tbody>
                        <tr><th colspan="2">Sản phẩm</th></tr>
                        <tr v-for="line in order.details" :key="line.masp">
                            <td>{{ line.tensp || line.masp }} × {{ line.soluong }}</td>
                            <td>{{ money(line.gia * line.soluong) }}</td>
                        </tr>
                        <tr><th>Tạm tính</th><td>{{ money(order.subtotal) }}</td></tr>
                        <tr><th>Tiền ship</th><td>+ {{ money(order.shippingFee) }}</td></tr>
                        <tr><th>Tiền khuyến mãi</th><td>- {{ money(order.discount) }}</td></tr>
                        <tr class="total"><th>Thanh toán</th><td>{{ money(order.thanhtien) }}</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="address-grid">
                <section>
                    <h4>Địa chỉ gửi hàng</h4>
                    <ul><li>Shop Anime Tôm Ká</li><li>Đường Hoàng Quốc Việt</li><li>Hà Nội</li><li>123 456 7890</li></ul>
                </section>
                <section>
                    <h4>Địa chỉ giao hàng</h4>
                    <ul><li>{{ address[0] }}</li><li>{{ receiverAddress }}</li><li>{{ address[2] }}</li><li>{{ address[1] }}</li></ul>
                </section>
            </div>

            <div class="status-section">
                <h4>Trạng thái đơn hàng</h4>
                <div class="table-responsive">
                    <table class="status-table">
                        <thead><tr><th>Mã</th><th>Ngày cập nhật</th><th>Thời gian</th><th>Trạng thái</th></tr></thead>
                        <tbody>
                            <tr v-for="status in order.statuses" :key="`${status.matt}-${status.ngaycapnhat}`">
                                <td>{{ order.mahd }}</td><td>{{ date(status.ngaycapnhat) }}</td><td>{{ time(status.ngaycapnhat) }}</td>
                                <td><span class="status-badge" :class="badgeClass(status.matt)">{{ status.tentrangthai }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="latestStatus?.matt === 'TT001'" class="detail-action">
                <router-link :to="`/Taikhoan/Donhang/${order.mahd}/Huy`" class="btn btn-danger">Hủy đơn hàng</router-link>
            </div>
        </template>
    </section>
</template>

<style scoped>
.order-detail { padding-bottom: 4rem; color: #222529; }
.back-link { display: inline-block; margin-bottom: 1.5rem; color: #08c; }
.account-sub-title { display: flex; align-items: center; gap: 10px; margin-bottom: 1.8rem; font-size: 22px; }
.account-sub-title i { color: #d7dce0; font-size: 34px; }
.state-message { padding: 5rem; text-align: center; }
.order-meta { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.2rem; margin-bottom: 2.6rem; text-align: center; }
.order-meta span, .order-meta strong { display: block; }
.order-meta span { margin-bottom: .5rem; color: #777; font-size: 12px; }
.order-card { margin-bottom: 3.2rem; padding: 2rem; border: 1px solid #ddd; }
.order-card table { width: 100%; }
.order-card td, .order-card th { padding: 1rem; border: 0; }
.order-card td:last-child { text-align: right; }
.order-card .total { border-top: 1px solid #ddd; font-size: 18px; }
.address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin: 0 0 3.2rem; padding: 2rem; border: 1px solid #ddd; background: #fff; }
.address-grid h4, .status-section h4 { color: #222529; font-size: 15px; font-weight: 700; line-height: 1.4; }
.address-grid h4 { margin-bottom: 1rem; }
.address-grid ul { margin: 0; padding: 0; list-style: none; }
.address-grid li { padding: .7rem 0; border-bottom: 1px solid #eee; }
.status-section { margin-top: .5rem; padding: 2rem; border: 1px solid #ddd; background: #fff; }
.status-section h4 { margin-bottom: 1.4rem; }
.status-table { width: 100%; min-width: 600px; text-align: center; }
.status-table th, .status-table td { padding: 1.1rem; border-bottom: 1px solid #eee; }
.status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; color: #fff; font-size: 11px; }
.pending { background: #20a9bd; }.preparing { background: #7f8c8d; }.shipping { background: #087fc1; }.complete { background: #28a745; }.cancelled { background: #dc3545; }
.detail-action { margin-top: 2rem; text-align: right; }
@media (max-width: 767px) { .order-meta { grid-template-columns: 1fr 1fr; } .address-grid { grid-template-columns: 1fr; } }
</style>
