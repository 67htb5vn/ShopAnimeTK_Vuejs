<template>
  <div class="analytics-page">
    <div v-if="loadError" class="alert error">{{ loadError }}</div>
    <section class="performance-card">
      <div class="panel-heading">
        <div><span>Tổng quan cửa hàng</span><small>Dữ liệu vận hành hiện tại</small></div>
        <RouterLink class="outline-link" to="/orders">Xem hóa đơn</RouterLink>
      </div>
      <div class="performance-grid">
        <article><span class="metric-icon amber">SP</span>
          <div><small>Sản phẩm</small><strong>{{ formatNumber(stats.total_products) }}</strong><em>Đang kinh doanh</em></div>
        </article>
        <article><span class="metric-icon rose">HD</span>
          <div><small>Hóa đơn</small><strong>{{ formatNumber(stats.total_orders) }}</strong><em>Đơn hàng toàn hệ thống</em></div>
        </article>
        <article><span class="metric-icon mint">DT</span>
          <div><small>Doanh thu</small><strong>{{ compactMoney(stats.total_revenue) }}</strong><em>{{ formatNumber(stats.total_users) }} người dùng</em></div>
        </article>
      </div>
    </section>

    <div class="analytics-grid">
      <section class="analytics-panel chart-panel">
        <div class="panel-heading">
          <div><span>Doanh thu 6 tháng</span><small>Biểu đồ lấy từ dữ liệu hóa đơn</small></div>
          <RouterLink class="outline-link" to="/orders">Chi tiết</RouterLink>
        </div>
        <div class="bar-chart" role="img" aria-label="Doanh thu 6 tháng gần nhất">
          <article v-for="point in chartRevenue" :key="point.label">
            <strong>{{ compactMoney(point.total) }}</strong>
            <span :style="{ height: `${barHeight(point.total)}%` }"></span>
            <small>{{ point.label }}</small>
          </article>
        </div>
      </section>

      <section class="analytics-panel">
        <div class="panel-heading">
          <div><span>Trạng thái đơn</span><small>Tỷ trọng theo trạng thái mới nhất</small></div>
          <RouterLink class="outline-link" to="/orders">Mở</RouterLink>
        </div>
        <div class="status-bars">
          <article v-for="item in statusItems" :key="item.label">
            <div><strong>{{ item.label }}</strong><small>{{ formatNumber(item.value) }} đơn</small></div>
            <span><i :style="{ width: `${slicePercent(item.value, statusTotal)}%` }"></i></span>
          </article>
          <p v-if="!statusTotal" class="muted">Chưa có đơn hàng để thống kê trạng thái.</p>
        </div>
      </section>
    </div>

    <div class="analytics-grid secondary">
      <section class="analytics-panel">
        <div class="panel-heading">
          <div><span>Tồn kho</span><small>Sản phẩm theo mức tồn</small></div>
          <RouterLink class="outline-link" to="/products">Kho</RouterLink>
        </div>
        <div class="stock-visual">
          <div class="stock-ring" :style="{ '--stock': stockAvailablePercent }">
            <strong>{{ Math.round(stockAvailablePercent) }}%</strong>
            <small>Còn hàng</small>
          </div>
          <div class="stock-list">
            <article v-for="item in stockItems" :key="item.label">
              <span>{{ item.label }}</span><strong>{{ formatNumber(item.value) }}</strong>
            </article>
          </div>
        </div>
      </section>

      <section class="analytics-panel">
        <div class="panel-heading">
          <div><span>Đơn gần đây</span><small>5 hóa đơn mới nhất</small></div>
          <RouterLink class="outline-link" to="/orders">Xem tất cả</RouterLink>
        </div>
        <ol class="recent-orders">
          <li v-for="order in visuals.recent_orders" :key="order.mahd">
            <div><strong>{{ order.mahd }}</strong><span>{{ order.tenkh || order.mand || 'Khách hàng' }}</span></div>
            <small>{{ formatDate(order.ngaylap) }}</small>
            <em>{{ compactMoney(order.thanhtien) }}</em>
          </li>
          <li v-if="!visuals.recent_orders.length" class="muted">Chưa có hóa đơn.</li>
        </ol>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api, formatDate } from '../api/http'

