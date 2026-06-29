import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/admin.css'

const appearance = JSON.parse(localStorage.getItem('admin_appearance') || '{}')
const isDark = appearance.theme === 'dark' || (appearance.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
document.documentElement.classList.toggle('dark', isDark)
document.documentElement.classList.toggle('compact', appearance.density === 'compact')
document.documentElement.classList.toggle('sidebar-compact', Boolean(appearance.compactSidebar))

createApp(App).use(router).mount('#app')
