<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import { decryptData } from '../../utils/crypto'
import Cookies from 'js-cookie'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'

// Types (same as before)
interface Message {
    id: string
    conversationId: string
    senderId: string
    senderType: 'user' | 'store'
    content: string
    createdAt: string
}

interface User {
    id: string
    name: string
    email: string
}

interface Conversation {
    id: string
    userId: string
    storeId: string
    createdAt: string
    updatedAt: string
    user?: User
    messages?: Message[]
}

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

// State
const currentView = ref<'list' | 'chat'>('list')
const conversations = ref<Conversation[]>([])
const messages = ref<Message[]>([])
const selectedConversation = ref<Conversation | null>(null)
const newMessage = ref('')
const searchQuery = ref('')
const isLoading = ref(true)
const isLoadingMessages = ref(false)
const isSending = ref(false)
const messagesContainer = ref<HTMLElement>()

// Socket
let socket: Socket | null = null

// Get store data from cookies
const user = decryptData(Cookies.get('userdata'))
const storeId = user?.store_id

// FIXED API Configuration
const baseURL = 'http://127.0.0.1:3001/api'      // API Gateway
const chatServiceURL = 'http://127.0.0.1:3001'   // Chat Service untuk Socket

console.log('🔍 Debug Info:')
console.log('Store ID:', storeId)
console.log('User data:', user)
console.log('API Gateway URL:', baseURL)
console.log('Chat Service URL:', chatServiceURL)

// Computed
const filteredConversations = computed(() => {
    if (!searchQuery.value) return conversations.value

    return conversations.value.filter(conversation =>
        conversation.user?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        conversation.user?.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const groupedMessages = computed(() => {
    const groups: { [key: string]: Message[] } = {}

    messages.value.forEach(message => {
        // Gunakan createdAt yang sudah di-map
        const date = formatDate(message.createdAt)
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(message)
    })

    return groups
})

// Socket Methods
const initializeSocket = () => {
    if (!storeId) return

    if (socket) {
        socket.disconnect()
    }

    console.log('🔌 Initializing socket connection...')
    console.log('🔌 Chat Service URL:', chatServiceURL)

    // Try to connect with polling first, then upgrade to websocket
    socket = io(`${chatServiceURL}/chat`, {
        transports: ['websocket'], // Start with polling, then upgrade
        upgrade: true,
        query: {
            userId: storeId,
            userType: 'store'
        },
        forceNew: true,
        timeout: 10000, // 10 seconds timeout
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3,
    });

    socket.on('connect', () => {
        console.log('✅ Connected to chat server')
        console.log('Socket ID:', socket?.id)
        console.log('Transport:', socket?.io?.engine?.transport?.name)

        // Try to upgrade to websocket after successful connection
        socket?.io?.engine?.upgrade()
    })

    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
        console.error('Error type:', error.constructor.name)
        console.error('Error message:', error.message)

        // Show user-friendly error with instructions
        if (error.message.includes('websocket') || error.message.includes('TransportError')) {
            console.warn('⚠️ WebSocket failed, but polling might still work')
            // Don't show alert immediately, let polling try first
        }
    })

    socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from chat server. Reason:', reason)
        if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            socket?.connect()
        }
    })

    socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to chat server after', attemptNumber, 'attempts')
    })

    socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection failed:', error)
    })

    socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after maximum attempts')
        showConnectionError()
    })

    // After 5 seconds, check if we're connected
    setTimeout(() => {
        if (!socket?.connected) {
            console.error('❌ Socket connection failed after timeout')
            showConnectionError()
        }
    }, 5000)

    // socket.on('new_message', (message: Message) => {
    //     console.log('📩 New message received:', message)

    //     // If we're in the current conversation, add message
    //     if (selectedConversation.value &&
    //         message.conversationId === selectedConversation.value.id) {
    //         messages.value.push(message)
    //         nextTick(() => scrollToBottom())
    //     }

    //     // Refresh conversation list to update last message
    //     // loadConversations()

    //     // Show notification
    //     showNotification('New Message', `New message from customer: ${message.content.substring(0, 50)}...`)
    // })

    socket.on('conversation_updated', () => {
        console.log('🔄 Conversation updated')
        loadConversations()
    })

    socket.on('joined_chat', (data) => {
        console.log('✅ Joined chat room:', data)
    })
}


