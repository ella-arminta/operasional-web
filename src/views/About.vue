<template>
	<div class="parent-container">
		<!-- Button to Open Modal -->
		<button
			class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
			@click="openModal"
		>
			Select Location
		</button>

		<!-- Modal Mappicker -->
		<div
			v-if="showModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition duration-300"
			@click.self="closeModal"
		>
			<div
				class="bg-white w-3/4 h-3/4 rounded-lg shadow-lg relative overflow-hidden"
			>
				<!-- Modal Header -->
				<div class="flex justify-between items-center p-4 border-b">
					<h2 class="text-xl font-bold">Select a Location</h2>
					<button
						class="text-gray-500 hover:text-gray-800"
						@click="closeModal"
					>
						&times;
					</button>
				</div>

				<!-- Modal Body -->
				<div class="p-4 h-auto">
					<MapPicker
						:defaultLocation="location"
						@update:location="updateLocation"
					/>
				</div>

				<!-- Modal Footer -->
				<div class="flex justify-end p-4 border-t">
					<button
						class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 mr-2"
						@click="closeModal"
					>
						Cancel
					</button>
					<button
						class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
						@click="saveLocation"
					>
						Save
					</button>
				</div>
			</div>
		</div>

		<!-- Display Selected Location -->
		<div class="mt-4">
			<p><strong>Selected Latitude:</strong> {{ location.lat }}</p>
			<p><strong>Selected Longitude:</strong> {{ location.lng }}</p>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import MapPicker from '../components/MapPicker.vue'

const location = ref({ lat: -7.2575, lng: 112.7521 }) // Default location (Surabaya)
const prevLocation = ref({ lat: -7.2575, lng: 112.7521 }) // Default location (Surabaya)
const showModal = ref(false)

const openModal = () => {
	showModal.value = true
}

const updateLocation = (newLocation) => {
	location.value = newLocation
}

const saveLocation = () => {
	showModal.value = false
	prevLocation.value = location.value
}

const closeModal = () => {
	showModal.value = false
	location.value = prevLocation.value
}
</script>

<style>
/* Modal Styling */
.parent-container {
	margin: 20px;
}

button {
	cursor: pointer;
}
</style>
