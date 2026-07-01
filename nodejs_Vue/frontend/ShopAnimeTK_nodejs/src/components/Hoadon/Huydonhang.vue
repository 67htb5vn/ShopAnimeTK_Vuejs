<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface CancelOrder {
    mahd: string
    ngaylap: string
    diachi: string
    thanhtien: number
    htthanhtoan: string
    statuses: { matt: string }[]
}

const route = useRoute()
const router = useRouter()
const order = ref<CancelOrder>()
const loading = ref(true)
const cancelling = ref(false)
const errorMessage = ref('')
const receiver = computed(() => order.value?.diachi?.split('_')[0] || '')
const canCancel = computed(() => order.value?.statuses?.[0]?.matt === 'TT001')
const money = (value?: number) => `${Number(value || 0).toLocaleString('vi-VN')} VND`
const date = (value?: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '—'

const loadOrder = async () => {
    try {
        const response = await axios.get(`/api/orders/${route.params.mahd}`, { withCredentials: true })
        order.value = response.data
        if (order.value?.statuses?.[0]?.matt !== 'TT001') {
            errorMessage.value = 'Đơn hàng này không còn có thể hủy.'
        }
    } catch (error: any) {
        if (error.response?.status === 401) return router.push('/Dangnhap')
        errorMessage.value = error.response?.data?.message || 'Không thể tải đơn hàng.'
    } finally {
        loading.value = false
    }
}

const confirmCancel = async () => {
    if (!order.value || cancelling.value) return
    cancelling.value = true
    errorMessage.value = ''
    try {
        await axios.patch(`/api/orders/${order.value.mahd}/cancel`, {}, { withCredentials: true })
        await router.replace('/Taikhoan/Donhang')
    } catch (error: any) {
        errorMessage.value = error.response?.data?.message || 'Không thể hủy đơn hàng.'
    } finally {
        cancelling.value = false
    }
}

onMounted(loadOrder)
</script>

<template>
    <section class="cancel-page">
        <router-link to="/Taikhoan/Donhang" class="back-link">« Quay lại</router-link>
        <div v-if="loading" class="state-message">Đang tải đơn hàng...</div>
        <template v-else-if="order">
            <h3 class="account-sub-title"><i class="sicon-social-dropbox"></i> Hủy đơn hàng</h3>

            <div class="order-meta">
                <div><span>Mã đơn hàng</span><strong>{{ order.mahd }}</strong></div>
                <div><span>Người nhận</span><strong>{{ receiver }}</strong></div>
                <div><span>Thời gian</span><strong>{{ date(order.ngaylap) }}</strong></div>
                <div><span>Thanh toán</span><strong>{{ money(order.thanhtien) }}</strong></div>
                <div><span>Phương thức</span><strong>{{ order.htthanhtoan }}</strong></div>
            </div>

            <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>
            <img src="/images/sorry.png" class="sorry-image" alt="Rất tiếc khi bạn muốn hủy đơn hàng">

            <div class="cancel-actions">
                <button type="button" class="btn confirm-button" :disabled="cancelling || !canCancel" @click="confirmCancel">
                    {{ cancelling ? 'Đang hủy...' : 'Xác nhận hủy đơn' }}
                </button>
                <router-link to="/Taikhoan/Donhang" class="btn btn-primary">Tôi vẫn muốn mua</router-link>
            </div>
        </template>
        <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    </section>
</template>

<style scoped>
.cancel-page { min-height: 570px; padding-bottom: 4rem; color: #222529; }
.back-link { display: inline-block; margin-bottom: 1.5rem; color: #08c; }
.account-sub-title { display: flex; align-items: center; gap: 10px; margin-bottom: 1.8rem; font-size: 22px; }
.account-sub-title i { color: #d7dce0; font-size: 34px; }
.state-message { padding: 5rem; text-align: center; }
.order-meta { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; text-align: center; }
.order-meta span, .order-meta strong { display: block; }
.order-meta span { margin-bottom: .5rem; color: #777; font-size: 12px; }
.sorry-image { display: block; width: min(560px, 90%); max-height: 330px; margin: 3rem auto 2rem; object-fit: contain; }
.cancel-actions { display: flex; justify-content: center; gap: 2rem; }
.confirm-button { border: 1px solid #444; background: #fff; color: #333; }
.confirm-button:hover { background: #333; color: #fff; }
@media (max-width: 767px) { .order-meta { grid-template-columns: 1fr 1fr; } .cancel-actions { flex-direction: column; } }
</style>
