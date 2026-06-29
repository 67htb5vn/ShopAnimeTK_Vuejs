<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { sanphamgiohang } from '@/models/sanphamgiohang'
import type { khuyenmai } from '@/models/khuyenmai'
import { useGiohangStore } from '@/stores/XemnhanhGiohang'
import Tamtinhdonhang from '@/components/Giohang/Tamtinhdonhang.vue'
import Khuyenmai from '@/components/Khuyenmai/Khuyenmai.vue'
import { useThanhtoanStore } from '@/stores/Thanhtoan'

const giohangStore = useGiohangStore()
const thanhtoanStore = useThanhtoanStore()
const router = useRouter()
const isLoading = ref(true)
const errorMessage = ref('')
const updatingProducts = ref<string[]>([])
const selectedPromotion = ref<khuyenmai | null>(null)

const selectedProducts = computed(() =>
    giohangStore.giohangs.filter((item) => item.chon !== false)
)

const orderTotal = computed(() =>
    selectedProducts.value.reduce(
        (total, item) => total + Number(item.gia ?? 0) * Number(item.soluong ?? 0),
        0
    )
)

const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(Number(value ?? 0))

const productLink = (item: sanphamgiohang) =>
    `/chitiet/${encodeURIComponent(`${item.tensp?.toLowerCase() ?? 'san-pham'}_${item.masp ?? ''}`)}`

const setUpdating = (masp: string, value: boolean) => {
    updatingProducts.value = value
        ? [...updatingProducts.value, masp]
        : updatingProducts.value.filter((id) => id !== masp)
}

const saveQuantity = async (item: sanphamgiohang, quantity: number) => {
    if (!item.masp) return

    const previousQuantity = Number(item.soluong ?? 1)
    const nextQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
    if (nextQuantity === previousQuantity) return

    // Cập nhật trước ở client để thành tiền và đơn hàng đổi ngay lập tức.
    item.soluong = nextQuantity
    item.thanhtien = Number(item.gia ?? 0) * nextQuantity
    errorMessage.value = ''
    setUpdating(item.masp, true)

    try {
        await giohangStore.updateSoluong(item.masp, nextQuantity)
    } catch (error) {
        item.soluong = previousQuantity
        item.thanhtien = Number(item.gia ?? 0) * previousQuantity
        errorMessage.value = 'Không thể cập nhật số lượng. Vui lòng thử lại.'
        console.error(error)
    } finally {
        setUpdating(item.masp, false)
    }
}

const updateQuantity = (item: sanphamgiohang, event: Event) => {
    const input = event.target as HTMLInputElement
    void saveQuantity(item, Number(input.value))
}

const changeQuantity = (item: sanphamgiohang, amount: number) => {
    void saveQuantity(item, Number(item.soluong ?? 1) + amount)
}

const removeProduct = async (item: sanphamgiohang) => {
    if (!item.masp) return

    errorMessage.value = ''
    setUpdating(item.masp, true)

    try {
        await giohangStore.xoaGiohang(item.masp)
    } catch (error) {
        errorMessage.value = 'Không thể xóa sản phẩm. Vui lòng thử lại.'
        console.error(error)
    } finally {
        setUpdating(item.masp, false)
    }
}

const proceedToCheckout = () => {
    if (selectedProducts.value.length === 0) return
    thanhtoanStore.startCheckout(selectedProducts.value, selectedPromotion.value)
    router.push('/Thanhtoan')
}

watch(orderTotal, (total) => {
    if (selectedPromotion.value && total < Number(selectedPromotion.value.giatri ?? 0)) {
        selectedPromotion.value = null
    }
})

