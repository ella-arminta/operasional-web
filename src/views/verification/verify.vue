<template>
	<div
		class="verify-email-container flex justify-center items-center min-h-screen bg-pinkGray"
	>
		<div class="verify-card">
			<div v-if="isVerifying" class="loading-state">
				<div class="spinner"></div>
				<h2>Verifying your email...</h2>
				<p>Please wait while we verify your email address.</p>
			</div>

			<div v-else-if="verificationSuccess" class="success-state">
				<div class="success-icon flex items-center justify-center">
					<svg
						class="w-24 h-24 text-green-500"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						></path>
					</svg>
				</div>
				<h2 class="text-xl">Email Verified Successfully!</h2>
				<p class="text-lg">
					Your email has been verified. You will be redirected to your
					dashboard shortly.
				</p>
				<button @click="redirectToDashboard" class="btn-primary">
					Continue to Dashboard
				</button>
			</div>

			<div v-else class="error-state">
				<div class="error-icon flex items-center justify-center">
					<svg
						class="w-24 h-24 text-red-500"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						></path>
					</svg>
				</div>
				<h2 class="text-xl">Verification Failed</h2>
				<p class="text-lg">{{ errorMessage }}</p>
				<div class="action-buttons">
					<button
						@click="resendVerification"
						class="btn-secondary"
						:disabled="isResending"
					>
						{{
							isResending
								? 'Sending...'
								: 'Resend Verification Email'
						}}
					</button>
					<button @click="goToLogin" class="btn-primary">
						Back to Login
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import Cookies from 'js-cookie'
import { encryptData } from '../../utils/crypto'
import { useAuthStore } from '../../vuex/auth'

const route = useRoute()
const router = useRouter()
const store = useStore()
const authStore = useAuthStore()

const isVerifying = ref(true)
const verificationSuccess = ref(false)
const errorMessage = ref('')
const isResending = ref(false)
const user = ref('')

const verifyEmail = async (token) => {
	try {
		const response = await axiosInstance.get(`/verify-email?token=${token}`)

		console.log(response.data)
		if (response.data && response.data.data.token) {
			// Verification successful - save token and user data
			const expiryTime = 5 // 5 hours default

			Cookies.set('token', encryptData(response.data.data.token), {
				expires: expiryTime,
			})

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

			verificationSuccess.value = true

			// Clear any pending verification email from storage
			sessionStorage.removeItem('pendingVerificationEmail')

			// Show success alert
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: 'Email verified successfully!',
			})

			// Auto redirect after 2 seconds
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
					setTimeout(() => router.push('/onboarding/company'), 2000)
					return
				} else {
					setTimeout(() => router.push('/onboarding/employee'), 2000)
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

				setTimeout(() => router.push('/home'), 2000)
			}
		}
	} catch (error) {
		console.error('Email verification failed:', error)
		errorMessage.value =
			error?.response?.data?.message ||
			'Invalid or expired verification link'
	} finally {
		isVerifying.value = false
	}
}

const resendVerification = async () => {
	if (user.value === '') {
		errorMessage.value = 'No email found for resending verification'
		return
	}

	isResending.value = true

	try {
		await axiosInstance.post('/resend-verification', { user: user.value })

		store.dispatch('triggerAlert', {
			type: 'success',
			title: 'Success!',
			message: 'Verification email sent! Please check your inbox.',
		})
	} catch (error) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error',
			message:
				error?.response?.data?.message ||
				'Failed to resend verification email',
		})
	} finally {
		isResending.value = false
	}
}

const goToLogin = () => {
	router.push('/')
}

onMounted(() => {
	const token = route.query.token
	user.value = route.query.id

	if (!token) {
		errorMessage.value = 'No verification token provided'
		isVerifying.value = false
		return
	}

	verifyEmail(token)
})
</script>

<style scoped>
.verify-email-container {
	min-height: 100vh;
	min-width: 100vw;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.verify-card {
	background: white;
	padding: 40px;
	border-radius: 12px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	text-align: center;
	max-width: 500px;
	width: 100%;
}

.loading-state .spinner {
	border: 4px solid #f3f3f3;
	border-radius: 50%;
	border-top: 4px solid #667eea;
	width: 50px;
	height: 50px;
	animation: spin 1s linear infinite;
	margin: 0 auto 20px;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.success-icon,
.error-icon {
	font-size: 4rem;
	margin-bottom: 20px;
}

.action-buttons {
	display: flex;
	gap: 15px;
	justify-content: center;
	flex-wrap: wrap;
	margin-top: 20px;
}

.btn-primary,
.btn-secondary {
	padding: 12px 24px;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.3s ease;
}

.btn-primary {
	background: #c58189;
	color: white;
}

.btn-primary:hover {
	background: #d19499;
}

.btn-secondary {
	background: #f8f9fa;
	color: #333;
	border: 1px solid #dee2e6;
}

.btn-secondary:hover {
	background: #e9ecef;
}

.btn-secondary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

h2 {
	color: #333;
	margin-bottom: 15px;
}

p {
	color: #666;
	line-height: 1.5;
}
</style>
