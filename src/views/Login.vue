<template>
	<div class="app flex justify-center items-center min-h-screen bg-pinkGray">
		<div class="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
			<!-- Logo -->
			<div class="flex justify-center mb-6">
				<img src="/logo.png" alt="Logamas Logo" class="w-auto" />
			</div>
			<form @submit.prevent="submit" class="space-y-4">
				<div class="mb-4">
					<label
						for="email"
						class="block text-sm font-medium text-grey-900"
						>Email</label
					>
					<input
						v-model="data.email"
						id="email"
						type="email"
						placeholder="Enter your email"
						class="mt-2 block w-full px-4 py-2 border border-pinkOrange rounded-lg focus:ring-2 focus:ring-pinkOrange focus:outline-none"
					/>
				</div>

				<div class="mb-6">
					<label
						for="password"
						class="block text-sm font-medium text-grey-900"
						>Password</label
					>
					<input
						v-model="data.password"
						id="password"
						type="password"
						placeholder="Enter your password"
						class="mt-2 block w-full px-4 py-2 border border-pinkOrange rounded-lg focus:ring-2 focus:ring-pinkOrange focus:outline-none"
					/>
				</div>

				<div class="flex justify-between items-center">
					<button
						type="submit"
						class="w-full bg-pinkDark hover:bg-pinkDarker text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinkOrange"
					>
						Sign In
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
import { reactive } from 'vue'
import axiosInstance from '../axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { useStore } from 'vuex'
import { encryptData } from '../utils/crypto'
import { useAuthStore } from '../vuex/auth'

export default {
	name: 'Login',
	setup() {
		const data = reactive({
			email: '',
			password: '',
		})

		const router = useRouter()
		const store = useStore() // Access Vuex store
		const authStore = useAuthStore()

		const submit = async () => {
			try {
				const response = await axiosInstance.post('/login', data)

				// Check if response contains token
				if (response.data) {
					// Save JWT token in a cookie for 5 hours
					Cookies.set(
						'token',
						encryptData(response.data.data.token),
						{ expires: 5 / 24 }
					)
					Cookies.set(
						'userdata',
						encryptData({
							id: response.data.data.id,
							email: response.data.data.email,
							company_id: response.data.data.company_id
								? response.data.data.company_id
								: null,
							store_id: response.data.data.store_id
								? response.data.data.store_id
								: null,
							is_owner: response.data.data.is_owner,
						}),
						{ expires: 5 / 24 }
					) // 5 hours

					if (
						response.data.company_id === null ||
						response.data.store_id === null
					) {
						store.dispatch('triggerAlert', {
							type: 'warning',
							title: 'Warning!',
							message: 'You have not created a company yet.',
						})
						if (response.data.is_owner) {
							router.push('/onboarding/company')
							return
						} else {
							router.push('/onboarding/employee')
							return
						}
					} else {
						// await fetch permissions
						await authStore.fetchPermissions()
						store.dispatch('triggerAlert', {
							type: 'success',
							title: 'Berhasil!',
							message: 'Anda berhasil login.',
							actions: [
								{
									label: 'close',
									type: 'secondary',
									handler: () => store.dispatch('hideAlert'),
								},
							],
						})
						router.push('/home')
					}
				}
			} catch (error) {
				alert('Login failed', error)
				console.error('Login failed', error)
			}
		}

		return {
			data,
			submit,
		}
	},
}
</script>

<style scoped>
/* Body Styling */
body {
	font-family: 'Arial', sans-serif;
	background-color: #f3f4f6;
}

/* Gradient Background */
.bg-pinkGray {
	background-color: #f9f9f9;
	/* Soft pink-gray background */
}

/* Form container styling */
.app {
	display: flex;
	/* Ensure the parent flex */
	align-items: center;
	justify-content: center;
	height: 100vh;
	/* Full screen height */
}

.w-full {
	width: 100%;
}

.max-w-sm {
	max-width: 380px;
}

.bg-white {
	background-color: #fff;
}

.p-8 {
	padding: 2rem;
}

.rounded-lg {
	border-radius: 1rem;
}

.shadow-md {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Button hover and focus effects */
button:hover {
	background-color: #c97b8c;
}

button:focus {
	outline: 2px solid #c97b8c;
}

button:focus:ring-2 {
	outline-offset: 2px;
}

input:focus {
	outline: 2px solid #c97b8c;
}

/* Input styling */
input {
	font-size: 1rem;
	padding: 0.75rem 1rem;
	border-radius: 0.375rem;
	border: 1px solid #f3a5c0;
	transition: border-color 0.3s ease;
}

img {
	height: 200px;
	object-fit: contain;
}
</style>
