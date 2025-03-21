<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<!-- Form section -->
		<form
			class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
			@submit.prevent="submit"
		>
			<FormHeader
				:title="
					mode === 'edit'
						? 'Edit Category'
						: mode === 'add'
							? 'Add Category'
							: 'Category Detail'
				"
				:showResetButton="mode === 'edit' && hasUnsavedChanges"
				:showSaveButton="mode !== 'detail'"
				@reset="resetForm"
			/>
			<FormSectionHeader title="Basic Category Information" icon="info" />
			<div class="grid grid-cols-3 gap-6 mt-4">
				<div class="space-y-3">
					<!-- Code -->
					<InputForm
						v-if="mode !== 'add'"
						v-model="form.code"
						id="code"
						label="Code"
						placeholder="Code"
						required
						:error="formError.code"
						:readonly="mode !== 'add'"
					/>
					<!-- Name -->
					<InputForm
						v-model="form.name"
						id="name"
						label="Name"
						placeholder="Name"
						required
						:error="formError.name"
						:readonly="mode === 'detail'"
					/>
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
					<!-- Purity -->
					<InputForm
						v-model="form.purity"
						id="purity"
						label="Purity"
						placeholder="Purity"
						:error="formError.purity"
						:readonly="mode === 'detail'"
						required
					/>
				</div>
				<div class="space-y-3">
					<!-- Metal Type -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Metal Type<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							v-model="form.metal_type"
							id="metal_type"
							:items="metals"
							:disabled="mode === 'detail'"
							:searchable="false"
							:placeholder="'Select Metal Type'"
							:multiple="false"
						/>
						<p
							v-if="formError.metal_type"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.metal_type }}
						</p>
					</div>
					<!-- Weight Tray -->
					<InputForm
						v-model="form.weight_tray"
						id="weight_tray"
						label="Weight Tray"
						placeholder="Weight Tray"
						:error="formError.weight_tray"
						:readonly="mode === 'detail'"
						type="number"
						required
					/>
					<!-- Weight Paper -->
					<InputForm
						v-model="form.weight_paper"
						id="weight_paper"
						label="Weight Paper"
						placeholder="Weight Paper"
						:error="formError.weight_paper"
						:readonly="mode === 'detail'"
						type="number"
						required
					/>
				</div>
				<div class="space-y-3">
					<!-- Description -->
					<TextareaForm
						v-model="form.description"
						id="description"
						label="Description"
						placeholder="Description"
						:error="formError.description"
						:readonly="mode === 'detail'"
					/>
				</div>
			</div>
			<FormSectionHeader title="Sub Category List" icon="info" />
			<div class="mt-2 flex flex-col space-y-4">
				<template v-for="t in form.types" :key="t.id">
					<div>
						<div class="flex items-center justify-between">
							<h1
								v-if="t.id != null"
								class="text-md text-pinkDark font-bold"
							>
								{{ t.code }} | {{ t.name }}
							</h1>
							<h1 v-else class="text-md text-pinkDark font-bold">
								New Sub Category
							</h1>
							<button
								v-if="mode !== 'detail'"
								type="button"
								class="material-icons text-pinkDark"
								@click="removeType(t)"
							>
								delete
							</button>
						</div>
						<hr
							class="mt-1 border-t border-pinkOrange border-opacity-25"
						/>
						<div class="grid grid-cols-3 gap-6 mt-4">
							<div class="space-y-3">
								<!-- Name -->
								<InputForm
									v-model="t.name"
									id="name"
									label="Name"
									placeholder="Name"
									required
									:error="formError.name"
									:readonly="mode === 'detail'"
								/>
								<InputForm
									v-model="t.percent_price_reduction"
									id="percent_price_reduction"
									label="Price Reduction (%)"
									placeholder="Price Reduction (%)"
									required
									:error="formError.percent_price_reduction"
									:readonly="mode === 'detail'"
									format="percent"
								/>
								<InputForm
									v-model="t.fixed_price_reduction"
									id="fixed_price_reduction"
									label="Price Reduction (Rp)"
									placeholder="Price Reduction (Rp)"
									required
									:error="formError.fixed_price_reduction"
									:readonly="mode === 'detail'"
									format="currency"
								/>
							</div>
							<div class="space-y-3">
								<InputForm
									v-model="t.percent_broken_reduction"
									id="percent_broken_reduction"
									label="Broken Reduction (%)"
									placeholder="Broken Reduction (%)"
									required
									:error="formError.percent_broken_reduction"
									:readonly="mode === 'detail'"
									format="percent"
								/>
								<InputForm
									v-model="t.fixed_broken_reduction"
									id="fixed_broken_reduction"
									label="Broken Reduction (Rp)"
									placeholder="Broken Reduction (Rp)"
									required
									:error="formError.fixed_broken_reduction"
									:readonly="mode === 'detail'"
									format="currency"
								/>
							</div>
							<div class="space-y-3">
								<!-- Description -->
								<TextareaForm
									v-model="t.description"
									id="description"
									label="Description"
									placeholder="Description"
									:error="formError.description"
									:readonly="mode === 'detail'"
								/>
							</div>
						</div>
					</div>
				</template>
				<button
					type="button"
					class="w-full bg-pinkDark text-white hover:bg-pinkOrange font-bold py-2 px-4 rounded-lg"
					@click="addType"
					v-if="mode !== 'detail'"
				>
					Add Sub Category
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import axiosInstance from '../../axios'

