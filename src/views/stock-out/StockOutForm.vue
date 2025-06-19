<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="'Stock Out'" />
		<form
			class="w-full bg-white p-4 rounded-lg shadow-md"
			@submit.prevent="submit"
		>
			<FormHeader
				title="Stock Out Form"
				:showSaveButton="mode !== 'detail'"
			/>
			<FormSectionHeader title="Form" icon="info" />
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div class="space-y-3">
					<!-- Open Date -->
					<InputForm
						v-model="formattedDate"
						id="date"
						type="date"
						label="Date"
						placeholder="Date"
						:readonly="mode === 'detail'"
						:error="formError.open_date"
						required
					/>
					<!-- Code -->
					<InputForm
						v-model="code"
						id="code"
						label="Input Product Code"
						placeholder="Product Code"
						required
						:readonly="false"
						@keypress.enter.prevent="addProduct"
					/>
				</div>
				<div class="space-y-3">
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Reason<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="reasons"
							v-model="form.taken_out_reason"
							placeholder="Select a reason"
							:multiple="false"
							:searchable="false"
							:disabled="mode === 'detail'"
						/>
						<p
							v-if="formError.taken_out_reason"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.taken_out_reason }}
						</p>
					</div>
					<div class="w-full flex flex-col items-start justify-end">
						<!-- Button Product Manual -->
						<p class="text-pinkDark text-sm mt-2">
							<span>*</span>For submission without scanning QR
						</p>
						<button
							type="button"
							class="w-full bg-pinkDark text-white hover:bg-pinkOrange font-bold py-2 px-4 rounded-lg"
							@click="addProduct"
						>
							Submit Manual
						</button>
					</div>
				</div>
				<!-- Button Scan QR -->
				<div class="w-full flex flex-col items-start justify-end">
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
			<FormSectionHeader title="Item Details" icon="tab" />
			<div class="mt-4">
				<EditableCat
					:initialRows="form.codes"
					:columns="itemColumns"
					:required="mode === 'add'"
					:readonly="mode === 'detail'"
					:allActive="false"
					:independent="true"
					:addable="false"
					title="Stock Out Items"
					@update:rows="handleRowsUpdate"
					:addPath="''"
					:editPath="''"
					:deletePath="''"
				/>
			</div>
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
import { computed, onMounted, ref, render } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import FormHeader from '../../components/FormHeader.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import InputForm from '../../components/InputForm.vue'
import Dropdown from '../../components/Dropdown.vue'
import EditableCat from '../../components/EditableCat.vue'
import QrScanner from '../../components/QrScanner.vue'
import axiosInstance from '../../axios'
import { decryptData } from '../../utils/crypto'
import Cookies from 'js-cookie'
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

const reasons = Object.freeze([
	{ id: 1, label: 'Repair' },
	{ id: 2, label: 'Lost' },
	{ id: 3, label: 'Other' },
])

const form = ref({
	date: '',
	taken_out_reason: '',
	codes: [],
})

const formError = ref({
	date: '',
	taken_out_reason: '',
	codes: '',
})

const code = ref('')

const itemColumns = Object.freeze([
	{ key: 'id', label: 'id', type: 'text', hidden: true },
	{ key: 'name', label: 'Name', type: 'text', width: '15%', readonly: true },
	{ key: 'type', label: 'Type', type: 'text', readonly: true },
	{ key: 'weight', label: 'Weight', type: 'text', readonly: true },
	{ key: 'price', label: 'Price', type: 'text', readonly: true },
	{ key: 'buy_price', label: 'Buy Price', type: 'text', readonly: true },
	{ key: 'description', type: 'text', label: 'Description' },
])

const handleScan = (result) => {
	console.log('Scanned Result in Parent:', result)
	code.value = result.split(';')[0]
	addProduct(code)
}

const addProduct = async () => {
	try {
		const data = code.value
		console.log(form.value.codes)
		if (form.value.codes.some((code) => code.barcode == data)) {
			code.value = ''
			throw new Error('Product already added')
		}
		if (!data) {
			throw new Error('Code is required')
		}
		const response = await axiosInstance.get(
			`/inventory/product-barcode/${data}`,
			{
				params: {
					store: decryptData(Cookies.get('userdata')).store_id,
				},
			}
		)
		if (!response.data.success) {
			throw new Error('Product not found')
		}

		if (response.data.data.status == 1) {
			throw new Error(
				'Product cannot be taken out because it is already sold.'
			)
		}

		if (response.data.data.status == 2) {
			throw new Error(
				'Product cannot be taken out because it is already returned.'
			)
		}

		if (response.data.data.status == 3) {
			throw new Error(
				'Product cannot be taken out because it is already taken out.'
			)
		}

		const product = response.data.data
		form.value.codes = [
			...form.value.codes,
			{
				id: product.id,
				barcode: product.barcode,
				name: product.name,
				type: product.type,
				weight: product.weight,
				price: product.price,
				buy_price: product.buy_price,
				description: product.description,
			},
		]
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

const handleRowsUpdate = (rows) => {
	form.value.codes = rows
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
	console.log('submit')
	console.log(form.value)
	form.value.taken_out_reason = form.value.taken_out_reason[0]
	try {
		if (!form.value.date) {
			throw new Error('Date is required')
		}
		if (!form.value.taken_out_reason) {
			throw new Error('Reason is required')
		}
		if (form.value.codes.length === 0) {
			throw new Error('At least one product is required')
		}
		// Submit the form
		const response = await axiosInstance.post(
			'/inventory/stock-out',
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
		router.push('/inventory/stock-out')
	} catch (error) {
		store.dispatch('triggerAlert', {
			message: error.response?.data?.message ?? error.message,
			type: 'error',
			title: 'Error',
		})
	}
	form.value.taken_out_reason = [form.value.taken_out_reason]
}

onMounted(() => {
	form.value.date = new Date().toISOString().split('T')[0]
})
</script>
