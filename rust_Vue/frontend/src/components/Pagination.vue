<template>
    <div class="pagination" v-if="totalPages > 0"><span>Hiển thị {{ start }}–{{ end }} / {{ total }}</span>
        <div class="pagination-actions"><select :value="pageSize"
                @change="$emit('update:pageSize', Number($event.target.value))">
                <option :value="10">10 / trang</option>
                <option :value="20">20 / trang</option>
                <option :value="50">50 / trang</option>
            </select><button class="btn ghost small" :disabled="page <= 1" @click="$emit('update:page', page - 1)">‹
                Trước</button><strong>{{ page }} / {{ totalPages }}</strong><button class="btn ghost small"
                :disabled="page >= totalPages" @click="$emit('update:page', page + 1)">Sau ›</button></div>
    </div>
</template>
<script
    setup>    import { computed } from 'vue'; const p = defineProps({ page: Number, pageSize: Number, total: Number, totalPages: Number }); defineEmits(['update:page', 'update:pageSize']); const start = computed(() => p.total ? (p.page - 1) * p.pageSize + 1 : 0), end = computed(() => Math.min(p.page * p.pageSize, p.total))</script>
