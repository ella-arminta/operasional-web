<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/master/employee/add'"
			:export="false"
			:reload="true"
			:ajaxPath="'/master/employee'"
			:editPath="'/master/employee/edit'"
			:deletePath="'/master/employee'"
			:infoPath="'/master/employee/view'"
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
	{ data: 'name', title: 'Name' },
	{ data: 'email', title: 'Email' },
	{
		data: 'action',
		title: 'Action',
		width: '15%',
		searchable: false,
		orderable: false,
	},
]
</script>
