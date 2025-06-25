<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import { decryptData } from '../../utils/crypto'
import Cookies from 'js-cookie'
import axios from 'axios'
import { formatIDR } from '../../utils/common'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

// State untuk menyimpan data laporan
const followerCount = ref(0)
const activeVouchers = ref(0)
const averageRating = ref(0)
const ratingCount = ref(0)
const marketplaceTransactions = ref(0)
const totalRevenue = ref(0)
const isLoaded = ref(false)

// Mendapatkan store_id dari cookie pengguna
const user = decryptData(Cookies.get('userdata'))
const storeId = user?.store_id

// Computed untuk format angka dengan animasi
const animatedFollowers = computed(() => isLoaded.value ? followerCount.value : 0)
const animatedVouchers = computed(() => isLoaded.value ? activeVouchers.value : 0)
const animatedRating = computed(() => isLoaded.value ? averageRating.value : 0)
const animatedRatingCount = computed(() => isLoaded.value ? ratingCount.value : 0)
const animatedTransactions = computed(() => isLoaded.value ? marketplaceTransactions.value : 0)
const animatedRevenue = computed(() => isLoaded.value ? totalRevenue.value : 0)

onMounted(async () => {
    if (!storeId) {
        console.error('Store ID not found in cookies')
        return
    }

    try {
        const response = await axios.get(`http://127.0.0.1:3001/api/dashboard/store`, {
            params: { store_id: storeId }
        })

        if (response.data.success) {
            const data = response.data.data
            followerCount.value = data.followerCount
            activeVouchers.value = data.activeVouchers
            averageRating.value = data.averageRating
            ratingCount.value = data.ratingCount
            marketplaceTransactions.value = data.marketplaceTransactions
            totalRevenue.value = data.totalRevenue

            // Trigger animasi setelah data dimuat
            setTimeout(() => {
                isLoaded.value = true
            }, 300)
        } else {
            console.error('Error fetching store report:', response.data.message)
        }
    } catch (error) {
        console.error('Failed to fetch store report:', error)
    }
})
</script>

<template>
    <div class="content min-h-screen dashboard-container" :class="{ 'full-width': smallMenu }">
        <PageTitle />

        <!-- Stats Cards Grid -->
        <div class="stats-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <!-- Followers Card -->
            <div class="stat-card group">
                <div class="card-icon followers-icon">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="stat-number">{{ animatedFollowers.toLocaleString() }}</h3>
                    <p class="stat-label">Followers</p>
                </div>
            </div>

            <!-- Active Vouchers Card -->
            <div class="stat-card group">
                <div class="card-icon vouchers-icon">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="stat-number">{{ animatedVouchers }}</h3>
                    <p class="stat-label">Active Vouchers</p>
                </div>
            </div>

            <!-- Average Rating Card -->
            <div class="stat-card group">
                <div class="card-icon rating-icon">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="stat-number">{{ animatedRating.toFixed(1) }}</h3>
                    <p class="stat-label">Average Rating</p>
                    <div class="rating-stars">
                        <span v-for="i in 5" :key="i" class="star"
                            :class="{ 'filled': i <= Math.floor(animatedRating) }">★</span>
                    </div>
                </div>
            </div>

            <!-- Total Ratings Card -->
            <div class="stat-card group">
                <div class="card-icon reviews-icon">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="stat-number">{{ animatedRatingCount.toLocaleString() }}</h3>
                    <p class="stat-label">Total Reviews</p>
                </div>
            </div>
        </div>

        <!-- Wide Cards for Transactions and Revenue -->
        <div class="wide-cards grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Marketplace Transactions -->
            <div class="wide-card transactions-card">
                <div class="wide-card-header">
                    <div class="wide-card-icon transactions-bg">
                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="wide-card-title">Marketplace Transactions</h3>
                        <p class="wide-card-subtitle">Total completed orders</p>
                    </div>
                </div>
                <div class="wide-card-content">
                    <h2 class="wide-card-number">{{ animatedTransactions.toLocaleString() }}</h2>

                </div>
            </div>

            <!-- Total Revenue -->
            <div class="wide-card revenue-card">
                <div class="wide-card-header">
                    <div class="wide-card-icon revenue-bg">
                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="wide-card-title">Total Revenue</h3>
                        <p class="wide-card-subtitle">Cumulative earnings</p>
                    </div>
                </div>
                <div class="wide-card-content">
                    <h2 class="wide-card-number">Rp {{ formatIDR(animatedRevenue) }}</h2>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container {
    padding: 2rem;
    min-height: 100vh;
}

.welcome-banner {
    position: relative;
    overflow: hidden;
}

.welcome-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
}

.stats-grid {
    animation: fadeInUp 0.6s ease-out;
}

.stat-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
}

.stat-card:hover::before {
    transform: translateX(0);
}

.stat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    transition: transform 0.3s ease;
}

.group:hover .card-icon {
    transform: scale(1.1) rotate(5deg);
}

.followers-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.vouchers-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

.rating-icon {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    color: #ff6b6b;
}

.reviews-icon {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #2d3748;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #2d3748;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
}

.stat-label {
    color: #718096;
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 1rem;
}

.stat-trend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
}

.stat-trend.positive {
    color: #38a169;
}

.stat-trend.neutral {
    color: #3182ce;
}

.trend-indicator {
    font-size: 1.2rem;
}

.rating-stars {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.5rem;
}

.star {
    color: #e2e8f0;
    font-size: 1.2rem;
    transition: color 0.3s ease;
}

.star.filled {
    color: #ffd700;
}

.wide-cards {
    animation: fadeInUp 0.8s ease-out;
}

.wide-card {
    background: white;
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.wide-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.wide-card-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.wide-card-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.transactions-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.revenue-bg {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.wide-card-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.25rem;
}

.wide-card-subtitle {
    color: #718096;
    font-size: 1rem;
}

.wide-card-number {
    font-size: 3rem;
    font-weight: 900;
    color: #2d3748;
    margin-bottom: 1.5rem;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 4px;
    animation: progressLoad 2s ease-out;
}

.transactions-progress {
    background: linear-gradient(90deg, #667eea, #764ba2);
    width: 75%;
}

.revenue-progress {
    background: linear-gradient(90deg, #f093fb, #f5576c);
    width: 85%;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes progressLoad {
    from {
        width: 0;
    }

    to {
        width: inherit;
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .dashboard-container {
        padding: 1rem;
    }

    .welcome-banner {
        padding: 1.5rem;
        text-align: center;
    }

    .welcome-banner h1 {
        font-size: 2rem;
    }

    .stat-card,
    .wide-card {
        padding: 1.5rem;
    }

    .wide-card-number {
        font-size: 2rem;
    }

    .stat-number {
        font-size: 2rem;
    }
}

.home input[type='date']:focus {
    outline: none;
}
</style>