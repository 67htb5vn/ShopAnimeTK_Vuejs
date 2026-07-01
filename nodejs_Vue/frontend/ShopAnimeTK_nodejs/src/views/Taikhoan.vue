<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import axios from 'axios'
import type { nguoidung } from '@/models/nguoidung'
import api from '@/api/axios'

interface NguoidungChiTiet extends nguoidung {
    hinhanhnds?: { maha?: string; duongdan?: string; mand?: string }[]
}

const isLoggedIn = ref(false)
const user = ref<NguoidungChiTiet | null>(null)
const avatarPreview = ref('/img/nd/boy.png')
const isUploadingAvatar = ref(false)
const avatarError = ref('')
const showPassword = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
let localPreviewUrl = ''

const form = ref({
    ten: '',
    ngaysinh: '',
    email: '',
    matkhaumoi: '',
    xacnhanmatkhau: ''
})

const avatarUrl = (path?: string) => {
    if (!path) return '/img/nd/boy.png'
    if (/^(https?:|data:|blob:|\/)/i.test(path)) return path
    return `/img/nd/${path}`
}

const openFilePicker = () => {
    if (!isUploadingAvatar.value) fileInput.value?.click()
}

const uploadAvatar = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    avatarError.value = ''
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        avatarError.value = 'Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.'
        input.value = ''
        return
    }
    if (file.size > 5 * 1024 * 1024) {
        avatarError.value = 'Ảnh đại diện không được vượt quá 5 MB.'
        input.value = ''
        return
    }

    const previousAvatar = avatarPreview.value
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    localPreviewUrl = URL.createObjectURL(file)
    avatarPreview.value = localPreviewUrl
    isUploadingAvatar.value = true

    try {
        const formData = new FormData()
        formData.append('avatar', file)
        const response = await axios.post('/api/upload-avatar', formData, { withCredentials: true })
        avatarPreview.value = `/img/nd/${response.data.filename}?t=${Date.now()}`
        if (user.value) user.value.hinhanhnds = [{ duongdan: response.data.filename }]
    } catch (error: any) {
        avatarPreview.value = previousAvatar
        avatarError.value = error.response?.data?.message || 'Không thể cập nhật ảnh đại diện.'
    } finally {
        isUploadingAvatar.value = false
        input.value = ''
        if (localPreviewUrl) {
            URL.revokeObjectURL(localPreviewUrl)
            localPreviewUrl = ''
        }
    }
}

const saveChanges = async () => {
    if (form.value.matkhaumoi && form.value.matkhaumoi !== form.value.xacnhanmatkhau) {
        window.alert('Mật khẩu xác nhận không khớp.')
        return
    }

    try {
        await api.put('/api/editTaikhoan', {
            ten: form.value.ten,
            ngaysinh: form.value.ngaysinh,
            email: form.value.email,
            matkhaumoi: form.value.matkhaumoi
        })
        window.alert('Lưu thay đổi thành công.')
        form.value.matkhaumoi = ''
        form.value.xacnhanmatkhau = ''
    } catch (error: any) {
        window.alert(error.response?.data?.message || 'Không thể lưu thông tin tài khoản.')
    }
}

onMounted(async () => {
    try {
        const response = await axios.get('/api/checkauth', { withCredentials: true })
        isLoggedIn.value = response.data.loggedIn
        user.value = response.data.user
        form.value.ten = user.value?.ten || ''
        form.value.ngaysinh = user.value?.ngaysinh?.slice(0, 10) || ''
        form.value.email = user.value?.email || ''
        avatarPreview.value = avatarUrl(user.value?.hinhanhnds?.[0]?.duongdan)
    } catch {
        isLoggedIn.value = false
    }
})

onBeforeUnmount(() => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
})
</script>

<template>
    <div class="tab-pane fade show active" id="edit" role="tabpanel">
        <h3 class="account-sub-title d-none d-md-block mt-0 pt-1 ml-1">
            <i class="icon-user-2 align-middle mr-3 pr-1"></i>Thông tin tài khoản
        </h3>

        <form v-if="isLoggedIn" @submit.prevent="saveChanges">
            <div class="avatar-picker">
                <img :src="avatarPreview" alt="Ảnh đại diện" class="avatar-image" @click="openFilePicker">
                <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="uploadAvatar">
                <button type="button" class="avatar-overlay" :disabled="isUploadingAvatar" @click="openFilePicker">
                    {{ isUploadingAvatar ? 'Đang tải...' : 'Thay đổi ảnh' }}
                </button>
            </div>
            <p v-if="avatarError" class="text-danger text-center mb-3">{{ avatarError }}</p>

            <div class="form-group mb-3">
                <label>Họ và tên</label>
                <input v-model.trim="form.ten" type="text" class="form-control" required>
            </div>
            <div class="form-group mb-3">
                <label>Tài khoản</label>
                <input :value="user?.taikhoan" class="form-control" readonly>
            </div>
            <div class="form-group mb-3">
                <label>Ngày sinh</label>
                <input v-model="form.ngaysinh" type="date" class="form-control">
            </div>
            <div class="form-group mb-4">
                <label>Email</label>
                <input v-model.trim="form.email" type="email" class="form-control" required>
            </div>

            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                Thay đổi mật khẩu
            </button>
            <div v-if="showPassword">
                <div class="form-group mb-3">
                    <label>Mật khẩu mới</label>
                    <input v-model="form.matkhaumoi" type="password" class="form-control">
                </div>
                <div class="form-group mb-4">
                    <label>Xác nhận mật khẩu</label>
                    <input v-model="form.xacnhanmatkhau" type="password" class="form-control">
                </div>
            </div>

            <button type="submit" class="btn btn-dark">Lưu thay đổi</button>
        </form>
    </div>
</template>

<style scoped>
.avatar-picker { position: relative; display: flex; justify-content: center; width: 130px; margin: 0 auto 2.5rem; }
.avatar-image { width: 120px; height: 120px; border: 2px solid #333; border-radius: 50%; object-fit: cover; cursor: pointer; background: #f3f3f3; }
.avatar-overlay { position: absolute; bottom: -5px; left: 50%; min-width: 105px; padding: 5px 10px; transform: translateX(-50%); border: 0; border-radius: 14px; background: rgb(0 0 0 / 65%); color: #fff; font-size: 12px; cursor: pointer; }
.avatar-overlay:disabled { cursor: wait; opacity: .8; }
.password-toggle { display: block; width: max-content; margin-bottom: 1.5rem; padding: 0; border: 0; background: transparent; color: #08c; cursor: pointer; }
.password-toggle + div { width: 100%; }
form > .btn[type="submit"] { display: block; margin-top: 1rem; }
</style>
