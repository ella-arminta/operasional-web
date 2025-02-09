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
						? 'Edit Role'
						: mode === 'add'
							? 'Add Role'
							: 'Role Detail'
				"
				:showResetButton="mode === 'edit' && hasUnsavedChanges"
				:showSaveButton="mode !== 'detail'"
				@reset="resetForm"
			/>
			<FormSectionHeader title="Basic Role Information" icon="info" />
			<div
				class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-3"
			>
				<div>
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
				</div>
				<div>
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
				</div>
				<div>
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Store<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="stores"
							v-model="form.store_id"
							placeholder="Select stores"
							:multiple="mode === 'add'"
							:searchable="true"
							:disabled="mode === 'detail'"
							:addRoute="'/master/store/add'"
						/>
						<p
							v-if="formError.store_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.store_id }}
						</p>
					</div>
				</div>
			</div>
			<FormSectionHeader title="Permission" icon="lock" />
			<div class="w-full !rounded-md shadow-sm overflow-hidden">
				<table class="w-full table-fixed">
					<thead class="bg-pinkDark text-white">
						<tr>
							<th class="px-4 py-2 text-start" width="35%">
								Pages
							</th>
							<th
								v-for="head in header"
								class="px-4 py-2 text-center"
								width="15%"
							>
								{{ head.label }}
							</th>
						</tr>
					</thead>
					<tbody class="text-sm">
						<tr
							v-for="(feature, index) in features"
							:key="index"
							:class="
								index % 2 === 0 ? 'bg-white' : 'bg-pinkGray'
							"
						>
							<td class="px-4 py-2 border-r border-opacity-50">
								{{ feature.path }}
							</td>

							<template
								v-if="
									feature.actions.some(
										(action) => action.action === 'all'
									)
								"
							>
								<td
									class="px-4 py-2 text-center border-r border-opacity-50"
									colspan="5"
								>
									<input
										type="checkbox"
										class="accent-pinkDark w-4 h-4 border-1 rounded-sm"
										v-model="
											feature.actions.find(
												(action) =>
													action.action === 'all'
											).checked
										"
										:id="
											feature.actions.find(
												(action) =>
													action.action === 'all'
											).id
										"
										@click="
											clickHandler(
												feature.actions.find(
													(action) =>
														action.action === 'all'
												).id,
												!feature.actions.find(
													(action) =>
														action.action === 'all'
												).checked
											)
										"
									/>
								</td>
							</template>
							<template v-else v-for="head in header">
								<td
									v-if="
										feature.actions.some(
											(action) =>
												action.action === head.key
										)
									"
									class="px-4 py-2 text-center border-r border-opacity-50"
								>
									<input
										type="checkbox"
										class="accent-pinkDark w-4 h-4 border-1 rounded-sm"
										v-model="
											feature.actions.find(
												(action) =>
													action.action === head.key
											).checked
										"
										:id="
											feature.actions.find(
												(action) =>
													action.action === head.key
											).id
										"
										@click="
											clickHandler(
												feature.actions.find(
													(action) =>
														action.action ===
														head.key
												).id,
												!feature.actions.find(
													(action) =>
														action.action ===
														head.key
												).checked
											)
										"
									/>
								</td>
							</template>
						</tr>
					</tbody>
				</table>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
import Dropdown from '../../components/Dropdown.vue'

const props = defineProps({
	mode: { type: String, required: true },
})

const form = ref({ name: '', company_id: [''], store_id: [''], features: [] })
const formCopy = ref({ ...form.value })
const formError = ref({ name: '', company_id: '', store_id: '', features: '' })

const router = useRouter()
const store = useStore()
const isMounted = ref(false)

const smallMenu = computed(() => store.getters.smallMenu)
const id = router.currentRoute.value.params.id

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
watch(
	() => form.value.company_id,
	(newValue) => {
		if (newValue.length > 0 && !isMounted.value) {
			fetchStores(newValue[0])
		}
	}
)

