<template>
	<div
		@click="triggerFileInput"
		class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
	>
		<div class="flex flex-col items-center justify-center gap-2 min-h-40">
			<img
				v-if="fileUrl"
				:src="fileUrl"
				alt="Preview"
				class="rounded-lg max-h-40 w-auto"
			/>
			<i v-else class="material-icons text-4xl">cloud_upload</i>
			<p class="text-sm">Click to Upload</p>
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

const props = defineProps({
	modelValue: String, // The parent can bind the file URL to this prop
	readonly: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const fileUrl = ref(props.modelValue) // Local file URL state

// Trigger file input click
const triggerFileInput = () => {
	if (!props.readonly) {
		fileInput.value.click()
	}
}

// Handle file input change
const handleFileChange = (event) => {
	const file = event.target.files[0]
	if (file) {
		const reader = new FileReader()
		reader.onload = (e) => {
			fileUrl.value = e.target.result
			emit('update:modelValue', fileUrl.value) // Emit the new value to the parent
		}
		reader.readAsDataURL(file)
	}
}

// Sync props changes with the local state
watch(
	() => props.modelValue,
	(newValue) => {
		fileUrl.value = newValue
	}
)
</script>
