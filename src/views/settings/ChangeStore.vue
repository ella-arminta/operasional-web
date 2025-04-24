<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<h1 class="text-lg font-semibold col-span-3 mb-3 text-gray-500">
				List of Authorized Stores
			</h1>
			<div
				class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3"
			>
				<template v-for="company in companies">
					<template v-for="store in company.stores">
						<div
							class="bg-white px-6 py-4 rounded-md shadow-md text-gray-500"
						>
							<h1 class="text-lg font-semibold">
								{{ store.code }} | {{ store.name }}
							</h1>
							<h2 class="text-sm font-semibold italic mb-3">
								{{ company.name }}
							</h2>
							<button
								@click="changeActive(store.id)"
								class="text-white w-full px-4 text-center rounded-md py-2"
								:class="{
									'bg-green-600': activeStore == store.id,
									'bg-pinkDark hover:bg-pinkOrange':
										activeStore != store.id,
								}"
								:disabled="activeStore == store.id"
							>
								{{
									activeStore == store.id
										? 'Active Store'
										: 'Change into Active'
								}}
							</button>
						</div>
					</template>
				</template>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import { decryptData, encryptData } from '../../utils/crypto'
import Cookies from 'js-cookie'
import { useAuthStore } from '../../vuex/auth'

const router = useRouter()
const store = useStore()
const authStore = useAuthStore()
// Get Company and Stores
const userdata = decryptData(Cookies.get('userdata'))
const activeStore = userdata.store_id

const companies = ref([])
const fetchStore = async () => {
	try {
		const response = await axiosInstance.get('auth/authorized-store')
		companies.value = response.data.data
	} catch (e) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: 'Failed to fetch stores.',
		})
	}
}

const changeActive = async (storeId) => {
	if (activeStore == storeId) return
	userdata.store_id = storeId
	userdata.company_id = await companies.value.find((company) =>
		company.stores.find((store) => store.id == storeId)
	).id
	await Cookies.set('userdata', encryptData(userdata))
	await authStore.fetchPermissions()
	router.go(0)
}

onMounted(async () => {
	fetchStore()
})
</script>
