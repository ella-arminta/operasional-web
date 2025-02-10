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
						? 'Edit Operation'
						: mode === 'add'
							? 'Add Operation'
							: 'Operation Detail'
				"
				:showResetButton="mode === 'edit' && hasUnsavedChanges"
				:showSaveButton="mode !== 'detail'"
				@reset="resetForm"
			/>
			<!-- Form Basic Information -->
			<FormSectionHeader
				title="Basic Operation Information"
				icon="info"
			/>
			<div class="grid grid-cols-3 gap-6 mt-4">
				<!-- First Grid -->
				<div class="space-y-3">
					<!-- Code -->
					<InputForm
						v-if="mode !== 'add'"
						v-model="form.code"
						id="code"
						type="text"
						label="Code"
						placeholder="Code"
						:readonly="true"
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
				</div>
				<!-- Second Grid -->
				<div class="space-y-3">
					<!-- price  -->
					<InputForm
						v-model="form.price"
						id="price"
						type="number"
						label="Price"
						placeholder="Price"
						:readonly="mode === 'detail'"
						:error="formError.price"
						required
					/>
					<!-- NPWP -->
					<InputForm
						v-model="form.uom"
						id="uom"
						type="text"
						label="Unit of Measurement"
						placeholder="Unit of Measurement"
						:readonly="mode === 'detail'"
						:error="formError.uom"
						required
					/>
				</div>
				<!-- Third Grid -->
				<div class="space-y-3">
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
		</form>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import axiosInstance from '../../axios'
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
const smallMenu = computed(() => store.getters.smallMenu)

const props = defineProps({
	mode: { type: String, required: true },
})
// Form Data
const form = ref({
	code: '',
	name: '',
	price: 0,
	uom: '',
	description: '',
})
const formCopy = ref({ ...form.value })
const formError = ref({
	code: '',
	name: '',
	price: '',
	uom: '',
	description: '',
})

watch(
	() => form.value.price,
	() => {
		if (form.value.price < 0) {
			form.value.price = 0
		}
		if (typeof form.value.price === 'string') {
			form.value.price = parseFloat(form.value.price)
		}
	}
)

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(
				`/inventory/operation/${id}`
			)
			form.value = { ...response.data.data }
			form.value.store_id = [form.value.store_id]
			formCopy.value = { ...form.value }
		} catch (error) {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch operation data.',
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
		form.value.store_id = decryptData(Cookies.get('userdata')).store_id
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

const excludedKeys = ['code', 'description']

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
	try {
		const endpoint =
			props.mode === 'edit'
				? `/inventory/operation/${id}`
				: '/inventory/operation'
		const method = props.mode === 'edit' ? 'put' : 'post'

		const response = await axiosInstance[method](endpoint, form.value)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Operation ${response.data.data.name} ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			router.push('/inventory/operation')
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
