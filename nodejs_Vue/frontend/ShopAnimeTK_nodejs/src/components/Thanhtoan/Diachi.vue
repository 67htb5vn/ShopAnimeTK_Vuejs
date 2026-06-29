<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import type { diachi } from '@/models/diachi'
import TableDiachi from '@/components/Thanhtoan/TableDiachi.vue'

defineProps<{
    modelValue: diachi
    provinces: string[]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: diachi]
}>()

const isOpen = ref(false)
const isEditorOpen = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const editorError = ref('')
const addresses = ref<diachi[]>([])
const selectedId = ref<number>()
const editingId = ref<number>()
const editorAddress = reactive<diachi>({ ten: '', sodienthoai: '', tinh_tp: 'Hà Nội', diachinha: '' })

const resetEditor = () => {
    editingId.value = undefined
    Object.assign(editorAddress, { ten: '', sodienthoai: '', tinh_tp: 'Hà Nội', diachinha: '' })
    editorError.value = ''
}

const loadAddresses = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await axios.get('/api/addresses', { withCredentials: true })
        addresses.value = response.data.addresses || []
        if (response.data.selected) emit('update:modelValue', response.data.selected)
    } catch (error) {
        errorMessage.value = 'Không thể tải địa chỉ đã lưu.'
        console.error(error)
    } finally {
        isLoading.value = false
    }
}

const openAddModal = () => {
    resetEditor()
    isEditorOpen.value = true
}

const openEditModal = (address: diachi) => {
    editingId.value = address.madc
    Object.assign(editorAddress, address)
    editorError.value = ''
    isEditorOpen.value = true
}

const closeEditor = () => {
    isEditorOpen.value = false
    resetEditor()
}

const saveAddress = async () => {
    isSaving.value = true
    editorError.value = ''

    try {
        if (editingId.value) {
            const response = await axios.put(`/api/addresses/${editingId.value}`, editorAddress, { withCredentials: true })
            const index = addresses.value.findIndex((item) => item.madc === editingId.value)
            if (index !== -1) addresses.value[index] = response.data
        } else {
            const response = await axios.post('/api/addresses', editorAddress, { withCredentials: true })
            addresses.value.unshift(response.data)
            selectedId.value = response.data.madc
        }
        closeEditor()
    } catch (error) {
        editorError.value = 'Không thể lưu địa chỉ. Vui lòng kiểm tra lại thông tin.'
        console.error(error)
    } finally {
        isSaving.value = false
    }
}

const useAddress = async () => {
    const selected = addresses.value.find((item) => item.madc === selectedId.value)
    if (!selected) {
        errorMessage.value = 'Vui lòng chọn một địa chỉ.'
        return
    }

    try {
        await axios.post('/api/checkout-address', selected, { withCredentials: true })
        emit('update:modelValue', { ...selected })
        isOpen.value = false
    } catch (error) {
        errorMessage.value = 'Không thể sử dụng địa chỉ này.'
        console.error(error)
    }
}

const deleteAddress = async (address: diachi) => {
    if (!address.madc) return
    try {
        await axios.delete(`/api/addresses/${address.madc}`, { withCredentials: true })
        addresses.value = addresses.value.filter((item) => item.madc !== address.madc)
        if (selectedId.value === address.madc) selectedId.value = undefined
    } catch (error) {
        errorMessage.value = 'Không thể xóa địa chỉ.'
        console.error(error)
    }
}

onMounted(loadAddresses)
</script>