const stores = ref([])
const fetchStores = async (company_id: string) => {
	try {
		const response = await axiosInstance.get('/master/store', {
			params: {
				company_id: company_id,
			},
		})
		if (response.data) {
			const ownedStores = response.data.data
			stores.value = ownedStores.map((store) => ({
				id: store.id,
				label: store.name,
			}))
			if (props.mode !== 'add') {
				stores.value = [
					...stores.value,
					{ id: '', label: 'All Stores' },
				]
			}
			form.value.store_id = []
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
		stores.value = []
	}
}

const features = ref([])
const header = [
	{ label: 'Open', key: 'open' },
	{ label: 'Detail', key: 'detail' },
	{ label: 'Add', key: 'add' },
	{ label: 'Edit', key: 'edit' },
	{ label: 'Delete', key: 'delete' },
]
const fetchFeatures = async () => {
	try {
		const response = await axiosInstance.get(
			`/auth/feature-role${id ? '/' + id : ''}`
		)
		if (response.data) {
			const data = response.data.data
			features.value = Object.values(
				data.reduce((acc, { path, action, id, roles }) => {
					if (!acc[path]) {
						acc[path] = { path, actions: [] }
					}
					acc[path].actions.push({
						...{ action, id, checked: roles.length > 0 },
					})
					if (roles.length > 0 && !form.value.features.includes(id)) {
						form.value.features.push(id)
					}
					return acc
				}, {})
			)
			formCopy.value.features = [...form.value.features]
		}
	} catch (error) {
		console.error(error)
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: 'Failed to fetch feature data.',
			actions: [
				{
					label: 'close',
					type: 'secondary',
					handler: () => store.dispatch('hideAlert'),
				},
			],
		})
		features.value = []
	}
}

const clickHandler = (id, value) => {
	if (value) {
		// Only add if it doesn't already exist
		if (!form.value.features.includes(id)) {
			form.value.features.push(id)
		}
	} else {
		// Remove the item by finding its index
		const index = form.value.features.indexOf(id)
		if (index !== -1) {
			form.value.features.splice(index, 1)
		}
	}
	console.log(form.value.features)
}

onMounted(async () => {
	isMounted.value = true
	await fetchCompany()
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/auth/role/${id}`)
			form.value = {
				...response.data.data,
				company_id: [response.data.data.company_id],
			}
			form.value.features = []
			await fetchStores(response.data.data.company_id)
			form.value.store_id = response.data.data.store_id
				? [response.data.data.store_id]
				: ['']
			formCopy.value = { ...form.value }
		} catch (error) {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch role data.',
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
		}
	}
	await fetchFeatures()
	isMounted.value = false
})

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}

const resetForm = () => {
	form.value = { ...formCopy.value }
	features.value = [
		...features.value.map((feature) => ({
			...feature,
			actions: feature.actions.map((action) => ({
				...action,
				checked: formCopy.value.features.includes(action.id),
			})),
		})),
	]
}

const hasUnsavedChanges = computed(() => {
	return Object.keys(form.value).some(
		(key) => form.value[key] !== formCopy.value[key]
	)
})

const hasFullyFilled = computed(() => {
	return Object.keys(form.value).every(
		(key) =>
			form.value[key] !== '' ||
			form.value[key] !== null ||
			form.value[key] !== undefined
	)
})

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
	const data = {
		name: form.value.name,
		company_id: form.value.company_id[0],
		store_id:
			form.value.store_id.length === stores.value.length ||
			form.value.store_id[0] === ''
				? ''
				: form.value.store_id,
	}
	try {
		const endpoint =
			props.mode === 'edit' ? `/auth/role/${id}` : '/auth/role'
		const method = props.mode === 'edit' ? 'put' : 'post'
		const response = await axiosInstance[method](endpoint, data)

		if (response.data) {
			try {
				// Assign permission
				const permissionData = {
					role_id: response.data.data.id,
					page_ids: form.value.features,
				}
				console.log('perm', permissionData)
				const permissionResponse = await axiosInstance.post(
					'/auth/mass-assign-feature',
					permissionData
				)

				if (permissionResponse.data) {
					await store.dispatch('triggerAlert', {
						type: 'success',
						title: 'Success!',
						message: permissionResponse.data.message,
						actions: [
							{
								label: 'close',
								type: 'secondary',
								handler: async () => {
									await store.dispatch('hideAlert')
									if (props.mode === 'add') {
										router.push('/auth/role')
									} else {
										router.go(0)
									}
								},
							},
						],
					})
				}
			} catch (error) {
				console.error(error.response.data)
				store.dispatch('triggerAlert', {
					type: 'error',
					title: 'Error!',
					message: 'Failed to assign permission.',
				})
			}
		}
	} catch (error) {
		console.error(error)
		const errors = error.response.data.errors || []
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: `Role ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
		})
	}
}
</script>
