<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/inventory/product/add' : ''"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/product'"
			:editPath="
				actions.includes('edit') ? '/inventory/product/edit' : ''
			"
			:deletePath="actions.includes('delete') ? '/inventory/product' : ''"
			:infoPath="
				actions.includes('detail') ? '/inventory/product/detail' : ''
			"
			:options="{
				scrollX: true,
				fixedColumns: { start: 0, end: 0 },
			}"
			:filters="filters"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, onMounted, ref, render } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import axiosInstance from '../../axios'
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'code', title: 'Code' },
	{ data: 'name', title: 'Name' },
	{
		data: 'type',
		title: 'Category',
		render: (data) => {
			return `${data.category.code} - ${data.category.name}`
		},
	},
	{
		data: 'type',
		title: 'Type',
		render: (data) => {
			return `${data.code} - ${data.name}`
		},
		visible: false,
	},
	{
		data: 'product_codes',
		title: 'In Stock',
		render: (data) => {
			return data.filter((data) => data.status === 0).length
		},
	},
	{
		data: 'product_codes',
		title: 'Sold',
		render: (data) => {
			return data.filter((data) => data.status > 0).length
		},
	},
	{
		data: 'product_codes',
		title: 'Avg. Price',
		render: (data) => {
			const total = data.reduce(
				(acc, curr) => acc + (parseFloat(curr.fixed_price) ?? 0),
				0
			)
			return formatPrice(total / (data.length > 0 ? data.length : 1))
		},
		visible: false,
	},
	{
		data: 'product_codes',
		title: 'In Stock Weight',
		render: (data) => {
			const total = data
				.filter((data) => data.status === 0)
				.reduce((acc, curr) => acc + (parseFloat(curr.weight) ?? 0), 0)
			return `${total} gr`
		},
	},
	{
		data: 'product_codes',
		title: 'Sold Weight',
		render: (data) => {
			const total = data
				.filter((data) => data.status > 0)
				.reduce((acc, curr) => acc + (parseFloat(curr.weight) ?? 0), 0)
			return `${total} gr`
		},
	},
	{ data: 'description', title: 'Description', visible: false },
	// { data: 'images', title: 'images', visible: false },
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]
const formatPrice = (price) => {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
	}).format(price)
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
			label: 'Category',
			name: 'category_id',
			type: 'select',
			options: [
				{ label: 'All Category', value: '' },
				...categoryFormated,
			],
		},
	]
})
</script>
