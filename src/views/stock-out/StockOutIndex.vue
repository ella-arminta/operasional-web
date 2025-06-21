<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle title="Stock Out" />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/inventory/stock-out/add' : ''"
			:export="false"
			:reload="true"
			:options="{
				scrollX: true,
			}"
			ref="tableDataRef"
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
			:filters="filters"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import axiosInstance from '../../axios'

const tableDataRef = ref(null)

function handleReload() {
	if (tableDataRef.value) {
		tableDataRef.value.reloadData()
	}
}

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
		data: 'buy_price',
		title: 'Buy Price',
		render: (data) => {
			return `<div class="text-end w-full">${formatCurrency(data)}</div>`
		},
	},
	{
		data: 'taken_out_reason',
		title: 'Reason',
		render: (data) =>
			data == 1
				? 'Repair'
				: data == 2
					? 'Lost'
					: data == 4
						? 'Lost in stock opname'
						: 'Other',
	},
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
		render: function (data, type, row) {
			var htmldata =
				`<div style="display:flex;justify-content: space-around;align-items:center;">` +
				data

			// Kalau repair
			if (row.taken_out_reason == 1) {
				if (row.status == 3){
					htmldata += `<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out approve-repair"
								title="Approve"
								data-id="${row.id}"
								data-title="Approve"
							>
								<i class="material-icons text-sm">check</i>
							</div>`
				} else if (row.status == 0) {
					htmldata = htmldata.replace(
						/<div\s+[^>]*title="Delete"[^>]*>[\s\S]*?<\/div>/g,
						''
					)
					htmldata += `<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out disapprove-repair"
								title="Disapprove"
								data-id="${row.id}"
								data-title="Disapprove"
							>
								<i class="material-icons text-sm">close</i>
							</div>`
							
				} else {
					htmldata = htmldata.replace(
						/<div\s+[^>]*title="Delete"[^>]*>[\s\S]*?<\/div>/g,
						''
					)
				}
			}
			htmldata += '</div>'
			return htmldata
		},
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
onMounted(() => {
	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement
		const button = target.closest('.approve-repair') as HTMLElement
		const disapproveBtn = target.closest('.disapprove-repair') as HTMLElement

		if (button) {
			const id = button.getAttribute('data-id')
			if (id) {
				approveRepair(id)
			}
		}
		if (disapproveBtn) {
			const id = disapproveBtn.getAttribute('data-id')
			if (id) {
				disapproveRepair(id)
			}
		}
	})
})

const approveRepair = (id: string) => {
	console.log(`Approving repair for ID: ${id}`)
	store.dispatch('triggerAlert', {
		type: 'info',
		title: 'Done Repair',
		message:
			'Apakah emas telah selesai diperbaiki dan ingin dikembalikan ke barang siap jual?',
		inputs: [
			{ label: 'Berat terbaru (gram)', model: 'weight', type: 'number' },
			{ label: 'Biaya Perbaikan (Rp)', model: 'expense', type: 'number' },
			{
				label: 'Kas/Bank',
				model: 'account_id',
				type: 'select',
				ajaxOptions: '/finance/account?account_type_id=1',
			},
		],
		actions: [
			{
				label: 'cancel',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
			{
				label: 'proceed',
				type: 'primary',
				handler: async (data) => {
					store.dispatch('triggerAlert', {
						type: 'loading',
						title: 'Processing...',
					})
					axiosInstance
						.post('/inventory/stock-repaired', { ...data, id })
						.then((response) => {
							store.dispatch('hideAlert') // Sembunyikan saat berhasil
							store.dispatch('triggerAlert', {
								type: 'success',
								title: 'Success',
								message: 'Process completed successfully!',
							})
							handleReload()
						})
						.catch((error) => {
							store.dispatch('hideAlert') // Sembunyikan jika gagal
							store.dispatch('triggerAlert', {
								type: 'error',
								title: 'Error',
								message: 'Something went wrong.',
							})
						})
				},
			},
		],
	})
}

const disapproveRepair = (id: string) => {
	console.log(`Disapproving repair for ID: ${id}`)
	store.dispatch('triggerAlert', {
		type: 'warning',
		title: 'Warning!',
		message: `Are you sure you want to disapprove this data?`,
		actions: [
			{
				label: 'cancel',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
			{
				label: 'proceed',
				type: 'primary',
				handler: async () => {
					try {
						const response = await axiosInstance.post(
							`/finance/stock-unrepaired`, { id }
						)
						if (response.data) {
							store.dispatch('triggerAlert', {
								type: 'success',
								title: 'Success!',
								message: 'Data deleted successfully.',
								actions: [
									{
										label: 'close',
										type: 'secondary',
										handler: () => {
											store.dispatch('hideAlert')
											handleReload()
										},
									},
								],
							})
						}
					} catch (error) {
						store.dispatch('triggerAlert', {
							type: 'error',
							title: 'Error!',
							message:
								error.response?.data.message ??
								'Failed to delete data.',
							actions: [
								{
									label: 'close',
									type: 'secondary',
									handler: () => store.dispatch('hideAlert'),
								},
							],
						})
					}
				},
			},
		],
	})
}
const filters = ref([])

// META-ACTIONS RBAC
const router = useRouter()
const authStore = useAuthStore()
const actions = ref([])
const route = useRoute()

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

	if (route.query.code) {
		console.log('Route query code:', route.query.code)
		document.querySelector('input[placeholder="Search..."]').value = route.query.code
		handleReload()
	}

})
</script>
