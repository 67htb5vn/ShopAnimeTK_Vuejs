<template>
  <section class="card list-controls-card">
    <div class="filter-bar"><select v-model="roleFilter"><option value="">Tất cả quyền</option><option value="1">Admin</option><option value="0">User</option></select><select v-model="activeFilter"><option value="">Tất cả trạng thái</option><option value="1">Hoạt động</option><option value="0">Khóa</option></select><button class="btn primary" @click="applyFilters">Lọc</button></div>
    <div class="toolbar"><input class="search" v-model="keyword" placeholder="Tìm người dùng..." @keyup.enter="applyFilters"/><button class="btn ghost" @click="resetAndLoad">↻ Tải lại</button><button class="btn primary" @click="open({})">+ Thêm người dùng</button></div>
    <div class="table-wrap"><table><thead><tr><th>Mã</th><th>Tên</th><th>Tài khoản</th><th>Email</th><th>Quyền</th><th>Trạng thái</th><th></th></tr></thead><tbody>
      <tr v-for="u in filtered" :key="u.mand"><td>{{ u.mand }}</td><td>{{ u.ten }}</td><td>{{ u.taikhoan }}</td><td>{{ u.email }}</td><td><span class="badge">{{ u.phanquyen === '1' ? 'Admin' : 'User' }}</span></td><td>{{ u.trangthai === '1' ? 'Hoạt động' : 'Khóa' }}</td><td class="actions"><button class="btn ghost" @click="open(u)">Sửa</button><button class="btn danger" @click="remove(u)">Xóa</button></td></tr>
    </tbody></table></div><Pagination :page="page" :page-size="pageSize" :total="total" :total-pages="totalPages" @update:page="changePage" @update:page-size="changePageSize" />
  </section>
  <div v-if="show" class="drawer" @click.self="show = false">
    <form class="drawer-panel" @submit.prevent="save">
      <div class="drawer-header">
        <h2>Người dùng</h2>
        <button class="btn ghost" type="button" @click="show = false">Đóng</button>
      </div>
      <div class="form-grid">
        <label>Tên <input v-model="form.ten" required /></label>
        <label>Tài khoản <input v-model="form.taikhoan" required /></label>
        <label>Mật khẩu <input type="password" v-model="form.matkhau" placeholder="Bỏ trống nếu không đổi" /></label>
        <label>Email <input v-model="form.email" /></label>
        <label>Ngày sinh <input type="date" v-model="form.ngaysinh" /></label>
        <label>Quyền <select v-model="form.phanquyen">
            <option value="0">User</option>
            <option value="1">Admin</option>
          </select></label>
        <label>Trạng thái <select v-model="form.trangthai">
            <option value="1">Hoạt động</option>
            <option value="0">Khóa</option>
          </select></label>
      </div>
      <div class="actions" style="margin-top:16px">
        <button class="btn primary">Lưu</button>
      </div>
    </form>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { api } from '../api/http'
import Pagination from '../components/Pagination.vue'
import { confirmAction, notify } from '../services/ui'
const items = ref([]), keyword = ref(''), show = ref(false), editing = ref(null);
const form = reactive({ ten: '', taikhoan: '', matkhau: '', email: '', ngaysinh: null, trangthai: '1', phanquyen: '0' })
const page = ref(1), pageSize = ref(10), total = ref(0), totalPages = ref(0), roleFilter = ref(''), activeFilter = ref('')
const filtered = computed(() => items.value.filter(u => [u.ten, u.taikhoan, u.email].some(v => String(v || '').toLowerCase().includes(keyword.value.toLowerCase()))))
async function load() {
  const { data } = await api.get('/users', { params: { page: page.value, page_size: pageSize.value, q: keyword.value, role: roleFilter.value, active: activeFilter.value } }); items.value = data.items; total.value = data.total; totalPages.value = data.total_pages
}
function applyFilters() { page.value = 1; load() }
function changePage(value) { page.value = value; load() }
function changePageSize(value) { pageSize.value = value; page.value = 1; load() }
function open(u) { editing.value = u.mand ? u : null; Object.assign(form, { ten: '', taikhoan: '', matkhau: '', email: '', ngaysinh: null, trangthai: '1', phanquyen: '0' }, u, { matkhau: '' }); show.value = true }
async function save() { const payload = { ...form, matkhau: form.matkhau || null }; if (editing.value) await api.put(`/users/${editing.value.mand}`, payload); else await api.post('/users', payload); show.value = false; await load() }
async function remove(u) { if (await confirmAction(`Bạn có chắc muốn xóa ${u.ten}?`)) { await api.delete(`/users/${u.mand}`); await load(); notify('Đã xóa người dùng.') } }
onMounted(load)
</script>
