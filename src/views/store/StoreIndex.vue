<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/master/store/add'"
			:export="false"
			:reload="true"
			:ajaxPath="'/master/store'"
			:editPath="'/master/store/edit'"
			:deletePath="'/master/store'"
			:infoPath="'/master/store/view'"
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
	{ data: 'npwp', title: 'Npwp' },
	{ data: 'open_date', title: 'Open Date', visible: false },
	{ data: 'address', title: 'Address', orderable: false, visible: true },
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
