<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="'Stock Opname'" />
		<form
			class="w-full bg-white p-4 rounded-lg shadow-md"
			@submit.prevent="submit"
		>
			<FormHeader
				title="Stock Opname Form"
				:showSaveButton="mode !== 'detail'"
			/>
			<FormSectionHeader title="Form" icon="info" />
			<div class="space-y-3">
				<div
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full"
				>
					<!-- Date -->
					<div>
						<InputForm
							v-model="formattedDate"
							id="date"
							type="date"
							label="Date"
							placeholder="Date"
							:readonly="mode === 'detail'"
							:error="formError.date"
							required
						/>
					</div>

					<!-- Category Dropdown -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-gray-900 font-medium mb-1"
						>
							Categories<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="categories"
							v-model="form.category_id"
							placeholder="Select a Category"
							:multiple="false"
							:searchable="true"
							:disabled="mode !== 'add'"
						/>
						<p
							v-if="formError.category_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.category_id }}
						</p>
					</div>
					<div v-if="mode !== 'add'">
						<label
							for="dropdown"
							class="block text-sm text-gray-900 font-medium mb-1"
						>
							Status<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="statuses"
							v-model="form.status"
							placeholder="Select a Status"
							:multiple="false"
							:searchable="false"
							:disabled="mode !== 'edit'"
						/>
						<p
							v-if="formError.status"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.status }}
						</p>
					</div>
				</div>

				<!-- Product Code + Buttons -->
				<div
					v-if="mode === 'edit'"
					class="col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full"
				>
					<!-- Product Code Input -->
					<div>
						<InputForm
							v-model="code"
							id="code"
							label="Input Product Code"
							placeholder="Product Code"
							required
							:readonly="false"
							@keypress.enter.prevent="scanProduct(true)"
						/>
					</div>

					<!-- Submit Manual Button -->
					<div class="flex flex-col items-start justify-end">
						<p class="text-pinkDark text-sm mt-2">
							<span>*</span>For submission without scanning QR
						</p>
						<button
							type="button"
							class="w-full bg-pinkDark text-white hover:bg-pinkOrange font-bold py-2 px-4 rounded-lg"
							@click="scanProduct(true)"
						>
							Submit Manual
						</button>
					</div>

					<!-- Scan QR Button -->
					<div class="flex flex-col items-start justify-end">
						<p class="text-pinkDark text-sm">
							<span>*</span>Use Camera Access For Scan QR
						</p>
						<button
							type="button"
							class="w-full bg-pinkDark text-white hover:bg-pinkOrange font-bold py-2 px-4 rounded-lg"
							@click="scanning = true"
						>
							Scan QR
						</button>
					</div>
				</div>
			</div>
			<template v-if="mode !== 'add'">
				<FormSectionHeader title="Item Details" icon="tab" />
				<div class="rounded-lg overflow-x-auto">
					<table
						class="shadow-xl border-none w-full h-full rounded-lg overflow-hidden"
					>
						<thead class="bg-pinkDark border-none rounded-t-lg">
							<tr>
								<th
									class="px-4 py-2 text-start text-white"
									v-for="column in itemColumns.filter(
										(column) => !column.hidden
									)"
									:key="column.key"
								>
									{{ column.label }}
								</th>
							</tr>
						</thead>
						<tbody class="rounded-b-lg overflow-hidden">
							<tr
								v-for="(item, index) in productCodes"
								:key="index"
								:class="{
									'bg-white': index % 2 === 0,
									'bg-pinkGray': index % 2 !== 0,
								}"
							>
								<td
									v-for="column in itemColumns.filter(
										(column) => !column.hidden
									)"
									:key="column.key"
								>
									<div
										class="px-4 py-2 w-full h-full flex flex-col items-start"
									>
										<div v-if="column.key !== 'scanned'">
											{{ item[column.key] }}
										</div>

										<!-- Toggle Switch for 'scanned' column -->
										<div v-else class="flex items-center">
											<label
												class="relative inline-flex items-center cursor-pointer"
											>
												<input
													type="checkbox"
													:checked="item[column.key]"
													:disabled="
														mode === 'detail'
													"
													@change="
														toggleScanned(item)
													"
													class="sr-only"
												/>
												<div
													:class="[
														'min-w-11 min-h-6 w-11 h-6 rounded-full transition-colors duration-200 ease-in-out',
														item['status'] == 2
															? 'bg-gray-300 cursor-not-allowed'
															: item[column.key]
																? 'bg-green-500'
																: 'bg-red-400',
													]"
												>
													<div
														:class="[
															'min-w-4 min-h-4 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out mt-1 ml-1',
															item[column.key]
																? 'translate-x-5'
																: 'translate-x-0',
														]"
													></div>
												</div>
												<span
													:class="[
														'ml-3 text-sm font-medium',
														item['status'] == 2
															? 'text-gray-500'
															: item[column.key]
																? 'text-green-600'
																: 'text-red-600',
													]"
												>
													{{
														item['status'] == 1 &&
														!item['scanned']
															? 'Sold Out'
															: item[column.key]
																? 'Yes'
																: 'No'
													}}
												</span>
											</label>
										</div>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</template>
		</form>
	</div>
	<!-- QR Scanner Component -->
	<QrScanner
		:show="scanning"
		@close="scanning = false"
		@scanned="handleScan"
	/>
