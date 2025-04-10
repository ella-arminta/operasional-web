<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="'Check Product'" />
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4 mb-4">
			<FormSectionHeader
				title="Check Product"
				icon="check_circle"
				color="pinkDark"
				accentColor="pinkOrange"
			/>
			<div class="grid grid-cols-3 gap-6 mt-4 items-end">
				<InputForm
					v-model="itemSelected"
					id="item"
					label="Product Code"
					placeholder="Product Code"
					required
				/>
				<div>
					<button
						type="button"
						class="w-full bg-pinkDark text-white rounded-lg py-2 px-4 hover:bg-pinkOrange transition duration-300"
						@click="handleInsert"
					>
						Manual Check
					</button>
				</div>
				<div>
					<button
						type="button"
						class="w-full bg-pinkDark text-white rounded-lg py-2 px-4 hover:bg-pinkOrange transition duration-300"
						@click="scanning = true"
					>
						Scan QR Code
					</button>
				</div>
			</div>
		</div>
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<template v-if="found">
				<FormSectionHeader
					title="Public Information"
					icon="info"
					color="pinkDark"
					accentColor="pinkOrange"
				/>
				<div class="flex flex-col gap-6">
					<!-- Photo -->
					<div class="grid grid-cols-3 gap-6">
						<div class="space-y-2">
							<template v-if="res.image !== null">
								<img
									:src="
										'http://127.0.0.1/3000/uploads/' +
											res.image ?? 'empty.png'
									"
									alt="Product Image"
									class="w-full h-auto object-cover border border-pinkDark border-opacity-25 rounded-lg p-4"
								/>
							</template>
							<template v-else>
								<div
									class="w-full h-auto object-cover border border-pinkDark border-opacity-25 rounded-lg py-20 flex flex-col items-center justify-center"
								>
									<span>
										<i
											class="material-icons text-pinkDark text-2xl"
											>image_not_supported</i
										>
									</span>
									<span class="text-pinkDark text-md">
										No Image Available
									</span>
								</div>
							</template>
							<div
								class="text-center text-md text-white bg-pinkDark rounded-lg py-2 w-full"
							>
								Status :
								{{
									res.status === 0
										? 'In Stock'
										: res.status == 1
											? 'Sold'
											: res.status == 2
												? 'Taken Out'
												: 'Bought Back'
								}}
							</div>
						</div>
						<div class="space-y-2">
							<InputForm
								label="Name"
								placeholder="Name"
								type="text"
								readonly
								class="w-full"
								v-model="res.product.name"
							/>
							<InputForm
								label="Code"
								placeholder="Code"
								type="text"
								readonly
								class="w-full"
								v-model="res.barcode"
							/>
							<InputForm
								label="Category"
								placeholder="Category"
								type="text"
								readonly
								class="w-full"
								v-model="res.product.type.category.name"
							/>
							<InputForm
								label="SubCategory"
								placeholder="SubCategory"
								type="text"
								readonly
								class="w-full"
								v-model="res.product.type.name"
							/>
						</div>
						<div class="space-y-2">
							<InputForm
								label="Weight"
								placeholder="Weight"
								type="text"
								readonly
								class="w-full"
								v-model="res.weight"
							/>
							<InputForm
								label="Price/gram"
								placeholder="Price/gram"
								type="text"
								readonly
								class="w-full"
								v-model="res.price"
							/>
							<InputForm
								label="Store"
								placeholder="Store"
								type="text"
								readonly
								class="w-full"
								v-model="res.product.store.name"
							/>
							<InputForm
								label="Company"
								placeholder="Company"
								type="text"
								readonly
								class="w-full"
								v-model="res.product.store.company.name"
							/>
						</div>
					</div>
				</div>
				<FormSectionHeader
					title="Mutation Information"
					icon="info"
					color="pinkDark"
					accentColor="pinkOrange"
				/>
				<TableData 
					:v-if="itemSelected != ''"
					:columns="columns"
					:export="false"
					:reload="true"
					:ajaxPath="ajaxPath"
					:options="{
						scrollX: true,
					}"
				/>
			</template>
			<template v-else>
				<div
					class="w-full py-24 text-center items-center flex flex-col"
				>
					<span
						><i class="material-icons text-pinkDark text-3xl"
							>searchsearchsearch</i
						></span
					>
					<span class="text-lg text-pinkDark font-semibold">
						Insert the product code you want to check!
					</span>
				</div>
			</template>
		</div>
	</div>
	<QrScanner
		:show="scanning"
		@close="scanning = false"
		@scanned="handleScan"
	/>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, onMounted, ref, render } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import InputForm from '../../components/InputForm.vue'
import QrScanner from '../../components/QrScanner.vue'
import axiosInstance from '../../axios'
import { Title } from 'chart.js'
import { formatIDR } from '../../utils/common'
const router = useRouter()
const store = useStore()
const authStore = useAuthStore()
const smallMenu = computed(() => store.getters.smallMenu)
const scanning = ref(false)
const itemSelected = ref('')
const found = ref(false)
const res = ref({
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
	barcode: '',
	status: 0,
})
const handleScan = (result) => {
	itemSelected.value = result.split(';')[0]
	scanning.value = false
}
const handleInsert = async () => {
	// Handle for Product
	try {
		const response = await axiosInstance.get(
			`/inventory/check-product/${itemSelected.value}`
		)
		ajaxPath.value = '/finance/stock-card' + '?product_code_code=' + itemSelected.value
		if (response.data.success) {
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: 'Product Found!',
			})
			res.value = response.data.data
			res.value.qr_code = itemSelected.value = null
			found.value = true
		}
	} catch (error) {
		console.error(error)
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: error.response?.data.message ?? 'Item Not Found!',
		})
	}
}
const formatPrice = (price) => {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
	}).format(price)
}
const formatDate = (date) => {
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(new Date(date))
}

const ajaxPath = ref('/finance/stock-card' + '?product_code_code=', itemSelected.value);
const columns = [
    { 
        data: 'date', 
        title: 'Date', 
        render: (data) => {
            const date = new Date(data);
            return date.toLocaleDateString('id-ID') + ' ' + 
                   date.toLocaleTimeString('id-ID', { hour12: false });
        } 
    },
    { data: 'code', title: 'Code' },
    { data: 'name', title: 'Name' },
    { data: 'description', title: 'Description', render: (data,type,row) => {
      if (row.trans_code != null && row.trans_code != '') {
        return data + ' ' + row.trans_code;
      } else {
        return data;
      }
    } },
    { data: 'in', title: 'In', className: 'text-end', render: (data) => String(data) },
    { data: 'out', title: 'Out', className: 'text-end', render: (data) => String(data) },
    { data: 'weight_in', title: 'In (gr)', render: (data) => data + ' gr', className: 'text-end' },
    { data: 'weight_out', title: 'Out (gr)', render: (data) => data + ' gr', className: 'text-end' },
	{ data: 'price', title: 'Buy price / Sold price', render: (data) =>'Rp. ' +  formatIDR(data), className: 'text-end' }
];
</script>
