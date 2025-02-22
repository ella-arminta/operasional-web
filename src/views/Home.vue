<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import PageTitle from '../components/PageTitle.vue'
import LineChart from '../components/chart/LineChart.vue'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const sellPrice = ref(0)
const buyPrice = ref(0)
const startDate = ref('')
const endDate = ref('')
</script>

<template>
	<div class="content min-h-screen home" :class="{ 'full-width': smallMenu }">
		<PageTitle />

		<!-- Filters -->
		<div
			class="shadow-md mb-6 bg-white shadow-md rounded-lg md:rounded-full px-4 py-4 text-center md:text-start md:flex justify-start items-center mb-5 md:w-[45%]"
		>
			<div
				class="md:text-start text-pinkDark w-full md:w-[20%] text-center"
			>
				Filters
			</div>
			<div class="flex gap-3 md:gap-10 flex-col md:flex-row md:w-[80%]">
				<div class="w-full">
					<label
						for="start-date"
						class="block md:inline-block text-gray-500"
						>Start Date</label
					>
					<input
						v-model="startDate"
						type="date"
						id="start-date"
						class="w-auto text-gray-700"
					/>
				</div>

				<div class="w-full">
					<label
						for="end-date"
						class="block md:inline-block text-gray-500"
						>End Date</label
					>
					<input
						v-model="endDate"
						type="date"
						id="end-date"
						class="w-auto text-gray-700"
					/>
				</div>
			</div>
		</div>

		<!-- Cards -->
		<div class="cards grid grid-cols-1 md:grid-cols-4 gap-6">
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						Rp. 100.000.100.000
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Gold Selling Price
					</p>
				</div>
			</div>
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						Rp. 100.000.200.000
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Gold Buying Price
					</p>
				</div>
			</div>
			<div class="card w-full bg-white rounded-lg px-4 py-7 shadow-md">
				<div class="card-header">
					<h2 class="text-center text-2xl text-wrap text-pinkDark">
						30
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
						Rp. 100.000.400.000
					</h2>
				</div>
				<div class="card-body mt-2">
					<p class="card-title text-center text-gray-500 text-lg">
						Sales Income
					</p>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
			<!-- <LineChart :apiPath="'/finance/gold-price'" :title="'Gold Selling Price'" :startDate="startDate" :endDate="endDate" />
      <LineChart :apiPath="'/finance/gold-price'" :title="'Sales'" :startDate="startDate" :endDate="endDate" /> -->
			<LineChart
				:apiPath="'/finance/gold-price'"
				:title="'Gold Selling Price'"
				:startDate="startDate"
				:endDate="endDate"
			/>
			<LineChart
				:apiPath="'/finance/gold-price'"
				:title="'Sales'"
				:startDate="startDate"
				:endDate="endDate"
			/>
		</div>
	</div>
</template>

<style>
.home input[type='date']:focus {
	outline: none;
}
</style>
