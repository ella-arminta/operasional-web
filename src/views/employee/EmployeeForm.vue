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
						? 'Edit Employee'
						: mode === 'add'
							? 'Add Employee'
							: 'Employee Detail'
				"
				:showResetButton="mode === 'edit' && hasUnsavedChanges"
				:showSaveButton="mode !== 'view'"
				@reset="resetForm"
			/>
			<FormSectionHeader title="Basic Employee Information" icon="info" />
			<div
				class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-3"
			>
				<div>
					<!-- Email -->
					<InputForm
						v-model="form.email"
						id="email"
						label="Email"
						placeholder="Email"
						required
						:error="formError.email"
						:readonly="mode === 'email'"
						:type="'email'"
					/>
				</div>

				<div>
					<!-- Name -->
					<InputForm
						v-model="form.name"
						id="name"
						label="Name"
						placeholder="Name"
						required
						:error="formError.name"
						:readonly="mode === 'view'"
					/>
				</div>
				<div>
					<!-- Notes -->
					<Notes
						title="Note"
						icon="warning"
						text="The password by default is 'password'. Please have your employee change it after the first login at settings > change password."
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
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
import Notes from '../../components/Notes.vue'

const props = defineProps({
	mode: { type: String, required: true },
})

const form = ref({ email: '', name: '' })
const formCopy = ref({ ...form.value })
const formError = ref({ email: '', name: '' })

const router = useRouter()
const store = useStore()

const smallMenu = computed(() => store.getters.smallMenu)
const id = router.currentRoute.value.params.id

onMounted(async () => {
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/master/employee/${id}`)
			form.value = { ...response.data.data }
			formCopy.value = { ...form.value }
		} catch (error) {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch employee data.',
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

const submit = async () => {
	console.log(form.value)
	resetError()
	try {
		const endpoint =
			props.mode === 'edit'
				? `/master/employee/${id}`
				: '/master/employee'
		const method = props.mode === 'edit' ? 'put' : 'post'
		const response = await axiosInstance[method](endpoint, form.value)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Employee ${response.data.data.name} ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			router.push('/master/employee')
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
			message: `Employee ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
		})
	}
}
</script>
