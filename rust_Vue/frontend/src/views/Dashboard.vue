<template>
  <section class="grid grid-4">
    <div class="card stat">
      <div><span>Sản phẩm</span><strong>{{ stats.total_products }}</strong></div>
      <div>🛍️</div>
    </div>
    <div class="card stat">
      <div><span>Người dùng</span><strong>{{ stats.total_users }}</strong></div>
      <div>👤</div>
    </div>
    <div class="card stat">
      <div><span>Hóa đơn</span><strong>{{ stats.total_orders }}</strong></div>
      <div>🧾</div>
    </div>
    <div class="card stat">
      <div><span>Doanh thu</span><strong>{{ formatMoney(stats.total_revenue) }}</strong></div>
      <div>💰</div>
    </div>
  </section>

  <section class="grid grid-2" style="margin-top:18px">
    <div class="card">
      <h3>Chức năng đã dựng</h3>
      <p class="muted">Quản lý sản phẩm, danh mục, anime, hóa đơn, người dùng, khuyến mãi và tag.</p>
    </div>
    <div class="card">
      <h3>Gợi ý nâng cấp</h3>
      <p class="muted">Thêm đăng nhập admin, upload ảnh sản phẩm, phân quyền và biểu đồ doanh thu theo ngày.</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { api, formatMoney } from '../api/http'

const stats = reactive({ total_products: 0, total_users: 0, total_orders: 0, total_revenue: 0 })

onMounted(async () => {
  const { data } = await api.get('/dashboard/stats')
  Object.assign(stats, data)
})
</script>