const joinChat = (userId: string, storeId: string) => {
    console.log('🚪 Joining chat room:', { userId, storeId })
    if (socket) {
        socket.emit('join_chat', { userId, storeId })
    }
}

const leaveChat = (userId: string, storeId: string) => {
    console.log('👋 Leaving chat room:', { userId, storeId })
    if (socket) {
        socket.emit('leave_chat', { userId, storeId })
    }
}

// API Methods
const loadConversations = async () => {
    if (!storeId) {
        console.error('❌ Store ID not found in cookies')
        return
    }

    try {
        console.log('📋 Loading conversations for store:', storeId)
        isLoading.value = true

        const response = await axios.get(`${baseURL}/chat/conversations/store/${storeId}`)
        console.log('📋 Conversations response:', response.data)

        if (response.data.success) {
            const formated = {
                ...response.data.data,
                createdAt: response.data.data.created_at
            }
            conversations.value = response.data.data
            console.log('✅ Loaded conversations:', conversations.value.length)

            // Debug: Log structure of each conversation
            conversations.value.forEach((conv, index) => {
                console.log(`📋 Conversation ${index}:`, {
                    id: conv.id,
                    userId: conv.userId,
                    user_id: conv['user_id'],
                    storeId: conv.storeId,
                    store_id: conv['store_id'],
                    user: conv.user,
                    keys: Object.keys(conv)
                })
            })
        } else {
            console.error('❌ Error fetching store conversations:', response.data.message)
        }
    } catch (error) {
        console.error('❌ Failed to fetch store conversations:', error)
        console.error('Error details:', error.response?.data)
    } finally {
        isLoading.value = false
    }
}

const loadMessages = async (userId: string) => {
    if (!storeId || !userId) {
        console.error('❌ Missing required parameters:', { storeId, userId })
        return
    }

    try {
        console.log('💬 Loading messages for conversation:', { userId, storeId })
        isLoadingMessages.value = true

        const url = `${baseURL}/chat/conversations/${userId}/${storeId}/messages`
        console.log('💬 API URL:', url)

        const response = await axios.get(url)
        console.log('💬 Messages response:', response.data)

        if (response.data.success) {
            // Mapping yang konsisten untuk semua properties
            messages.value = response.data.data.messages.map(msg => ({
                id: msg.id,
                conversationId: msg.conversation_id,
                senderId: msg.sender_id,
                senderType: msg.sender_type, // Konsisten gunakan senderType
                content: msg.content,
                createdAt: msg.created_at    // Konsisten gunakan createdAt
            }))

            console.log('✅ Loaded messages:', messages.value.length)
            console.log('Messages data:', messages.value)

            await nextTick()
            scrollToBottom()
        } else {
            console.error('❌ Error fetching messages:', response.data.message)
        }
    } catch (error) {
        console.error('❌ Failed to fetch messages:', error)
        console.error('Error details:', error.response?.data)
        alert(`Failed to load messages: ${error.response?.data?.message || error.message}`)
    } finally {
        isLoadingMessages.value = false
    }
}


