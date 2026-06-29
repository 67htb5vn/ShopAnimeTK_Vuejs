import { createRouter, createWebHistory } from 'vue-router'

import Layout from '../layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import DmhSanpham from '../views/DmhSanpham.vue'
import HhSanpham from '@/views/HhSanpham.vue'
import SearchSanpham from '@/views/SearchSanpham.vue'
import DetailSanpham from '@/views/DetailSanpham.vue'
import Dangnhap from '@/views/Dangnhap.vue'
import Taikhoan from '@/views/Taikhoan.vue'
import TaikhoanLayout from '@/layouts/TaikhoanLayout.vue'
import Lichsudonhang from '@/views/Lichsudonhang.vue'
import Giohang from '@/views/Giohang.vue'
import Thanhtoan from '@/views/Thanhtoan.vue'
import Dathangthanhcong from '@/views/Dathangthanhcong.vue'

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                component: HomeView
            },
            {
                path: 'Danhmuchang',
                name: 'Danhmuchang',
                component: DmhSanpham
            },
            {
                path: 'Hoathinh',
                name: 'Hoanhhinh',
                component: HhSanpham
            },
            {
                path: 'search',
                name: 'search',
                component: SearchSanpham
            },
            {
                path: 'chitiet/:slug',
                name: 'chitiet',
                component: DetailSanpham
            },
            {
                path: 'Giohang',
                name: 'Giohang',
                component: Giohang
            },
            {
                path: 'Thanhtoan',
                name: 'Thanhtoan',
                component: Thanhtoan
            },
            {
                path: 'Dathangthanhcong/:mahd',
                name: 'Dathangthanhcong',
                component: Dathangthanhcong
            }
        ],
    },
    {
        path: '/Dangnhap',
        component: Dangnhap
    },
    {
        path: '/Taikhoan',
        component: TaikhoanLayout,
        children: [
            {
                path: '',
                component: Taikhoan
            }
        ]
    },
    {
        path: '/Lichsudonhang',
        component: Lichsudonhang
    },
    {
        path: '/HomeUser',
        component: Layout,
        children: [
            {
                path: '',
                name: 'HomeUser',
                component: HomeView
            },
            {
                path: 'Danhmuchang',
                name: 'DanhmuchangHomeUser',
                component: DmhSanpham
            },
            {
                path: 'Hoathinh',
                name: 'HoanhhinhHomeUser',
                component: HhSanpham
            },
            {
                path: 'search',
                name: 'searchHomeUser',
                component: SearchSanpham
            },
                        {
                path: 'Giohang',
                name: 'GiohangHomeUser',
                component: Giohang
            },
            {
                path: 'Thanhtoan',
                name: 'ThanhtoanHomeUser',
                component: Thanhtoan
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
