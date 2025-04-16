<script setup lang="ts">
import { computed, ref, onMounted, watchEffect } from 'vue'
import { useStore } from 'vuex'
import PageTitle from '../components/PageTitle.vue'
import LineChart from '../components/chart/LineChart.vue'
import axiosInstance from '../axios'
import { formatIDR } from '../utils/common'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const sellPrice = ref(0)
const buyPrice = ref(0)
const startDate = ref('')
const endDate = ref('')
const lastUpdated = ref('')
const salesCount = ref(0)
const salesIncome = ref(0)
onMounted(async () => {
	const today = new Date();
	const tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);

	startDate.value = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
	endDate.value = tomorrow.toISOString().split('T')[0];

	const response = await axiosInstance.get('/finance/current-gold-price');
	console.log('response', response.data);
	if (response.data.success) {
		console.log('success');
		if (response.data.data && Object.keys(response.data.data).length > 0) {
			sellPrice.value = response.data.data.sellPrice;
			buyPrice.value = response.data.data.buyPrice;
			lastUpdated.value = new Date(response.data.data.created_at).toLocaleString('id-ID', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			});
		}
	}
});

const fetchSalesCards = async () => {
	const response = await axiosInstance.get('/finance/sales-cards', {
		params: {
			start_date: startDate.value,
			end_date: endDate.value
		}
	});
	if (response.data.success) {
		salesCount.value = response.data.data.count;
		salesIncome.value = response.data.data.amount;
	}
	console.log('salesCount', salesCount.value);
	console.log('salesIncome', salesIncome.value);
};

watchEffect(async () => {
	if (startDate.value && endDate.value) {
		await fetchSalesCards();
	}
});
</script>

<template>
	<div class="content min-h-screen home" :class="{ 'full-width': smallMenu }">
		<PageTitle />

		<!-- Filters -->
		<div
			class="shadow-md mb-6 bg-white shadow-md rounded-lg md:rounded-full px-4 py-4 text-center md:text-start md:flex justify-center items-center mb-5 md:w-[50%] box-border">
			<div class="md:text-start text-pinkDark w-full md:w-[20%] text-center">
				Filters
			</div>
			<div class="flex gap-3 md:gap-10 flex-col md:flex-row md:w-[80%]">
				<div class="w-full">
					<label for="start-date" class="block  text-gray-500">Start Date</label>
					<input v-model="startDate" type="date" id="start-date" class="w-auto text-gray-700" />
				</div>

				<div class="w-full">
					<label for="end-date" class="block  text-gray-500">End Date</label>
					<input v-model="endDate" type="date" id="end-date" class="w-auto text-gray-700" />
				</div>
			</div>
		</div>

		<!-- Cards -->
		<div class="cards grid grid-cols-1 md:grid-cols-4 gap-6">
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						Rp. {{ formatIDR(sellPrice) }}
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Gold Selling Price
					</p>
					<!-- last updated -->
					<p class="card-title text-center text-gray-500 text-xs mt-2">
						Last Updated: {{ lastUpdated }}
					</p>
				</div>
			</div>
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						Rp. {{ formatIDR(buyPrice) }}
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Gold Buying Price
					</p>
					<!-- last updated -->
					<p class="card-title text-center text-gray-500 text-xs mt-2">
						Last Updated: {{ lastUpdated }}
					</p>
				</div>
			</div>
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						{{ salesCount }}
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Sales
					</p>
				</div>
			</div>
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						Rp. {{ formatIDR(salesIncome) }}
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Sales Revenue
					</p>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
			<LineChart :apiPath="'/finance/gold-price'" :title="'Gold Selling Price'" :startDate="startDate"
				:endDate="endDate" />
			<LineChart :apiPath="'/finance/gold-price'" colData="buyPrice" :title="'Gold Buy Price'" :startDate="startDate"
				:endDate="endDate" />
			<LineChart :apiPath="'/finance/sales-chart'" :title="'Sales'" :startDate="startDate" :endDate="endDate" />
		</div>
	</div>
</template>

<style>
.home input[type='date']:focus {
	outline: none;
}
</style>
