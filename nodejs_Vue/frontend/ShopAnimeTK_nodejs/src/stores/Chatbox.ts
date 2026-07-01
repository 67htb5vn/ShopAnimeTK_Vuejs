import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ChatRole = 'user' | 'assistant'
export interface ChatMessage {
    id: string
    role: ChatRole
    content: string
    createdAt: string
}

// Đổi phiên bản khi thay model để không nạp lại câu trả lời đã lưu từ model cũ.
const STORAGE_KEY = 'shopanime_chat_history_ollama_qwen25_v2'
const LEGACY_STORAGE_KEYS = ['shopanime_chat_history_v1']
const greeting = (): ChatMessage => ({
    id: 'welcome',
    role: 'assistant',
    content: 'Xin chào 👋 Mình là trợ lý của Shop Anime Tôm Ká. Mình có thể giúp gì cho bạn?',
    createdAt: new Date().toISOString()
})

const readHistory = (): ChatMessage[] => {
    try {
        LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key))
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        return Array.isArray(stored) && stored.length ? stored.slice(-50) : [greeting()]
    } catch {
        return [greeting()]
    }
}

export const useChatboxStore = defineStore('chatbox', () => {
    const messages = ref<ChatMessage[]>(readHistory())

    const addMessage = (role: ChatRole, content: string) => {
        messages.value.push({
            id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            role,
            content,
            createdAt: new Date().toISOString()
        })
    }

    const clearHistory = () => {
        messages.value = [greeting()]
    }

    watch(messages, value => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value.slice(-50)))
    }, { deep: true })

    return { messages, addMessage, clearHistory }
})
