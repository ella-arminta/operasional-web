<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<MExpensesIndex
			:addPath="'/finance/mincomes/add'"
			:editPath="'/finance/mincomes/edit'"
			:infoPath="'/finance/mincomes/detail'"
			:ajaxPath="'/finance/uang-keluar-masuk?trans_type_id=2'"
			:pageTitle="'Miscellaneous Incomes'"
		/>
	</div>
</template>
<script setup>
import { useStore } from 'vuex'
import { ref, onMounted, computed, render } from 'vue'
import MExpensesIndex from './MExpensesIndex.vue'
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
</script>
