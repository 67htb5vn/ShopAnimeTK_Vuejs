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
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