const stats = reactive({ total_products: 0, total_users: 0, total_orders: 0, total_revenue: 0 })
const visuals = reactive({ revenue: [], order_statuses: [], payment_methods: [], stock_summary: [], recent_orders: [] })
const loadError = ref('')
const formatNumber = value => Number(value || 0).toLocaleString('vi-VN')
const compactMoney = value => new Intl.NumberFormat('vi-VN', { notation: 'compact', style: 'currency', currency: 'VND', maximumFractionDigits: 1 }).format(Number(value || 0))
const chartRevenue = computed(() => visuals.revenue.length ? visuals.revenue : defaultRevenue())
const statusItems = computed(() => visuals.order_statuses.length ? visuals.order_statuses : [
  { label: 'Chờ xử lý', value: 0 },
  { label: 'Đang giao', value: 0 },
  { label: 'Hoàn tất', value: 0 }
])
const stockItems = computed(() => visuals.stock_summary.length ? visuals.stock_summary : [
  { label: 'Còn hàng', value: 0 },
  { label: 'Sắp hết', value: 0 },
  { label: 'Hết hàng', value: 0 }
])
const maxRevenue = computed(() => Math.max(...chartRevenue.value.map(point => Number(point.total || 0)), 1))
const statusTotal = computed(() => statusItems.value.reduce((sum, item) => sum + Number(item.value || 0), 0))
const stockTotal = computed(() => stockItems.value.reduce((sum, item) => sum + Number(item.value || 0), 0))
const stockAvailablePercent = computed(() => slicePercent(stockItems.value[0]?.value || 0, stockTotal.value))
const barHeight = value => Math.max(8, Math.round(Number(value || 0) / maxRevenue.value * 100))
const slicePercent = (value, total) => total ? Math.round(Number(value || 0) / total * 100) : 0

onMounted(async () => {
  loadError.value = ''
  const [statsResult, visualsResult] = await Promise.allSettled([api.get('/dashboard/stats'), api.get('/dashboard/visuals')])
  if (statsResult.status === 'fulfilled') Object.assign(stats, statsResult.value.data)
  if (visualsResult.status === 'fulfilled') {
    Object.assign(visuals, normalizeVisuals(visualsResult.value.data))
  } else {
    await loadFallbackVisuals()
    loadError.value = 'Backend chưa trả dữ liệu trực quan mới. Đang hiển thị dữ liệu dự phòng từ danh sách hiện có.'
  }
})

function defaultRevenue() {
  const formatter = new Intl.DateTimeFormat('vi-VN', { month: '2-digit', year: 'numeric' })
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - index))
    return { label: formatter.format(date), total: 0 }
  })
}

function normalizeVisuals(data = {}) {
  return {
    revenue: Array.isArray(data.revenue) ? data.revenue : [],
    order_statuses: Array.isArray(data.order_statuses) ? data.order_statuses : [],
    payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
    stock_summary: Array.isArray(data.stock_summary) ? data.stock_summary : [],
    recent_orders: Array.isArray(data.recent_orders) ? data.recent_orders : []
  }
}

async function loadFallbackVisuals() {
  try {
    const [ordersResponse, productsResponse] = await Promise.all([
      api.get('/orders', { params: { page: 1, page_size: 100, sort: 'newest' } }),
      api.get('/products', { params: { page: 1, page_size: 100 } })
    ])
    const orders = ordersResponse.data.items || []
    const products = productsResponse.data.items || []
    visuals.recent_orders = orders.slice(0, 5)
    visuals.order_statuses = groupBy(orders, order => order.trangthai || 'Chưa có trạng thái')
    visuals.stock_summary = [
      { label: 'Còn hàng', value: products.filter(product => Number(product.soluong || 0) > 10).length },
      { label: 'Sắp hết', value: products.filter(product => Number(product.soluong || 0) > 0 && Number(product.soluong || 0) <= 10).length },
      { label: 'Hết hàng', value: products.filter(product => Number(product.soluong || 0) === 0).length }
    ]
    visuals.revenue = buildRevenueFromOrders(orders)
  } catch {
    visuals.revenue = defaultRevenue()
  }
}

function groupBy(items, getLabel) {
  const map = new Map()
  for (const item of items) {
    const label = getLabel(item)
    map.set(label, (map.get(label) || 0) + 1)
  }
  return [...map.entries()].map(([label, value]) => ({ label, value }))
}

function buildRevenueFromOrders(orders) {
  const points = defaultRevenue()
  const byLabel = new Map(points.map(point => [point.label, point]))
  const formatter = new Intl.DateTimeFormat('vi-VN', { month: '2-digit', year: 'numeric' })
  for (const order of orders) {
    if (!order.ngaylap) continue
    const label = formatter.format(new Date(order.ngaylap))
    if (byLabel.has(label)) byLabel.get(label).total += Number(order.thanhtien || 0)
  }
  return points
}
</script>
