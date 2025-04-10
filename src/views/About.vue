<template>
	<div className></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QrScanner from '../components/QrScanner.vue'

const scanning = ref(false)

const handleScan = (result: string) => {
	console.log('Scanned Result in Parent:', result)
}
</script>
