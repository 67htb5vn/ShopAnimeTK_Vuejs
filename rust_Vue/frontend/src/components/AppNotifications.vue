<template>
  <div class="toast-stack" aria-live="polite"><button v-for="toast in uiState.toasts" :key="toast.id" class="app-toast"
      :class="toast.type" @click="dismissToast(toast.id)"><span>{{ toastIcon(toast.type) }}</span>
      <div><strong>{{ toastTitle(toast.type) }}</strong><small>{{ toast.message }}</small></div>
      <i>×</i>
    </button></div>
  <div v-if="uiState.confirmation" class="confirm-backdrop" @click.self="resolveConfirmation(false)">
    <section class="confirm-dialog" role="alertdialog">
      <div class="confirm-icon" :class="{ danger: uiState.confirmation.danger }">!</div>
      <h3>{{ uiState.confirmation.title }}</h3>
      <p>{{ uiState.confirmation.message }}</p>
      <div class="confirm-actions"><button class="btn ghost" @click="resolveConfirmation(false)">Hủy</button><button
          class="btn" :class="uiState.confirmation.danger ? 'danger' : 'primary'"
          @click="resolveConfirmation(true)">{{ uiState.confirmation.confirmText }}</button></div>
    </section>
  </div>
</template>
<script setup>
import { uiState, dismissToast, resolveConfirmation } from '../services/ui'

function toastIcon(type) {
  if (type === 'success') return '✓'
  if (type === 'info') return 'i'
  return '!'
}

function toastTitle(type) {
  if (type === 'success') return 'Thành công'
  if (type === 'info') return 'Đơn hàng mới'
  return 'Thông báo'
}
</script>
