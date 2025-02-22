<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/transaction/sales/add' : ''"
			:export="false"
			:reload="true"
			:ajaxPath="'/transaction/transaction'"
			:editPath="
				actions.includes('edit') ? '/transaction/sales/edit' : ''
			"
			:deletePath="
				actions.includes('delete') ? '/transaction/transaction' : ''
			"
			:infoPath="
				actions.includes('detail') ? '/transaction/sales/detail' : ''
			"
			:approvePath="'/transaction/transaction-approve'"
			:disapprovePath="'/transaction/transaction-disapprove'"
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
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'code', title: 'Code' },
	{ data: 'date', title: 'Date', render: (data) => formatDate(data) },
	{ data: 'customer', title: 'Customer', render: (data) => data.name },
	{
		data: 'transaction_products',
		title: 'Weight',
		render: (data, type, row) => {
			let weight = 0
			data.map((data) => {
				weight += parseFloat(data.weight)
			})
			return weight + ' gr'
		},
	},
	{
		data: 'transaction_products',
		title: 'Total Item',
		render: (data) => data.length,
		visible: false,
	},
	{
		data: 'sub_total_price',
		title: 'Sub Total',
		render: (data) => formatPrice(parseFloat(data)),
		visible: false,
	},
	{
		data: 'tax_price',
		title: 'Tax',
		render: (data) => formatPrice(parseFloat(data)),
		visible: false,
	},
	{
		data: 'total_price',
		title: 'Total',
		render: (data) => formatPrice(parseFloat(data)),
	},
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
const formatDate = (date) => {
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
	}).format(new Date(date))
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
