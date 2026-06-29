<template>
    <div class="settings-grid">
        <section class="card settings-card">
            <div>
                <p class="eyebrow">CÁ NHÂN HÓA</p>
                <h2>Giao diện</h2>
                <p class="muted">Tùy chỉnh giao diện trên thiết bị này.</p>
            </div>
            <div class="setting-group"><span>Chủ đề</span>
                <div class="segmented"><button v-for="item in themes" :key="item.value" class="btn"
                        :class="{ primary: appearance.theme === item.value }"
                        @click="appearance.theme = item.value">{{ item.label }}</button></div>
            </div>
            <div class="setting-group"><span>Mật độ hiển thị</span>
                <div class="segmented"><button class="btn" :class="{ primary: appearance.density === 'comfortable' }"
                        @click="appearance.density = 'comfortable'">Thoải mái</button><button class="btn"
                        :class="{ primary: appearance.density === 'compact' }" @click="appearance.density = 'compact'">Thu
                        gọn</button></div>
            </div><button class="btn primary" @click="saveAppearance">Lưu giao diện</button>
            <div v-if="appearanceMessage" class="alert success">{{ appearanceMessage }}</div>
        </section>
        <section class="card settings-card">
            <div>
                <p class="eyebrow">TÀI KHOẢN ADMIN</p>
                <h2>Thông tin tài khoản</h2>
            </div>
            <form class="settings-form" @submit.prevent="saveProfile"><label>Tài khoản<input :value="profile.taikhoan"
                        disabled /></label><label>Tên hiển thị<input v-model="profile.ten"
                        required /></label><label>Email<input v-model="profile.email" type="email" /></label><button
                    class="btn primary" :disabled="savingProfile">{{ savingProfile ? 'Đang lưu...' : 'Lưu thôngtin'}}</button></form>
            <div v-if="profileMessage" class="alert" :class="profileError ? 'error' : 'success'">{{ profileMessage }}</div>
            <hr />
            <form class="settings-form" @submit.prevent="changePassword">
                <h3>Đổi mật khẩu</h3><label>Mật khẩu hiện tại<input v-model="password.current" type="password"
                        required /></label><label>Mật khẩu mới<input v-model="password.next" type="password"
                        minlength="6" required /></label><label>Xác nhận mật khẩu<input v-model="password.confirm"
                        type="password" minlength="6" required /></label><button class="btn primary"
                    :disabled="savingPassword">{{ savingPassword ? 'Đang đổi...' : 'Đổi mật khẩu' }}</button>
            </form>
            <div v-if="passwordMessage" class="alert" :class="passwordError ? 'error' : 'success'">{{ passwordMessage }}</div>
        </section>
    </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from 'vue'; import { api } from '../api/http'; const themes = [{ value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }, { value: 'system', label: 'Hệ thống' }], appearance = reactive({ theme: 'light', density: 'comfortable', compactSidebar: false, ...JSON.parse(localStorage.getItem('admin_appearance') || '{}') }), profile = reactive({ taikhoan: '', ten: '', email: '' }), password = reactive({ current: '', next: '', confirm: '' }), appearanceMessage = ref(''), profileMessage = ref(''), passwordMessage = ref(''), profileError = ref(false), passwordError = ref(false), savingProfile = ref(false), savingPassword = ref(false); function applyAppearance() { const dark = appearance.theme === 'dark' || (appearance.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.classList.toggle('dark', dark); document.documentElement.classList.toggle('compact', appearance.density === 'compact'); document.documentElement.classList.toggle('sidebar-compact', appearance.compactSidebar) } watch(appearance, applyAppearance, { deep: true }); function saveAppearance() { localStorage.setItem('admin_appearance', JSON.stringify(appearance)); appearanceMessage.value = 'Đã lưu cài đặt giao diện.' } async function loadProfile() { const { data } = await api.get('/auth/me'); Object.assign(profile, { taikhoan: data.taikhoan, ten: data.ten || '', email: data.email || '' }) } async function saveProfile() { savingProfile.value = true; profileMessage.value = ''; try { const { data } = await api.put('/auth/profile', { ten: profile.ten, email: profile.email || null }); localStorage.setItem('admin_user', JSON.stringify(data)); profileError.value = false; profileMessage.value = 'Đã cập nhật thông tin tài khoản.' } catch (e) { profileError.value = true; profileMessage.value = e.response?.data?.message || 'Không thể cập nhật.' } finally { savingProfile.value = false } } async function changePassword() { passwordMessage.value = ''; if (password.next !== password.confirm) { passwordError.value = true; passwordMessage.value = 'Mật khẩu xác nhận không khớp.'; return } savingPassword.value = true; try { await api.put('/auth/password', { matkhau_hientai: password.current, matkhau_moi: password.next }); password.current = password.next = password.confirm = ''; passwordError.value = false; passwordMessage.value = 'Đổi mật khẩu thành công.' } catch (e) { passwordError.value = true; passwordMessage.value = e.response?.data?.message || 'Không thể đổi mật khẩu.' } finally { savingPassword.value = false } } onMounted(() => { applyAppearance(); loadProfile() })
</script>
