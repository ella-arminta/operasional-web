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
						? 'Edit Company'
						: mode === 'add'
							? 'Add Company'
							: 'Company Detail'
				"
				:showResetButton="mode === 'edit' && hasUnsavedChanges"
				:showSaveButton="mode !== 'detail'"
				@reset="resetForm"
			/>
			<FormSectionHeader title="Basic Company Information" icon="info" />
			<div class="grid sm:grid-cols-1 md:grid-cols-3 gap-6 mt-4">
				<div class="space-y-3">
					<!-- Code -->
					<InputForm
						v-model="form.code"
						id="code"
						label="Code"
						placeholder="Code"
						required
						:error="formError.code"
						:readonly="mode === 'detail'"
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
				</div>

				<div>
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
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'

const props = defineProps({
	mode: { type: String, required: true },
})

const form = ref({ code: '', name: '', description: '' })
const formCopy = ref({ ...form.value })
const formError = ref({ code: '', name: '', description: '' })

const router = useRouter()
const store = useStore()

const smallMenu = computed(() => store.getters.smallMenu)
const id = router.currentRoute.value.params.id

onMounted(async () => {
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/master/company/${id}`)
			form.value = { ...response.data.data }
			formCopy.value = { ...form.value }
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
		}
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
			props.mode === 'edit' ? `/master/company/${id}` : '/master/company'
		const method = props.mode === 'edit' ? 'put' : 'post'
		const response = await axiosInstance[method](endpoint, form.value)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Company ${response.data.data.name} ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			router.push('/master/company')
		}
	} catch (error) {
		console.error(error.response.data)
		const errors = error.response.data.errors || []
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		console.log('Form Errors:', formError.value)
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: `Company ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
		})
	}
}
</script>
