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

const sortedPromotions = computed(() =>
    [...khuyenMais.value].sort((a, b) => Number(b.mucgiam ?? 0) - Number(a.mucgiam ?? 0))
)

const isEligible = (promotion: khuyenmai) =>
    props.tamTinh >= Number(promotion.giatri ?? 0)

const discountPercent = (promotion: khuyenmai) =>
    `${Math.round(Number(promotion.mucgiam ?? 0) * 100)}%`

const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(Number(value ?? 0))

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

onMounted(async () => {
    isLoading.value = true
    try {
        const response = await axios.get('/api/loadKhuyenmai')
        khuyenMais.value = response.data.khuyenmais || response.data
    } catch (error) {
        errorMessage.value = 'Không thể tải danh sách khuyến mãi.'
        console.error(error)
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <div class="promotion-entry">
        <h4 class="mt-3 text-primary mb-1">Voucher</h4>
        <button type="button" class="btn btn-primary" :disabled="isLoading" @click="openModal">
            {{ modelValue ? `Đổi voucher (${modelValue.makm})` : 'Chọn voucher' }}
        </button>
        <p v-if="errorMessage" class="promotion-error">{{ errorMessage }}</p>
    </div>

    <Teleport to="body">
        <div v-if="isOpen" class="promotion-modal" role="dialog" aria-modal="true" aria-labelledby="promotion-title">
            <div class="promotion-backdrop" @click="closeModal"></div>
            <div class="modal-dialog promotion-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary">
                        <h4 id="promotion-title" class="modal-title text-white">Voucher chuẩn – Giảm giá chất!</h4>
                        <button type="button" class="btn btn-light btn-sm close-modal-x" @click="closeModal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            Voucher đang hiệu lực được sắp xếp theo mức giảm tốt nhất.
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
                                        <th class="text-center">Chọn voucher</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="promotion in sortedPromotions" :key="promotion.makm">
                                        <td class="text-center">{{ promotion.makm }}</td>
                                        <td>
                                            <img
                                                :src="isEligible(promotion) ? khuyenmaiHopLeImage : khuyenmaiKhongHopLeImage"
                                                width="70"
                                                height="70"
                                                alt=""
                                            >
                                        </td>
                                        <td class="text-center">{{ promotion.tenkm }}</td>
                                        <td class="text-center">{{ discountPercent(promotion) }}</td>
                                        <td class="text-center">
                                            <span>{{ promotion.dieukien }}</span>
                                            <small>Đơn tối thiểu {{ formatCurrency(promotion.giatri) }}</small>
                                        </td>
                                        <td v-if="isEligible(promotion)" class="text-center">
                                            <input
                                                v-model="selectedCode"
                                                type="radio"
                                                name="promotion"
                                                :value="promotion.makm"
                                                :aria-label="`Chọn voucher ${promotion.makm}`"
                                            >
                                        </td>
                                        <td v-else class="text-center promotion-invalid">
                                            Không đủ điều kiện áp dụng
                                        </td>
                                    </tr>
                                    <tr v-if="!isLoading && sortedPromotions.length === 0">
                                        <td colspan="6" class="text-center">Hiện chưa có voucher khả dụng.</td>
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
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e7e7e7;
}

.promotion-error,
.promotion-invalid {
    color: #dc3545;
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
</style>
