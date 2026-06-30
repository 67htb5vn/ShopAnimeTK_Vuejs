<template>
  <section class="card">
    <div class="list-header">
      <div>
        <strong>Danh mục</strong>
        <span>{{ filtered.length }} danh mục</span>
      </div>
      <button class="btn primary" @click="open({})">+ Thêm danh mục</button>
    </div>

    <div class="control-panel compact">
      <input class="search" v-model="keyword" placeholder="Tìm danh mục..." />
      <button class="btn ghost" @click="resetSearch">Tải lại</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên danh mục</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.madmh">
            <td>{{ c.madmh }}</td>
            <td>{{ c.tendmh }}</td>
            <td class="actions">
              <button class="btn ghost" @click="open(c)">Sửa</button>
              <button class="btn danger" @click="remove(c)">Xóa</button>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td class="empty-cell" colspan="3">Không tìm thấy danh mục phù hợp.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <div v-if="show" class="drawer" @click.self="close">
    <form class="drawer-panel" @submit.prevent="save">
      <div class="drawer-header">
        <h2>{{ editing ? 'Sửa danh mục' : 'Thêm danh mục' }}</h2>
        <button class="btn ghost" type="button" @click="close">Đóng</button>
      </div>
      <div class="form-grid">
        <label class="full">Tên danh mục <input v-model="form.tendmh" required autofocus /></label>
      </div>
      <div class="actions" style="margin-top:16px">
        <button class="btn primary">Lưu</button>
        <button class="btn ghost" type="button" @click="close">Hủy</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '../api/http'
import { confirmAction, notify } from '../services/ui'

const items = ref([])
const keyword = ref('')
const show = ref(false)
const editing = ref(null)
const form = reactive({ tendmh: '' })

const filtered = computed(() => {
  const q = keyword.value.toLowerCase().trim()
  if (!q) return items.value
  return items.value.filter(c => [c.madmh, c.tendmh].some(v => String(v || '').toLowerCase().includes(q)))
})

async function load() { items.value = (await api.get('/categories')).data }
function open(category) {
  editing.value = category.madmh ? category : null
  Object.assign(form, { tendmh: category.tendmh || '' })
  show.value = true
}
function close() { show.value = false; editing.value = null; form.tendmh = '' }
function resetSearch() { keyword.value = ''; load() }
async function save() {
  if (!form.tendmh.trim()) return
  if (editing.value) await api.put(`/categories/${editing.value.madmh}`, { tendmh: form.tendmh })
  else await api.post('/categories', { tendmh: form.tendmh })
  close()
  await load()
}
async function remove(c) {
  if (await confirmAction(`Bạn có chắc muốn xóa ${c.tendmh}?`)) {
    await api.delete(`/categories/${c.madmh}`)
    await load()
    notify('Đã xóa danh mục.')
  }
}
onMounted(load)
</script>
