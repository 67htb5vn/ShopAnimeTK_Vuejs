<template>
    <li v-for="(dmh, index) in dmhs.filter(x => (x.madmh?.trim() != 'DMH002') && (x.madmh?.trim() != 'DMH003'))"
        :key="dmh.madmh">
        <router-link :to="`/Danhmuchang?MaDmh=${dmh.madmh}`">
            <i :class="icons[index]"></i>
            {{ dmh.tendmh }}
        </router-link>
    </li>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import type { danhmuchang } from '@/models/danhmuchang';
7
const router = useRouter();
const icons = [
    "sicon-ghost",
    "sicon-magic-wand",
    "sicon-picture",
    "sicon-bag",
    "sicon-book-open",
    "sicon-puzzle",
    "sicon-pencil",
    "sicon-present"
]

// State
const dmhs = ref<danhmuchang[]>([]);
// Hàm lấy dữ liệu từ Backend
const loadDanhmucHang = async () => {
    try {
        const response = await axios.get(`/api/loadDmh`);
        // Gán dữ liệu dựa trên cấu trúc trả về từ service.js của bạn
        dmhs.value = response.data || [];
    } catch (error) {
        console.error("Lỗi khi kết nối với Backend:", error);
    }
};

onMounted(() => {
    loadDanhmucHang()
})
</script>