<template>
	<div
		class="h-full md:h-3/4 max-h-[90vh] md:max-h-[70vh] w-full md:w-3/4 bg-white md:rounded-lg shadow-sm md:my-16"
	>
		<!-- Title Stepper OnBoarding Step -->
		<div class="grid grid-cols-2 py-6">
			<!-- Step 1 -->
			<router-link to="/onboarding/company">
				<div class="flex flex-col items-center">
					<div
						class="w-10 h-10 flex items-center justify-center rounded-full font-bold bg-white text-pinkDark border border-pinkDark"
					>
						1
					</div>
					<div class="mt-2 text-sm text-pinkDark text-center">
						Create a Company
					</div>
				</div>
			</router-link>

			<!-- Step 2 -->
			<div class="flex flex-col items-center">
				<div
					class="w-10 h-10 flex items-center justify-center rounded-full font-bold bg-pinkDark text-white"
				>
					2
				</div>
				<div class="mt-2 text-sm text-pinkDark text-center">
					Create a Store
				</div>
			</div>
		</div>

		<!-- Divider -->
		<hr class="border-t border-pinkDark border-opacity-50" />

		<!-- Content -->
		<div
			class="grid grid-cols-1 md:grid-cols-2 w-full h-3/4 overflow-hidden"
		>
			<div
				class="md:flex flex-col hidden h-full overflow-hidden justify-between"
			>
				<div class="py-8">
					<h2
						class="text-xl lg:text-2xl font-bold text-pinkDark text-center mt-6"
					>
						Setup your First Store!
					</h2>

					<p
						class="text-md lg:text-lg text-pinkDark text-start mt-6 px-8"
					>
						You can create a store that will be used to manage your
						resource/business. You can create multiple stores under
						one company. All operational activities will be recorded
						in store.
					</p>
				</div>

				<router-link
					to="/logout"
					class="text-md lg:text-lg text-pinkDark text-start pl-8 underline"
				>
					Logout</router-link
				>
			</div>
			<!-- Form -->
			<div class="flex flex-col h-full max-h-full overflow-hidden">
				<form
					class="flex-1 w-full h-full px-8 py-8 overflow-y-auto"
					@submit.prevent="submit"
				>
					<h2
						class="w-full text-lg font-bold text-pinkDark text-start mt-2"
					>
						Store Form
					</h2>
					<!-- Form Basic Information -->
					<div class="grid grid-cols-1 gap-3 mt-4">
						<!-- First Grid -->
						<div class="space-y-3">
							<!-- Code -->
							<InputForm
								v-model="form.code"
								id="code"
								type="text"
								label="Code"
								placeholder="Code"
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
								:error="formError.name"
								required
							/>
							<!-- Open Date (DatePicker) -->
							<InputForm
								v-model="formattedDate"
								id="open_date"
								type="date"
								label="Open Date"
								placeholder="Open Date"
								:error="formError.open_date"
								required
							/>
							<!-- NPWP -->
							<InputForm
								v-model="form.npwp"
								id="npwp"
								type="text"
								label="NPWP"
								placeholder="NPWP"
								:error="formError.npwp"
								required
							/>
							<!-- WA Number -->
							<div>
								<label
									for="wa_number"
									class="block text-sm text-grey-900 font-medium mb-1"
								>
									WhatsApp Number<span class="text-pinkDark"
										>*</span
									>
								</label>
								<InputForm
									v-model="form.wa_number"
									id="wa_number"
									type="text"
									placeholder="Enter WA Number (start with 8)"
									:error="formError.wa_number"
									@input="validateWaNumber"
								/>
								<p class="text-gray-500 text-xs mt-1">
									Example: <b>81234567890</b> → will be
									formatted as
									<b>+62 812 3456 7890</b>
								</p>
							</div>
							<!-- Address -->
							<TextareaForm
								v-model="form.address"
								id="address"
								label="Address"
								placeholder="Address"
								:error="formError.address"
								required
							/>
							<!-- Location -->
							<div>
								<label
									for="location"
									class="block text-sm text-grey-900 font-medium mb-1"
								>
									Map Location<span class="text-pinkDark"
										>*</span
									>
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
									v-if="
										formError.latitude ||
										formError.longitude
									"
									class="text-pinkDark text-xs italic transition duration-300"
								>
									{{
										(formError.latitude,
										formError.longitude)
									}}
								</p>
							</div>

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
								:error="formError.description"
							/>
						</div>
					</div>

					<!-- Already Have a Company button -->
					<div
						class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full mt-4"
					>
						<div>
							<button
								type="button"
								class="w-full bg-pinkGray text-pinkDark rounded-lg py-2 px-4 hover:bg-pinkLight hover:text-white transition duration-300"
								@click="alreadyHave"
							>
								Already Had One
							</button>
						</div>
						<!-- Submit Button -->
						<button
							type="button"
							class="w-full bg-pinkDark text-white rounded-lg py-2 px-4 hover:bg-pinkOrange transition duration-300"
							@click="submit"
						>
							Next
						</button>
					</div>
				</form>
			</div>
		</div>
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
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import Cookies from 'js-cookie'
import axiosInstance from '../../axios'
import MapPicker from '../../components/MapPicker.vue'
import ImageUpload from '../../components/ImageUpload.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import ToggleForm from '../../components/ToggleForm.vue'
import { encryptData, decryptData } from '../../utils/crypto'

// Form Data
const form = ref({
	code: '',
	name: '',
	description: '',
	company_id: '',
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
	tax_purchase: 0,
	grace_period: 0,
	fixed_tt_adjustment: 0,
	percent_tt_adjustment: 0,
	fixed_kbl_adjustment: 0,
	percent_kbl_adjustment: 0,
})
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
	tax_purchase: '',
	grace_period: '',
	fixed_tt_adjustment: '',
	percent_tt_adjustment: '',
	fixed_kbl_adjustment: '',
	percent_kbl_adjustment: '',
})

// Already Have Logic
const alreadyHave = () => {
	const userdata = decryptData(Cookies.get('userdata'))
	if (userdata.store_id == null) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You have not created a company yet.',
		})
		return
	}
	router.push('/home')
}

// MapPicker
const prevLocation = ref({ lat: -7.2575, lng: 112.7521 }) // Default location (Surabaya)
const showModal = ref(false)
const firstLoad = ref(true)
const authStore = useAuthStore()

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

onMounted(async () => {
	const userdata = await decryptData(Cookies.get('userdata'))
	if (userdata.company_id == null) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You have not created a company yet.',
		})
		router.push('/onboarding/company')
		return
	}
	form.value.company_id = userdata.company_id
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

const excludedKeys = [
	'company_id',
	'description',
	'poin_config',
	'is_active',
	'is_flex_price',
	'is_float_price',
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
	const userdata = await decryptData(Cookies.get('userdata'))
	console.log(form.value)
	if (!hasFullyFilled.value) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You are missing some fields.',
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
		const response = await axiosInstance.post('/master/store', form.value)

		if (response.data) {
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Store ${response.data.data.name} Created.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			Cookies.set(
				'userdata',
				encryptData({
					id: userdata.id,
					email: userdata.email,
					company_id: userdata.company_id,
					store_id: response.data.data.id,
					is_owner: userdata.is_owner,
				}),
				{ expires: 5 / 24 }
			) // 5 hours

			// Fething new PErmission
			await authStore.fetchPermissions()

			router.push('/home')
		}
	} catch (error) {
		console.error(error)
		const errors = error.response?.data?.errors || []
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: `Store creation failed.`,
		})
	}
}
</script>
