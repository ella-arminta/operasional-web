<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/inventory/stock-out/add' : ''"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/stock-out'"
			:editPath="
				actions.includes('edit') ? '/inventory/stock-out/edit' : ''
			"
			:deletePath="
				actions.includes('delete') ? '/inventory/unstock-out' : ''
			"
			:infoPath="
				actions.includes('detail') ? '/inventory/stock-out/detail' : ''
			"
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
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const columns = ref([
	{ data: 'no', title: 'No', width: '5%' },
	{
		data: 'taken_out_at',
		title: 'Date',
		hidden: true,
		render: (data) => formatDate(data),
	},
	{ data: 'name', title: 'Name', width: '15%' },
	{ data: 'type', title: 'Type' },
	{
		data: 'weight',
		title: 'Weight',
		render: (data) => {
			return `<div class="text-end w-full">${data} gr</div>`
		},
	},
	{
		data: 'price',
		title: 'Price',
		render: (data) => {
			return `<div class="text-end w-full">${formatCurrency(data)}</div>`
		},
	},
	{
		data: 'taken_out_reason',
		title: 'Reason',
		render: (data) => (data == 1 ? 'Repair' : data == 2 ? 'Lost' : 'Other'),
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
