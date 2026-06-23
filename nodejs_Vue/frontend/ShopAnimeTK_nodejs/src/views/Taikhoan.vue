<script setup lang="ts">
// const avatarPreview = document.getElementById('avatarPreview');
// const avatarInput = document.getElementById('avatarInput');

// avatarPreview.addEventListener('click', () => avatarInput.click());
// avatarInput.addEventListener('change', e => {
//     const file = e.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = () => avatarPreview.src = reader.result;
//         reader.readAsDataURL(file);
//     }
// });

// const toggleLink = document.getElementById('togglePassword');
// const passwordDiv = document.querySelector('.change-password');

// toggleLink.addEventListener('click', () => {
//     passwordDiv.style.display = (passwordDiv.style.display === 'none' || passwordDiv.style.display === '')
//         ? 'block'
//         : 'none';
// });

import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import type { nguoidung } from '@/models/nguoidung';
import api from '@/api/axios'
import router from '@/router';

interface NguoidungChiTiet extends nguoidung {
    hinhanhnds?: {
        maha?: string;
        duongdan?: string;
        mand?: string;
    }[];
}

const isLoggedIn = ref(false)
const user = ref<NguoidungChiTiet | null>(null)
const avatarPreview = ref('/img/nd/boy.png')
const showPassword = ref(false)
const form = ref({
    ten: '',
    ngaysinh: '',
    email: '',
    matkhaumoi: '',
    xacnhanmatkhau: ''
})

// const onFileChange = (event: Event) => {
//     const input = event.target as HTMLInputElement
//     if (input.files && input.files[0]) {
//         const file = input.files[0]
//         avatarPreview.value = URL.createObjectURL(file)
//     }
// }

const uploadAvatar = async (e: Event) => {
    const target = e.target as HTMLInputElement
    if (!target.files?.length)
        return

    const file = target.files[0]!
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await axios.post(
        '/api/upload-avatar',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        }
    )

    avatarPreview.value =
        `/img/nd/${res.data.filename}?t=${Date.now()}`
}

const fileInput = ref<HTMLInputElement | null>(null)

const openFilePicker = () => {
    fileInput.value?.click()
}

const luuthaydoi = async () => {
    try {
        await api.put('/api/editTaikhoan', {
            ten: form.value.ten,
            ngaysinh: form.value.ngaysinh,
            email: form.value.email,
            matkhaumoi: form.value.matkhaumoi
        })
        alert('Lưu thành công')
        router.push('/Taikhoan')
    } catch (err: any) {
        err.value = err.response?.data?.message
    }
}

onMounted(async () => {
    try {
        const res = await axios.get('/api/checkauth', {
            withCredentials: true
        })

        isLoggedIn.value = res.data.loggedIn
        user.value = res.data.user

        form.value.ten = user.value?.ten || ''
        form.value.ngaysinh = user.value?.ngaysinh || ''
        form.value.email = user.value?.email || ''

        avatarPreview.value = user.value?.hinhanhnds?.[0]?.duongdan
            ? `/img/nd/${user.value.hinhanhnds[0].duongdan}`
            : '/img/nd/boy.png'
    }
    catch (err) {
        isLoggedIn.value = false
    }
})

</script>
<template>
    <div class="tab-pane fade show active" id="edit" role="tabpanel">
        <h3 class="account-sub-title d-none d-md-block mt-0 pt-1 ml-1">
            <i class="icon-user-2 align-middle mr-3 pr-1"></i>Thông tin tài khoản
        </h3>
        <form @submit.prevent="luuthaydoi" enctype="multipart/form-data">
            <div class="text-center mb-4 position-relative" style="display:flex; justify-content:center;">
                <img :src="avatarPreview" alt="avatar" id="avatarPreview" class="rounded-circle" @click="openFilePicker"
                    style="width:120px; height:120px; object-fit:cover; cursor:pointer; border:2px solid #333;" />
                <input ref="fileInput" type="file" id="avatarInput" accept="image/*" @change="uploadAvatar"
                    style="display:none;">
                <div class="avatar-overlay" style="position:absolute; bottom:0; left:50%; transform:translateX(-50%);
                    background:rgba(0,0,0,0.5); color:white; font-size:12px;
                    padding:4px 8px; border-radius:12px; cursor:pointer;">
                    Thay đổi ảnh
                </div>
            </div>

            <div class="form-group mb-3">
                <label>Họ và tên</label>
                <input v-model="form.ten" type="text" class="form-control">
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

                <input v-model="form.email" type="email" class="form-control">
            </div>

            <div class="text-primary mb-3" style="cursor:pointer;" @click="showPassword = !showPassword">
                Thay đổi mật khẩu
            </div>

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

            <button type="submit" class="btn btn-dark">
                Lưu thay đổi
            </button>

        </form>

    </div><!-- End .tab-pane -->
</template>