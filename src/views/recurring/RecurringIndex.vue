<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import { formatDate } from '../../utils/common'

const columns = [
	{ data: 'no', title: 'No' },
	{ data: 'store.name', title: 'Store' },
	{ data: 'recurringType', title: 'Recurring Period', render: function(data, type, row, meta) {
		const interval = row.interval != 1 ? row.interval : '';
		return `Every ${interval} ${data}(s)`
	} },
	{ data: 'trans_type.name', title: 'Type' },
	{ data: 'description', title: 'Description' },
	{
		data: 'startDate',
		title: 'Start Date',
		render: (data) => formatDate(data),
	},
	{
		data: 'endDate',
		title: 'End Date',
		render: (data) =>
			data != null ? formatDate(data) : '-',
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
	var storesFormated = storeData.data.data.data.map((store) => ({
		label: store.name,
		id: store.id,
	}))
	// ALL PERIOD
	const periodData = await axiosInstance.get('/finance/recurring-period')
	console.log('this is periodData',periodData);
	var periodFormated = periodData.data.data.map((period) => ({
		label: period,
		id: period,
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
			label: 'Recurring Period',
			name: 'recurringType',
			options: [{ label: 'All Period', id: '' }, ...periodFormated],
		},
		{
			type: 'select',
			label: 'Type',
			name: 'trans_type_id',
			options: [{ label: 'All Type', id: null }, ...transTypeFormated],
		},
		{
			type: 'date',
			label: 'Start Date',
			name: 'startDate',
		},
		{
			type: 'date',
			label: 'End Date',
			name: 'endDate',
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
			:options="{
				scrollX: true,
			}"
		/>
	</div>
</template>
