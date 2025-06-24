<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<form @submit.prevent="submit">
				<FormHeader :title="mode === 'edit'
					? 'Edit Voucher'
					: mode === 'detail'
						? 'Voucher Detail'
						: 'Add Voucher'
					" :showSaveButton="mode !== 'detail'" />
				<FormSectionHeader title="Voucher Information" icon="info" />

				<div class="space-y-8">
					<!-- Basic Information Section -->
					<div class="bg-white rounded-lg border border-gray-200 p-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Voucher Name -->
							<div class="md:col-span-2">
								<InputForm id="voucher_name" v-model="form.voucher_name" label="Voucher Name"
									placeholder="Enter voucher name" required :error="formError.voucher_name"
									:readonly="mode === 'detail'" />
							</div>

							<!-- Description -->
							<div class="md:col-span-2">
								<TextareaForm id="description" v-model="form.description" label="Description"
									placeholder="Enter voucher description" :error="formError.description"
									:readonly="mode === 'detail'" rows="3" />
							</div>
						</div>
					</div>

					<!-- Discount Configuration Section -->
					<div class="bg-white rounded-lg border border-gray-200 p-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Discount Configuration</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Discount Amount -->
							<div>
								<InputForm id="discount_amount" v-model="form.discount_amount" label="Discount Amount"
									type="number" placeholder="0" required :error="formError.discount_amount"
									:readonly="mode === 'detail'" />
								<p class="text-sm text-gray-500 mt-1 flex items-center">
									<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clip-rule="evenodd"></path>
									</svg>
									Amount entered is in percentage (%)
								</p>
							</div>

							<!-- Max Discount -->
							<div>
								<InputForm id="max_discount" v-model="form.max_discount" label="Max Discount Amount"
									type="number" placeholder="0" required :error="formError.max_discount"
									:readonly="mode === 'detail'" />
								<p class="text-sm text-gray-500 mt-1">Maximum discount in currency</p>
							</div>

							<!-- Minimum Purchase -->
							<div>
								<InputForm id="minimum_purchase" v-model="form.minimum_purchase"
									label="Minimum Purchase" type="number" placeholder="0" required
									:error="formError.minimum_purchase" :readonly="mode === 'detail'" />
								<p class="text-sm text-gray-500 mt-1">Minimum amount to use voucher</p>
							</div>

							<!-- Point Price -->
							<div>
								<InputForm id="poin_price" v-model="form.poin_price" label="Point Price" type="number"
									placeholder="0" required :error="formError.poin_price"
									:readonly="mode === 'detail'" />
								<p class="text-sm text-gray-500 mt-1">Points required to redeem</p>
							</div>
						</div>
					</div>

					<!-- Validity Period Section -->
					<div class="bg-white rounded-lg border border-gray-200 p-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Validity Period</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Start Date -->
							<div>
								<InputFormCustom id="start_date" v-model="form.start_date" label="Start Date"
									type="date" required :error="formError.start_date" :readonly="mode === 'detail'"
									:min="minStartDate" />
								<p class="text-sm text-gray-500 mt-1">When voucher becomes active</p>
							</div>

							<!-- End Date -->
							<div>
								<InputFormCustom id="end_date" v-model="form.end_date" label="End Date" type="date"
									required :error="formError.end_date" :readonly="mode === 'detail'"
									:disabled="!form.start_date" :min="form.start_date" />
								<p class="text-sm text-gray-500 mt-1">When voucher expires</p>
							</div>
						</div>
					</div>

					<!-- Status Section -->
					<div class="bg-white rounded-lg border border-gray-200 p-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Status</h3>
						<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div>
								<label class="text-sm font-medium text-gray-900">Active Status</label>
								<p class="text-sm text-gray-500">Enable or disable this voucher</p>
							</div>
							<ToggleForm v-model="form.is_active" label="" :disabled="mode === 'detail'" />
						</div>
					</div>
				</div>

				<!-- Show totalSold when in view mode -->
				<div v-if="mode === 'detail'" class="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
					<h3 class="text-lg font-semibold text-gray-700">
						Total Sold
					</h3>
					<p class="text-2xl font-bold text-pinkDark">
						{{ form.totalSold }} vouchers sold
					</p>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'

// Components
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import InputFormCustom from '../../components/InputFormCustom.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
import ToggleForm from '../../components/ToggleForm.vue'

const router = useRouter()
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const mode = computed(() => router.currentRoute.value.params.mode)
const id = computed(() => router.currentRoute.value.params.id)
const today = new Date().toISOString().split('T')[0] // hasilnya format "YYYY-MM-DD"
const minStartDate = ref(today)

// Default form state
const form = ref({
	voucher_name: '',
	discount_amount: '',
	max_discount: '',
	minimum_purchase: '',
	poin_price: '',
	description: '',
	start_date: '',
	end_date: '',
	is_active: true, // Pastikan boolean, bukan string
	store_id: decryptData(Cookies.get('userdata')).store_id,
	totalSold: 0, // Default value
})

const formError = ref({
	voucher_name: '',
	discount_amount: '',
	max_discount: '',
	minimum_purchase: '',
	poin_price: '',
	description: '',
	start_date: '',
	end_date: '',
})

const submit = async () => {
	try {
		const url =
			mode.value === 'edit'
				? `/transaction/voucher/${id.value}`
				: '/transaction/voucher'
		const method = mode.value === 'edit' ? 'put' : 'post'
		const headers = {
			Authorization: `Bearer ${Cookies.get('token')}`,
		}

		if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
			formError.value.end_date = 'End Date must be after or same as Start Date'
			return // atau set isValid = false jika validasi terpusat
		}


		// Convert data before submission
		const formData = { ...form.value }

		// Convert numeric values from string to number
		formData.discount_amount = Number(formData.discount_amount)
		formData.max_discount = Number(formData.max_discount)
		formData.minimum_purchase = Number(formData.minimum_purchase)
		formData.poin_price = Number(formData.poin_price)

		formData.is_active = formData.is_active === "true" || formData.is_active === true

		const response = await axiosInstance[method](url, formData, { headers })

		if (response.data.success) {
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Voucher ${mode.value === 'edit' ? 'Updated' : 'Created'} successfully.`,
			})
			router.push('/marketplace/voucher')
		}
	} catch (error) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: 'Failed to process voucher data.',
		})
	}
}



onMounted(async () => {
	if (mode.value !== 'add' && id.value) {
		try {
			const response = await axiosInstance.get(
				`/transaction/voucher/${id.value}/id`
			)
			const voucher = response.data.data

			form.value = {
				voucher_name: voucher.name,
				discount_amount: voucher.discount_amount,
				max_discount: voucher.max_discount,
				minimum_purchase: voucher.min_purchase,
				poin_price: voucher.poin_price,
				description: voucher.description,
				start_date: voucher.start_date.split('T')[0],
				end_date: voucher.end_date.split('T')[0],
				is_active: Boolean(voucher.is_active), // Ubah ke boolean langsung
				store_id: voucher.store_id,
				totalSold: voucher.totalSold || 0, // Ambil dari API response
			}
		} catch (error) {
			console.error('Error fetching voucher:', error)
		}
	}
})
</script>
