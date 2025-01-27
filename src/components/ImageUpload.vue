<template>
	<div
		@click="triggerFileInput"
		class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25 cursor-pointer"
	>
		<div
			v-if="loading"
			class="flex items-center justify-center gap-2 min-h-40"
		>
			<i class="material-icons text-4xl animate-spin">refresh</i>
			<p class="text-sm">Uploading...</p>
		</div>
		<div
			v-else
			class="flex flex-col items-center justify-center gap-2 min-h-40"
		>
			<img
				v-if="preview"
				:src="preview"
				alt="Preview"
				class="rounded-lg max-h-40 w-auto"
			/>
			<i v-else class="material-icons text-4xl">cloud_upload</i>
			<p class="text-sm">
				{{ preview ? 'Successfully Uploaded' : 'Click to Upload' }}
			</p>
		</div>
	</div>
	<input
		type="file"
		accept="image/*"
		@change="handleFileChange"
		ref="fileInput"
		class="hidden"
	/>
</template>

<script setup>
import { ref, watch } from 'vue'
import axiosInstance from '../axios'

// Define props
const props = defineProps({
	modelValue: {
		type: String, // Expect the file object from the parent
		default: '',
	},
	readonly: {
		type: Boolean,
		default: false,
	},
})

// Define events
const emit = defineEmits(['update:modelValue'])

// Local refs
const fileInput = ref(null)
const preview = ref('') // For previewing the image
const loading = ref(false) // For loading state

// Trigger file input click
const triggerFileInput = () => {
	if (!props.readonly) {
		fileInput.value.click()
	}
}

const baseUrl = import.meta.env.VITE_BASE_URL

// Handle file input change
const handleFileChange = async (event) => {
	const file = event.target.files[0]
	if (file) {
		try {
			// Create FormData and append the file
			const formData = new FormData()
			formData.append('file', file)

			// Delete the existing file (if any) before uploading a new one
			if (props.modelValue && typeof props.modelValue === 'string') {
				await axiosInstance.delete('/delete-image', {
					params: { url: props.modelValue },
				})
			}

			// Loading State
			loading.value = true

			// Upload the new file
			const response = await axiosInstance.post(
				'/upload-logo',
				formData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				}
			)

			// Loading State
			loading.value = false

			// Get uploaded file URL from response
			const uploadedUrl = response.data.data.path

			// Emit the uploaded URL to the parent component
			emit('update:modelValue', uploadedUrl)
		} catch (error) {
			console.error('File upload failed:', error)
		}
	}
}

// Watch `modelValue` to update the preview when it changes from the parent
watch(
	() => props.modelValue,
	(newValue) => {
		console.log('NewValue of modelValue', newValue)
		if (newValue instanceof File) {
			// If it's a File instance, create a preview
			const reader = new FileReader()
			reader.onload = (e) => {
				preview.value = e.target.result
			}
			reader.readAsDataURL(newValue)
		} else if (typeof newValue === 'string' && newValue) {
			// If it's a URL, directly use it as the preview
			preview.value = baseUrl + '/' + newValue
		} else {
			// If null or other types, clear the preview
			preview.value = ''
		}
	},
	{ immediate: true } // Sync immediately on mount
)
</script>

<style scoped>
.min-h-40 {
	min-height: 10rem; /* Adjust as needed */
}
.cursor-pointer {
	cursor: pointer;
}
</style>
