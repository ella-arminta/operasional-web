<template>
	<div class="flex flex-col w-full h-auto text-center text-start">
		<div class="flex items-center gap-1">
			<i class="material-icons text-lg text-pinkMed">{{ icon }}</i>
			<span class="text-md text-pinkMed font-bold">{{ title }}</span>
		</div>
		<div class="text-sm font-light text-gray-400">
			<p>
				{{ text }}
			</p>
		</div>
	</div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
defineProps({
	title: { type: String, required: true },
	icon: { type: String, required: true },
	text: { type: String, required: true },
})
</script>
