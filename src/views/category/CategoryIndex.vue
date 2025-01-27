<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/master/category/add'"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/category'"
			:editPath="'/master/category/edit'"
			:deletePath="'/inventory/category'"
			:infoPath="'/master/category/view'"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed } from 'vue'
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'code', title: 'Code', width: '10%' },
	{ data: 'name', title: 'Name', width: '15%' },
	{ data: 'company.name', title: 'Company' },
	{ data: 'purity', title: 'Purity' },
	{ data: 'metal_type', title: 'Metal Type' },
	{ data: 'weight_tray', title: 'Weight Tray' },
	{ data: 'weight_paper', title: 'Weight Paper', visible: false },
	{
		data: 'description',
		title: 'Description',
		orderable: false,
		visible: false,
	},
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]
</script>
