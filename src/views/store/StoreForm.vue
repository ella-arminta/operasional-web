<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<!--  Form section -->
		<form
			class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
			@submit.prevent="submit"
		>
			<FormHeader
				:title="
					mode === 'edit'
						? 'Edit Store'
						: mode === 'add'
							? 'Add Store'
							: 'Store Detail'
				"
				:showResetButton="mode === 'edit' && hasUnsavedChanges"
				:showSaveButton="mode !== 'detail'"
				@reset="resetForm"
			/>
			<!-- Form Basic Information -->
			<FormSectionHeader title="Basic Store Information" icon="info" />
			<div class="grid grid-cols-3 gap-6 mt-4">
				<!-- First Grid -->
				<div class="space-y-3">
					<!-- Code -->
					<InputForm
						v-model="form.code"
						id="code"
						type="text"
						label="Code"
						placeholder="Code"
						:readonly="mode === 'detail'"
						:error="formError.code"
						required
					/>
					<!-- Name -->
					<InputForm
						v-model="form.name"
						id="name"
						type="text"
						label="Name"
						placeholder="Name"
						:readonly="mode === 'detail'"
						:error="formError.name"
						required
					/>
					<!-- Dropdown Company -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Company<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="companies"
							v-model="form.company_id"
							placeholder="Select a company"
							:multiple="false"
							:searchable="true"
							:disabled="mode === 'detail'"
							:addRoute="'/master/company/add'"
						/>
						<p
							v-if="formError.company_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.company_id }}
						</p>
					</div>
					<!-- Open Date (DatePicker) -->
					<InputForm
						v-model="formattedDate"
						id="open_date"
						type="date"
						label="Open Date"
						placeholder="Open Date"
						:readonly="mode === 'detail'"
						:error="formError.open_date"
						required
					/>
				</div>
				<!-- Second Grid -->
				<div class="space-y-3">
					<!-- NPWP -->
					<InputForm
						v-model="form.npwp"
						id="npwp"
						type="text"
						label="NPWP"
						placeholder="NPWP"
						:readonly="mode === 'detail'"
						:error="formError.npwp"
						required
					/>
					<!-- WA Number -->
					<div>
						<label
							for="wa_number"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							WhatsApp Number<span class="text-pinkDark">*</span>
						</label>
						<InputForm
							v-model="form.wa_number"
							id="wa_number"
							type="text"
							placeholder="Enter WA Number (start with 8)"
							:readonly="mode === 'detail'"
							:error="formError.wa_number"
							@input="validateWaNumber"
						/>
						<p class="text-gray-500 text-xs mt-1">
							Example: <b>81234567890</b> → will be formatted as
							<b>+62 812 3456 7890</b>
						</p>
					</div>

					<!-- Address -->
					<TextareaForm
						v-model="form.address"
						id="address"
						label="Address"
						placeholder="Address"
						:readonly="mode === 'detail'"
						:error="formError.address"
						required
					/>
					<!-- Location -->
					<div>
						<label
							for="location"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Map Location<span class="text-pinkDark">*</span>
						</label>
						<!-- Button to Open Modal -->
						<button
							class="w-full bg-pinkGray text-pinkOrange text-opacity-50 px-4 py-2 rounded-lg border border-pinkOrange border-opacity-25 hover:bg-pinkDark hover:bg-opacity-75 hover:text-white transition duration-300 ease-in-out"
							type="button"
							@click="openModal"
							:class="{
								'bg-opacity-25': mode === 'detail',
							}"
						>
							{{
								form.latitude && form.longitude
									? mode === 'detail'
										? 'View Location'
										: 'Change Location'
									: 'Select a Location'
							}}
						</button>
						<p
							v-if="formError.latitude || formError.longitude"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ (formError.latitude, formError.longitude) }}
						</p>
					</div>
				</div>
				<!-- Third Grid -->
				<div class="space-y-3">
					<!-- Logo -->
					<div>
						<label
							for="logo"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Logo<span class="text-pinkDark">*</span>
						</label>

						<ImageUpload
							v-model="form.logo"
							:readonly="mode === 'detail'"
							:uploadFile="'/upload-logo'"
						/>
						<p
							v-if="formError.logo"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.logo }}
						</p>
					</div>
					<!-- Description -->
					<TextareaForm
						v-model="form.description"
						id="description"
						label="Description"
						placeholder="Type your description..."
						:readonly="mode === 'detail'"
						:error="formError.description"
					/>
				</div>
			</div>
			<!-- Form Advanced Settings -->
			<FormSectionHeader
				title="Advanced Store Settings"
				icon="settings"
			/>
			<div class="grid grid-cols-3 gap-6 mt-4">
				<div class="space-y-3">
					<!-- Activation Status -->
					<ToggleForm
						v-model="form.is_active"
						label="Active Status"
						:disabled="mode === 'detail'"
					/>
					<!-- Tax Percentage / PPN Jual -->
					<InputForm
						v-model="form.tax_percentage"
						id="tax_percentage"
						type="decimal"
						label="PPN Jual (%)"
						placeholder="PPN Jual (%)"
						:readonly="mode === 'detail'"
						:error="formError.tax_percentage"
						format="percent"
					/>
					<!-- PPN Beli -->
					<InputForm
						v-model="form.tax_purchase"
						id="tax_purchase"
						type="decimal"
						label="PPN Beli (%)"
						placeholder="PPN Beli (%)"
						:readonly="mode === 'detail'"
						:error="formError.tax_purchase"
						format="percent"
					/>
					<!-- Flexible Price -->
					<ToggleForm
						v-model="form.is_flex_price"
						label="Flexible Sold Product Price"
						:disabled="mode === 'detail'"
					/>
					<!-- Floating Price -->
					<ToggleForm
						v-model="form.is_float_price"
						label="Floating Product Price"
						:disabled="mode === 'detail'"
					/>
					<!-- Marketplace poin -->
					<InputForm
						v-model="form.poin_config"
						id="poin_config"
						type="number"
						label="Marketplace Poin"
						placeholder="Marketplace Poin"
						:readonly="mode === 'detail'"
						:error="formError.poin_config"
					/>
					<!-- Grace Period -->
					<InputForm
						v-model="form.grace_period"
						id="grace_period"
						type="number"
						label="Grace Period"
						placeholder="Grace Period"
						:readonly="mode === 'detail'"
						:error="formError.grace_period"
					/>
				</div>
				<div class="space-y-3">
					<div>
						<label
							for="trade_tt"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Trade In Fee (Store > Customer)
						</label>
						<div
							class="space-y-3 px-3 py-3 rounded-lg border border-pinkOrange border-opacity-25"
						>
							<InputForm
								v-model="form.fixed_tt_adjustment"
								id="fixed_tt_adjustment"
								type="number"
								label="In Rupiah"
								placeholder="In Rupiah"
								:readonly="mode === 'detail'"
								:error="formError.fixed_tt_adjustment"
								format="currency"
							/>
							<InputForm
								v-model="form.percent_tt_adjustment"
								id="percent_tt_adjustment"
								type="number"
								label="In Percentage"
								placeholder="In Percentage"
								:readonly="mode === 'detail'"
								:error="formError.percent_tt_adjustment"
								format="percent"
							/>
						</div>
					</div>
					<div>
						<label
							for="kbl"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Trade In Fee (Store < Customer)
						</label>
						<div
							class="space-y-3 px-3 py-3 rounded-lg border border-pinkOrange border-opacity-25"
						>
							<InputForm
								v-model="form.fixed_kbl_adjustment"
								id="fixed_kbl_adjustment"
								type="number"
								label="In Rupiah"
								placeholder="In Rupiah"
								:readonly="mode === 'detail'"
								:error="formError.fixed_kbl_adjustment"
								format="currency"
							/>
							<InputForm
								v-model="form.percent_kbl_adjustment"
								id="percent_kbl_adjustment"
								type="number"
								label="In Percentage"
								placeholder="In Percentage"
								:readonly="mode === 'detail'"
								:error="formError.percent_kbl_adjustment"
								format="percent"
							/>
						</div>
					</div>
				</div>
			</div>
		</form>
		<!-- Modal Mappicker -->
		<teleport to="#modal-container">
			<div
				v-if="showModal"
				class="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 transition duration-300"
				@click.self="closeModal"
			>
				<div
					class="bg-white w-3/4 h-auto max-h-3/4 rounded-lg shadow-lg relative overflow-hidden"
				>
					<!-- Modal Header -->
					<div class="flex justify-between items-center p-4 border-b">
						<h2 class="text-xl font-bold">Select a Location</h2>
						<button
							class="text-pinkMed text-2xl hover:text-pinkDark transition duration-300 ease-in-out"
							@click="closeModal"
						>
							&times;
						</button>
					</div>

					<!-- Modal Body -->
					<div class="p-4 h-auto">
						<MapPicker
							:defaultLocation="prevLocation"
							:current="mode === 'add' && firstLoad"
							@update:location="updateLocation"
						/>
					</div>

					<!-- Modal Footer -->
					<div class="flex justify-end p-4 border-t">
						<button
							class="px-4 py-2 bg-pinkLight text-PinkDark rounded-lg hover:bg-pinkMed mr-2 transition duration-300 ease-in-out"
							@click="closeModal"
						>
							Cancel
						</button>
						<button
							class="px-4 py-2 bg-pinkOrange text-white rounded-lg hover:bg-pinkDark transition duration-300 ease-in-out"
							@click="saveLocation"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</teleport>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
