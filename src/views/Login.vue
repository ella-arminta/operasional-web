<template>
	<div class="app flex justify-center items-center min-h-screen bg-pinkGray">
		<div
			class="login-container w-full max-w-md bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out"
			:class="{ 'scale-in': showForm }"
		>
			<!-- Logo dengan animasi -->
			<div class="flex justify-center mb-8">
				<img
					src="/logo.png"
					alt="Logamas Logo"
					class="w-auto h-36 object-contain transition-all duration-500 hover:scale-105"
					@mouseover="logoHover = true"
					@mouseleave="logoHover = false"
					:class="{ pulse: logoHover }"
				/>
			</div>

			<!-- Alert notifikasi -->
			<div
				v-if="alert.show"
				class="mb-6 p-4 rounded-lg border-l-4 transition-all duration-300 ease-in-out"
				:class="alertStyles"
			>
				<div class="flex items-center">
					<span class="mr-2" v-html="alert.icon"></span>
					<span class="font-medium">{{ alert.message }}</span>
				</div>
			</div>

			<form @submit.prevent="submit" class="space-y-5">
				<!-- Email Field -->
				<div class="form-group relative">
					<label
						for="email"
						class="block text-sm font-medium text-gray-700 mb-1 transition-all duration-300"
						:class="{ 'text-pinkDark': focusedField === 'email' }"
						>Email</label
					>
					<div class="relative">
						<input
							v-model="data.email"
							id="email"
							type="email"
							placeholder="Enter your email"
							class="block w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none transition-all duration-300 ease-in-out"
							:class="[
								focusedField === 'email'
									? 'border-pinkDark ring-2 ring-pink-100 bg-white'
									: 'border-gray-200',
							]"
							@focus="focusField('email')"
							@blur="blurField"
						/>
						<span class="absolute right-3 top-3 text-gray-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								:class="{
									'text-pinkDark': focusedField === 'email',
								}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</span>
					</div>
				</div>

				<!-- Password Field -->
				<div class="form-group relative">
					<label
						for="password"
						class="block text-sm font-medium text-gray-700 mb-1 transition-all duration-300"
						:class="{
							'text-pinkDark': focusedField === 'password',
						}"
						>Password</label
					>
					<div class="relative">
						<input
							v-model="data.password"
							id="password"
							:type="showPassword ? 'text' : 'password'"
							placeholder="Enter your password"
							class="block w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none transition-all duration-300 ease-in-out"
							:class="[
								focusedField === 'password'
									? 'border-pinkDark ring-2 ring-pink-100 bg-white'
									: 'border-gray-200',
							]"
							@focus="focusField('password')"
							@blur="blurField"
						/>
						<button
							type="button"
							class="absolute right-3 top-3 text-gray-400 hover:text-pinkDark focus:outline-none transition-colors duration-300"
							@click="togglePassword"
						>
							<svg
								v-if="!showPassword"
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							<svg
								v-else
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Submit Button -->
				<div class="pt-2">
					<button
						type="submit"
						:class="[
							'w-full relative overflow-hidden font-semibold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out',
							isLoading
								? 'bg-pinkDarker cursor-not-allowed'
								: 'bg-pinkDark hover:bg-pinkDarker hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-pinkOrange',
						]"
						:disabled="isLoading"
					>
						<span v-if="!isLoading" class="text-white relative z-10"
							>Sign In</span
						>
						<span
							v-else
							class="text-white flex items-center justify-center"
						>
							<svg
								class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Processing...
						</span>
						<span
							class="ripple absolute bg-white/20 rounded-full transform scale-0 transition-transform"
							:style="rippleStyle"
							ref="ripple"
						></span>
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
import { reactive, ref, computed, onMounted } from 'vue'
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
		const store = useStore()
		const authStore = useAuthStore()

		// UI state
		const showPassword = ref(false)
		const focusedField = ref(null)
		const isLoading = ref(false)
		const showForm = ref(false)
		const logoHover = ref(false)
		const rememberMe = ref(false)
		const alert = reactive({
			show: false,
			type: '',
			message: '',
			icon: '',
		})

		// Animation
		const ripple = ref(null)
		const rippleStyle = ref({})

		// Computed properties
		const alertStyles = computed(() => {
			if (alert.type === 'error') {
				return 'bg-red-50 border-red-500 text-red-700'
			} else if (alert.type === 'success') {
				return 'bg-green-50 border-green-500 text-green-700'
			} else if (alert.type === 'warning') {
				return 'bg-yellow-50 border-yellow-500 text-yellow-700'
			}
			return ''
		})

		// Methods
		const focusField = (field) => {
			focusedField.value = field
		}

		const blurField = () => {
			focusedField.value = null
		}

		const togglePassword = () => {
			showPassword.value = !showPassword.value
		}

		const createRipple = (event) => {
			const button = event.currentTarget
			const diameter = Math.max(button.clientWidth, button.clientHeight)
			const radius = diameter / 2

			rippleStyle.value = {
				width: `${diameter}px`,
				height: `${diameter}px`,
				left: `${event.offsetX - radius}px`,
				top: `${event.offsetY - radius}px`,
				transform: 'scale(2)',
				opacity: '0',
				transition: 'transform 0.6s, opacity 0.6s',
			}

			setTimeout(() => {
				rippleStyle.value = {
					...rippleStyle.value,
					transform: 'scale(0)',
					opacity: '0',
				}
			}, 600)
		}

		const showAlert = (type, message) => {
			let icon = ''

			if (type === 'error') {
				icon =
					'<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
			} else if (type === 'success') {
				icon =
					'<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
			} else if (type === 'warning') {
				icon =
					'<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
			}

			alert.type = type
			alert.message = message
			alert.icon = icon
			alert.show = true

			setTimeout(() => {
				alert.show = false
			}, 5000)
		}

		const submit = async (event) => {
			// Add ripple effect
			createRipple(event)

			// Validation check
			if (!data.email || !data.password) {
				showAlert('error', 'Please fill in all fields')
				return
			}

			isLoading.value = true

			try {
				const response = await axiosInstance.post('/login', data)

				// Check if response contains token
				if (response.data) {
					// Check if email verification is required
					console.log(response.data.data)
					if (response.data.data.requiresVerification) {
						showAlert(
							'success',
							response.data?.message ||
								'Please check your email for verification link'
						)

						// Optionally store email for resend functionality
						sessionStorage.setItem(
							'pendingVerificationEmail',
							response.data.data.id
						)

						// Redirect to verification waiting page or show message
						setTimeout(() => router.push('/verify-pending'), 1500)
						return
					}
					// Save JWT token in a cookie for 5 hours or 5 days if remember me is checked
					const expiryTime = rememberMe.value ? 5 : 5 / 24

					Cookies.set(
						'token',
						encryptData(response.data.data.token),
						{ expires: expiryTime }
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
						{ expires: expiryTime }
					)

					showAlert('success', 'Login successful! Redirecting...')

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
							setTimeout(
								() => router.push('/onboarding/company'),
								1500
							)
							return
						} else {
							setTimeout(
								() => router.push('/onboarding/employee'),
								1500
							)
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

						setTimeout(() => router.push('/home'), 1500)
					}
				}
			} catch (error) {
				console.log(error)
				showAlert(
					'error',
					error?.response?.data?.message ??
						'Login failed. Please check your credentials and try again.'
				)
				console.error('Login failed', error)
			} finally {
				isLoading.value = false
			}
		}

		onMounted(() => {
			console.log('Mounted')
			// Add entrance animation
			setTimeout(() => {
				showForm.value = true
			}, 100)
		})

		return {
			data,
			submit,
			showPassword,
			togglePassword,
			focusedField,
			focusField,
			blurField,
			isLoading,
			showForm,
			logoHover,
			rememberMe,
			alert,
			alertStyles,
			ripple,
			rippleStyle,
		}
	},
}
</script>

<style scoped>
/* Background gradients */
.app {
	background: linear-gradient(135deg, #f9f0f2 0%, #e8e8e8 100%);
}

/* Animations */
@keyframes pulse {
	0% {
		transform: scale(1);
	}

	50% {
		transform: scale(1.05);
	}

	100% {
		transform: scale(1);
	}
}

.pulse {
	animation: pulse 1.5s infinite;
}

.scale-in {
	opacity: 1;
	transform: scale(1);
}

.login-container {
	transition: all 0.5s ease-in-out;
}

/* Custom colors */
.bg-pinkGray {
	background-color: #f9f0f2;
}

.bg-pinkDark {
	background-color: #c58189;
}

.bg-pinkDarker {
	background-color: #c44b70;
}

.text-pinkDark {
	color: #d65d82;
}

.text-pinkDarker {
	color: #c44b70;
}

.border-pinkOrange {
	border-color: #f3a5c0;
}

.focus\:ring-pinkOrange:focus {
	--tw-ring-color: rgba(243, 165, 192, 0.5);
}

/* Ripple effect */
.ripple {
	position: absolute;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0);
	pointer-events: none;
}
</style>
