<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="
				actions.includes('add') ? '/inventory/stock-opname/add' : ''
			"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/stock-opname'"
			:editPath="
				actions.includes('edit') ? '/inventory/stock-opname/edit' : ''
			"
			:deletePath="
				actions.includes('delete') ? '/inventory/stock-opname' : ''
			"
			:infoPath="
				actions.includes('detail')
					? '/inventory/stock-opname/detail'
					: ''
			"
			:approvePath="
				actions.includes('approve')
					? '/inventory/stock-opname-approve'
					: ''
			"
			:disapprovePath="
				actions.includes('disapprove')
					? '/inventory/stock-opname-disapprove'
					: ''
			"
			:filters="filters"
			:options="{
				scrollX: true,
			}"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import axiosInstance from '../../axios'
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const columns = ref([
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'date', title: 'Date', render: (data) => formatDate(data) },
	{
		data: 'category',
		title: 'Category',
		render: (data) => `${data.code} - ${data.name}`,
	},
	{
		data: 'store',
		title: 'Store',
		render: (data) => `${data.code} - ${data.name}`,
	},
	{
		data: 'status',
		title: 'Status',
		render: (data) => (data == 0 ? 'Draft' : 'Done'),
	},
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
])
const formatCurrency = (value) => {
	if (!value) return ''
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
	}).format(value)
}
const formatDate = (date) => {
	if (!date) return ''
	return new Date(date).toISOString().split('T')[0] // Extract only the date part
}
const filters = ref([])

// META-ACTIONS RBAC
const router = useRouter()
const authStore = useAuthStore()
const actions = ref([])
onMounted(async () => {
	const currentPath = router.currentRoute.value.path
	const path = authStore.allowedPaths.find(
		(item) => item.path === currentPath
	)
	actions.value = path ? path.action : []

	// Set filters
	const category = await axiosInstance.get('/inventory/category')
	const categoryFormated = category.data.data.data.map((category) => ({
		label: category.name,
		id: category.id,
	}))
	filters.value = [
		{
			type: 'selectRangeFinance',
			label: 'Date Range',
			name: 'date_range',
		},
		{
			type: 'select',
			label: 'Category',
			name: 'category_id',
			options: [
				{ label: 'All Category', value: '' },
				...categoryFormated,
			],
		},
	]
})
</script>
