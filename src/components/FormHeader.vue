<template>
	<div class="flex items-center justify-between">
		<h1 class="text-xl text-pinkDark">
			{{ title }}
		</h1>
		<div class="flex gap-4">
			<button
				v-if="showResetButton"
				class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
				type="button"
				@click="onReset"
			>
				<i class="material-icons text-md">history</i>
				Reset
			</button>
			<button
				v-if="showSaveButton"
				class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
				type="submit"
			>
				<i class="material-icons text-md">save</i>
				Save
			</button>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	title: {
		type: String,
		required: true,
	},
	showResetButton: {
		type: Boolean,
		default: false,
	},
	showSaveButton: {
		type: Boolean,
		default: true,
	},
})

const emit = defineEmits(['reset'])

const onReset = () => {
	emit('reset')
}
</script>

<style scoped>
/* Add component-specific styles if needed */
</style>
