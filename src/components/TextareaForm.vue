<template>
	<div class="space-y-1 w-full">
		<!-- Label -->
		<label :for="id" class="block text-sm text-gray-900 font-medium">
			{{ label }} <span v-if="required" class="text-pinkDark">*</span>
		</label>

		<!-- Input -->
		<textarea
			:id="id"
			:placeholder="placeholder"
			:readonly="readonly"
			:value="modelValue"
			rows="4"
			@input="$emit('update:modelValue', $event.target.value)"
			class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
			:class="{
				'border-pinkDark': error,
				'border-pinkOrange': !error,
				'placeholder-opacity-50 bg-opacity-25': readonly,
				'text-opacity-100 bg-opacity-100 text-pinkDark': !readonly,
			}"
		></textarea>

		<!-- Error Message -->
		<p v-if="error" class="text-pinkDark text-xs italic">
			{{ error }}
		</p>
	</div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
	modelValue: { type: String, required: true },
	id: { type: String, required: true },
	label: { type: String, required: true },
	placeholder: { type: String, default: '' },
	required: { type: Boolean, default: false },
	error: { type: String, default: '' },
	readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
</script>
