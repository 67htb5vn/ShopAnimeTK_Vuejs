<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useChatboxStore } from '@/stores/Chatbox'
import { useGiohangStore } from '@/stores/XemnhanhGiohang'

const route = useRoute()
const chatStore = useChatboxStore()
const cartStore = useGiohangStore()
const isOpen = ref(false)
const input = ref('')
const isSending = ref(false)
const messageList = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
    await nextTick()
    if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
}

const currentContext = () => ({
    page: {
        path: route.fullPath,
        name: String(route.name || ''),
        title: document.querySelector('h1, .account-sub-title, .section-title')?.textContent?.trim() || document.title,
        productName: document.querySelector('.product-single-details .product-title')?.textContent?.trim() || '',
        productPrice: document.querySelector('.product-single-details .product-price')?.textContent?.trim() || ''
    },
    cart: {
        productTypes: cartStore.tongSoLuong,
        items: cartStore.giohangs.slice(0, 10).map(item => ({
            name: item.tensp,
            quantity: item.soluong,
            price: item.gia
        }))
    }
})

const sendMessage = async () => {
    const content = input.value.trim()
    if (!content || isSending.value) return

    const history = chatStore.messages.slice(-12).map(message => ({
        role: message.role,
        content: message.content
    }))
    chatStore.addMessage('user', content)
    input.value = ''
    isSending.value = true
    await scrollToBottom()

    try {
        const response = await axios.post('/api/chat', {
            message: content,
            history,
            context: currentContext()
        }, { withCredentials: true })
        chatStore.addMessage('assistant', response.data.answer)
    } catch (error: any) {
        chatStore.addMessage('assistant', error.response?.data?.message || 'Xin lỗi, mình chưa thể trả lời lúc này. Bạn vui lòng thử lại sau nhé.')
    } finally {
        isSending.value = false
        await scrollToBottom()
    }
}

const toggleChat = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) scrollToBottom()
}

watch(() => route.fullPath, () => {
    if (isOpen.value) scrollToBottom()
})
</script>

<template>
    <aside class="chatbox" :class="{ open: isOpen }" aria-label="Trợ lý trực tuyến">
        <section v-if="isOpen" class="chat-window">
            <header class="chat-header">
                <div class="chat-title"><span class="bot-icon">🤖</span><strong>Trợ lý Tôm Ká</strong></div>
                <div class="header-actions">
                    <button type="button" title="Xóa hội thoại" aria-label="Xóa hội thoại" @click="chatStore.clearHistory">↻</button>
                    <button type="button" title="Thu nhỏ" aria-label="Thu nhỏ" @click="toggleChat">⌄</button>
                </div>
            </header>

            <div ref="messageList" class="chat-messages" aria-live="polite">
                <div v-for="message in chatStore.messages" :key="message.id" class="message-row" :class="message.role">
                    <span v-if="message.role === 'assistant'" class="message-avatar">🤖</span>
                    <p>{{ message.content }}</p>
                </div>
                <div v-if="isSending" class="message-row assistant typing">
                    <span class="message-avatar">🤖</span><p><i></i><i></i><i></i></p>
                </div>
            </div>

            <form class="chat-input" @submit.prevent="sendMessage">
                <input v-model="input" maxlength="1000" autocomplete="off" placeholder="Nhập tin nhắn..." aria-label="Tin nhắn">
                <button type="submit" :disabled="isSending || !input.trim()" aria-label="Gửi tin nhắn">➤</button>
            </form>
        </section>

        <button v-else type="button" class="chat-launcher" aria-label="Mở trợ lý trực tuyến" @click="toggleChat">
            <span>🤖</span><span class="launcher-label">Chat với Tôm Ká</span>
        </button>
    </aside>
</template>

<style scoped>
.chatbox { position: fixed; right: 22px; bottom: 22px; z-index: 2000; font-family: Arial, sans-serif; }
.chat-window { display: grid; grid-template-rows: 58px minmax(260px, 390px) 62px; width: min(360px, calc(100vw - 28px)); overflow: hidden; border: 1px solid #c9dfe9; border-radius: 14px; background: #fff; box-shadow: 0 12px 38px rgb(0 0 0 / 24%); }
.chat-header { display: flex; align-items: center; justify-content: space-between; padding: 0 14px; background: linear-gradient(135deg, #08c, #0876b5); color: #fff; }
.chat-title { display: flex; align-items: center; gap: 9px; font-size: 15px; }
.bot-icon, .message-avatar { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #fff; }
.bot-icon { width: 32px; height: 32px; }
.header-actions { display: flex; gap: 4px; }
.header-actions button { width: 30px; height: 30px; padding: 0; border: 0; background: transparent; color: #fff; font-size: 20px; cursor: pointer; }
.chat-messages { overflow-y: auto; padding: 16px 13px; background: #f8fcfe; scroll-behavior: smooth; }
.message-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 13px; }
.message-row.user { justify-content: flex-end; }
.message-avatar { flex: 0 0 30px; width: 30px; height: 30px; border: 1px solid #bfe2f1; font-size: 15px; }
.message-row p { max-width: 78%; margin: 0; padding: 10px 12px; border-radius: 12px 12px 12px 4px; background: #eaf5fa; color: #263238; font-size: 13px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.message-row.user p { border-radius: 12px 12px 4px 12px; background: #08c; color: #fff; }
.typing p { display: flex; gap: 4px; padding: 13px 15px; }
.typing i { width: 6px; height: 6px; border-radius: 50%; background: #70a9c3; animation: typing 1s infinite alternate; }
.typing i:nth-child(2) { animation-delay: .2s; }.typing i:nth-child(3) { animation-delay: .4s; }
.chat-input { display: grid; grid-template-columns: 1fr 42px; gap: 8px; align-items: center; padding: 10px 12px; border-top: 1px solid #d9e7ed; background: #fff; }
.chat-input input { width: 100%; height: 40px; padding: 0 14px; border: 1px solid #cfdde3; border-radius: 22px; outline: 0; font-size: 13px; }
.chat-input input:focus { border-color: #08c; box-shadow: 0 0 0 2px rgb(0 136 204 / 12%); }
.chat-input button { width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: #08c; color: #fff; cursor: pointer; }
.chat-input button:disabled { opacity: .45; cursor: default; }
.chat-launcher { display: flex; align-items: center; gap: 9px; min-height: 54px; padding: 8px 17px 8px 9px; border: 0; border-radius: 28px; background: #08c; color: #fff; box-shadow: 0 8px 25px rgb(0 0 0 / 25%); cursor: pointer; }
.chat-launcher > span:first-child { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: #fff; font-size: 21px; }
.launcher-label { font-weight: 700; }
@keyframes typing { to { opacity: .25; transform: translateY(-2px); } }
@media (max-width: 575px) { .chatbox { right: 10px; bottom: 10px; } .chat-window { grid-template-rows: 54px minmax(260px, 55vh) 60px; } .launcher-label { display: none; } .chat-launcher { padding-right: 9px; } }
</style>
