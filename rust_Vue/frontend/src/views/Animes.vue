<template>
  <section class="card anime-card">
    <div class="toolbar"><input class="search" v-model="form.tenhh" placeholder="Tên anime" /><button
        class="btn primary" @click="save">{{ editing ? 'Cập nhật' : '+ Thêm' }}</button></div>
    <textarea v-model="form.mota" placeholder="Mô tả" style="margin-bottom:14px" />
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
          <tr v-for="a in items" :key="a.mahh">
            <td>{{ a.mahh }}</td>
            <td>{{ a.tenhh }}</td>
            <td>{{ a.mota }}</td>
            <td class="actions"><button class="btn ghost" @click="edit(a)">Sửa</button><button class="btn danger"
                @click="remove(a)">Xóa</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'; import { api } from '../api/http'
import { confirmAction, notify } from '../services/ui'
const items = ref([]), editing = ref(null); const form = reactive({ tenhh: '', mota: '' })
async function load() { items.value = (await api.get('/animes')).data }
function edit(a) { editing.value = a; Object.assign(form, { tenhh: a.tenhh, mota: a.mota }) }
async function save() { if (!form.tenhh.trim()) return; if (editing.value) await api.put(`/animes/${editing.value.mahh}`, form); else await api.post('/animes', form); editing.value = null; Object.assign(form, { tenhh: '', mota: '' }); await load() }
async function remove(a) { if (await confirmAction(`Bạn có chắc muốn xóa ${a.tenhh}?`)) { await api.delete(`/animes/${a.mahh}`); await load(); notify('Đã xóa anime.') } }
onMounted(load)
</script>