// Components
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
import Dropdown from '../../components/Dropdown.vue'

const props = defineProps({
	mode: { type: String, required: true },
})
const router = useRouter()
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const id = router.currentRoute.value.params.id

// Constant
const metals = Object.freeze([
	{ id: 1, label: 'Gold' },
	{ id: 2, label: 'Silver' },
	{ id: 3, label: 'Red Gold' },
	{ id: 4, label: 'White Gold' },
	{ id: 5, label: 'Platinum' },
])
const typeColumns = ref([])

const companies = ref([])
const fetchCompany = async () => {
	try {
		const response = await axiosInstance.get('/master/company', {
			params: {
				owner_id: decryptData(Cookies.get('userdata')).id,
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
}

// Form Data for Category
const form = ref({
	code: '',
	name: '',
	purity: '',
	metal_type: [],
	weight_tray: 0,
	weight_paper: 0,
	description: '',
	company_id: [],
	types: [],
})
const formCopy = ref({ ...form.value })
const formError = ref({
	code: '',
	name: '',
	purity: '',
	metal_type: '',
	weight_tray: '',
	weight_paper: '',
	description: '',
	company_id: '',
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
const excludedKeys = ['code', 'description']
const hasFullyFilled = computed(() => {
	return Object.keys(form.value)
		.filter((key) => !excludedKeys.includes(key))
		.every((key) => {
			return (
				form.value[key] !== '' &&
				form.value[key] !== null &&
				form.value[key] !== undefined &&
				form.value[key].length > 0
			)
		})
})

const submitCategory = async () => {
	try {
		const endpoint =
			props.mode === 'edit'
				? `/inventory/category/${id}`
				: '/inventory/category'
		const method = props.mode === 'edit' ? 'put' : 'post'
		if (Array.isArray(form.value.company_id)) {
			form.value.company_id = form.value.company_id[0]
		}
		if (Array.isArray(form.value.metal_type)) {
			form.value.metal_type = form.value.metal_type[0]
		}

		const response = await axiosInstance[method](endpoint, form.value)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Category ${response.data.data.name} ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			return response.data.data
		}
	} catch (error) {
		const errors = error.response.data.errors || []
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: `Category ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
		})
	}
}

const addType = async () => {
	form.value.types.push({
		id: null,
		category_id: id,
		name: '',
		percent_price_reduction: 0,
		fixed_price_reduction: 0,
		percent_broken_reduction: 0,
		fixed_broken_reduction: 0,
		description: '',
	})
}

const removeType = async (type) => {
	const index = form.value.types.indexOf(type)
	if (type.id != null) {
		try {
			const response = await axiosInstance.delete(
				`/inventory/type/${type.id}`
			)
			if (response.data) {
				showAlert(
					'success',
					'Success!',
					'Subcategory deleted successfully.'
				)
			}
		} catch (error) {
			console.error('Error deleting type:', error)
			showAlert('error', 'Error!', 'Failed to delete subcategory.')
		}
	}
	if (index > -1) {
		form.value.types.splice(index, 1)
	}
}

const submitType = async (category_id) => {
	if (props.mode === 'add') {
		form.value.types.forEach((type) => {
			type.category_id = category_id
		})
		try {
			await axiosInstance.post('/inventory/bulk-type', {
				types: form.value.types,
			})
		} catch (error) {
			console.error('Error submitting types:', error)
			showAlert('error', 'Error!', 'Failed to create subcategories.')
		}
	} else {
		try {
			await axiosInstance.put('/inventory/bulk-type', {
				types: form.value.types,
			})
		} catch (error) {
			console.error('Error submitting type:', error)
			showAlert('error', 'Error!', 'Failed to create subcategory.')
		}
	}
}

// Submit Form
const submit = async () => {
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
	const data = await submitCategory()
	// After the Category is created than create the sub category [Type]
	if (data) {
		if (props.mode === 'add') {
			await submitType(data.id)
		} else {
			await submitType(id)
		}
	}
	if (!Array.isArray(form.value.metal_type)) {
		form.value.metal_type = [form.value.metal_type]
	}
	if (!Array.isArray(form.value.company_id)) {
		form.value.company_id = [form.value.company_id]
	}
}

const showAlert = (
	type: 'success' | 'error' | 'warning',
	title: string,
	message: string
) => {
	store.dispatch('triggerAlert', {
		type,
		title,
		message,
		actions: [
			{
				label: 'close',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
		],
	})
}

onMounted(async () => {
	await fetchCompany()
	if (props.mode !== 'add' && id) {
		typeColumns.value = [
			{ label: 'id', key: 'id', type: 'text', hidden: true },
			{
				label: 'Code',
				key: 'code',
				type: 'text',
				readonly: true,
			},
			{ label: 'Name', key: 'name', type: 'text', required: true },
			{ label: 'Description', key: 'description', type: 'text' },
			{
				label: 'Category ID',
				key: 'category_id',
				type: 'text',
				hidden: true,
				default: id,
			},
		]
		try {
			const response = await axiosInstance.get(
				`/inventory/category/${id}`
			)
			console.log(response.data.data)
			// Populate form with fetched data
			form.value = { ...response.data.data }
			form.value.company_id = [form.value.company_id]
			form.value.metal_type = [form.value.metal_type]
			form.value.types = toRaw(form.value.types).map((type) => ({
				...toRaw(type), // Convert each object to a plain object
				category_id: id,
			}))
			formCopy.value = { ...form.value }
			console.log(form.value.types)
		} catch (error) {
			console.error('Error fetching category:', error)
			showAlert('error', 'Error!', 'Failed to fetch category data.')
		}
	} else {
		typeColumns.value = [
			{ label: 'id', key: 'id', type: 'text', hidden: true },
			{ label: 'Name', key: 'name', type: 'text', required: true },
			{ label: 'Description', key: 'description', type: 'text' },
			{
				label: 'Category ID',
				key: 'category_id',
				type: 'text',
				hidden: true,
				default: id,
			},
		]
	}
})

// Track previous values for comparison
let previousTypes = []

watch(
	() => form.value.types,
	(newTypes) => {
		newTypes.forEach((item, index) => {
			console.log('Item ', index, ' :', item)

			// Handle price reduction fields - detect which one changed
			const prevItem = previousTypes[index] || {
				fixed_price_reduction: '0',
				percent_price_reduction: '0',
				fixed_broken_reduction: '0',
				percent_broken_reduction: '0',
			}

			// Check if fixed price reduction changed
			if (item.fixed_price_reduction !== prevItem.fixed_price_reduction) {
				if (parseInt(item.fixed_price_reduction) > 0) {
					form.value.types[index].percent_price_reduction = '0'
				}
			}

			// Check if percent price reduction changed
			if (
				item.percent_price_reduction !==
				prevItem.percent_price_reduction
			) {
				if (parseInt(item.percent_price_reduction) > 0) {
					form.value.types[index].fixed_price_reduction = '0'
				}
			}

			// Check if fixed broken reduction changed
			if (
				item.fixed_broken_reduction !== prevItem.fixed_broken_reduction
			) {
				if (parseInt(item.fixed_broken_reduction) > 0) {
					form.value.types[index].percent_broken_reduction = '0'
				}
			}

			// Check if percent broken reduction changed
			if (
				item.percent_broken_reduction !==
				prevItem.percent_broken_reduction
			) {
				if (parseInt(item.percent_broken_reduction) > 0) {
					form.value.types[index].fixed_broken_reduction = '0'
				}
			}
		})

		// Update previous values for next comparison
		previousTypes = JSON.parse(JSON.stringify(newTypes))
	},
	{ deep: true }
)
</script>
