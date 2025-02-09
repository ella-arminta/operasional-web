<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import TableDataGroup from '../../components/TableDataGroup.vue'

const columns = [
	{ data: 'code', title: 'Journal Entry', visible: false },
	{ data: 'name', title: 'Date' },
	{ data: 'debit', title: 'Account' },
	{ data: 'credit', title: 'Label' },
	{ data: 'balance', title: 'Debit' },
	{ data: 'credit', title: 'Credit' },
]
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

const filters = ref([])
const ajaxPath = ref('/finance/journal')
onMounted(async () => {
	filters.value = [
		{
			type: 'selectRangeFinance',
			label: 'Range',
			name: 'range',
		},
	]
})
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle />

		<TableDataGroup
			:columns="columns"
			:reload="true"
			:export="true"
			:filters="filters"
			:ajaxPath="ajaxPath"
			:infoPath="'/finance/journal/detail'"
			:infoLabel="'Buku besar'"
		/>
	</div>
</template>
