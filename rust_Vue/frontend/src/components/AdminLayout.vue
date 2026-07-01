<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo">TK</div>
        <div>
          <strong>Shop Anime</strong>
        </div>
        <button class="sidebar-toggle" type="button" @click="toggleSidebar">☰</button>
      </div>

      <nav class="menu">
        <RouterLink v-for="item in menu.filter(item => item.path !== '/settings')" :key="item.path" :to="item.path">
          <span>{{ item.icon }}</span>{{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <main class="content">
      <header class="topbar">
        <div class="topbar-title">
          <h1>{{ title }}</h1>
          <p>{{ todayLabel }}</p>
        </div>

        <div ref="topbarAccount" class="topbar-account">
          <button class="topbar-icon notification-trigger" type="button" aria-label="Thông báo đơn hàng"
            @click="toggleNotifications">
            <span>🔔</span>
            <b v-if="unreadOrderCount">{{ unreadOrderCount > 9 ? '9+' : unreadOrderCount }}</b>
          </button>
          <div v-if="notificationsOpen" class="notification-menu">
            <div class="notification-head">
              <strong>Đơn hàng mới</strong>
              <button v-if="unreadOrderCount" type="button" @click="markAllOrdersSeen">Đánh dấu đã xem</button>
            </div>
            <button v-for="order in recentOrders" :key="order.mahd" type="button" class="notification-item"
              :class="{ unread: !seenOrderIds.has(order.mahd) }" @click="openOrderNotification(order)">
              <span>{{ !seenOrderIds.has(order.mahd) ? 'Mới' : 'Đơn' }}</span>
              <div>
                <strong>{{ order.mahd }}</strong>
                <small>{{ order.tenkh || order.mand || 'Khách hàng' }} · {{ formatOrderTime(order.ngaylap) }}</small>
              </div>
              <em>{{ formatOrderAmount(order.thanhtien) }}</em>
            </button>
            <p v-if="!recentOrders.length" class="notification-empty">Chưa có đơn hàng.</p>
          </div>
          <button class="profile-trigger" type="button" @click="toggleAccount"><span
              class="profile-copy"><strong>{{ adminName }}</strong><small>Quản trị viên</small></span><span
              class="profile-avatar">{{ initials }}</span><span>⌄</span></button>
          <div v-if="accountOpen" class="profile-menu">
            <RouterLink to="/settings" @click="accountOpen = false">⚙ Cài đặt tài khoản</RouterLink><button type="button"
              @click="logout">↪ Đăng xuất</button>
          </div>
        </div>
        <div class="admin-account old-admin-account">
          <div class="admin-chip">{{ adminName }}</div>
          <button class="btn ghost small" @click="logout">Đăng xuất</button>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/http'
import { notify } from '../services/ui'

const route = useRoute()
const router = useRouter()
const title = computed(() => route.meta.title || 'Admin')
const todayLabel = computed(() => new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }))
const savedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
const adminName = computed(() => savedUser.ten || savedUser.taikhoan || 'Admin')
const initials = computed(() => adminName.value.split(/\s+/).slice(-2).map(word => word[0]).join('').toUpperCase())
const accountOpen = ref(false)
const notificationsOpen = ref(false)
const topbarAccount = ref(null)
const recentOrders = ref([])
const knownOrderIds = ref(new Set(JSON.parse(localStorage.getItem('known_order_ids') || '[]')))
const seenOrderIds = ref(new Set(JSON.parse(localStorage.getItem('seen_order_ids') || '[]')))
const unreadOrderCount = computed(() => recentOrders.value.filter(order => !seenOrderIds.value.has(order.mahd)).length)
const appearance = JSON.parse(localStorage.getItem('admin_appearance') || '{}')
const sidebarCollapsed = ref(Boolean(appearance.compactSidebar))
function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value; document.documentElement.classList.toggle('sidebar-compact', sidebarCollapsed.value); localStorage.setItem('admin_appearance', JSON.stringify({ ...appearance, compactSidebar: sidebarCollapsed.value })) }
let orderPollingTimer

onMounted(async () => {
  try { await api.get('/auth/me') } catch { /* interceptor handles expired sessions */ }
  await loadOrderNotifications(true)
  orderPollingTimer = window.setInterval(() => loadOrderNotifications(false), 10000)
  document.addEventListener('pointerdown', closeTopbarMenus)
})

onBeforeUnmount(() => {
  if (orderPollingTimer) window.clearInterval(orderPollingTimer)
  document.removeEventListener('pointerdown', closeTopbarMenus)
})

async function loadOrderNotifications(initial = false) {
  try {
    const { data } = await api.get('/orders', { params: { page: 1, page_size: 5, sort: 'newest' } })
    const orders = data.items || []
    const newOrders = initial ? [] : orders.filter(order => !knownOrderIds.value.has(order.mahd))
    recentOrders.value = orders
    if (initial) {
      seenOrderIds.value = new Set([...seenOrderIds.value, ...orders.map(order => order.mahd)])
      saveSeenOrders()
    }
    knownOrderIds.value = new Set([...knownOrderIds.value, ...orders.map(order => order.mahd)].slice(-30))
    localStorage.setItem('known_order_ids', JSON.stringify([...knownOrderIds.value]))
    if (newOrders.length) notify(`Có ${newOrders.length} đơn hàng mới cần xử lý.`, 'info')
  } catch { /* keep notification polling silent */ }
}

function toggleNotifications() {
  notificationsOpen.value = !notificationsOpen.value
  accountOpen.value = false
}

function toggleAccount() {
  accountOpen.value = !accountOpen.value
  notificationsOpen.value = false
}

function closeTopbarMenus(event) {
  if (!topbarAccount.value?.contains(event.target)) {
    notificationsOpen.value = false
    accountOpen.value = false
  }
}

function saveSeenOrders() {
  localStorage.setItem('seen_order_ids', JSON.stringify([...seenOrderIds.value].slice(-50)))
}

function markAllOrdersSeen() {
  seenOrderIds.value = new Set([...seenOrderIds.value, ...recentOrders.value.map(order => order.mahd)])
  saveSeenOrders()
}

async function openOrderNotification(order) {
  seenOrderIds.value = new Set([...seenOrderIds.value, order.mahd])
  saveSeenOrders()
  notificationsOpen.value = false
  await router.push({ path: '/orders', query: { order: order.mahd } })
}

const formatOrderAmount = value => Number(value || 0).toLocaleString('vi-VN', { notation: 'compact', style: 'currency', currency: 'VND', maximumFractionDigits: 1 })
const formatOrderTime = value => value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '-'

async function logout() {
  try { await api.post('/auth/logout') } catch { /* clear the local session either way */ }
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  await router.replace('/login')
}

const menu = [
  { path: '/settings', label: 'Cài đặt', icon: '⚙️' },
  { path: '/dashboard', label: 'Tổng quan', icon: '📊' },
  { path: '/products', label: 'Sản phẩm', icon: '🛍️' },
  { path: '/categories', label: 'Danh mục', icon: '📦' },
  { path: '/animes', label: 'Anime', icon: '🎬' },
  { path: '/orders', label: 'Hóa đơn', icon: '🧾' },
  { path: '/users', label: 'Người dùng', icon: '👤' },
  { path: '/promotions', label: 'Khuyến mãi', icon: '🏷️' }
]
</script>