const sendMessage = async () => {
    if (!newMessage.value.trim() || isSending.value || !storeId || !selectedConversation.value) {
        console.log('❌ Cannot send message:', {
            hasMessage: !!newMessage.value.trim(),
            isSending: isSending.value,
            hasStoreId: !!storeId,
            hasConversation: !!selectedConversation.value
        })
        return
    }

    const messageContent = newMessage.value.trim()
    newMessage.value = ''

    // Get userId with fallback
    const userId = selectedConversation.value.userId || selectedConversation.value['user_id']

    if (!userId) {
        console.error('❌ No userId found in selected conversation')
        newMessage.value = messageContent // Restore message
        return
    }

    try {
        console.log('📤 Sending message:', messageContent)
        isSending.value = true

        const payload = {
            user_id: userId,
            store_id: storeId,
            sender_id: storeId,
            sender_type: 'store',
            content: messageContent
        }

        console.log('📤 Message payload:', payload)

        const response = await axios.post(`${baseURL}/chat/messages`, payload)
        console.log('📤 Send message response:', response.data)

        if (response.data.success) {
            const formattedMessage = {
                ...response.data.data,
                senderType: response.data.data.sender_type,
                createdAt: response.data.data.created_at,
                conversationId: response.data.data.conversation_id
            }
            messages.value.push(formattedMessage)
            console.log('✅ Message sent successfully')
            await nextTick()
            scrollToBottom()
        } else {
            throw new Error(response.data.message || 'Failed to send message')
        }
    } catch (error) {
        console.error('❌ Failed to send message:', error)
        console.error('Error details:', error.response?.data)

        // Restore message on error
        newMessage.value = messageContent

        // Show user-friendly error
        alert(`Failed to send message: ${error.response?.data?.message || error.message}`)
    } finally {
        isSending.value = false
    }
}

// UI Methods
const openChat = (conversation: Conversation) => {
    console.log('💬 Opening chat for conversation:', conversation)
    console.log('💬 Conversation userId:', conversation.userId)
    console.log('💬 Conversation user_id:', conversation['user_id'])
    console.log('💬 Full conversation object:', JSON.stringify(conversation, null, 2))

    // Check if userId exists, fallback to user_id if needed
    const userId = conversation.userId || conversation['user_id']

    if (!userId) {
        console.error('❌ No userId found in conversation object!')
        alert('Error: Cannot open chat - user ID not found')
        return
    }

    console.log('💬 Using userId:', userId)

    selectedConversation.value = conversation
    currentView.value = 'chat'
    messages.value = []

    // Join chat room
    joinChat(userId, storeId!)

    // Load messages
    loadMessages(userId)
}

const goBack = () => {
    console.log('⬅️ Going back to conversation list')

    if (selectedConversation.value) {
        const userId = selectedConversation.value.userId || selectedConversation.value['user_id']
        if (userId) {
            leaveChat(userId, storeId!)
        }
    }
    selectedConversation.value = null
    currentView.value = 'list'
    messages.value = []
}

const refreshConversations = () => {
    console.log('🔄 Refreshing conversations')
    loadConversations()
}

const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        console.log('📜 Scrolled to bottom')
    }
}

const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
    }
}

// Utility Methods (same as before)
const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
        return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
    } else {
        return date.toLocaleDateString()
    }
}

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`
    } else {
        return date.toLocaleDateString()
    }
}

const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        })
    }
}

const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
    }
}

// Add connection status indicator
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')

const updateConnectionStatus = (status: typeof connectionStatus.value) => {
    connectionStatus.value = status
    console.log('🔗 Connection status:', status)
}

// Update socket methods to track connection status
const initializeSocketWithStatus = () => {
    updateConnectionStatus('connecting')

    if (!storeId) {
        updateConnectionStatus('error')
        return
    }

    if (socket) {
        socket.disconnect()
    }

    console.log('🔌 Initializing socket connection...')
    console.log('🔌 Chat Service URL:', chatServiceURL)

    // Try to connect with polling first, then upgrade to websocket
    socket = io(`${chatServiceURL}/chat`, {
        transports: ['websocket'], // Start with polling, then upgrade
        autoConnect: true,
        query: {
            userId: storeId,
            userType: 'store'
        },
    });

    socket.on('connect', () => {
        console.log('✅ Connected to chat server')
        console.log('Socket ID:', socket?.id)
        console.log('Transport:', socket?.io?.engine?.transport?.name)
        updateConnectionStatus('connected')
    })

    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
        console.error('Error type:', error.constructor.name)
        console.error('Error message:', error.message)
        updateConnectionStatus('error')

        // Show user-friendly error with instructions
        if (error.message.includes('websocket') || error.message.includes('TransportError')) {
            console.warn('⚠️ WebSocket failed, but polling might still work')
            // Don't show alert immediately, let polling try first
        }
    })

    socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from chat server. Reason:', reason)
        updateConnectionStatus('disconnected')

        if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            socket?.connect()
        }
    })

    socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to chat server after', attemptNumber, 'attempts')
        updateConnectionStatus('connected')
    })

    socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection failed:', error)
        updateConnectionStatus('error')
    })

    socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after maximum attempts')
        updateConnectionStatus('error')
        showConnectionError()
    })

    socket.on('new_message', (message: Message) => {
        console.log('📩 New message received:', message)



        // Refresh conversation list hanya jika message bukan dari store ini
        if (message.sender_type !== 'store') {
            // Map properties untuk konsistensi
            const formattedMessage = {
                ...message,
                senderType: message.sender_type,
                createdAt: message.created_at,
                conversationId: message.conversation_id
            }

            // Tambahkan message ke array (baik dari user maupun store)
            messages.value.push(formattedMessage)
            messages.value = [...messages.value]
            nextTick(() => scrollToBottom())
            loadConversations()
            // Show notification hanya untuk message dari customer
            showNotification('New Message', `New message from customer: ${message.content.substring(0, 50)}...`)
        }
    })

    socket.on('conversation_updated', () => {
        console.log('🔄 Conversation updated')
        loadConversations()
    })

    socket.on('joined_chat', (data) => {
        console.log('✅ Joined chat room:', data)
    })
}

const showConnectionError = () => {
    const errorMessage = `
