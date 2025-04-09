<template>
	<div
		class="h-full md:h-3/4 max-h-[90vh] md:max-h-[70vh] w-full md:w-3/4 bg-white md:rounded-lg shadow-sm md:my-16 overflow-scroll"
	>
		<!-- Title Stepper OnBoarding Step -->
		<div class="grid grid-cols-2 py-4 md:py-6">
			<!-- Step 1 -->
			<div class="flex flex-col items-center">
				<div
					class="w-10 h-10 flex items-center justify-center rounded-full font-bold bg-pinkDark text-white"
				>
					1
				</div>
				<div class="mt-2 text-sm text-pinkDark text-center">
					Create a Company
				</div>
			</div>

			<!-- Step 2 -->
			<router-link to="/onboarding/store">
				<div class="flex flex-col items-center">
					<div
						class="w-10 h-10 flex items-center justify-center rounded-full font-bold bg-white text-pinkDark border border-pinkDark"
					>
						2
					</div>
					<div class="mt-2 text-sm text-pinkDark text-center">
						Create a Store
					</div>
				</div>
			</router-link>
		</div>

		<!-- Divider -->
		<hr class="border-t border-pinkDark border-opacity-50" />

		<!-- content -->
		<div class="grid grid-cols-1 md:grid-cols-2 w-full">
			<div class="md:flex flex-col mt-10 hidden">
				<h2
					class="text-xl lg:text-2xl font-bold text-pinkDark text-center mt-6"
				>
					Create Your First Company!
				</h2>

				<p
					class="text-md lg:text-lg text-pinkDark text-start mt-6 px-8"
				>
					The Company Here will be your first step into joining our
					community. You can create a company that will be used to
					manage your stores. You can create multiple stores under one
					company. You can also create multiple companies under one
					account. This is useful if you have multiple companies that
					you want to manage under one account.
				</p>
			</div>

			<form class="w-full" @submit.prevent="submit">
				<div
					class="flex flex-col items-center justify-center px-8 py-8 gap-4"
				>
					<h2
						class="w-full text-lg font-bold text-pinkDark text-start mt-2"
					>
						Company Form
					</h2>
					<!-- Code -->
					<InputForm
						v-model="form.code"
						id="code"
						label="Code"
						placeholder="Code"
						required
						:error="formError.code"
					/>
					<!-- Name -->
					<InputForm
						v-model="form.name"
						id="name"
						label="Name"
						placeholder="Name"
						required
						:error="formError.name"
					/>

					<!-- Description -->
					<TextareaForm
						v-model="form.description"
						id="description"
						label="Description"
						placeholder="Description"
						:error="formError.description"
					/>

					<div
						class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full mt-4"
					>
						<!-- Submit Button -->
						<div>
							<button
								type="button"
								class="w-full bg-pinkGray text-pinkDark rounded-lg py-2 px-4 hover:bg-pinkLight hover:text-white transition duration-300"
								@click="alreadyHave"
							>
								Already Had One
							</button>
						</div>
						<!-- Already Have a Company button -->
						<div>
							<button
								type="button"
								class="w-full bg-pinkDark text-white rounded-lg py-2 px-4 hover:bg-pinkOrange transition duration-300"
								@click="submit"
							>
								Next
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { encryptData, decryptData } from '../../utils/crypto'

const form = ref({ code: '', name: '', description: '' })
const formCopy = ref({ ...form.value })
const formError = ref({ code: '', name: '', description: '' })

const store = useStore()
const router = useRouter()
const userData = decryptData(Cookies.get('userdata'))

const alreadyHave = () => {
	if (userData.company_id == null) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You have not created a company yet.',
		})
		return
	}
	router.push('/onboarding/store')
}

onMounted(() => {})

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
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
	if (!hasFullyFilled.value) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You are missing some fields.',
		})
		return
	}
	resetError()
	try {
		const response = await axiosInstance.post('/master/company', form.value)

		console.log(response.data.data.name)
		if (response.data.success) {
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Company ${response.data.data.name} Created.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})

			Cookies.set(
				'userdata',
				encryptData({
					id: userData.id,
					email: userData.email,
					company_id: response.data.data.id,
					store_id: null,
					is_owner: userData.is_owner,
				}),
				{ expires: 5 / 24 }
			) // 5 hours

			router.push('/onboarding/store')
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
			message: `Company creation failed.`,
		})
	}
}
</script>
