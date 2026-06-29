<template>
  <main class="login-page">
    <section class="login-card">
      <div class="login-brand">
        <div class="brand-logo">SA</div>
        <div><strong>Shop Anime</strong><span>Admin Panel</span></div>
      </div>
      <div class="login-heading">
        <p class="eyebrow">KHU VỰC QUẢN TRỊ</p>
        <h1>Đăng nhập</h1>
        <p>Chỉ tài khoản quản trị viên mới có thể truy cập.</p>
      </div>
      <form @submit.prevent="submit">
        <div v-if="error" class="alert error">{{ error }}</div>
        <label>Tài khoản<input v-model.trim="form.taikhoan" autocomplete="username" autofocus
            placeholder="Nhập tài khoản admin" /></label>
        <label>Mật khẩu<input v-model="form.matkhau" type="password" autocomplete="current-password"
            placeholder="Nhập mật khẩu" /></label>
        <button class="btn primary login-submit" :disabled="loading || !form.taikhoan || !form.matkhau">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/http'

const router = useRouter()
const form = reactive({ taikhoan: '', matkhau: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!form.taikhoan || !form.matkhau || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.post('/auth/login', form)
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_user', JSON.stringify(data.user))
    await router.replace('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Không thể đăng nhập. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>
