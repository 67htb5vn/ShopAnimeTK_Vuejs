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
const isLoggedIn = ref(false)
const authChecked = ref(false)
const selectedRating = ref(0)
const reviewContent = ref('')
const isSubmitting = ref(false)
const submitMessage = ref('')

const formatDate = (value?: string) => value
    ? new Intl.DateTimeFormat('vi-VN').format(new Date(value))
    : ''

const avatarUrl = (review: ReviewDisplay) => {
    const avatar = review.avatar?.trim()
    if (!avatar) return '/img/nd/boy.png'
    if (/^(https?:|data:|blob:|\/)/i.test(avatar)) return avatar
    return `/img/nd/${avatar}`
}

const handleAvatarError = (event: Event) => {
    const image = event.target as HTMLImageElement
    image.onerror = null
    image.src = '/img/nd/boy.png'
}

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

const loadAuth = async () => {
    try {
        const response = await axios.get('/api/checkauth', { withCredentials: true })
        isLoggedIn.value = response.data.loggedIn === true
    } catch {
        isLoggedIn.value = false
    } finally {
        authChecked.value = true
    }
}

const submitReview = async () => {
    if (!props.masp || selectedRating.value < 1 || !reviewContent.value.trim()) {
        submitMessage.value = 'Vui lòng chọn số sao và nhập nội dung đánh giá.'
        return
    }

    isSubmitting.value = true
    submitMessage.value = ''
    try {
        await axios.post(`/api/reviews/${props.masp}`, {
            sao: selectedRating.value,
            noidung: reviewContent.value.trim()
        }, { withCredentials: true })

        selectedRating.value = 0
        reviewContent.value = ''
        submitMessage.value = 'Đánh giá của bạn đã được đăng.'
        await loadReviews()
    } catch (error: any) {
        if (error.response?.status === 401) isLoggedIn.value = false
        submitMessage.value = error.response?.data?.message || 'Không thể đăng đánh giá.'
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    loadReviews()
    loadAuth()
})
watch(() => props.masp, loadReviews)
</script>

<template>
    <div class="review-list">
        <p v-if="isLoading" class="review-status">Đang tải đánh giá...</p>
        <p v-else-if="errorMessage" class="review-error">{{ errorMessage }}</p>
        <p v-else-if="reviews.length === 0" class="review-status">Sản phẩm chưa có đánh giá.</p>

        <article v-for="review in reviews" :key="review.madg" class="review-item">
            <figure class="review-avatar">
                <img :src="avatarUrl(review)" :alt="review.tennguoidung || 'Người đánh giá'" @error="handleAvatarError">
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

        <section v-if="authChecked" class="review-form-section">
            <form v-if="isLoggedIn" class="review-form" @submit.prevent="submitReview">
                <h4>Viết đánh giá của bạn</h4>
                <label>Điểm đánh giá <span class="required">*</span></label>
                <div class="rating-picker" role="radiogroup" aria-label="Chọn điểm đánh giá">
                    <button
                        v-for="star in 5"
                        :key="star"
                        type="button"
                        :class="{ selected: star <= selectedRating }"
                        :aria-label="`${star} sao`"
                        @click="selectedRating = star"
                    ><i class="fas fa-star"></i></button>
                </div>
                <label for="review-content">Nội dung <span class="required">*</span></label>
                <textarea
                    id="review-content"
                    v-model.trim="reviewContent"
                    class="form-control"
                    rows="4"
                    maxlength="500"
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    required
                ></textarea>
                <p v-if="submitMessage" class="submit-message">{{ submitMessage }}</p>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Đang đăng...' : 'Gửi đánh giá' }}
                </button>
            </form>
            <p v-else class="login-review-message">
                Vui lòng <router-link to="/Dangnhap">đăng nhập</router-link> để viết đánh giá.
            </p>
        </section>
    </div>
</template>

<style scoped>
.review-item { display: grid; grid-template-columns: 80px 1fr; gap: 1.8rem; margin-bottom: 2rem; }
.review-avatar { width: 80px; height: 80px; margin: 0; overflow: hidden; border: 1px solid #ddd; }
.review-avatar img { display: block; width: 80px; height: 80px; object-fit: cover; }
.review-content { position: relative; min-height: 88px; padding: 1.8rem 2rem; background: #f4f6f7; }
.review-arrow { position: absolute; top: 28px; left: -14px; border-width: 10px 14px 10px 0; border-style: solid; border-color: transparent #f4f6f7 transparent transparent; }
.review-content header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: #777; }
.review-content p { margin: 0.8rem 0 0; color: #777; }
.review-stars { display: flex; gap: 0.2rem; color: #d5d8dc; white-space: nowrap; }
.review-stars .filled { color: #fd5b5a; }
.review-status { padding: 2rem; color: #777; text-align: center; }
.review-error { color: #dc3545; }
.review-form-section { margin-top: 3rem; padding-top: 2.5rem; border-top: 1px solid #e5e5e5; }
.review-form { max-width: 720px; }
.review-form h4 { margin-bottom: 1.8rem; color: #222529; font-size: 20px; }
.review-form label { display: block; margin-bottom: .7rem; color: #222529; font-weight: 600; }
.required { color: #dc3545; }
.rating-picker { display: flex; gap: .4rem; margin-bottom: 1.8rem; }
.rating-picker button { padding: 0; border: 0; background: transparent; color: #d5d8dc; font-size: 22px; cursor: pointer; }
.rating-picker button.selected { color: #fd5b5a; }
.review-form textarea { margin-bottom: 1rem; resize: vertical; }
.submit-message { margin-bottom: 1rem; color: #087fc1; }
.login-review-message { padding: 1.5rem; background: #f4f6f7; }
@media (max-width: 575px) { .review-item { grid-template-columns: 80px 1fr; gap: 1rem; } .review-content header { align-items: flex-start; flex-direction: column; } }
</style>
