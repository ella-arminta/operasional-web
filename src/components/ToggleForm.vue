<template>
	<div class="flex items-center gap-2 justify-between">
		<!-- Label -->
		<label class="block text-sm text-grey-900 font-medium mb-1">
			{{ label }}
		</label>
		<!-- Toggle Button Container -->
		<div @click="toggle" :class="[
			'relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 border border-pinkOrange border-opacity-25',
			active ? 'bg-pinkDark' : 'bg-pinkGray',
			disabled ? 'opacity-25 cursor-default' : '',
		]">
			<!-- Toggle Knob -->
			<div :class="[
				'absolute top-[0.2rem] left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300',
				active ? 'translate-x-6' : 'translate-x-0',
			]"></div>
		</div>
	</div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
	modelValue: {
		type: Boolean,
		required: true,
	},
	label: {
		type: String,
		required: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:modelValue'])

const active = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val),
})

const toggle = () => {
	if (props.disabled) return
	active.value = !active.value
}
</script>
