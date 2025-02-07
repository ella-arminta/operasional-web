<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/settings/role/add'"
			:export="false"
			:reload="true"
			:ajaxPath="'/auth/role'"
			:editPath="'/settings/role/edit'"
			:deletePath="'/auth/role'"
			:infoPath="'/settings/role/view'"
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
	{ data: 'name', title: 'Name', width: '15%' },
	{ data: 'company', title: 'Company', render: (data) => data.name },
	{
		data: 'store',
		title: 'Store',
		render: (data) => {
			if (!data) return 'All'
			return data.name
		},
	},
	{
		data: 'users',
		title: 'Users',
		render: (data) => data.length,
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
