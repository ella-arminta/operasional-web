<template>
	<div class="content min-h-screen">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/master/company/add'"
			:export="false"
			:reload="true"
			:ajaxPath="'/master/company'"
			:editPath="'/master/company/edit'"
			:deletePath="'/master/company'"
			:infoPath="'/master/company/view'"
		/>
	</div>
</template>

<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'

const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'code', title: 'Code', width: '10%' },
	{ data: 'name', title: 'Name' },
	{ data: 'description', title: 'Description', orderable: false },
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]
</script>
