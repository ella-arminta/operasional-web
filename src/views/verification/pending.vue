<template>
	<div
		class="verification-pending-container flex justify-center items-center min-h-screen bg-pinkGray"
	>
		<div class="pending-card">
			<div class="email-icon">📧</div>
			<h2>Check Your Email</h2>
			<p>
				We've sent a verification link to your email address. Please
				click the link in the email to verify your account.
			</p>

			<div class="info-box">
				<p><strong>Didn't receive the email?</strong></p>
				<ul>
					<li>Check your spam/junk folder</li>
					<li>Make sure you entered the correct email address</li>
					<li>Wait a few minutes and try resending</li>
				</ul>
			</div>

			<div class="action-buttons">
				<button
					@click="resendEmail"
					class="btn-secondary"
					:disabled="isResending"
				>
					{{ isResending ? 'Sending...' : 'Resend Email' }}
				</button>
				<button @click="goToLogin" class="btn-primary bg-pinkDark">
					Back to Login
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'

const router = useRouter()
const store = useStore()
const isResending = ref(false)

const resendEmail = async () => {
	const user = sessionStorage.getItem('pendingVerificationEmail')
	console.log('Email', user)
	if (!user) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error',
			message: 'No user found. Please try logging in again.',
		})
		return
	}

	isResending.value = true

	try {
		await axiosInstance.post('/resend-verification', { user })

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
	sessionStorage.removeItem('pendingVerificationEmail')
	router.push('/')
}
</script>

<style scoped>
.verification-pending-container {
	min-height: 100vh;
	min-width: 100vw;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.pending-card {
	background: white;
	padding: 40px;
	border-radius: 12px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	text-align: center;
	max-width: 500px;
	width: 100%;
}

.email-icon {
	font-size: 4rem;
	margin-bottom: 20px;
}

.info-box {
	background: #f8f9fa;
	padding: 20px;
	border-radius: 8px;
	margin: 20px 0;
	text-align: left;
}

.info-box ul {
	margin: 10px 0 0 20px;
}

.info-box li {
	margin: 5px 0;
	color: #666;
}

.action-buttons {
	display: flex;
	gap: 15px;
	justify-content: center;
	flex-wrap: wrap;
	margin-top: 30px;
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
