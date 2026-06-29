import { reactive } from 'vue'

export const uiState = reactive({ toasts: [], confirmation: null })
let nextId = 1

export function notify(message, type = 'success') {
  const id = nextId++
  uiState.toasts.push({ id, message, type })
  setTimeout(() => dismissToast(id), 3500)
}
export function dismissToast(id) { const index = uiState.toasts.findIndex(item => item.id === id); if (index >= 0) uiState.toasts.splice(index, 1) }
export function confirmAction(message, options = {}) {
  return new Promise(resolve => { uiState.confirmation = { message, title: options.title || 'Xác nhận thao tác', confirmText: options.confirmText || 'Xác nhận', danger: options.danger !== false, resolve } })
}
export function resolveConfirmation(value) { uiState.confirmation?.resolve(value); uiState.confirmation = null }
