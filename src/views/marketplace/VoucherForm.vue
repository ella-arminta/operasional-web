<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<form @submit.prevent="submit">
				<FormHeader
					:title="
						mode === 'edit'
							? 'Edit Voucher'
							: mode === 'detail'
								? 'Voucher Detail'
								: 'Add Voucher'
					"
					:showSaveButton="mode !== 'detail'"
				/>
				<FormSectionHeader title="Voucher Information" icon="info" />

				<div class="grid grid-cols-2 gap-6 mt-4">
					<!-- Voucher Name -->
					<InputForm
						id="voucher_name"
						v-model="form.voucher_name"
						label="Voucher Name"
						placeholder="Enter voucher name"
						required
						:error="formError.voucher_name"
						:readonly="mode === 'detail'"
					/>

					<!-- Discount Amount -->
					<div>
						<InputForm
							id="discount_amount"
							v-model="form.discount_amount"
							label="Discount Amount (%)"
							type="number"
							placeholder="Enter discount amount"
							required
							:error="formError.discount_amount"
							:readonly="mode === 'detail'"
						/>
						<p class="text-sm text-gray-500 mt-1">
							* Amount entered is in percentage (%)
						</p>
					</div>

					<!-- Max Discount -->
					<InputForm
						id="max_discount"
						v-model="form.max_discount"
						label="Max Discount"
						type="number"
						placeholder="Enter max discount"
						required
						:error="formError.max_discount"
						:readonly="mode === 'detail'"
					/>

					<!-- Minimum Purchase -->
					<InputForm
						id="minimum_purchase"
						v-model="form.minimum_purchase"
						label="Minimum Purchase"
						type="number"
						placeholder="Enter minimum purchase"
						required
						:error="formError.minimum_purchase"
						:readonly="mode === 'detail'"
					/>

					<!-- Poin Price -->
					<InputForm
						id="poin_price"
						v-model="form.poin_price"
						label="Poin Price"
						type="number"
						placeholder="Enter poin price"
						required
						:error="formError.poin_price"
						:readonly="mode === 'detail'"
					/>

					<!-- Start Date -->
					<InputForm
						id="start_date"
						v-model="form.start_date"
						label="Start Date"
						type="date"
						required
						:error="formError.start_date"
						:readonly="mode === 'detail'"
					/>

					<!-- End Date -->
					<InputForm
						id="end_date"
						v-model="form.end_date"
						label="End Date"
						type="date"
						required
						:error="formError.end_date"
						:readonly="mode === 'detail'"
					/>

					<!-- Active Status -->
					<ToggleForm
						v-model="form.is_active"
						label="Active Status"
						:disabled="mode === 'detail'"
					/>

					<!-- Description -->
					<TextareaForm
						id="description"
						v-model="form.description"
						label="Description"
						placeholder="Enter voucher description"
						:error="formError.description"
						:readonly="mode === 'detail'"
					/>
				</div>

				<!-- Show totalSold when in view mode -->
				<div
					v-if="mode === 'detail'"
					class="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm"
				>
					<h3 class="text-lg font-semibold text-gray-700">
						Total Sold
					</h3>
					<p class="text-2xl font-bold text-pinkDark">
						{{ form.totalSold }} vouchers sold
					</p>
				</div>

				<button
					v-if="mode !== 'detail'"
					type="submit"
					class="w-full mt-4 px-4 py-2 bg-pinkDark text-white rounded-lg hover:bg-pinkDarker transition duration-300"
				>
					{{ mode === 'edit' ? 'Update Voucher' : 'Create Voucher' }}
				</button>
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
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
import ToggleForm from '../../components/ToggleForm.vue'

const router = useRouter()
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const mode = computed(() => router.currentRoute.value.params.mode)
const id = computed(() => router.currentRoute.value.params.id)

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
