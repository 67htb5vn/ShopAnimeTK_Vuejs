<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import TableHoadon, { type OrderSummary } from '@/components/Hoadon/TableHoadon.vue'

const router = useRouter()
interface OrderTab {
    key: string
    label: string
    statuses: string[]
}

const tabs: OrderTab[] = [
    { key: 'pending', label: 'Chờ xác nhận', statuses: ['TT001'] },
    { key: 'shipping', label: 'Chờ giao hàng', statuses: ['TT002', 'TT003'] },
    { key: 'complete', label: 'Hoàn thành', statuses: ['TT004'] },
    { key: 'cancelled', label: 'Đã hủy', statuses: ['TT005'] }
]

const activeTab = ref<OrderTab>(tabs[0]!)
const orders = ref<OrderSummary[]>([])
const loading = ref(false)
const errorMessage = ref('')
const page = ref(1)
const totalPages = ref(1)

const loadOrders = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await axios.get('/api/orders', {
            params: {
                statuses: activeTab.value.statuses.join(','),
                page: page.value,
                pageSize: 4
            },
            withCredentials: true
        })
        orders.value = response.data.items || []
        totalPages.value = response.data.totalPages || 1
    } catch (error: any) {
        orders.value = []
        if (error.response?.status === 401) {
            await router.push('/Dangnhap')
            return
        }
        errorMessage.value = error.response?.data?.message || 'Không thể tải lịch sử đơn hàng.'
    } finally {
        loading.value = false
    }
}

const selectTab = (tab: OrderTab) => {
    activeTab.value = tab
    page.value = 1
    loadOrders()
}

const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages.value || newPage === page.value) return
    page.value = newPage
    loadOrders()
}

const cancelOrder = async (order: OrderSummary) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng ${order.mahd}?`)) return
    try {
        await axios.patch(`/api/orders/${order.mahd}/cancel`, {}, { withCredentials: true })
        await loadOrders()
    } catch (error: any) {
        window.alert(error.response?.data?.message || 'Không thể hủy đơn hàng.')
    }
}

onMounted(loadOrders)
</script>

<template>
    <section class="order-content">
        <h3 class="account-sub-title">
            <i class="sicon-social-dropbox"></i>
            Đơn hàng của tôi
        </h3>

        <div class="order-tabs" role="tablist" aria-label="Trạng thái đơn hàng">
            <button v-for="tab in tabs" :key="tab.key" type="button" class="order-tab"
                :class="{ active: activeTab.key === tab.key }" @click="selectTab(tab)">
                {{ tab.label }}
            </button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <TableHoadon :orders="orders" :loading="loading" :page="page" :total-pages="totalPages"
            @page-change="changePage" @cancel="cancelOrder" />
    </section>
</template>

<style scoped>
.order-content {
    padding-bottom: 40px;
}

.account-sub-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 22px;
    color: #222;
    font-size: 22px;
    font-weight: 700;
}

.account-sub-title i {
    color: #d7dce0;
    font-size: 34px;
}

.order-tabs {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0;
}

.order-tab {
    min-width: 118px;
    padding: 13px 20px;
    border: 1px solid #e7e7e7;
    border-bottom: 0;
    background: #f5f5f5;
    color: #444;
    cursor: pointer;
}

.order-tab+.order-tab {
    border-left: 0;
}

.order-tab.active {
    position: relative;
    background: #fff;
    color: #08c;
}

.order-tab.active::before {
    content: '';
    position: absolute;
    left: -1px;
    right: -1px;
    top: -2px;
    height: 3px;
    background: #08c;
}

.alert {
    margin-bottom: 12px;
}

@media (max-width: 575px) {
    .order-tab {
        flex: 1 1 50%;
    }
}
</style>
