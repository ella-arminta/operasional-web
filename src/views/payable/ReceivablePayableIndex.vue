<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import { formatDate } from '../../utils/common'
import { formatIDR } from '../../utils/common'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
const columns = [
	{ data: 'no', title: 'No' },
	{
        data: '',
        title: 'Type',
        render: function(data, type, row) {
            return row.account.account_type_id == 3 ? 'Payable' : 'Receivable'
        },
    },
	{
		data: 'payable_receivables.status',
		title: 'Status',
		render: function(data, type, row) {
			if (data == 1) {
				return '<span class="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">Paid</span>';
			} else if (data == 0 && (new Date(row.payable_receivables.due_date) >= new Date() || row.payable_receivables.due_date == null)) {
				return '<span class="inline-block px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">On Progress</span>';
			} else if (data == 0 && new Date(row.payable_receivables.due_date) < new Date()) {
				return '<span class="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">Overdue</span>';
			}
		},
	},
    {
        data: 'account.name',
        title: 'Account',
        render: function(data, type, row) {
            return row.account ? row.account.code + ' - ' + row.account.name : '-'
        },
    },
	{
		data: 'payable_receivables.due_date',
		title: 'Due Date',
		render: (data) => data ? formatDate(data) : 'Not yet set',
	},
	{ data: 'amount', title: 'Amount Payable/Receivable', render: (data) => 'Rp. ' + formatIDR(data) },
	{
		data: 'payable_receivables.amount_paid',
		title: 'Paid Amount',
		render: (data) => 'Rp. ' + formatIDR(data),
	},
	{
		data: 'trans_date',
		title: 'Transaction Date',
		render: (data) => formatDate(data),
	},
   
	{ data: 'code', title: 'Transaction Code', render: function( data, type, row) {
            return data;
        } 
    },
	{ data: 'trans_type.name', title: 'Transaction Type' },
	{ data: 'description', title: 'Description' },
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
	// ALL TRANSACTION TYPE
	var transTypeFormated = [
        { label: 'Receivable', id: 4 },
        { label: 'Payable', id: 3 },
    ]
    
	filters.value = [
        {
			type: 'date',
			label: 'Start Due Date',
			name: 'start_date',
		},
		{
			type: 'date',
			label: 'End Due Date',
			name: 'end_date',
		},
		{
			type: 'select',
			label: 'Store',
			name: 'store_id',
			options: [{ label: 'All Store', id: '' }, ...storesFormated],
		},
		{
			type: 'select',
			label: 'Type',
			name: 'trans_type_id',
			options: [{ label: 'All Type', id: null }, ...transTypeFormated],
		},
		{
			type: 'select',
			label: 'Status',
			name: 'status',
			options: [
				{ label: 'Paid', id: 1 },
				{ label: 'On Progress', id: 2 },
				{ label: 'Overdue', id: 3, overdue: true },
			],
			multiple: true,
			placeholder: 'Select Status',
			value: [2,3],
		}
	]
})
// META-ACTIONS RBAC
const router = useRouter()
const authStore = useAuthStore()
const actions = ref([])
onMounted(() => {
	const currentPath = router.currentRoute.value.path
	const path = authStore.allowedPaths.find(
		(item) => item.path === currentPath
	)
	actions.value = path ? path.action : []
})
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="'List of Receivables and Payable'" />
		<!-- <TableData
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
		/> -->
        <TableData
			:columns="columns"
			:reload="true"
			:editPath="actions.includes('edit') ? '/finance/receivable-payable/edit' : ''"
			:filters="filters"
			:ajaxPath="'/finance/receivable-payable'"
			:options="{
				scrollX: true,
			}"
		/>
	</div>
</template>
