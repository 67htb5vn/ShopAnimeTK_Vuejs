<template>
  <section class="card">
    <div class="toolbar"><strong>Danh sách khuyến mãi</strong><button class="btn primary" @click="open({})">+
        Thêm</button></div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên</th>
            <th>Thời gian</th>
            <th>Giảm</th>
            <th>Điều kiện</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="km in items" :key="km.makm">
            <td>{{ km.makm }}</td>
            <td>{{ km.tenkm }}</td>
            <td>{{ formatDate(km.ngaybd) }} - {{ formatDate(km.ngaykt) }}</td>
            <td>{{ km.mucgiam }}%</td>
            <td>{{ km.dieukien }} {{ km.giatri }}</td>
            <td class="actions"><button class="btn ghost" @click="open(km)">Sửa</button><button class="btn danger"
                @click="remove(km)">Xóa</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <div v-if="show" class="drawer" @click.self="show = false">
    <form class="drawer-panel" @submit.prevent="save">
      <div class="drawer-header">
        <h2>Khuyến mãi</h2><button class="btn ghost" type="button" @click="show = false">Đóng</button>
      </div>
      <div class="form-grid"><label>Tên <input v-model="form.tenkm" required /></label><label>Mức giảm % <input
            type="number" v-model.number="form.mucgiam" /></label><label>Ngày bắt đầu <input type="date"
            v-model="form.ngaybd" /></label><label>Ngày kết thúc <input type="date"
            v-model="form.ngaykt" /></label><label>Điều kiện <input v-model="form.dieukien" /></label><label>Giá trị
          <input type="number" v-model.number="form.giatri" /></label></div>
      <div class="actions" style="margin-top:16px"><button class="btn primary">Lưu</button></div>
    </form>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'; import { api, formatDate } from '../api/http'
import { confirmAction, notify } from '../services/ui'
const items = ref([]), show = ref(false), editing = ref(null); const form = reactive({ makm: null, tenkm: '', ngaybd: null, ngaykt: null, mucgiam: 0, dieukien: '', giatri: 0 })
async function load() { items.value = (await api.get('/promotions')).data }
function open(km) { editing.value = km.makm ? km : null; Object.assign(form, { makm: null, tenkm: '', ngaybd: null, ngaykt: null, mucgiam: 0, dieukien: '', giatri: 0 }, km); show.value = true }
async function save() { if (editing.value) await api.put(`/promotions/${editing.value.makm}`, form); else await api.post('/promotions', form); show.value = false; await load() }
async function remove(km) { if (await confirmAction(`Bạn có chắc muốn xóa ${km.tenkm}?`)) { await api.delete(`/promotions/${km.makm}`); await load(); notify('Đã xóa khuyến mãi.') } }
onMounted(load)
</script>
