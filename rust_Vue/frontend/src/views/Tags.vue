<template>
  <section class="card">
    <div class="toolbar"><input class="search" v-model="name" placeholder="Tên tag" /><button class="btn primary"
        @click="save">{{ editing ? 'Cập nhật' : '+ Thêm' }}</button></div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên tag</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in items" :key="t.matag">
            <td>{{ t.matag }}</td>
            <td>{{ t.tentag }}</td>
            <td class="actions"><button class="btn ghost" @click="edit(t)">Sửa</button><button class="btn danger"
                @click="remove(t)">Xóa</button></td>
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
async function load() { items.value = (await api.get('/tags')).data }
function edit(t) { editing.value = t; name.value = t.tentag }
async function save() { if (!name.value.trim()) return; if (editing.value) await api.put(`/tags/${editing.value.matag}`, { tentag: name.value }); else await api.post('/tags', { tentag: name.value }); name.value = ''; editing.value = null; await load() }
async function remove(t) { if (await confirmAction(`Bạn có chắc muốn xóa ${t.tentag}?`)) { await api.delete(`/tags/${t.matag}`); await load(); notify('Đã xóa tag.') } }
onMounted(load)
</script>
