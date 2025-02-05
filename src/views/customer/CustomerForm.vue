<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<form @submit.prevent="submit">
				<FormHeader title="Add Customer" :showSaveButton="false" />
				<FormSectionHeader title="Customer Information" icon="info" />

				<div class="grid grid-cols-1 gap-6 mt-4">
					<!-- Name -->
					<InputForm
						id="name"
						v-model="form.name"
						label="Name"
						placeholder="Enter name"
						required
						:error="formError.name"
					/>

					<!-- Email -->
					<InputForm
						id="email"
						v-model="form.email"
						label="Email"
						type="email"
						placeholder="Enter email"
						required
						:error="formError.email"
					/>

					<!-- Phone -->
					<InputForm
						id="phone"
						v-model="form.phone"
						label="Phone"
						type="tel"
						placeholder="Enter phone number"
						required
						:error="formError.phone"
					/>
				</div>

				<button
					type="submit"
					class="w-full mt-4 px-4 py-2 bg-pinkDark text-white rounded-lg hover:bg-pinkDarker transition duration-300"
				>
					Create Customer
				</button>
				<p class="mt-2 text-sm text-gray-500">
					* Default password for new customers is
					<strong>"password"</strong>.
				</p>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'

// Components
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'

const router = useRouter()
const store = useStore()

// Default form state
const form = ref({
	name: '',
	email: '',
	phone: '',
})

const formError = ref({
	name: '',
	email: '',
	phone: '',
})

const validateForm = () => {
	let isValid = true

	// Reset error messages
	formError.value = { name: '', email: '', phone: '' }

	if (!form.value.name) {
		formError.value.name = 'Name is required'
		isValid = false
	}
	if (!form.value.email) {
		formError.value.email = 'Email is required'
		isValid = false
	} else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) {
		formError.value.email = 'Invalid email format'
		isValid = false
	}
	if (!form.value.phone) {
		formError.value.phone = 'Phone number is required'
		isValid = false
	} else if (!/^\d{10,15}$/.test(form.value.phone)) {
		formError.value.phone = 'Phone number must be 10-15 digits'
		isValid = false
	}

	return isValid
}

const submit = async () => {
	// Cek validasi sebelum submit
	if (!validateForm()) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Validation Error!',
			message: 'Please fill in all required fields correctly.',
		})
		return
	}

	try {
		const response = await axiosInstance.post(
			'http://127.0.0.1:3001/api/user/add-by-admin',
			form.value
		)

		if (response.data.success) {
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: 'Customer added successfully.',
			})
			// router.push('/customer')
		}
	} catch (error) {
		const errorMessage =
			error.response?.data?.message || 'Failed to add customer.'
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: errorMessage,
		})
	}
}
</script>
