<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="'Product Code'" />
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<FormSectionHeader
				title="Product Code Information"
				icon="info"
				color="pinkDark"
				accentColor="pinkOrange"
			/>
			<div class="flex flex-col gap-6">
				<!-- Photo -->
				<div class="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
					<div class="space-y-2">
						<ImageUpload
							v-model="form.image"
							:uploadFile="'/upload-product'"
							:readonly="mode === 'detail'"
							:height="800"
						/>
						<div
							class="text-center text-md text-white bg-pinkDark rounded-lg py-2 w-full"
						>
							Status :
							{{
								form.status === 0
									? 'In Stock'
									: form.status == 1
										? 'Sold'
										: form.status == 2
											? 'Taken Out'
											: 'Bought Back'
							}}
						</div>
					</div>
					<div
						class="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
					>
						<div class="space-y-4">
							<InputForm
								id="name"
								label="Name"
								placeholder="Name"
								type="text"
								readonly
								class="w-full"
								v-model="form.product.name"
							/>
							<InputForm
								id="code"
								label="Code"
								placeholder="Code"
								type="text"
								readonly
								class="w-full"
								v-model="form.barcode"
							/>
							<InputForm
								id="category"
								label="Category"
								placeholder="Category"
								type="text"
								readonly
								class="w-full"
								v-model="form.product.type.category.name"
							/>
							<InputForm
								id="subCategory"
								label="SubCategory"
								placeholder="SubCategory"
								type="text"
								readonly
								class="w-full"
								v-model="form.product.type.name"
							/>
							<InputForm
								id="weight"
								label="Weight"
								placeholder="Weight"
								type="text"
								:readonly="props.mode === 'detail'"
								class="w-full"
								v-model="form.weight"
							/>
							<InputForm
								id="certificate_link"
								label="Certificate Link"
								placeholder="Certificate Link"
								type="text"
								readonly
								class="w-full"
								v-model="form.certificate_link"
							/>
						</div>
						<div class="space-y-4">
							<InputForm
								id="price"
								label="Price/gram"
								placeholder="Price/gram"
								type="text"
								:readonly="props.mode === 'detail'"
								class="w-full"
								v-model="form.price"
								format="currency"
							/>
							<InputForm
								id="buy_price"
								label="Buy Price/gram"
								placeholder="Buy Price/gram"
								type="text"
								:readonly="props.mode === 'detail'"
								class="w-full"
								v-model="form.buy_price"
								format="currency"
							/>
							<InputForm
								id="tax_purchase"
								label="Tax Purchase"
								placeholder="Tax Purchase"
								type="text"
								:readonly="props.mode === 'detail'"
								class="w-full"
								v-model="form.tax_purchase"
								format="currency"
							/>
							<InputForm
								id="store_id"
								label="Store"
								placeholder="Store"
								type="text"
								readonly
								class="w-full"
								v-model="form.product.store.name"
							/>
							<InputForm
								id="company_id"
								label="Company"
								placeholder="Company"
								type="text"
								readonly
								class="w-full"
								v-model="form.product.store.company.name"
							/>
							<ToggleForm
								v-model="form.is_active"
								label="Post to Marketplace ?"
								:disabled="mode === 'detail'"
							/>
						</div>
						<div
							v-if="props.mode === 'edit'"
							class="col-span-1 md:col-span-2"
						>
							<button
								type="button"
								class="w-full rounded-md px-4 py-2 text-md text-white bg-pinkDark hover:bg-pinkOrange font-bold focus:outline-none focus:ring focus:ring-pinkDark focus:ring-opacity-25"
								@click="saveUpdate"
							>
								SAVE
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import InputForm from '../../components/InputForm.vue'
import axiosInstance from '../../axios'
import ImageUpload from '../../components/ImageUpload.vue'
import ToggleForm from '../../components/ToggleForm.vue'
import { formatIDR } from '../../utils/common'
const router = useRouter()
const store = useStore()
const authStore = useAuthStore()
const smallMenu = computed(() => store.getters.smallMenu)
const props = defineProps({
	mode: { type: String, required: true },
})
const form = ref({
	product: {
		name: '',
		store: {
			name: '',
			company: {
				name: '',
			},
		},
		type: {
			name: '',
			category: {
				name: '',
			},
		},
		image: 'empty.png',
	},
	weight: 0,
	price: 0,
	buy_price: 0,
	tax_purchase: 0,
	account_id: '',
	barcode: '',
	status: 0,
	is_active: true,
	certificate_link: '',
})
const formCopy = ref({ ...form.value })
const id = router.currentRoute.value.params.id

onMounted(async () => {
	if (!['edit', 'detail'].includes(props.mode)) {
		// redirect 404
		return router.push({
			name: 'NotFound',
		})
	} else {
		try {
			const response = await axiosInstance.get(
				`/inventory/product-code/${id}`
			)
			form.value = { ...response.data.data }
			formCopy.value = { ...form.value }
		} catch (error) {
			console.error(error)
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch product code data.',
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

const saveUpdate = async () => {
	form.value.fixed_price = form.value.price
	console.log('form.value', form.value)
	// return
	try {
		const response = await axiosInstance.put(
			`/inventory/product-code/${id}`,
			form.value
		)
		store.dispatch('triggerAlert', {
			type: 'success',
			title: 'Success!',
			message: 'Product code updated successfully.',
			actions: [
				{
					label: 'close',
					type: 'secondary',
					handler: () => {
						store.dispatch('hideAlert')
						router.pop()
					},
				},
			],
		})
	} catch (error) {
		console.error(error)
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message:
				error.response?.data.message ??
				'Failed to update product code.',
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
</script>
