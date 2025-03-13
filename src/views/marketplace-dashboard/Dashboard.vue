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

// Mendapatkan store_id dari cookie pengguna
const user = decryptData(Cookies.get('userdata'))
const storeId = user?.store_id

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
        } else {
            console.error('Error fetching store report:', response.data.message)
        }
    } catch (error) {
        console.error('Failed to fetch store report:', error)
    }
})
</script>

<template>
    <div class="content min-h-screen home" :class="{ 'full-width': smallMenu }">
        <PageTitle />

        <!-- Cards -->
        <div class="cards grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Followers -->
            <div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
                <div class="card-header">
                    <h2 class="text-center text-2xl text-wrap text-pinkDark">
                        {{ followerCount }}
                    </h2>
                </div>
                <div class="card-body mt-2">
                    <p class="card-title text-center text-gray-500 text-lg">
                        Followers
                    </p>
                </div>
            </div>

            <!-- Active Vouchers -->
            <div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
                <div class="card-header">
                    <h2 class="text-center text-2xl text-wrap text-pinkDark">
                        {{ activeVouchers }}
                    </h2>
                </div>
                <div class="card-body mt-2">
                    <p class="card-title text-center text-gray-500 text-lg">
                        Active Vouchers
                    </p>
                </div>
            </div>

            <!-- Average Rating -->
            <div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
                <div class="card-header">
                    <h2 class="text-center text-2xl text-wrap text-pinkDark">
                        {{ averageRating.toFixed(1) }}
                    </h2>
                </div>
                <div class="card-body mt-2">
                    <p class="card-title text-center text-gray-500 text-lg">
                        Average Rating
                    </p>
                </div>
            </div>

            <!-- Total Ratings -->
            <div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
                <div class="card-header">
                    <h2 class="text-center text-2xl text-wrap text-pinkDark">
                        {{ ratingCount }}
                    </h2>
                </div>
                <div class="card-body mt-2">
                    <p class="card-title text-center text-gray-500 text-lg">
                        Total Ratings
                    </p>
                </div>
            </div>

            <!-- Marketplace Transactions -->
            <div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md col-span-1 md:col-span-2">
                <div class="card-header">
                    <h2 class="text-center text-2xl text-wrap text-pinkDark">
                        {{ marketplaceTransactions }}
                    </h2>
                </div>
                <div class="card-body mt-2">
                    <p class="card-title text-center text-gray-500 text-lg">
                        Marketplace Transactions
                    </p>
                </div>
            </div>

            <!-- Marketplace Transactions Revenue -->
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md col-span-1 md:col-span-2">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						Rp. {{ formatIDR(totalRevenue) }}
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Total Revenue
					</p>
				</div>
			</div>
        </div>
    </div>
</template>

<style>
.home input[type='date']:focus {
    outline: none;
}
</style>
