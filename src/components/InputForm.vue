<template>
	<div class="space-y-1 w-full">
		<!-- Label -->
		<label :for="id" class="block text-sm text-gray-900 font-medium">
			{{ label }} <span v-if="required" class="text-pinkDark">*</span>
			<!-- edit -->
			<router-link
				v-if="editPath !== ''"
				:to="editPath"
				class="material-icons text-sm text-pinkDark"
				>edit</router-link
			>
		</label>

		<!-- Input -->
		<input
			:id="id"
			:type="type"
			:placeholder="placeholder"
			:readonly="readonly"
			v-model="inputValue"
			@input="onInput"
			@blur="onBlur"
			@focus="onFocus"
			class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
			:class="{
				'border-pinkDark': error,
				'border-pinkOrange': !error,
				'placeholder-opacity-50 bg-opacity-25': readonly,
				'text-opacity-100 bg-opacity-100 text-pinkDark': !readonly,
			}"
			@keypress.enter.prevent
		/>

		<!-- Error Message -->
		<p v-if="error" class="text-pinkDark text-xs italic">
			{{ error }}
		</p>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatIDR, formatDate } from '../utils/common'

const props = defineProps({
	modelValue: { type: [String, Number, null], required: true },
	id: { type: String, required: true },
	type: { type: String, default: 'text' },
	label: { type: String, required: true },
	placeholder: { type: String, default: '' },
	required: { type: Boolean, default: false },
	error: { type: String, default: '' },
	readonly: { type: Boolean, default: false },
	editPath: { type: String, default: '' },
	format: { type: String, default: 'text' }, // 'currency', 'date', 'percent'
})

const emit = defineEmits(['update:modelValue'])
const inputValue = ref(props.modelValue || '')

// Watch modelValue to keep inputValue in sync externally
watch(
	() => props.modelValue,
	(newValue) => {
		inputValue.value = formatValue(newValue)
	}
)

// Format input value based on type
var onFirstCurrencyNumber = true;
const formatValue = (value) => {
	if (!value) return ''
	// if (props.format === 'currency') return formatIDR(value)
	if (props.format === 'currency') {
		// kalo isinya bukan 0, bukal null dan bukan undefined atau bukan ''
		if (value != 0 && value != null && value != undefined && value != '' && onFirstCurrencyNumber) {
			onFirstCurrencyNumber  = false
			return formatIDR(value)
		} 
	}
	if (props.format === 'date') return formatDate(value)
	if (props.format === 'percent') return value
	return value
}

// Handle user input dynamically
const onInput = (event) => {
	let rawValue = event.target.value

	if (props.format === 'currency') {
		// rawValue = rawValue.replace(/\D/g, '')
		// inputValue.value = formatIDR(rawValue)
	} else if (props.format === 'percent') {
		// ✅ Replace all `,` and `.` with a single `.`
		rawValue = rawValue.replace(/[\,\.]+/g, '.')

		// ✅ Ensure only one decimal point remains
		const parts = rawValue.split('.')
		if (parts.length > 2) {
			rawValue = parts.shift() + '.' + parts.join('')
		}

		// ✅ If user is typing (e.g., "2."), allow it without conversion
		if (rawValue.endsWith('.')) {
			inputValue.value = rawValue
			emit('update:modelValue', rawValue)
			return
		}

		// ✅ Convert to float and enforce min/max (0-100)
		let numericValue = parseFloat(rawValue)

		if (!isNaN(numericValue)) {
			numericValue = Math.min(Math.max(numericValue, 0), 100)
			inputValue.value = numericValue.toString() // Keep it as a string for input
			rawValue = numericValue.toString()
		} else {
			inputValue.value = rawValue
		}
	} else {
		inputValue.value = rawValue
	}
	emit('update:modelValue', rawValue)
}
const onBlur = () => {
	if (props.format === 'currency') {
		inputValue.value = formatIDR(inputValue.value)
	}
}
const onFocus = () => {
	if (props.format === 'currency') {		
		const numberValue = formatIDR(inputValue.value, true)
		inputValue.value = numberValue
	}
}
</script>
