<template>
  <section class="card">
    <div class="toolbar"><input class="search" v-model="name" placeholder="Tên danh mục" /><button class="btn primary"
        @click="save">{{ editing ? 'Cập nhật' : '+ Thêm' }}</button></div>
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
          <tr v-for="c in items" :key="c.madmh">
            <td>{{ c.madmh }}</td>
            <td>{{ c.tendmh }}</td>
            <td class="actions"><button class="btn ghost" @click="edit(c)">Sửa</button><button class="btn danger"
                @click="remove(c)">Xóa</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'; import { api } from '../api/http'
import { confirmAction, notify } from '../services/ui'
const items = ref([]), name = ref(''), editing = ref(null)
async function load() { items.value = (await api.get('/categories')).data }
function edit(c) { editing.value = c; name.value = c.tendmh }
async function save() { if (!name.value.trim()) return; if (editing.value) await api.put(`/categories/${editing.value.madmh}`, { tendmh: name.value }); else await api.post('/categories', { tendmh: name.value }); name.value = ''; editing.value = null; await load() }
async function remove(c) { if (await confirmAction(`Bạn có chắc muốn xóa ${c.tendmh}?`)) { await api.delete(`/categories/${c.madmh}`); await load(); notify('Đã xóa danh mục.') } }
onMounted(load)
</script>