<template>
    <div class="saved-address-entry">
        <span>Sử dụng địa chỉ đã lưu?</span>
        <button type="button" class="btn btn-link" @click="isOpen = true">Chọn địa chỉ</button>
    </div>

    <Teleport to="body">
        <div v-if="isOpen" class="address-modal" role="dialog" aria-modal="true" aria-labelledby="saved-address-title">
            <div class="address-backdrop" @click="isOpen = false"></div>
            <div class="address-dialog">
                <div class="address-content">
                    <div class="address-header">
                        <h3 id="saved-address-title">Địa chỉ đã lưu</h3>
                        <button type="button" class="modal-close" aria-label="Đóng" @click="isOpen = false">×</button>
                    </div>

                    <div class="address-body">
                        <div class="address-alert">Chọn địa chỉ <strong>phù hợp nhất với vị trí của bạn!</strong></div>
                        <p v-if="errorMessage" class="address-error">{{ errorMessage }}</p>
                        <button type="button" class="btn btn-primary add-address-button" @click="openAddModal">
                            <span>+</span> Thêm địa chỉ mới
                        </button>

                        <TableDiachi
                            v-model="selectedId"
                            :addresses="addresses"
                            :loading="isLoading"
                            @edit="openEditModal"
                            @delete="deleteAddress"
                        />
                    </div>

                    <div class="address-footer">
                        <button type="button" class="btn btn-light" @click="isOpen = false">Đóng</button>
                        <button type="button" class="btn btn-primary" :disabled="!selectedId" @click="useAddress">
                            Sử dụng địa chỉ
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isEditorOpen" class="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div class="editor-backdrop" @click="closeEditor"></div>
            <div class="editor-dialog">
                <form class="editor-content" @submit.prevent="saveAddress">
                    <div class="editor-header">
                        <h3 id="editor-title">{{ editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm mới địa chỉ' }}</h3>
                        <button type="button" class="modal-close" aria-label="Đóng" @click="closeEditor">×</button>
                    </div>

                    <div class="editor-body">
                        <p v-if="editorError" class="address-error">{{ editorError }}</p>
                        <div class="editor-grid">
                            <div class="form-group">
                                <label>Tên <abbr>*</abbr></label>
                                <input v-model.trim="editorAddress.ten" class="form-control" placeholder="Nhập tên" required>
                            </div>
                            <div class="form-group">
                                <label>Số điện thoại <abbr>*</abbr></label>
                                <input v-model.trim="editorAddress.sodienthoai" class="form-control" placeholder="Nhập số điện thoại" pattern="0[0-9]{9}" required>
                            </div>
                            <div class="form-group full-width">
                                <label>Tỉnh/Thành phố <abbr>*</abbr></label>
                                <select v-model="editorAddress.tinh_tp" class="form-control" required>
                                    <option v-for="province in provinces" :key="province" :value="province">{{ province }}</option>
                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label>Địa chỉ chi tiết <abbr>*</abbr></label>
                                <input v-model.trim="editorAddress.diachinha" class="form-control" placeholder="Nhập số nhà, tên đường, xã/phường" required>
                            </div>
                        </div>
                    </div>

                    <div class="editor-footer">
                        <button type="button" class="btn btn-light" @click="closeEditor">Đóng</button>
                        <button type="submit" class="btn btn-success" :disabled="isSaving">
                            {{ isSaving ? 'Đang lưu...' : editingId ? 'Lưu' : 'Thêm' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.saved-address-entry { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; font-size: 1.5rem; }
.address-modal, .editor-modal { position: fixed; inset: 0; display: grid; place-items: center; padding: 2rem; }
.address-modal { z-index: 1200; }
.editor-modal { z-index: 1300; }
.address-backdrop, .editor-backdrop { position: absolute; inset: 0; z-index: 0; background: rgb(0 0 0 / 58%); }
.editor-backdrop { background: rgb(0 0 0 / 42%); }
.address-dialog, .editor-dialog { position: relative; z-index: 1; width: min(1120px, 96vw); margin: 0; }
.editor-dialog { width: min(1050px, 96vw); }
.address-content, .editor-content { overflow: hidden; border: 1px solid #777; background: #fff; box-shadow: 0 12px 35px rgb(0 0 0 / 30%); }
.address-header, .editor-header { display: flex; align-items: center; justify-content: space-between; min-height: 66px; padding: 1.2rem 2.4rem; background: #08c; color: #fff; }
.editor-header { background: #20a4b8; }
.address-header h3, .editor-header h3 { margin: 0; color: inherit; font-size: 2rem; font-weight: 600; }
.modal-close { width: 36px; height: 36px; border: 0; background: #fff; color: #333; font-size: 1.7rem; line-height: 1; cursor: pointer; }
.address-body { padding: 3rem 4rem 0; }
.address-alert { margin-bottom: 2.5rem; padding: 2rem; background: #d7f1f7; color: #2f6473; font-size: 1.6rem; }
.address-error { margin-bottom: 1rem; color: #dc3545; }
.add-address-button { margin-bottom: 2.5rem; border-radius: 8px; }
.add-address-button span { margin-right: 0.5rem; font-size: 2rem; }
.address-footer, .editor-footer { display: flex; justify-content: flex-end; gap: 1.5rem; padding: 2rem 4rem; border-top: 1px solid #e5e5e5; }
.address-footer .btn, .editor-footer .btn { min-width: 140px; }
.editor-body { padding: 3rem 4rem; }
.editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 2.5rem; }
.full-width { grid-column: 1 / -1; }
.form-group { margin: 0; }
.form-group label { color: #222529; font-weight: 600; }
.form-group abbr { color: #dc3545; text-decoration: none; }
.form-control { min-height: 56px; }
@media (max-width: 767px) {
    .address-modal, .editor-modal { padding: 1rem; }
    .address-header, .editor-header, .address-body, .editor-body, .address-footer, .editor-footer { padding-right: 2rem; padding-left: 2rem; }
    .editor-grid { grid-template-columns: 1fr; }
    .full-width { grid-column: auto; }
}
</style>
