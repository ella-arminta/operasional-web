<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'

const columns = [
	{ data: 'no', title: 'No' },
	{ data: 'store.name', title: 'Store' },
	{ data: 'recurring_period.name', title: 'Period' },
	{ data: 'trans_type.name', title: 'Type' },
	{ data: 'description', title: 'Description' },
	{
		data: 'trans_start_date',
		title: 'Start Date',
		render: (data) => new Date(data).toLocaleDateString(),
	},
	{
		data: 'trans_last_date',
		title: 'Last Date',
		render: (data) =>
			data != null ? new Date(data).toLocaleDateString() : '-',
	},
	// TODO LIST ACTIVE NOT ACTIVE
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
		hiddenExport: true,
	},
]
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

const filters = ref([])

onMounted(async () => {
	// ALL STORE
	const storeData = await axiosInstance.get('/master/store')
	var storesFormated = storeData.data.data.map((store) => ({
		label: store.name,
		id: store.id,
	}))
	// ALL PERIOD
	const periodData = await axiosInstance.get('/finance/recurring-period')
	var periodFormated = periodData.data.data.map((period) => ({
		label: period.name,
		id: period.code,
	}))
	// ALL TRANSACTION TYPE
	const transTypeData = await axiosInstance.get('/finance/trans-type')
	var transTypeFormated = transTypeData.data.data.map((transType) => ({
		label: transType.name,
		id: transType.id,
	}))

	filters.value = [
		{
			type: 'select',
			label: 'Store',
			name: 'store_id',
			options: [{ label: 'All Store', id: '' }, ...storesFormated],
		},
		{
			type: 'select',
			label: 'Period',
			name: 'recurring_period_code',
			options: [{ label: 'All Period', id: '' }, ...periodFormated],
		},
		{
			type: 'select',
			label: 'Type',
			name: 'trans_type_id',
			options: [{ label: 'All Type', id: '' }, ...transTypeFormated],
		},
		{
			type: 'date',
			label: 'Start Date',
			name: 'start_date',
		},
		{
			type: 'date',
			label: 'End Date',
			name: 'end_date',
		},
	]
})
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="'List of Recurring Income/Expense'" />
		<TableData
			:columns="columns"
			:addPath="'/finance/recurring/add'"
			:reload="true"
			:filters="filters"
			:ajaxPath="'/finance/recurring'"
			:editPath="'/finance/recurring/edit'"
			:deletePath="'/finance/recurring'"
			:infoPath="'/finance/recurring/detail'"
		/>
	</div>
</template>
