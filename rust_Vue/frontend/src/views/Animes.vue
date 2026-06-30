<template>
  <section class="card">
    <div class="list-header">
      <div>
        <strong>Danh sách anime</strong>
        <span>{{ filtered.length }} anime</span>
      </div>
      <button class="btn primary" @click="open({})">+ Thêm anime</button>
    </div>

    <div class="control-panel compact">
      <input class="search" v-model="keyword" placeholder="Tìm anime..." />
      <button class="btn ghost" @click="resetSearch">Tải lại</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên anime</th>
            <th>Mô tả</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtered" :key="a.mahh">
            <td>{{ a.mahh }}</td>
            <td>{{ a.tenhh }}</td>
            <td>{{ a.mota }}</td>
            <td class="actions">
              <button class="btn ghost" @click="open(a)">Sửa</button>
              <button class="btn danger" @click="remove(a)">Xóa</button>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td class="empty-cell" colspan="4">Không tìm thấy anime phù hợp.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <div v-if="show" class="drawer" @click.self="close">
    <form class="drawer-panel" @submit.prevent="save">
      <div class="drawer-header">
        <h2>{{ editing ? 'Sửa anime' : 'Thêm anime' }}</h2>
        <button class="btn ghost" type="button" @click="close">Đóng</button>
      </div>
      <div class="form-grid">
        <label class="full">Tên anime <input v-model="form.tenhh" required autofocus /></label>
        <label class="full">Mô tả <textarea v-model="form.mota" /></label>
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
const form = reactive({ tenhh: '', mota: '' })

const filtered = computed(() => {
  const q = keyword.value.toLowerCase().trim()
  if (!q) return items.value
  return items.value.filter(a => [a.mahh, a.tenhh, a.mota].some(v => String(v || '').toLowerCase().includes(q)))
})

async function load() { items.value = (await api.get('/animes')).data }
function open(anime) {
  editing.value = anime.mahh ? anime : null
  Object.assign(form, { tenhh: anime.tenhh || '', mota: anime.mota || '' })
  show.value = true
}
function close() { show.value = false; editing.value = null; Object.assign(form, { tenhh: '', mota: '' }) }
function resetSearch() { keyword.value = ''; load() }
async function save() {
  if (!form.tenhh.trim()) return
  if (editing.value) await api.put(`/animes/${editing.value.mahh}`, form)
  else await api.post('/animes', form)
  close()
  await load()
}
async function remove(a) {
  if (await confirmAction(`Bạn có chắc muốn xóa ${a.tenhh}?`)) {
    await api.delete(`/animes/${a.mahh}`)
    await load()
    notify('Đã xóa anime.')
  }
}
onMounted(load)
</script>