import axiosInstance from '../../axios'
import PageTitle from '../../components/PageTitle.vue'
import Dropdown from '../../components/Dropdown.vue'
import MapPicker from '../../components/MapPicker.vue'
import ImageUpload from '../../components/ImageUpload.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import ToggleForm from '../../components/ToggleForm.vue'
import FormHeader from '../../components/FormHeader.vue'
import { decryptData } from '../../utils/crypto'
const smallMenu = computed(() => store.getters.smallMenu)
// Dropdown Items
const companies = ref([])

const props = defineProps({
	mode: { type: String, required: true },
})
// Form Data
const form = ref({
	code: '',
	name: '',
	description: '',
	company_id: [],
	open_date: '',
	npwp: '',
	address: '',
	wa_number: '',
	latitude: 0,
	longitude: 0,
	logo: '',
	poin_config: 0,
	is_active: true,
	is_flex_price: false,
	is_float_price: false,
	tax_percentage: 0,
	defect_nominal: 0,
	defect_percentage: 0,
	tax_purchase: 0,
	grace_period: 0,
	fixed_tt_adjustment: 0,
	percent_tt_adjustment: 0,
	fixed_kbl_adjustment: 0,
	percent_kbl_adjustment: 0,
})
const formCopy = ref({ ...form.value })
const formError = ref({
	code: '',
	name: '',
	description: '',
	company_id: '',
	open_date: '',
	npwp: '',
	address: '',
	latitude: '',
	longitude: '',
	wa_number: '',
	logo: '',
	poin_config: '',
	is_active: '',
	is_flex_price: '',
	is_float_price: '',
	tax_percentage: '',
	defect_nominal: '',
	defect_percentage: '',
	tax_purchase: '',
	grace_period: '',
	fixed_tt_adjustment: '',
	percent_tt_adjustment: '',
	fixed_kbl_adjustment: '',
	percent_kbl_adjustment: '',
})

