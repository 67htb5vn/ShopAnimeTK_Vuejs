<script setup lang="ts">
import type { diachi } from '@/models/diachi'

defineProps<{
    addresses: diachi[]
    modelValue?: number
    loading?: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: number]
    edit: [address: diachi]
    delete: [address: diachi]
}>()
</script>

<template>
    <div class="address-table-wrap">
        <table class="table address-table">
            <thead>
                <tr>
                    <th>Tên</th>
                    <th>Số điện thoại</th>
                    <th>Tỉnh/Thành phố</th>
                    <th>Địa chỉ nhà</th>
                    <th>Chọn địa chỉ</th>
                    <th>Chỉnh sửa</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="loading">
                    <td colspan="6" class="empty-cell">Đang tải địa chỉ...</td>
                </tr>
                <tr v-for="address in addresses" :key="address.madc">
                    <td>{{ address.ten }}</td>
                    <td>{{ address.sodienthoai }}</td>
                    <td>{{ address.tinh_tp }}</td>
                    <td class="house-address" :title="address.diachinha">{{ address.diachinha }}</td>
                    <td>
                        <input
                            type="radio"
                            name="saved-address"
                            :checked="modelValue === address.madc"
                            :value="address.madc"
                            :aria-label="`Chọn địa chỉ của ${address.ten}`"
                            @change="address.madc && emit('update:modelValue', address.madc)"
                        >
                    </td>
                    <td>
                        <div class="address-actions">
                            <button type="button" class="edit-button" title="Chỉnh sửa" @click="emit('edit', address)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="delete-button" title="Xóa" @click="emit('delete', address)">×</button>
                        </div>
                    </td>
                </tr>
                <tr v-if="!loading && addresses.length === 0">
                    <td colspan="6" class="empty-cell">Bạn chưa lưu địa chỉ nào.</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.address-table-wrap { max-height: 330px; overflow: auto; border-top: 1px solid #e5e5e5; }
.address-table { width: 100%; margin: 0; table-layout: fixed; }
.address-table th { position: sticky; top: 0; z-index: 1; padding: 1.5rem 1rem; background: #f7f7f7; color: #666; text-align: center; vertical-align: middle; }
.address-table td { padding: 1.4rem 1rem; text-align: center; vertical-align: middle; }
.address-table th:nth-child(4) { width: 25%; }
.house-address { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.address-actions { display: flex; justify-content: center; gap: 0.5rem; }
.edit-button, .delete-button { width: 32px; height: 32px; border: 0; color: #fff; cursor: pointer; }
.edit-button { background: #e36159; }
.delete-button { background: #777; font-size: 1.8rem; }
.empty-cell { padding: 3rem !important; color: #777; }
@media (max-width: 767px) { .address-table { min-width: 760px; } }
</style>
