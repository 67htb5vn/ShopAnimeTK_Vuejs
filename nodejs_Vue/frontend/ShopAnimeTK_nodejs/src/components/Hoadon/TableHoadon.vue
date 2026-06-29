<script setup lang="ts">
import { computed } from 'vue'
import { handleProductImageError, normalizeProductImagePath, productPlaceholderImage } from '@/utils/productImage'

export interface OrderProduct {
    masp: string
    tensp: string
    soluong: number
    hinhanh?: string
}

export interface OrderSummary {
    mahd: string
    ngaylap?: string
    thanhtien: number
    htthanhtoan?: string
    matt: string
    tentrangthai: string
    products: OrderProduct[]
}

const props = defineProps<{
    orders: OrderSummary[]
    loading: boolean
    page: number
    totalPages: number
}>()

const emit = defineEmits<{
    pageChange: [page: number]
}>()

const pages = computed(() => {
    const start = Math.max(1, props.page - 2)
    const end = Math.min(props.totalPages, start + 4)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const imageOf = (order: OrderSummary) =>
    normalizeProductImagePath(order.products?.[0]?.hinhanh) || productPlaceholderImage

const productNames = (order: OrderSummary) =>
    (order.products || []).map(product => product.tensp || product.masp).join(', ')

const formatDate = (value?: string) => {
    if (!value) return '—'
    const [year, month, day] = value.slice(0, 10).split('-')
    return `${day}-${month}-${year}`
}

const formatMoney = (value: number) => Number(value || 0).toLocaleString('vi-VN')

const badgeClass = (status: string) => ({
    TT001: 'status-pending',
    TT002: 'status-preparing',
    TT003: 'status-shipping',
    TT004: 'status-complete',
    TT005: 'status-cancelled'
}[status] || 'status-cancelled')
</script>

<template>
    <div class="order-table-container">
        <div v-if="loading" class="order-message">
            <i class="fas fa-circle-notch fa-spin"></i> Đang tải đơn hàng...
        </div>

        <div v-else-if="orders.length === 0" class="order-message">
            Bạn chưa có đơn hàng nào ở trạng thái này.
        </div>

        <div v-else class="table-responsive">
            <table class="table table-order">
                <thead>
                    <tr>
                        <th class="order-code">Mã</th>
                        <th colspan="2">Sản phẩm</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Thanh toán</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in orders" :key="order.mahd">
                        <td class="order-code">{{ order.mahd }}</td>
                        <td class="product-picture">
                            <img :src="imageOf(order)" :alt="productNames(order)" @error="handleProductImageError">
                        </td>
                        <td class="product-name" :title="productNames(order)">{{ productNames(order) }}</td>
                        <td>{{ formatDate(order.ngaylap) }}</td>
                        <td>
                            <span class="status-badge" :class="badgeClass(order.matt)">
                                {{ order.tentrangthai }}
                            </span>
                        </td>
                        <td>{{ formatMoney(order.thanhtien) }}</td>
                        <td>
                            <div class="order-actions">
                                <router-link
                                    :to="`/Taikhoan/Donhang/${order.mahd}`"
                                    class="action-button view-button"
                                    title="Xem chi tiết"
                                >
                                    <i class="fas fa-eye"></i>
                                </router-link>
                                <router-link
                                    v-if="order.matt === 'TT001'"
                                    :to="`/Taikhoan/Donhang/${order.mahd}/Huy`"
                                    class="action-button cancel-button"
                                    title="Hủy đơn hàng"
                                >
                                    <i class="fas fa-window-close"></i>
                                </router-link>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <nav v-if="!loading && totalPages > 1" class="order-pagination" aria-label="Phân trang hóa đơn">
            <button :disabled="page === 1" @click="emit('pageChange', page - 1)">
                <i class="fas fa-angle-left"></i>
            </button>
            <button
                v-for="pageNumber in pages"
                :key="pageNumber"
                :class="{ active: pageNumber === page }"
                @click="emit('pageChange', pageNumber)"
            >
                {{ pageNumber }}
            </button>
            <button :disabled="page === totalPages" @click="emit('pageChange', page + 1)">
                <i class="fas fa-angle-right"></i>
            </button>
        </nav>
    </div>
</template>

<style scoped>
.order-table-container {
    min-height: 300px;
    border: 1px solid #e7e7e7;
    padding: 14px;
    background: #fff;
}

.table-order { margin: 0; min-width: 790px; }
.table-order th { padding: 16px 10px; border-top: 0; color: #222; font-weight: 700; text-align: center; white-space: nowrap; }
.table-order td { padding: 9px 10px; height: 106px; vertical-align: middle; text-align: center; border-top: 1px solid #e8e8e8; color: #777; }
.table-order .order-code { width: 76px; }
.product-picture { width: 92px; }
.product-picture img { width: 80px; height: 80px; object-fit: contain; background: #f7f7f7; }
.table-order .product-name { width: 245px; max-width: 245px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #555; }

.status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap; }
.status-pending { background: #20a9bd; }
.status-preparing { background: #7f8c8d; }
.status-shipping { background: #087fc1; }
.status-complete { background: #28a745; }
.status-cancelled { background: #dc3545; }

.order-actions { display: flex; justify-content: center; gap: 5px; }
.action-button { width: 40px; height: 38px; display: inline-flex; align-items: center; justify-content: center; border: 0; color: #fff !important; cursor: pointer; }
.view-button { background: #ff6b6b; }
.cancel-button { background: #df273c; }
.action-button:hover { filter: brightness(.92); }

.order-message { min-height: 270px; display: flex; align-items: center; justify-content: center; color: #777; font-size: 15px; }
.order-pagination { display: flex; gap: 5px; padding: 18px 0 4px; }
.order-pagination button { min-width: 34px; height: 34px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
.order-pagination button.active { color: #fff; border-color: #08c; background: #08c; }
.order-pagination button:disabled { opacity: .45; cursor: default; }
</style>