</template>
<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import FormHeader from '../../components/FormHeader.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import InputForm from '../../components/InputForm.vue'
import Dropdown from '../../components/Dropdown.vue'
import QrScanner from '../../components/QrScanner.vue'
import axiosInstance from '../../axios'
const store = useStore()
const router = useRouter()
const smallMenu = computed(() => store.getters.smallMenu)

const props = defineProps({
	mode: {
		type: String,
		required: true,
	},
})

const scanning = ref(false)

const categories = ref([])
const statuses = Object.freeze([
	{ id: 0, label: 'Draft' },
	{ id: 1, label: 'Done' },
])
const productCodes = ref([])
const id = router.currentRoute.value.params.id

const getCategories = async () => {
	const response = await axiosInstance.get('/inventory/category')
	categories.value = [
		...response.data.data.data.map((category) => {
			return {
				id: category.id,
				label: `${category.code} - ${category.name}`,
			}
		}),
	]
}

const form = ref({
	date: '',
	category_id: '',
	description: '',
	status: [0],
	approved: false,
	details: [],
})

const formError = ref({
	date: '',
	category_id: '',
	description: '',
	status: '',
	approved: '',
	details: [],
})

const code = ref('')

const itemColumns = Object.freeze([
	{ key: 'id', label: 'id', type: 'text', hidden: true },
	{ key: 'code', label: 'Code', type: 'text', width: '15%', readonly: true },
	{ key: 'name', label: 'Name', type: 'text', width: '15%', readonly: true },
	{ key: 'type', label: 'Type', type: 'text', readonly: true },
	{ key: 'weight', label: 'Weight', type: 'text', readonly: true },
	{ key: 'statusLabel', label: 'Status', type: 'text', readonly: true },
	{ key: 'scanned', label: 'Scanned', type: 'text', readonly: true },
])

const handleScan = (result) => {
	console.log('Scanned Result in Parent:', result)
	code.value = result.split(';')[0]
	scanProduct(true)
}

const scanProduct = async (scanned: bool) => {
	try {
		const data = code.value
		console.log(form.value.codes)
		if (!data) {
			throw new Error('Code is required')
		}
		if (!productCodes.value.find((product) => product.code === data)) {
			throw new Error('Product not in this category!')
		}
		if (
			productCodes.value.find((product) => product.code === data).scanned
		) {
			throw new Error('Product already Scanned!')
		}
		if (
			productCodes.value.find(
				(product) =>
					product.code === data &&
					!product.scanned &&
					product.status == 1
			)
		) {
			const result = await store.dispatch('triggerConfirm', {
				type: 'confirm',
				title: 'Confirmation',
				message:
					'The item already Sold, are you sure it is in the stock?',
			})
			if (!result) {
				store.dispatch('triggerAlert', {
					message: 'Action cancelled!',
					type: 'info',
					title: 'Cancel',
				})
				code.value = ''
				return
			}
		}
		if (
			productCodes.value.find(
				(product) =>
					product.code === data &&
					!product.scanned &&
					product.status == 3
			)
		) {
			const result = await store.dispatch('triggerConfirm', {
				type: 'confirm',
				title: 'Confirmation',
				message:
					'The item already taken out, are you sure it is in the stock?',
			})
			if (!result) {
				store.dispatch('triggerAlert', {
					message: 'Action cancelled!',
					type: 'info',
					title: 'Cancel',
				})
				code.value = ''
				return
			}
		}
		const p_id = productCodes.value.find((p) => p.code == data).id
		const response = await axiosInstance.put(
			`/inventory/stock-opname-detail/${router.currentRoute.value.params.id}`,
			{
				product_code_id: p_id,
				scanned: true,
			}
		)
		if (!response.data.success) {
			throw new Error(response.data.message)
		}
		store.dispatch('triggerAlert', {
			message: 'Successfully scanned product',
			title: 'Success',
			type: 'success',
		})
		productCodes.value.find((pc) => pc.code === data).scanned = true
		code.value = ''
	} catch (error) {
		store.dispatch('triggerAlert', {
			message: error.response?.data?.message ?? error.message,
			type: 'error',
			title: 'Error',
		})
		code.value = ''
	}
}

