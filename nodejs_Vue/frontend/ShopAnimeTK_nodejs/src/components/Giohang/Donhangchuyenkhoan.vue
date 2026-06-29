<script setup lang="ts">
defineProps<{ open: boolean; total: number; loading?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND'
}).format(value)
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="transfer-modal" role="dialog" aria-modal="true" aria-labelledby="bank-transfer-title">
            <div class="transfer-backdrop" @click="emit('close')"></div>
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary">
                        <h4 id="bank-transfer-title" class="modal-title text-white">Chuyển khoản ngân hàng</h4>
                        <button type="button" class="btn btn-light btn-sm" aria-label="Đóng" @click="emit('close')">×</button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="alert alert-warning">Sau khi chuyển khoản, vui lòng bấm xác nhận để hoàn tất.</div>
                        <h4>NGÂN HÀNG QUÂN ĐỘI – MBBank</h4>
                        <img class="bank-qr" src="/images/chuyenkhoan.jpg" alt="Mã QR chuyển khoản ngân hàng MBBank">
                        <p>Số tài khoản: <strong>0123456789</strong></p>
                        <p>Nội dung: <strong>SHOPANIME + SỐ ĐIỆN THOẠI</strong></p>
                        <p class="transfer-total">Số tiền: <strong>{{ formatCurrency(total) }}</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" @click="emit('close')">Đóng</button>
                        <button type="button" class="btn btn-primary" :disabled="loading" @click="emit('confirm')">
                            {{ loading ? 'Đang xử lý...' : 'Xác nhận' }}
                        </button>
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
.modal-header { min-height: 58px; padding: 1rem 1.5rem; }
.modal-header .modal-title { margin: 0; font-size: 1.8rem; font-weight: 600; }
.modal-header .btn { width: 34px; height: 34px; padding: 0; font-size: 1.8rem; line-height: 1; }
.modal-body h4 { margin-top: 1.5rem; }
.bank-qr { display: block; width: min(230px, 70vw); max-height: 260px; margin: 1.5rem auto; object-fit: contain; }
.transfer-total { margin-top: 2rem; color: #222529; font-size: 1.8rem; }
</style>
