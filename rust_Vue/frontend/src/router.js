import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/AnalyticsDashboard.vue'
import Products from './views/Products.vue'
import Categories from './views/Categories.vue'
import Animes from './views/Animes.vue'
import Orders from './views/InvoiceOrders.vue'
import Users from './views/Users.vue'
import Promotions from './views/Promotions.vue'
import Tags from './views/Tags.vue'
import Login from './views/Login.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/login', component: Login, meta: { title: 'Đăng nhập', public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard, meta: { title: 'Tổng quan' } },
  { path: '/products', component: Products, meta: { title: 'Sản phẩm' } },
  { path: '/categories', component: Categories, meta: { title: 'Danh mục hãng' } },
  { path: '/animes', component: Animes, meta: { title: 'Hoạt hình / Anime' } },
  { path: '/orders', component: Orders, meta: { title: 'Hóa đơn' } },
  { path: '/users', component: Users, meta: { title: 'Người dùng' } },
  { path: '/promotions', component: Promotions, meta: { title: 'Khuyến mãi' } },
  { path: '/tags', component: Tags, meta: { title: 'Tag' } },
  { path: '/settings', component: Settings, meta: { title: 'Cài đặt' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(to => {
  const token = localStorage.getItem('admin_token')
  if (!to.meta.public && !token) return '/login'
  if (to.path === '/login' && token) return '/dashboard'
})

export default router