onMounted(async () => {
    try {
        await giohangStore.loadGiohang()
    } catch (error) {
        errorMessage.value = 'Không thể tải giỏ hàng. Vui lòng thử lại.'
        console.error(error)
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <main class="main">
        <div class="container">
            <ul class="checkout-progress-bar d-flex justify-content-center flex-wrap">
                <li class="active">
                    <router-link to="/Giohang">Giỏ hàng</router-link>
                </li>
                <li><span>Thanh toán</span></li>
            </ul>

            <p v-if="errorMessage" class="cart-error" role="alert">{{ errorMessage }}</p>
            <div v-if="isLoading" class="cart-empty">Đang tải giỏ hàng...</div>

            <div v-else-if="giohangStore.giohangs.length === 0" class="cart-empty">
                <h3>Giỏ hàng của bạn đang trống</h3>
                <router-link to="/" class="btn btn-primary mt-2">Tiếp tục mua sắm</router-link>
            </div>

            <div v-else class="row">
                <div class="col-lg-8">
                    <div class="cart-table-container">
                        <table class="table table-cart">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th class="thumbnail-col"></th>
                                    <th class="product-col">Sản phẩm</th>
                                    <th class="price-col text-center">Giá</th>
                                    <th class="qty-col text-center">Số lượng</th>
                                    <th class="text-center">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in giohangStore.giohangs" :key="item.masp" class="product-row">
                                    <td>
                                        <div class="form-check">
                                            <input v-model="item.chon" class="form-check-input" type="checkbox"
                                                aria-label="Chọn sản phẩm để thanh toán">
                                        </div>
                                    </td>
                                    <td>
                                        <figure class="product-image-container">
                                            <router-link :to="productLink(item)" class="product-image">
                                                <img :src="item.duongdan" :alt="item.tensp || 'Sản phẩm'">
                                            </router-link>
                                            <button type="button" class="btn-remove icon-cancel" title="Xóa sản phẩm"
                                                :disabled="item.masp ? updatingProducts.includes(item.masp) : true"
                                                @click="removeProduct(item)"></button>
                                        </figure>
                                    </td>
                                    <td class="product-col">
                                        <h5 class="product-title">
                                            <router-link :to="productLink(item)">{{ item.tensp }}</router-link>
                                        </h5>
                                    </td>
                                    <td class="text-center">{{ formatCurrency(item.gia) }}</td>
                                    <td class="quantity-cell">
                                        <div class="quantity-control">
                                            <button type="button" class="quantity-button" aria-label="Giảm số lượng"
                                                :disabled="Number(item.soluong ?? 1) <= 1 || (item.masp ? updatingProducts.includes(item.masp) : true)"
                                                @click="changeQuantity(item, -1)">−</button>
                                            <input class="form-control quantity-input" type="number"
                                                :value="item.soluong ?? 1" min="1" step="1"
                                                :disabled="item.masp ? updatingProducts.includes(item.masp) : true"
                                                @change="updateQuantity(item, $event)">
                                            <button type="button" class="quantity-button" aria-label="Tăng số lượng"
                                                :disabled="item.masp ? updatingProducts.includes(item.masp) : true"
                                                @click="changeQuantity(item, 1)">+</button>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span class="subtotal-price">
                                            {{ formatCurrency(Number(item.gia ?? 0) * Number(item.soluong ?? 0)) }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="col-lg-4">
                    <Tamtinhdonhang :tam-tinh="orderTotal" :khuyen-mai="selectedPromotion"
                        @xoa-khuyen-mai="selectedPromotion = null"
                        @thanh-toan="proceedToCheckout" />
                    <Khuyenmai v-model="selectedPromotion" :tam-tinh="orderTotal" />
                </div>
            </div>
        </div>
        <div class="mb-6"></div>
    </main>
</template>

<style scoped>
td .form-check {
    display: flex;
    justify-content: center;
    align-items: center;
}

td .form-check-input {
    width: 15px !important;
    height: 15px !important;
    transform: scale(1.5) !important;
}

.cart-table-container {
    max-height: 580px;
    overflow-y: auto;
}

.cart-table-container::-webkit-scrollbar {
    width: 6px;
}

.cart-table-container::-webkit-scrollbar-thumb {
    background-color: #bbb;
    border-radius: 3px;
}

.table-cart thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #fff;
}

.cart-empty {
    padding: 5rem 1rem;
    text-align: center;
}

.cart-error {
    margin-bottom: 1.5rem;
    color: #dc3545;
}

.quantity-control {
    display: inline-grid !important;
    grid-template-columns: 38px 54px 38px;
    align-items: center;
    width: 130px !important;
    min-width: 130px !important;
    height: 46px;
    margin: 0 auto !important;
    padding: 0 !important;
    overflow: hidden;
    border: 1px solid #e1e1e1;
    background: #fff;
    box-sizing: border-box;
}

.quantity-control .quantity-input {
    display: block !important;
    width: 54px !important;
    min-width: 54px !important;
    max-width: 54px !important;
    height: 44px !important;
    min-height: 44px !important;
    margin: 0 !important;
    padding: 0 !important;
    border-width: 0 1px !important;
    border-style: solid !important;
    border-color: #e1e1e1 !important;
    border-radius: 0 !important;
    background: #fff !important;
    color: #222529;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 44px !important;
    text-align: center !important;
    box-shadow: none !important;
    appearance: textfield;
    box-sizing: border-box !important;
}

.quantity-control .quantity-input::-webkit-inner-spin-button,
.quantity-control .quantity-input::-webkit-outer-spin-button {
    margin: 0;
    appearance: none;
}

.quantity-button {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 38px !important;
    min-width: 38px !important;
    height: 44px !important;
    min-height: 44px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: #fff !important;
    color: #222529;
    font: inherit;
    font-size: 0;
    line-height: 1;
    cursor: pointer;
    box-shadow: none !important;
    box-sizing: border-box !important;
}

.quantity-button::before {
    font-size: 1.6rem;
    line-height: 1;
}

.quantity-button:first-child::before {
    content: "−";
}

.quantity-button:last-child::before {
    content: "+";
}

.quantity-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.quantity-cell {
    text-align: center;
    vertical-align: middle !important;
}
</style>
