<template>
	<!-- Example of QR Scanner -->
	<div>
		<button @click="scanning = true">Scan QR Code</button>

		<!-- QR Scanner Component -->
		<QrScanner
			:show="scanning"
			@close="scanning = false"
			@scanned="handleScan"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QrScanner from '../components/QrScanner.vue'

const scanning = ref(false)

const handleScan = (result: string) => {
	console.log('Scanned Result in Parent:', result)
}
</script>
