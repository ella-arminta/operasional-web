<template>
	<div class="map-picker">
		<!-- Map Container -->
		<div id="map" class="map"></div>

		<!-- Info -->
		<div class="mt-4">
			<p><strong>Latitude:</strong> {{ selectedLocation.lat }}</p>
			<p><strong>Longitude:</strong> {{ selectedLocation.lng }}</p>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
	defaultLocation: {
		type: Object,
		default: () => ({ lat: -7.2575, lng: 112.7521 }), // Default location (Surabaya)
	},
	current: {
		type: Boolean,
		default: false,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:location'])

const selectedLocation = ref({
	lat: props.defaultLocation.lat,
	lng: props.defaultLocation.lng,
})

// Function to get current location
const getCurrentLocation = () => {
	return new Promise((resolve, reject) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords
					resolve({ lat: latitude, lng: longitude })
				},
				(error) => {
					console.error(
						'Error fetching current location:',
						error.message
					)
					// Default to Surabaya if geolocation fails
					resolve({ lat: -7.2575, lng: 112.7521 })
				}
			)
		} else {
			console.error('Geolocation is not supported by this browser.')
			// Default to Surabaya
			resolve({ lat: -7.2575, lng: 112.7521 })
		}
	})
}

let map = null
let marker = null

const initializeMap = () => {
	// Initialize Leaflet map
	map = L.map('map').setView(
		[selectedLocation.value.lat, selectedLocation.value.lng],
		13
	)

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors',
	}).addTo(map)

	// Add a draggable marker
	marker = L.marker(
		[selectedLocation.value.lat, selectedLocation.value.lng],
		{ draggable: !props.readonly }
	).addTo(map)

	// Update location when marker is dragged
	marker.on('dragend', () => {
		const { lat, lng } = marker.getLatLng()
		selectedLocation.value = { lat, lng }
		emit('update:location', selectedLocation.value)
	})

	// Update location when map is clicked
	map.on('click', (e) => {
		const { lat, lng } = e.latlng
		selectedLocation.value = { lat, lng }
		marker.setLatLng([lat, lng])
		emit('update:location', selectedLocation.value)
	})
}
const resolveLocationAndInitMap = async () => {
	// Fetch the current location if required
	if (props.current) {
		selectedLocation.value = await getCurrentLocation()
	}

	// Once location is resolved, initialize the map
	initializeMap()
}

// Make onMounted async to await current location
onMounted(() => {
	resolveLocationAndInitMap()
})

onBeforeUnmount(() => {
	if (map) {
		map.remove()
	}
})
</script>

<style>
#map {
	height: 50vh;
	width: 100%;
	border-radius: 8px;
	border: 1px solid #ccc;
}
</style>
