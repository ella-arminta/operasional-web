<template>
	<teleport to="#modal-container">
		<div
			v-if="show"
			class="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 transition duration-300"
		>
			<div
				class="bg-white w-3/4 h-auto rounded-lg shadow-lg relative overflow-hidden"
			>
				<!-- Modal Header -->
				<div class="flex justify-between items-center p-4 border-b">
					<h2 class="text-xl font-bold">SCANNING</h2>
					<button
						class="text-pinkMed text-2xl hover:text-pinkDark transition duration-300 ease-in-out"
						@click="closeScanner"
					>
						&times;
					</button>
				</div>
				<div class="p-12 h-auto">
					<qrcode-stream
						@detect="onDecode"
						@init="onInit"
						class="rounded-lg"
					></qrcode-stream>
				</div>
				<div class="flex justify-end p-4 border-t">
					<button
						class="px-4 py-2 bg-pinkLight text-PinkDark rounded-lg hover:bg-pinkMed mr-2 transition duration-300 ease-in-out"
						@click="closeScanner"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'

// Define props
defineProps<{ show: boolean }>()

// Define emits
const emit = defineEmits<{
	(event: 'close'): void
	(event: 'scanned', result: string): void
}>()

// Handle QR Code scan result
const onDecode = (detectedCodes) => {
	if (detectedCodes.length > 0) {
		const result = detectedCodes[0]?.rawValue || ''
		console.log('Scanned QR Code:', result)
		emit('scanned', result) // Emit scanned result
		closeScanner()
	}
}

// Handle scanner errors
const onInit = (promise: Promise<void>) => {
	promise.catch((error) => {
		console.error('QR Scanner initialization error:', error)
		closeScanner()
	})
}

// Close scanner
const closeScanner = () => {
	emit('close')
}
</script>
