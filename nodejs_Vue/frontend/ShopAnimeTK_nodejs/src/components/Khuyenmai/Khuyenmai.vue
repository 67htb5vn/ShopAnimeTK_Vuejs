<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import type { khuyenmai } from '@/models/khuyenmai'
import khuyenmaiHopLeImage from '@/assets/images/khuyenmaiHL.png'
import khuyenmaiKhongHopLeImage from '@/assets/images/khuyenmaiKO.png'

const props = defineProps<{
    tamTinh: number
    modelValue: khuyenmai | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: khuyenmai | null]
}>()

const isOpen = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const khuyenMais = ref<khuyenmai[]>([])
const selectedCode = ref('')

const isEligible = (promotion: khuyenmai) => {
    const minimumOrder = Number(promotion.giatri)
    return promotion.giatri != null
        && Number.isFinite(minimumOrder)
        && props.tamTinh >= minimumOrder
}

const sortedPromotions = computed(() =>
    [...khuyenMais.value].sort((a, b) => {
        const eligibilityOrder = Number(isEligible(b)) - Number(isEligible(a))
        return eligibilityOrder || Number(b.mucgiam ?? 0) - Number(a.mucgiam ?? 0)
    })
)

const discountPercent = (promotion: khuyenmai) =>
    `${Math.round(Number(promotion.mucgiam ?? 0) * 100)}%`

const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(Number(value ?? 0))

const loadPromotions = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        const response = await axios.get('/api/loadKhuyenmai')
        const data = response.data.khuyenmais || response.data
        khuyenMais.value = Array.isArray(data)
            ? data.map((promotion) => ({
                ...promotion,
                makm: promotion.makm?.trim()
            }))
            : []
    } catch (error) {
        errorMessage.value = 'Không thể tải danh sách khuyến mãi.'
        console.error(error)
    } finally {
        isLoading.value = false
    }
}

const openModal = () => {
    selectedCode.value = props.modelValue?.makm ?? ''
    isOpen.value = true
}

const closeModal = () => {
    isOpen.value = false
}

const applyPromotion = () => {
    const promotion = khuyenMais.value.find(
        (item) => item.makm === selectedCode.value && isEligible(item)
    )

    emit('update:modelValue', promotion ?? null)
    closeModal()
}

onMounted(loadPromotions)
</script>

<template>
    <div class="promotion-entry">
        <div>
            <h4 class="promotion-title">Voucher</h4>
            <span class="promotion-hint">Chọn ưu đãi phù hợp với đơn hàng</span>
        </div>
        <button type="button" class="btn btn-primary promotion-button" :disabled="isLoading" @click="openModal">
            {{ isLoading ? 'Đang tải...' : modelValue ? `Đổi voucher (${modelValue.makm})` : 'Chọn voucher' }}
        </button>
    </div>

    <div v-if="errorMessage" class="promotion-error-box">
        <span>{{ errorMessage }}</span>
        <button type="button" class="btn btn-sm btn-outline-primary" @click="loadPromotions">Tải lại</button>
    </div>

    <Teleport to="body">
        <div v-if="isOpen" class="promotion-modal" role="dialog" aria-modal="true" aria-labelledby="promotion-title">
            <div class="promotion-backdrop" @click="closeModal"></div>
            <div class="modal-dialog promotion-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary">
                        <h4 id="promotion-title" class="modal-title text-white">Danh sách voucher</h4>
                        <button type="button" class="btn btn-light btn-sm close-modal-x" @click="closeModal">×</button>
                    </div>

                    <div class="modal-body">
                        <div class="alert alert-info">
                            Tất cả voucher được hiển thị; voucher khả dụng được xếp lên trước.
                        </div>
                        <div class="custom-scrollbar promotion-list">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th class="text-center">Mã KM</th>
                                        <th></th>
                                        <th class="text-center">Tên</th>
                                        <th class="text-center">Giảm giá</th>
                                        <th class="text-center">Điều kiện</th>
                                        <th class="text-center">Áp dụng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="promotion in sortedPromotions" :key="promotion.makm">
                                        <td class="text-center">{{ promotion.makm }}</td>
                                        <td>
                                            <img :src="isEligible(promotion) ? khuyenmaiHopLeImage : khuyenmaiKhongHopLeImage"
                                                width="70" height="70" alt="">
                                        </td>
                                        <td class="text-center">{{ promotion.tenkm }}</td>
                                        <td class="text-center">{{ discountPercent(promotion) }}</td>
                                        <td class="text-center">
                                            <span>{{ promotion.dieukien }}</span>
                                            <small v-if="promotion.giatri != null">
                                                Đơn tối thiểu {{ formatCurrency(promotion.giatri) }}
                                            </small>
                                            <small v-else>Chưa thiết lập giá trị đơn tối thiểu</small>
                                        </td>
                                        <td v-if="isEligible(promotion)" class="text-center">
                                            <input v-model="selectedCode" type="radio" name="promotion"
                                                :value="promotion.makm" :aria-label="`Chọn voucher ${promotion.makm}`">
                                        </td>
                                        <td v-else class="text-center promotion-invalid">Không khả dụng</td>
                                    </tr>
                                    <tr v-if="sortedPromotions.length === 0">
                                        <td colspan="6" class="text-center">Chưa có dữ liệu khuyến mãi.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" @click="closeModal">Đóng</button>
                        <button type="button" class="btn btn-primary" :disabled="!selectedCode" @click="applyPromotion">
                            Sử dụng voucher
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.promotion-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    margin-top: 1.5rem;
    padding: 1.5rem;
    border: 1px solid #e7e7e7;
    background: #f7f7f7;
}

.promotion-title {
    margin: 0;
    color: #08c;
}

.promotion-hint {
    display: block;
    margin-top: 0.3rem;
    color: #777;
    font-size: 1.2rem;
}

.promotion-button {
    flex: 0 0 auto;
    min-width: 145px;
}

.promotion-error-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.8rem;
    color: #dc3545;
}

.promotion-invalid {
    color: #dc3545;
    font-weight: 600;
}

.promotion-modal {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.promotion-backdrop {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 55%);
}

.promotion-dialog {
    position: relative;
    z-index: 1;
    width: min(900px, 100%);
    max-width: 900px;
    margin: 0;
}

.modal-header,
.modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.promotion-list {
    max-height: 420px;
    overflow: auto;
}

.promotion-list td {
    vertical-align: middle;
}

.promotion-list small {
    display: block;
    margin-top: 0.4rem;
    color: #777;
}

.close-modal-x {
    font-size: 2rem;
}

@media (max-width: 575px) {
    .promotion-entry {
        align-items: stretch;
        flex-direction: column;
    }

    .promotion-button {
        width: 100%;
    }
}
</style>
