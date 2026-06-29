<script setup lang="ts">
defineProps<{ open: boolean; total: number }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND'
}).format(value)
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="transfer-modal" role="dialog" aria-modal="true">
            <div class="transfer-backdrop" @click="emit('close')"></div>
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary">
                        <h4 class="modal-title text-white">Chuyển khoản ngân hàng</h4>
                        <button type="button" class="btn btn-light btn-sm" @click="emit('close')">×</button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="alert alert-warning">Sau khi chuyển khoản, vui lòng bấm xác nhận để hoàn tất.</div>
                        <h4>NGÂN HÀNG QUÂN ĐỘI – MBBank</h4>
                        <p>Số tài khoản: <strong>0123456789</strong></p>
                        <p>Nội dung: <strong>SHOPANIME + SỐ ĐIỆN THOẠI</strong></p>
                        <p class="transfer-total">Số tiền: <strong>{{ formatCurrency(total) }}</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" @click="emit('close')">Đóng</button>
                        <button type="button" class="btn btn-primary" @click="emit('confirm')">Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.transfer-modal { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 2rem; }
.transfer-backdrop { position: absolute; inset: 0; z-index: 0; background: rgb(0 0 0 / 55%); }
.modal-dialog { position: relative; z-index: 1; width: min(560px, 100%); margin: 0; }
.modal-header, .modal-footer { display: flex; align-items: center; justify-content: space-between; }
.transfer-total { margin-top: 2rem; color: #222529; font-size: 1.8rem; }
</style>