const toggleScanned = async (item) => {
	console.log(item)
	// Don't allow toggling if item is sold out
	if (item.status == 1 && !item.scanned) {
		const result = await store.dispatch('triggerConfirm', {
			type: 'confirm',
			title: 'Confirmation',
			message: 'The item already Sold, are you sure it is in the stock?',
		})
		if (!result) {
			store.dispatch('triggerAlert', {
				message: 'Action cancelled!',
				type: 'info',
				title: 'Cancel',
			})
			return
		}
	}

	if (item.status == 3 && !item.scanned) {
		const result = await store.dispatch('triggerConfirm', {
			type: 'confirm',
			title: 'Confirmation',
			message:
				'The item already Taken Out, are you sure it is in the stock?',
		})
		if (!result) {
			store.dispatch('triggerAlert', {
				message: 'Action cancelled!',
				type: 'info',
				title: 'Cancel',
			})
			return
		}
	}

	// Call API
	try {
		const response = await axiosInstance.put(
			`/inventory/stock-opname-detail/${router.currentRoute.value.params.id}`,
			{
				product_code_id: item.id,
				scanned: !item.scanned,
			}
		)
		if (!response.data.success) {
			throw new Error(response.data.message)
		}

		// Toggle the scanned status
		item.scanned = !item.scanned
	} catch (e) {
		console.log(e)
		store.dispatch('triggerAlert', {
			message: e.response?.data?.message ?? e.message,
			type: 'error',
			title: 'Error',
		})
	}
}

const formatDate = (date) => {
	if (!date) return ''
	return new Date(date).toISOString().split('T')[0] // Extract only the date part
}

const formattedDate = computed({
	get: () => formatDate(form.value.date),
	set: (newValue) => {
		form.value.date = newValue
	},
})

const submit = async () => {
	form.value.category_id = form.value.category_id[0]
	form.value.status = form.value.status[0]
	try {
		if (form.value.date === null) {
			throw new Error('Date is required')
		}
		if (form.value.category_id === null) {
			throw new Error('Category is required')
		}
		if (form.value.status === null) {
			throw new Error('Status is required')
		}

		if (props.mode === 'add') {
			// Submit the form
			const response = await axiosInstance.post(
				'/inventory/stock-opname',
				form.value
			)
			if (!response.data.success) {
				throw new Error(response.data.message)
			}
			store.dispatch('triggerAlert', {
				message: response.data.message,
				type: 'success',
				title: 'Success',
			})
			router.push('/inventory/stock-opname/edit/' + response.data.data.id)
		} else {
			// Update the form
			const response = await axiosInstance.put(
				`/inventory/stock-opname/${router.currentRoute.value.params.id}`,
				form.value
			)
			if (!response.data.success) {
				throw new Error(response.data.message)
			}
			store.dispatch('triggerAlert', {
				message: response.data.message,
				type: 'success',
				title: 'Success',
			})
			router.push('/inventory/stock-opname')
		}
	} catch (error) {
		if (error.response?.data?.message === 'store_id already exists') {
			store.dispatch('triggerAlert', {
				message:
					'Store Opname already Created for this date and category',
				type: 'error',
				title: 'Error',
			})
		} else {
			store.dispatch('triggerAlert', {
				message: error.response?.data?.message ?? error.message,
				type: 'error',
				title: 'Error',
			})
		}
	}
	form.value.category_id = [form.value.category_id]
	form.value.status = [form.value.status]
}

const getStockOpname = async (id) => {
	const response = await axiosInstance.get(`/inventory/stock-opname/${id}`)
	const data = response.data.data
	form.value = {
		date: data.date,
		category_id: [data.category_id],
		description: data.description,
		status: [data.status],
		approved: data.approved,
		details: data.details,
	}
}

function getStatusLabel(status) {
	switch (status) {
		case 0:
			return 'Available'
		case 1:
			return 'Sold'
		case 2:
			return 'Bought back'
		case 3:
			return 'Taken Out'
		default:
			return 'Unknown'
	}
}

const getProductCodes = async () => {
	const response = await axiosInstance.get('/inventory/product-code', {
		params: {
			category_id: form.value.category_id[0],
		},
	})
	const data = response.data.data.data
	productCodes.value = data.map((product) => {
		return {
			id: product.id,
			code: product.barcode,
			name: product.product.name,
			type: product.product.type.name,
			weight: `${product.weight} gr`,
			status: product.status,
			statusLabel: getStatusLabel(product.status),
			scanned:
				form.value.details.filter(
					(p) => p.product_code_id === product.id
				)[0]?.scanned ?? false,
		}
	})
}

onMounted(async () => {
	await getCategories()
	if (props.mode == 'add') {
		form.value.date = new Date().toISOString().split('T')[0]
	} else {
		await getStockOpname(router.currentRoute.value.params.id)
		await getProductCodes()
	}
})

// For after creation
watch(
	() => router.currentRoute.value.params.id,
	async (newId) => {
		if (newId) {
			await getStockOpname(router.currentRoute.value.params.id)
			await getProductCodes()
		}
	}
)
</script>
