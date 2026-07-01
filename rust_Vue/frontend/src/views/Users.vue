<template>
  <section class="card list-controls-card user-list-card">
    <div class="list-header">
      <div>
        <strong>Danh sách người dùng</strong>
        <span>{{ total }} tài khoản</span>
      </div>
    </div>

    <div class="control-panel">
      <input class="search" v-model="keyword" placeholder="Tìm tên, tài khoản hoặc email..." @keyup.enter="applyFilters" />
      <select v-model="roleFilter" @change="applyFilters">
        <option value="">Tất cả quyền</option>
        <option value="1">Admin</option>
        <option value="0">User</option>
      </select>
      <select v-model="activeFilter" @change="applyFilters">
        <option value="">Tất cả trạng thái</option>
        <option value="1">Hoạt động</option>
        <option value="0">Khóa</option>
      </select>
      <button class="btn ghost" @click="resetAndLoad">Tải lại</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên</th>
            <th>Tài khoản</th>
            <th>Email</th>
            <th>Quyền</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.mand">
            <td>{{ u.mand }}</td>
            <td>{{ u.ten }}</td>
            <td>{{ u.taikhoan }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge">{{ u.phanquyen === '1' ? 'Admin' : 'User' }}</span></td>
            <td>
              <span class="badge" :class="u.trangthai === '1' ? 'success' : 'locked'">
                {{ u.trangthai === '1' ? 'Hoạt động' : 'Khóa' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn ghost" @click="open(u)">Trạng thái</button>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td class="empty-cell" colspan="7">{{ emptyMessage }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="page" :page-size="pageSize" :total="total" :total-pages="totalPages" @update:page="changePage" @update:page-size="changePageSize" />
  </section>

  <div v-if="show" class="drawer" @click.self="show = false">
    <form class="drawer-panel" @submit.prevent="save">
      <div class="drawer-header">
        <h2>Cập nhật trạng thái</h2>
        <button class="btn ghost" type="button" @click="show = false">Đóng</button>
      </div>
      <div class="form-grid">
        <label>Tên <input :value="form.ten || '-'" disabled /></label>
        <label>Tài khoản <input :value="form.taikhoan || '-'" disabled /></label>
        <label>Email <input :value="form.email || '-'" disabled /></label>
        <label>Quyền <input :value="form.phanquyen === '1' ? 'Admin' : 'User'" disabled /></label>
        <label>Trạng thái
          <select v-model="form.trangthai">
            <option value="1">Hoạt động</option>
            <option value="0">Khóa</option>
          </select>
        </label>
      </div>
      <div class="actions" style="margin-top:16px">
        <button class="btn primary">Lưu trạng thái</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '../api/http'
import Pagination from '../components/Pagination.vue'
import { notify } from '../services/ui'

const items = ref([])
const keyword = ref('')
const show = ref(false)
const editing = ref(null)
const form = reactive({ ten: '', taikhoan: '', email: '', ngaysinh: null, trangthai: '1', phanquyen: '0' })
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const roleFilter = ref('')
const activeFilter = ref('')

const filtered = computed(() => {
  const q = keyword.value.toLowerCase().trim()
  if (!q) return items.value
  return items.value.filter(u => [u.mand, u.ten, u.taikhoan, u.email].some(v => String(v || '').toLowerCase().includes(q)))
})

const emptyMessage = computed(() => {
  if (activeFilter.value === '0') return 'Không có người dùng đang bị khóa.'
  if (keyword.value || roleFilter.value || activeFilter.value) return 'Không tìm thấy người dùng phù hợp.'
  return 'Chưa có người dùng.'
})

async function load() {
  const { data } = await api.get('/users', {
    params: { page: page.value, page_size: pageSize.value, q: keyword.value, role: roleFilter.value, active: activeFilter.value }
  })
  items.value = data.items
  total.value = data.total
  totalPages.value = data.total_pages
}

function applyFilters() { page.value = 1; load() }
function changePage(value) { page.value = value; load() }
function changePageSize(value) { pageSize.value = value; page.value = 1; load() }
function resetAndLoad() { keyword.value = ''; roleFilter.value = ''; activeFilter.value = ''; page.value = 1; load() }
function open(u) {
  editing.value = u
  Object.assign(form, { ten: '', taikhoan: '', email: '', ngaysinh: null, trangthai: '1', phanquyen: '0' }, u)
  show.value = true
}
async function save() {
  if (!editing.value) return
  const payload = {
    ten: form.ten || '',
    ngaysinh: form.ngaysinh || null,
    taikhoan: form.taikhoan || '',
    email: form.email || null,
    phanquyen: form.phanquyen || '0',
    trangthai: form.trangthai
  }
  try {
    const userId = String(editing.value.mand || '').trim()
    const { data } = await api.put(`/users/${encodeURIComponent(userId)}`, payload)
    Object.assign(editing.value, data)
    show.value = false
    await load()
    notify('Đã cập nhật trạng thái người dùng.')
  } catch (err) {
    notify(err.response?.data?.message || 'Không thể cập nhật trạng thái người dùng.', 'error')
  }
}
onMounted(load)
</script>
