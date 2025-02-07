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
				:showSaveButton="mode !== 'view'"
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
						:readonly="mode === 'view'"
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
						:readonly="mode === 'view'"
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
							:disabled="mode === 'view'"
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
						:readonly="mode === 'view'"
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
						:readonly="mode === 'view'"
						:error="formError.npwp"
						required
					/>
					<!-- Address -->
					<TextareaForm
						v-model="form.address"
						id="address"
						label="Address"
						placeholder="Address"
						:readonly="mode === 'view'"
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
								'bg-opacity-25': mode === 'view',
							}"
						>
							{{
								form.latitude && form.longitude
									? mode === 'view'
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
							:readonly="mode === 'view'"
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
						:readonly="mode === 'view'"
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
						:disabled="mode === 'view'"
					/>
					<!-- Tax Percentage -->
					<InputForm
						v-model="form.tax_percentage"
						id="tax_percentage"
						type="number"
						label="Tax Percentage (%)"
						placeholder="Tax Percentage (%)"
						:readonly="mode === 'view'"
						:error="formError.tax_percentage"
					/>
					<!-- Flexible Price -->
					<ToggleForm
						v-model="form.is_flex_price"
						label="Flexible Sold Product Price"
						:disabled="mode === 'view'"
					/>
					<!-- Floating Price -->
					<ToggleForm
						v-model="form.is_float_price"
						label="Floating Product Price"
						:disabled="mode === 'view'"
					/>
					<!-- Marketplace poin -->
					<InputForm
						v-model="form.poin_config"
						id="poin_config"
						type="number"
						label="Marketplace Poin"
						placeholder="Marketplace Poin"
						:readonly="mode === 'view'"
						:error="formError.poin_config"
					/>
				</div>
				<div class="space-y-3">
					<!-- Defect -->
					<div>
						<label
							for="defect"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Defect Discount
						</label>
						<div
							class="space-y-3 px-3 py-3 rounded-lg border border-pinkOrange border-opacity-25"
						>
							<!-- Defect Nominal -->
							<InputForm
								v-model="form.defect_nominal"
								id="defect_nominal"
								type="number"
								label="Defect Nominal (Rp)"
								placeholder="Defect Nominal (Rp)"
								:readonly="mode === 'view'"
								:error="formError.defect_nominal"
							/>
							<!-- Defect Percentage -->
							<InputForm
								v-model="form.defect_percentage"
								id="defect_percentage"
								type="number"
								label="Defect Percentage (%)"
								placeholder="Defect Percentage (%)"
								:readonly="mode === 'view'"
								:error="formError.defect_percentage"
							/>
						</div>
					</div>
					<!-- Discount Buy -->
					<div>
						<label
							for="defect"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Potongan Harga beli minimum TT/KBL
						</label>
						<div
							class="space-y-3 px-3 py-3 rounded-lg border border-pinkOrange border-opacity-25"
						>
							<!-- Minimum Trade in (%) -->
							<InputForm
								v-model="form.discount_trade"
								id="discount_trade"
								type="number"
								label="Discount (%) in minimum Trade in"
								placeholder="Discount (%) in minimum Trade in"
								:readonly="mode === 'view'"
								:error="formError.discount_trade"
							/>
							<!-- Defect Percentage -->
							<InputForm
								v-model="form.discount_kbl"
								id="discount_kbl"
								type="number"
								label="Discount (%) in minimum KBL"
								placeholder="Discount (%) in minimum KBL"
								:readonly="mode === 'view'"
								:error="formError.discount_kbl"
							/>
						</div>
					</div>
					<!-- Adjustment Price TT/KBL -->
					<div>
						<label
							for="defect"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Price Adjustment TT/KBL
						</label>
						<div
							class="space-y-3 px-3 py-3 rounded-lg border border-pinkOrange border-opacity-25"
						>
							<!-- Minimum Trade in (%) -->
							<InputForm
								v-model="form.adjustment_price_trade"
								id="adjustment_price_trade"
								type="number"
								label="Discount (%) in minimum Trade in"
								placeholder="Discount (%) in minimum Trade in"
								:readonly="mode === 'view'"
								:error="formError.adjustment_price_trade"
							/>
							<!-- Defect Percentage -->
							<InputForm
								v-model="form.adjustment_price_kbl"
								id="adjustment_price_kbl"
								type="number"
								label="Discount (%) in minimum KBL"
								placeholder="Discount (%) in minimum KBL"
								:readonly="mode === 'view'"
								:error="formError.adjustment_price_kbl"
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
import { ref, onMounted, computed, readonly } from 'vue'
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
	logo: '',
	poin_config: '',
	is_active: '',
	is_flex_price: '',
	is_float_price: '',
	tax_percentage: '',
	defect_nominal: '',
	defect_percentage: '',
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
			const ownedCompanies = response.data.data
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
			form.value.company_id = [form.value.company_id]
			formCopy.value = { ...form.value }
			prevLocation.value = {
				lat: form.value.latitude,
				lng: form.value.longitude,
			}
		} catch (error) {
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

const submit = async () => {
	if (props.mode === 'view') return
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
