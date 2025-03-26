<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useAuthStore } from '../../vuex/auth'

const columns = [
	{ data: 'code', title: 'No' },
	{
		data: 'trans_date',
		title: 'Date',
		render: (data) => new Date(data).toLocaleDateString(),
		type: 'date',
	},
	{ data: 'account_name', title: 'Account' },
	{ data: 'total', title: 'Total' },
	{ data: 'description', title: 'Description' },
	{ data: 'created_by', title: 'Created By' },
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

const props = defineProps({
	addPath: {
		type: String,
		default: '/finance/mexpenses/add',
	},
	editPath: {
		type: String,
		default: '/finance/mexpenses/edit',
	},
	infoPath: {
		type: String,
		default: '/finance/mexpenses/detail',
	},
	ajaxPath: {
		type: String,
		default: '/finance/uang-keluar-masuk?trans_type_id=1',
	},
	pageTitle: {
		type: String,
		default: 'Miscellaneous Expenses',
	},
})

const filters = ref([])
const router = useRouter()
const authStore = useAuthStore()
const actions = ref([])

onMounted(async () => {
	const accountData = await axiosInstance.get('/finance/account')
	var accountsFormated = accountData.data.data.map((company) => ({
		label: company.name,
		id: company.id,
	}))

	filters.value = [
		{
			type: 'select',
			label: 'Account',
			name: 'account_id',
			options: [{ label: 'All Account', id: '' }, ...accountsFormated],
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
	const currentPath = router.currentRoute.value.path
	const path = authStore.allowedPaths.find(
		(item) => item.path === currentPath
	)
	actions.value = path ? path.action : []
})
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="pageTitle" />
		<TableData
			:columns="columns"
			:addPath="addPath"
			:export="true"
			:reload="true"
			:filters="filters"
			:ajaxPath="ajaxPath"
			:editPath="editPath"
			:options="{
				scrollX: true,
			}"
			:approvePath="'/finance/uang-keluar-masuk-approve'"
			:disapprovePath="
				actions.includes('disapprove')
					? '/finance/uang-keluar-masuk-disapprove'
					: ''
			"
			:deletePath="'/finance/transaction'"
			:infoPath="infoPath"
		/>
	</div>
</template>
