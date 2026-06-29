<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import type { danhgia } from '@/models/danhgia'

interface ReviewDisplay extends danhgia {
    tennguoidung?: string
    avatar?: string
}

const props = defineProps<{ masp?: string }>()
const emit = defineEmits<{
    summary: [value: { count: number; average: number }]
}>()

const reviews = ref<ReviewDisplay[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const formatDate = (value?: string) => value
    ? new Intl.DateTimeFormat('vi-VN').format(new Date(value))
    : ''

const avatarUrl = (review: ReviewDisplay) => review.avatar
    ? `/img/nd/${review.avatar}`
    : '/img/nd/boy.png'

const loadReviews = async () => {
    if (!props.masp) return
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await axios.get(`/api/reviews/${props.masp}`)
        reviews.value = response.data.reviews || []
        emit('summary', {
            count: Number(response.data.count || 0),
            average: Number(response.data.average || 0)
        })
    } catch (error) {
        errorMessage.value = 'Không thể tải đánh giá sản phẩm.'
        console.error(error)
    } finally {
        isLoading.value = false
    }
}

onMounted(loadReviews)
watch(() => props.masp, loadReviews)
</script>

<template>
    <div class="review-list">
        <p v-if="isLoading" class="review-status">Đang tải đánh giá...</p>
        <p v-else-if="errorMessage" class="review-error">{{ errorMessage }}</p>
        <p v-else-if="reviews.length === 0" class="review-status">Sản phẩm chưa có đánh giá.</p>

        <article v-for="review in reviews" :key="review.madg" class="review-item">
            <figure class="review-avatar">
                <img :src="avatarUrl(review)" :alt="review.tennguoidung || 'Người đánh giá'">
            </figure>
            <div class="review-content">
                <div class="review-arrow"></div>
                <header>
                    <span><strong>{{ review.tennguoidung }}</strong> – {{ formatDate(review.thoigian) }}</span>
                    <span class="review-stars" :aria-label="`${review.sao || 0} trên 5 sao`">
                        <i v-for="star in 5" :key="star" class="fas fa-star" :class="{ filled: star <= Number(review.sao || 0) }"></i>
                    </span>
                </header>
                <p>{{ review.noidung }}</p>
            </div>
        </article>
    </div>
</template>

<style scoped>
.review-item { display: grid; grid-template-columns: 82px 1fr; gap: 1.8rem; margin-bottom: 2rem; }
.review-avatar { width: 82px; height: 82px; margin: 0; overflow: hidden; border: 1px solid #ddd; }
.review-avatar img { width: 100%; height: 100%; object-fit: cover; }
.review-content { position: relative; min-height: 88px; padding: 1.8rem 2rem; background: #f4f6f7; }
.review-arrow { position: absolute; top: 28px; left: -14px; border-width: 10px 14px 10px 0; border-style: solid; border-color: transparent #f4f6f7 transparent transparent; }
.review-content header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: #777; }
.review-content p { margin: 0.8rem 0 0; color: #777; }
.review-stars { display: flex; gap: 0.2rem; color: #d5d8dc; white-space: nowrap; }
.review-stars .filled { color: #fd5b5a; }
.review-status { padding: 2rem; color: #777; text-align: center; }
.review-error { color: #dc3545; }
@media (max-width: 575px) { .review-item { grid-template-columns: 55px 1fr; gap: 1rem; } .review-avatar { width: 55px; height: 55px; } .review-content header { align-items: flex-start; flex-direction: column; } }
</style>
