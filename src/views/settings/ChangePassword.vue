<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<!-- Form section -->
		<form
			class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
			@submit.prevent="submit"
		>
			<FormHeader :title="'Change Password'" :showSaveButton="true" />
			<div
				class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-3"
			>
				<div>
					<!-- Old Password -->
					<InputForm
						v-model="form.old_password"
						id="old_password"
						label="old_password"
						placeholder="old_password"
						required
						:error="formError.old_password"
						:type="'password'"
					/>
					<!-- New Password -->
					<InputForm
						v-model="form.confirm_password"
						id="confirm_password"
						label="confirm_password"
						placeholder="confirm_password"
						required
						:error="formError.confirm_password"
						:type="'password'"
					/>
				</div>

				<div>
					<!-- New Password -->
					<InputForm
						v-model="form.new_password"
						id="new_password"
						label="new_password"
						placeholder="new_password"
						required
						:error="formError.new_password"
						:type="'password'"
					/>
				</div>
				<div>
					<!-- Notes -->
					<Notes
						title="Tips"
						icon="info"
						text="Recommended to use a strong password that consist of at least 12 characters, a combination of uppercase and lowercase letters, numbers, and symbols."
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

const form = ref({ old_password: '', new_password: '', confirm_password: '' })
const formError = ref({
	old_password: '',
	new_password: '',
	confirm_password: '',
})

const router = useRouter()
const store = useStore()

const smallMenu = computed(() => store.getters.smallMenu)
const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}

const hasFullyFilled = computed(() => {
	return Object.keys(form.value).every(
		(key) =>
			form.value[key] !== '' ||
			form.value[key] !== null ||
			form.value[key] !== undefined
	)
})

const submit = async () => {
	if (!hasFullyFilled.value) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You are missing some fields.',
		})
		return
	}
	if (form.value.new_password !== form.value.confirm_password) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'New password and confirm password do not match.',
		})
		return
	}
	resetError()
	try {
		const response = await axiosInstance.post(
			'/auth/change-password',
			form.value
		)

		if (response.data) {
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: response.data.message,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			form.value = {
				old_password: '',
				new_password: '',
				confirm_password: '',
			}
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
			message: error.response.data.message,
		})
	}
}
</script>
