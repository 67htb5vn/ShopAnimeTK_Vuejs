<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import type { hoathinh } from '@/models/hoathinh';
7
const router = useRouter();
const hhs = ref<hoathinh[]>([]);
// Hàm lấy dữ liệu từ Backend
const loadDanhmucHang = async () => {
    try {
        const response = await axios.get(`/api/loadHh`);
        // Gán dữ liệu dựa trên cấu trúc trả về từ service.js của bạn
        hhs.value = response.data || [];
    } catch (error) {
        console.error("Lỗi khi kết nối với Backend:", error);
    }
};

onMounted(() => {
    loadDanhmucHang()
})
</script>

<template>
    <li v-for="hoathinh in hhs">
        <router-link :to="`/Hoathinh?MaHh=${hoathinh.mahh}`">{{ hoathinh.tenhh }}
        </router-link>
    </li>
</template>