❌ Chat service connection failed!

Possible solutions:
1. Make sure chat service is running on port 3001
2. Check if the chat service URL is correct: ${chatServiceURL}
3. Verify that WebSocket/Socket.IO is properly configured

The app will still work for viewing conversations, but real-time features will be disabled.
    `

    console.error(errorMessage)

    // Show user-friendly message
    if (confirm('Chat service is not available. Real-time features will be disabled. Do you want to continue?')) {
        console.log('🔄 Continuing without real-time features')
    }
}

// Lifecycle
onMounted(async () => {
    console.log('🚀 Component mounted')

    if (storeId) {

        // Request notification permission
        requestNotificationPermission()

        // Initialize socket connection with status tracking
        initializeSocketWithStatus()

        // Load initial conversations
        await loadConversations()
    } else {
        console.error('❌ Store ID not found in cookies')
        alert('Store ID not found. Please login again.')
    }
})

onUnmounted(() => {
    console.log('🛑 Component unmounted')
    if (socket) {
        socket.disconnect()
    }
})
</script>

<template>
    <div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
        <PageTitle />

        <!-- Conversation List View -->
        <div v-if="currentView === 'list'">
            <!-- Header -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-2xl font-bold text-gray-800">Customer Messages</h1>
                    <button @click="refreshConversations"
                        class="bg-pinkDark hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="relative">
                    <input v-model="searchQuery" type="text"
                        placeholder="Search conversations by customer name or email..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pinkDark focus:border-transparent">
                    <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-8 text-center">
                <div
                    class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-pinkDark bg-white">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-pinkDark" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Loading conversations...
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredConversations.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
                <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">
                    {{ searchQuery ? 'No conversations found' : 'No customer messages yet' }}
                </h3>
                <p class="text-gray-600 max-w-md mx-auto">
                    {{ searchQuery
                        ? 'Try adjusting your search terms'
                        : 'When customers start messaging your store, they will appear here.'
                    }}
                </p>
            </div>

            <!-- Conversations List -->
            <div v-else class="bg-white rounded-lg shadow-md">
                <div class="divide-y divide-gray-200">
                    <div v-for="conversation in filteredConversations" :key="conversation.id"
                        @click="openChat(conversation)" class="p-6 hover:bg-gray-50 cursor-pointer tr
                        ansition-colors group">
                        <div class="flex items-start space-x-4">
                            <!-- Avatar -->
                            <div class="flex-shrink-0">
                                <div
                                    class="w-12 h-12 bg-pinkDark rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {{ conversation.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3
                                            class="text-lg font-semibold text-gray-900 group-hover:text-pinkDark transition-colors">
                                            {{ conversation.user?.name || 'Unknown Customer' }}
                                        </h3>
                                        <p class="text-sm text-gray-600">
                                            {{ conversation.user?.email }}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm text-gray-500">
                                            {{ formatRelativeTime(conversation.updated_at) }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Last Message Preview -->
                                <div v-if="conversation.messages && conversation.messages.length > 0" class="mt-2">
                                    <p class="text-sm text-gray-700 line-clamp-2">
                                        <span v-if="conversation.messages[0].senderType === 'store'"
                                            class="text-pinkDark font-medium">
                                            You:
                                        </span>
                                        {{ conversation.messages[0].content }}
                                    </p>
                                </div>
                                <div v-else class="mt-2">
                                    <p class="text-sm text-gray-500 italic">No messages yet</p>
                                </div>
                            </div>

                            <!-- Arrow -->
                            <div class="flex-shrink-0">
                                <svg class="w-5 h-5 text-gray-400 group-hover:text-pinkDark transition-colors"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat Detail View -->
        <div v-else-if="currentView === 'chat'" class="flex flex-col h-screen">
            <!-- Chat Header -->
            <div class="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    <div class="flex items-center space-x-3">
                        <div class="relative">
                            <div
                                class="w-10 h-10 bg-pinkDark rounded-full flex items-center justify-center text-white font-semibold">
                                {{ selectedConversation?.user?.name?.charAt(0)?.toUpperCase() || 'C' }}
                            </div>
                            <!-- Online status indicator -->
                            <div
                                class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full">
                            </div>
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900">
                                {{ selectedConversation?.user?.name || 'Customer' }}
                            </h2>
                            <p class="text-sm text-gray-600">
                                {{ selectedConversation?.user?.email || 'Customer conversation' }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex items-center space-x-2">
                    <!-- Connection status indicator -->
                    <div class="flex items-center space-x-2">
                        <div :class="[
                            'w-2 h-2 rounded-full',
                            connectionStatus === 'connected' ? 'bg-green-500' :
                                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                                    'bg-red-500'
                        ]"></div>
                        <span class="text-xs text-gray-500 capitalize">{{ connectionStatus }}</span>
                    </div>
                </div>
            </div>

            <!-- Messages Container -->
            <div class="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <!-- Loading State -->
                <div v-if="isLoadingMessages" class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <svg class="animate-spin h-8 w-8 text-pinkDark mx-auto mb-4" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <p class="text-gray-600">Loading messages...</p>
                    </div>
                </div>

                <!-- Messages -->
                <div v-else ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    <div v-if="Object.keys(groupedMessages).length === 0" class="text-center py-12">
                        <div class="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-medium text-gray-900 mb-3">Start the conversation</h3>
                        <p class="text-gray-600 max-w-sm mx-auto">Send a message to begin chatting with this customer.
                            They'll receive a notification when you reply.</p>
                    </div>

                    <!-- Message Groups by Date -->
                    <!-- Fix template untuk menggunakan property names yang konsisten -->
                    <div v-for="(dayMessages, date) in groupedMessages" :key="date" class="space-y-6">
                        <!-- Date Separator -->
                        <div class="flex justify-center my-6">
                            <span
                                class="bg-white text-gray-600 px-4 py-2 rounded-full text-sm font-medium shadow-sm border">
                                {{ date }}
                            </span>
                        </div>

                        <!-- Messages for this date -->
                        <div v-for="message in dayMessages" :key="message.id" class="flex items-end space-x-2"
                            :class="message.senderType === 'store' ? 'justify-end flex-row-reverse space-x-reverse' : 'justify-start'">

                            <!-- Avatar untuk pesan user (kiri) -->
                            <div v-if="message.senderType === 'user'" class="flex-shrink-0">
                                <div
                                    class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {{ selectedConversation?.user?.name?.charAt(0)?.toUpperCase() || 'C' }}
                                </div>
                            </div>

                            <!-- Balon Pesan -->
                            <div class="flex flex-col max-w-xs lg:max-w-md">
                                <div :class="[
                                    'px-4 py-3 shadow-sm',
                                    message.senderType === 'store'
                                        ? 'bg-blue-600 text-white rounded-br-sm rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                                        : 'bg-gray-200 text-gray-900 rounded-bl-sm rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'
                                ]">
                                    <p class="text-sm leading-relaxed break-words">{{ message.content }}</p>
                                </div>

                                <!-- Waktu Pesan - FIX: gunakan createdAt yang konsisten -->
                                <div :class="[
                                    'text-xs mt-1 px-2 select-none',
                                    message.senderType === 'store' ? 'text-right text-gray-300' : 'text-left text-gray-600'
                                ]">
                                    {{ formatTime(message.createdAt) }}
                                    <span v-if="message.senderType === 'store'" class="ml-1 inline-block">
                                        <svg class="w-3 h-3 inline text-gray-300" fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Typing indicator (if needed) -->
                    <!-- <div v-if="isTyping" class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ selectedConversation?.user?.name?.charAt(0)?.toUpperCase() || 'C' }}
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div> -->
                </div>

                <!-- Message Input -->
                <div class="border-t border-gray-200 bg-white p-4">
                    <div class="flex items-end space-x-3">

                        <!-- Message input -->
                        <div class="flex-1 relative">
                            <textarea v-model="newMessage" @keypress="handleKeyPress" placeholder="Type your message..."
                                rows="1"
                                class="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-pinkDark focus:border-transparent placeholder-gray-500 text-sm leading-relaxed max-h-32"
                                :disabled="isSending" style="min-height: 44px;"></textarea>

                        </div>

                        <!-- Send button -->
                        <button @click="sendMessage" :disabled="!newMessage.trim() || isSending"
                            class="p-3 bg-pinkDark text-white rounded-full hover:bg-pink-600 focus:ring-2 focus:ring-pinkDark focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                            :class="!newMessage.trim() ? 'scale-90' : 'scale-100'">
                            <svg v-if="isSending" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            <svg v-else class="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>

                    <!-- Quick replies (optional) -->
                    <!-- <div class="mt-3 flex flex-wrap gap-2">
                <button v-for="reply in quickReplies" :key="reply" 
                    @click="newMessage = reply"
                    class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors">
                    {{ reply }}
                </button>
            </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Enhanced scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

/* Message animations */
.message-enter-active {
    transition: all 0.3s ease-out;
}

.message-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.message-enter-to {
    opacity: 1;
    transform: translateY(0);
}

/* Auto-resize textarea */
textarea {
    resize: none;
    overflow: hidden;
}

/* Message bubble hover effects */
.message-bubble:hover {
    transform: translateY(-1px);
    transition: transform 0.2s ease;
}

/* Connection status pulse animation */
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom bounce animation for typing indicator */
@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

.animate-bounce {
    animation: bounce 1.4s infinite;
}

/* Smooth transitions */
.transition-all {
    transition: all 0.2s ease-in-out;
}

/* Message spacing improvements */
.message-group {
    margin-bottom: 1rem;
}

.message-group:last-child {
    margin-bottom: 0;
}

/* Input focus styles */
textarea:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

/* Send button animation */
.send-button {
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.send-button:hover:not(:disabled) {
    transform: scale(1.05);
}

.send-button:active:not(:disabled) {
    transform: scale(0.95);
}

/* Message time fade in */
.message-time {
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.message-bubble:hover .message-time {
    opacity: 1;
}

/* Membuat balon chat lebih halus dan konsisten */
.bg-blue-600 {
    background-color: #3b82f6;
    /* warna biru cerah */
}

/* Animasi ringan untuk hover balon chat */
.px-4.py-3.shadow-sm:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
}

/* Buat teks timestamp lebih kecil dan subtle */
.text-xs.text-gray-300 {
    font-size: 10px;
    opacity: 0.8;
}

/* Ensure proper message alignment */
.justify-end .max-w-xs,
.justify-end .max-w-md {
    margin-left: auto;
}

/* Better spacing for reversed flex */
.space-x-reverse>*+* {
    margin-right: 0.5rem;
    margin-left: 0;
}
</style>