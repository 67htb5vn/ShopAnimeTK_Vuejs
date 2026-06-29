import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { sanphamgiohang } from '@/models/sanphamgiohang'
import type { khuyenmai } from '@/models/khuyenmai'

interface CheckoutSnapshot {
    products: sanphamgiohang[]
    promotion: khuyenmai | null
}

const STORAGE_KEY = 'shop-anime-checkout'

export const useThanhtoanStore = defineStore('thanhtoan', () => {
    const products = ref<sanphamgiohang[]>([])
    const promotion = ref<khuyenmai | null>(null)

    const hydrate = () => {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return

        try {
            const snapshot = JSON.parse(raw) as CheckoutSnapshot
            products.value = Array.isArray(snapshot.products) ? snapshot.products : []
            promotion.value = snapshot.promotion ?? null
        } catch {
            sessionStorage.removeItem(STORAGE_KEY)
        }
    }

    const startCheckout = (selectedProducts: sanphamgiohang[], selectedPromotion: khuyenmai | null) => {
        products.value = selectedProducts.map((item) => ({ ...item }))
        promotion.value = selectedPromotion ? { ...selectedPromotion } : null
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            products: products.value,
            promotion: promotion.value
        }))
    }

    const clear = () => {
        products.value = []
        promotion.value = null
        sessionStorage.removeItem(STORAGE_KEY)
    }

    hydrate()

    return { products, promotion, startCheckout, clear }
})
