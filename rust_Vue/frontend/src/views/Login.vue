<template>
  <main class="login-page">
    <section class="login-card">
      <div class="login-brand">
        <div class="brand-logo">SA</div>
        <div><strong>Shop Anime</strong></div>
      </div>
      <div class="login-heading">
        <h1>{{ forgotMode ? 'Quên mật khẩu' : 'Đăng nhập' }}</h1>
      </div>
      <form v-if="!forgotMode" @submit.prevent="submit">
        <div v-if="error" class="alert error">{{ error }}</div>
        <label>Tài khoản<input v-model.trim="form.taikhoan" autocomplete="username" autofocus
            placeholder="Nhập tài khoản admin" /></label>
        <label>Mật khẩu<input v-model="form.matkhau" type="password" autocomplete="current-password"
            placeholder="Nhập mật khẩu" /></label>
        <button class="btn primary login-submit" :disabled="loading || !form.taikhoan || !form.matkhau">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
        <button class="btn ghost login-submit" type="button" @click="openForgot">Quên mật khẩu</button>
      </form>
      <form v-else @submit.prevent="forgotPassword">
        <div v-if="forgotMessage" class="alert" :class="forgotError ? 'error' : 'success'">{{ forgotMessage }}</div>
        <label>Email admin<input v-model.trim="forgotEmail" type="email" autocomplete="email" autofocus
            placeholder="Nhập email admin" /></label>
        <button class="btn primary login-submit" :disabled="forgotLoading || !forgotEmail">
          {{ forgotLoading ? 'Đang gửi...' : 'Gửi mật khẩu mới' }}
        </button>
        <button class="btn ghost login-submit" type="button" @click="forgotMode = false">Quay lại đăng nhập</button>
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
const forgotMode = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotMessage = ref('')
const forgotError = ref(false)

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

function openForgot() {
  forgotMode.value = true
  forgotMessage.value = ''
  forgotError.value = false
}

async function forgotPassword() {
  if (!forgotEmail.value || forgotLoading.value) return
  forgotLoading.value = true
  forgotMessage.value = ''
  forgotError.value = false
  try {
    const { data } = await api.post('/auth/forgot-password', { email: forgotEmail.value })
    forgotMessage.value = data.message || 'Đã gửi mật khẩu mới nếu email hợp lệ.'
  } catch (err) {
    forgotError.value = true
    forgotMessage.value = err.response?.data?.message || 'Không thể gửi mật khẩu mới.'
  } finally {
    forgotLoading.value = false
  }
}
</script>
