<template>
  <section class="card">
    <div class="toolbar"><input class="search" v-model="keyword" placeholder="Tìm hóa đơn..." /><button
        class="btn ghost" @click="load">Tải lại</button></div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Ngày lập</th>
            <th>Khách hàng</th>
            <th>Địa chỉ</th>
            <th>Thanh toán</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in filtered" :key="o.mahd">
            <td>{{ o.mahd }}</td>
            <td>{{ formatDate(o.ngaylap) }}</td>
            <td>{{ o.tenkh || o.mand }}</td>
            <td>{{ o.diachi }}</td>
            <td>{{ o.htthanhtoan }}</td>
            <td>{{ formatMoney(o.thanhtien) }}</td>
            <td><span class="badge order-status" :class="statusClass(o)">{{ o.trangthai || 'Chưa có' }}</span></td>
            <td><button class="btn ghost" @click="open(o)">Chi tiết</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <div v-if="selected" class="drawer" @click.self="selected = null">
    <div class="drawer-panel">
      <div class="drawer-header">
        <h2>Hóa đơn {{ selected.order.mahd }}</h2><button class="btn ghost" @click="selected = null">Đóng</button>
      </div>
      <p><b>Khách:</b> {{ selected.order.tenkh || selected.order.mand }}</p>
      <p><b>Địa chỉ:</b> {{ selected.order.diachi }}</p>
      <p><b>Tổng tiền:</b> {{ formatMoney(selected.order.thanhtien) }}</p>
      <div class="form-grid" style="margin:16px 0"><label>Cập nhật trạng thái<select v-model="newStatus">
            <option value="">-- Chọn --</option>
            <option v-for="s in statuses" :key="s.matt" :value="s.matt">{{ s.tentrangthai }}</option>
          </select></label>
        <div style="align-self:end"><button class="btn primary" @click="updateStatus">Cập nhật</button></div>
      </div>
      <h3>Sản phẩm</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã SP</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>SL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in selected.items" :key="i.masp">
              <td>{{ i.masp }}</td>
              <td>{{ i.tensp }}</td>
              <td>{{ formatMoney(i.gia) }}</td>
              <td>{{ i.soluong }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'; import { api, formatDate, formatMoney } from '../api/http'
const items = ref([]), statuses = ref([]), selected = ref(null), keyword = ref(''), newStatus = ref('')
const filtered = computed(() => items.value.filter(o => [o.mahd, o.tenkh, o.diachi, o.trangthai].some(v => String(v || '').toLowerCase().includes(keyword.value.toLowerCase()))))
function normalizeStatus(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() }
function statusClass(status) {
  const raw = normalizeStatus(`${status?.matt || ''} ${status?.trangthai || ''} ${status?.tentrangthai || ''}`)
  if (!raw.trim()) return 'status-empty'
  if (raw.includes('huy') || raw.includes('cancel')) return 'status-cancelled'
  if (raw.includes('hoan') || raw.includes('thanh cong') || raw.includes('da giao') || raw.includes('done')) return 'status-done'
  if (raw.includes('giao') || raw.includes('van chuyen') || raw.includes('ship')) return 'status-shipping'
  if (raw.includes('xac nhan') || raw.includes('xu ly') || raw.includes('cho') || raw.includes('pending')) return 'status-pending'
  return 'status-processing'
}
async function load() { items.value = (await api.get('/orders')).data; statuses.value = (await api.get('/statuses')).data }
async function open(o) { selected.value = (await api.get(`/orders/${o.mahd}`)).data; newStatus.value = selected.value.order.matt || '' }
async function updateStatus() { if (!newStatus.value) return; const { data } = await api.post(`/orders/${selected.value.order.mahd}/status`, { matt: newStatus.value }); selected.value.order = data; await load() }
onMounted(load)
</script>
