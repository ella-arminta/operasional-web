<template>
	<hr :class="'mt-4 border-t border-' + accentColor + ' border-opacity-25'" />
	<div :class="'flex items-center my-1 ml-2 text-' + color">
		<i class="material-icons text-xl">{{ icon }}</i>
		<h4 class="text-md font-light ml-2">{{ title }}</h4>
	</div>
	<hr :class="'mb-4 border-t border-' + accentColor + ' border-opacity-25'" />
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
defineProps({
	title: { type: String, required: true },
	icon: { type: String, required: true },
	color: { type: String, default: 'pinkDark' },
	accentColor: { type: String, default: 'pinkOrange' },
})
</script>