// MapPicker
const prevLocation = ref({ lat: -7.2575, lng: 112.7521 }) // Default location (Surabaya)
const showModal = ref(false)
const firstLoad = ref(true)

const openModal = () => {
	showModal.value = true
	firstLoad.value = false
}

const updateLocation = (newLocation) => {
	form.value.latitude = newLocation.lat
	form.value.longitude = newLocation.lng
}

const saveLocation = () => {
	showModal.value = false
	prevLocation.value = { lat: form.value.latitude, lng: form.value.longitude }
}

const closeModal = () => {
	showModal.value = false
	form.value.latitude = prevLocation.lat
	form.value.longitude = prevLocation.lng
}
const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	try {
		const owner_id = decryptData(Cookies.get('userdata')).id
		console.log('owner', owner_id)
		const response = await axiosInstance.get('/master/company', {
			params: {
				owner_id: owner_id,
			},
		})
		if (response.data) {
			const ownedCompanies = response.data.data.data
			companies.value = ownedCompanies.map((company) => ({
				id: company.id,
				label: company.name,
			}))
		}
	} catch (error) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: 'Failed to fetch company data.',
			actions: [
				{
					label: 'close',
					type: 'secondary',
					handler: () => store.dispatch('hideAlert'),
				},
			],
		})
		companies.value = []
	}
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/master/store/${id}`)
			form.value = { ...response.data.data }
			if (
				form.value.wa_number !== null &&
				form.value.wa_number.startsWith('62')
			) {
				form.value.wa_number = form.value.wa_number.substring(2)
			}
			form.value.company_id = [form.value.company_id]
			formCopy.value = { ...form.value }
			prevLocation.value = {
				lat: form.value.latitude,
				lng: form.value.longitude,
			}
		} catch (error) {
			console.error(error)
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch store data.',
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
		}
	} else {
		form.value.company_id = [form.value.company_id]
	}
})

const validateWaNumber = () => {
	// Hapus semua karakter non-angka
	form.value.wa_number = form.value.wa_number.replace(/\D/g, '')

	// Validasi menggunakan regex: hanya boleh angka & harus mulai dengan "8"
	const regex = /^8\d{0,14}$/

	if (!regex.test(form.value.wa_number)) {
		formError.value.wa_number =
			"WhatsApp number must start with '8' and contain only digits."
		form.value.wa_number = '' // Reset input jika salah
	} else {
		formError.value.wa_number = '' // Hapus error jika valid
	}
}

const formatDate = (date) => {
	if (!date) return ''
	return new Date(date).toISOString().split('T')[0] // Extract only the date part
}

const formattedDate = computed({
	get: () => formatDate(form.value.open_date),
	set: (newValue) => {
		form.value.open_date = newValue
	},
})

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}

const resetForm = () => {
	form.value = { ...formCopy.value }
}

const hasUnsavedChanges = computed(() => {
	return Object.keys(form.value).some(
		(key) => form.value[key] !== formCopy.value[key]
	)
})

const excludedKeys = [
	'description',
	'poin_config',
	'is_active',
	'is_flex_price',
	'is_float_price',
	'defect_nominal',
	'defect_percentage',
	'tax_purchase',
	'tax_percentage',
	'grace_period',
	'fixed_tt_adjustment',
	'percent_tt_adjustment',
	'fixed_kbl_adjustment',
	'percent_kbl_adjustment',
]

const hasFullyFilled = computed(() => {
	return Object.keys(form.value)
		.filter((key) => !excludedKeys.includes(key))
		.every(
			(key) =>
				form.value[key] !== '' &&
				form.value[key] !== null &&
				form.value[key] !== undefined &&
				form.value[key] !== 0
		)
})

// Only limit fixed_tt_adjustment or percent_tt_adjustment
// to be filled, not both
watch(
	() => form.value.percent_tt_adjustment,
	(newValue) => {
		if (newValue > 0) {
			form.value.percent_tt_adjustment = parseInt(newValue)
			form.value.fixed_tt_adjustment = '0'
		}
	}
)
watch(
	() => form.value.fixed_tt_adjustment,
	(newValue) => {
		if (newValue > 0) {
			form.value.fixed_tt_adjustment = parseInt(newValue)
			form.value.percent_tt_adjustment = '0'
		}
	}
)

// Only limit fixed_kbl_adjustment or percent_kbl_adjustment
// to be filled, not both
watch(
	() => form.value.percent_kbl_adjustment,
	(newValue) => {
		if (newValue > 0) {
			form.value.percent_kbl_adjustment = parseInt(newValue)
			form.value.fixed_kbl_adjustment = '0'
		}
	}
)
watch(
	() => form.value.fixed_kbl_adjustment,
	(newValue) => {
		if (newValue > 0) {
			form.value.fixed_kbl_adjustment = parseInt(newValue)
			form.value.percent_kbl_adjustment = '0'
		}
	}
)

const submit = async () => {
	if (props.mode === 'detail') return
	if (!hasFullyFilled.value && props.mode === 'add') {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You are missing some fields.',
		})
		return
	}
	if (!hasUnsavedChanges.value && props.mode === 'edit') {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'No changes detected.',
		})
		return
	}
	resetError()
	// Validasi sebelum submit
	if (!/^8\d{6,14}$/.test(form.value.wa_number)) {
		formError.value.wa_number =
			"WhatsApp number must start with '8' and be at least 7 digits."
		return
	}

	// Format nomor WA menjadi "62xxxxxxxxxx"
	form.value.wa_number = `62${form.value.wa_number}`
	try {
		const endpoint =
			props.mode === 'edit' ? `/master/store/${id}` : '/master/store'
		const method = props.mode === 'edit' ? 'put' : 'post'
		if (Array.isArray(form.value.company_id)) {
			form.value.company_id = form.value.company_id[0]
		}

		const response = await axiosInstance[method](endpoint, form.value)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Store ${response.data.data.name} ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			router.push('/master/store')
		}
	} catch (error) {
		console.error(error.response.data)
		const errors = error.response.data.errors || []
		form.value.company_id = [form.value.company_id] // resetting the state to array
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: `Store ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
		})
	}
}
</script>
