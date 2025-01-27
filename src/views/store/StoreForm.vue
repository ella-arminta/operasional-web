<template>
	<div class="content min-h-screen">
		<PageTitle />
		<!--  Form section -->
		<form
			class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
			@submit.prevent="submit"
		>
			<div class="flex items-center justify-between">
				<h1 class="text-xl text-pinkDark">
					{{
						mode === 'edit'
							? 'Edit Store'
							: mode === 'add'
								? 'Add Store'
								: 'Store Detail'
					}}
				</h1>
				<div class="flex gap-4">
					<button
						v-if="mode === 'edit' && hasUnsavedChanges"
						class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
						type="button"
						@click="resetForm"
					>
						<i class="material-icons text-md">history</i>
						Reset
					</button>
					<button
						v-if="mode !== 'view'"
						class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
						type="submit"
					>
						<i class="material-icons text-md">save</i>
						Save
					</button>
				</div>
			</div>
			<!-- Form Session -->
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
						v-model="form.open_date"
						id="open_date"
						type="date"
						label="Open Date"
						placeholder="Open Date"
						:readonly="mode === 'view'"
						:error="formError.open_date"
					/>
				</div>
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
					/>
					<!-- Address -->
					<TextareaForm
						v-model="form.address"
						id="address"
						label="Address"
						placeholder="Address"
						:readonly="mode === 'view'"
						:error="formError.address"
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
							class="w-full bg-pinkGray text-pinkOrange text-opacity-50 px-4 py-2 rounded-lg border border-pinkOrange border-opacity-25 hover:bg-pinkDark hover:bg-opacity-50 transition duration-300 ease-in-out"
							type="button"
							@click="openModal"
							:readonly="mode === 'view'"
						>
							Select Location
						</button>
						<p
							v-if="formError.latitude || formError.longitude"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ (formError.latitude, formError.longitude) }}
						</p>
					</div>
				</div>
				<!-- Form Line 3 -->
				<div class="space-y-3">
					<!-- Logo -->
					<div>
						<label
							for="logo"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Logo
						</label>

						<ImageUpload
							v-model="form.logo"
							:readonly="mode === 'view'"
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
		</form>
		<!-- Modal Mappicker -->
		<teleport to="#modal-container">
			<div
				v-if="showModal && mode !== 'view'"
				class="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 transition duration-300"
				@click.self="closeModal"
			>
				<div
					class="bg-white w-3/4 h-3/4 rounded-lg shadow-lg relative overflow-hidden"
				>
					<!-- Modal Header -->
					<div class="flex justify-between items-center p-4 border-b">
						<h2 class="text-xl font-bold">Select a Location</h2>
						<button
							class="text-gray-500 hover:text-gray-800"
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
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 mr-2"
							@click="closeModal"
						>
							Cancel
						</button>
						<button
							class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
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
})
const formCopy = ref({
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
	logo: '',
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
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/master/store/${id}`)
			form.value = { ...response.data.data }
			formCopy.value = { ...form.value }
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
	const ownedCompanies = JSON.parse(Cookies.get('userdata')).owned_company
	companies.value = ownedCompanies.map((company) => ({
		id: company.id,
		label: company.name,
	}))
})

const resetError = () => {
	formError.value = { code: '', name: '', description: '' }
}

const resetForm = () => {
	form.value = { ...formCopy.value }
}

const hasUnsavedChanges = computed(() => {
	return (
		form.value.code !== formCopy.value.code ||
		form.value.name !== formCopy.value.name ||
		form.value.description !== formCopy.value.description ||
		form.value.company_id !== formCopy.value.company_id
	)
})

const submit = async () => {
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
