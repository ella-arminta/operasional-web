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
						? 'Edit Price'
						: mode === 'add'
							? 'Add Price'
							: 'Price Detail'
				"
				:showResetButton="mode === 'edit' && hasUnsavedChanges"
				:showSaveButton="mode !== 'detail'"
				@reset="resetForm"
			/>
			<FormSectionHeader title="Basic Price Information" icon="info" />
			<div class="grid grid-cols-3 gap-6 mt-4">
				<div class="space-y-3">
					<!-- Date (Now For add readonly) -->
					<InputForm
						v-model="form.date"
						id="date"
						label="Date"
						placeholder="Date"
						required
						:error="formError.date"
						:readonly="true"
					/>
				</div>

				<div class="space-y-3">
					<!-- Category -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Category<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="categories"
							v-model="selectedCategory"
							placeholder="Select a category to modify"
							:multiple="false"
							:searchable="true"
							:disabled="mode === 'detail'"
							:addRoute="'/master/category/add'"
						/>
						<p
							v-if="formError.company_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.company_id }}
						</p>
					</div>
				</div>
			</div>
			<div class="mt-4">
				<!-- Price Table -->
				<EditableCat
					:initialRows="form.prices"
					:columns="columns"
					:required="mode === 'add'"
					:allActive="mode === 'add'"
					:addable="false"
					:deletable="false"
					:independent="mode !== 'add'"
					title="Price List"
					@update:rows="handleRowsUpdate"
					:editPath="'/inventory/price'"
					:noDataState="noDataState"
				/>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
import Dropdown from '../../components/Dropdown.vue'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import EditableCat from '../../components/EditableCat.vue'

const props = defineProps({
	mode: { type: String, required: true },
})

const form = ref({ date: '', prices: [] })
const formCopy = ref({ ...form.value })
const formError = ref({ date: '', prices: [] })

// No Data State Table
const noDataState = ref('')

const columns = Object.freeze([
	{
		label: 'id',
		key: 'id',
		type: 'text',
		hidden: true,
	},
	{
		label: 'Type_id',
		key: 'type_id',
		type: 'text',
		required: true,
		hidden: true,
	},
	{
		label: 'Type',
		key: 'type_name',
		type: 'text',
		required: true,
		readonly: true,
	},
	{
		label: 'Price',
		key: 'price',
		type: 'number',
	},
])

const router = useRouter()
const store = useStore()

// Handle for Categories
const categories = ref([])
const fetchCategory = async () => {
	try {
		const response = await axiosInstance.get('/inventory/category')
		if (response.data) {
			const ownedCategories = response.data.data
			categories.value = ownedCategories.map((category) => ({
				id: category.id,
				label: `${category.code} - ${category.name}`,
			}))
		}
	} catch (error) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: 'Failed to fetch categories data.',
			actions: [
				{
					label: 'close',
					type: 'secondary',
					handler: () => store.dispatch('hideAlert'),
				},
			],
		})
		categories.value = []
	}
}
const selectedCategory = ref([])
watch(
	() => selectedCategory.value,
	async (newValue) => {
		// Fetching types based on the category
		if (newValue[0] === undefined) return
		if (props.mode !== 'add') return
		try {
			const response = await axiosInstance.get(
				`/inventory/category/${newValue[0]}`
			)

			if (response.data) {
				const types = response.data.data.types
				form.value.prices = types.map((type) => {
					const t = {
						type_id: type.id,
						type_name: `${type.code} - ${type.name}`,
						price: 0,
					}
					return t
				})
			}
			noDataState.value = ` <a href="/master/category/view/${newValue[0]}"
									class="flex w-full items-center justify-center bg-white py-2 text-pinkDark hover:bg-pinkGray hover:cursor-pointer hover:underline transition duration-300 ease-in-out">
									Create a Subcategory First
								</a>`
		} catch (error) {
			console.log('error', error)
		}
	},
	{ immediate: true }
)

// Handle for Prices
const handleRowsUpdate = (newRows) => {
	form.value.prices = newRows
}

const smallMenu = computed(() => store.getters.smallMenu)
const id = router.currentRoute.value.params.id

onMounted(async () => {
	await fetchCategory()
	const splitId = id.split(';')
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(
				`/inventory/price-category-detail`,
				{
					params: {
						category_id: splitId[0],
						date: splitId[1],
					},
				}
			)
			selectedCategory.value = [splitId[0]]
			form.value = { ...response.data.data }
			form.value.date = new Date(form.value.date)
				.toISOString()
				.split('T')[0]
			formCopy.value = { ...form.value }
		} catch (error) {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch price data.',
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
		form.value.date = new Date().toISOString().split('T')[0]
	}
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

const excludedKeys = ['description']

const hasFullyFilled = computed(() => {
	return Object.keys(form.value)
		.filter((key) => !excludedKeys.includes(key))
		.every(
			(key) =>
				form.value[key] !== '' &&
				form.value[key] !== null &&
				form.value[key] !== undefined
		)
})

const submit = async () => {
	console.log(form.value)
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
		const data = form.value.prices.map((price) => {
			return {
				type_id: price.type_id,
				price: price.price,
				date: form.value.date,
			}
		})
		console.log(data)
		const endpoint =
			props.mode === 'edit'
				? `/inventory/price/${id}`
				: '/inventory/bulk-price'
		const method = props.mode === 'edit' ? 'put' : 'post'
		const response = await axiosInstance[method](endpoint, data)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Price ${response.data.data.name} ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			router.push('/master/price')
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
			message: `Price ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
		})
	}
}
</script>
