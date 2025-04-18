<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<!-- Form section -->
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<form @submit.prevent="submit">
				<FormHeader
					:title="
						mode === 'edit'
							? 'Edit Product'
							: mode === 'add'
								? 'Add Product'
								: 'Product Detail'
					"
					:showResetButton="
						mode === 'edit' && hasUnsavedChanges.value
					"
					:showSaveButton="mode !== 'detail'"
					@reset="resetForm"
				/>
				<FormSectionHeader
					title="Basic Product Information"
					icon="info"
				/>
				<div class="grid grid-cols-3 gap-6 mt-4">
					<div class="space-y-3">
						<!-- Code -->
						<InputForm
							v-if="mode !== 'add'"
							v-model="form.code"
							id="code"
							label="Code"
							placeholder="Code"
							required
							:error="formError.code"
							:readonly="mode !== 'add'"
						/>
						<!-- Name -->
						<InputForm
							v-model="form.name"
							id="name"
							label="Name"
							placeholder="Name"
							required
							:error="formError.name"
							:readonly="mode === 'detail'"
						/>
						<!-- Category -->
						<div>
							<label
								for="dropdown"
								class="block text-sm text-grey-900 font-medium mb-1"
							>
								Category<span class="text-pinkDark">*</span>
							</label>
							<Dropdown
								:items="categories"
								v-model="form.category_id"
								placeholder="Select a category"
								:multiple="false"
								:searchable="true"
								:disabled="mode === 'detail'"
								:addRoute="'/master/category/add'"
							/>
							<p
								v-if="formError.category_id"
								class="text-pinkDark text-xs italic transition duration-300"
							>
								{{ formError.category_id }}
							</p>
						</div>
					</div>
					<div class="space-y-3">
						<!-- Type -->
						<div>
							<label
								for="dropdown"
								class="block text-sm text-grey-900 font-medium mb-1"
							>
								Type<span class="text-pinkDark">*</span>
							</label>
							<Dropdown
								:items="types"
								v-model="form.type_id"
								placeholder="Select a type"
								:multiple="false"
								:searchable="true"
								:disabled="mode === 'detail'"
								:addRoute="`/master/category/view/${form.category_id}`"
							/>
							<p
								v-if="formError.type_id"
								class="text-pinkDark text-xs italic transition duration-300"
							>
								{{ formError.type_id }}
							</p>
						</div>
						<!-- Price -->
						<InputForm
							v-model="form.price"
							id="price"
							label="Active Price"
							placeholder="Active Price"
							required
							:error="formError.price"
							:readonly="true"
						/>
						<!-- Tags -->
						<div class="space-y-3">
							<label
								for="tags"
								class="block text-sm text-grey-900 font-medium mb-1"
							>
								Tags
							</label>
							<div class="relative flex items-center">
								<input
									v-if="mode !== 'detail'"
									v-model="form.tagsInput"
									id="tags"
									type="text"
									placeholder="Add a tag"
									:readonly="mode === 'detail'"
									:value="form.tagsInput"
									@input="
										$emit(
											'update:modelValue',
											$event.target.value
										)
									"
									class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
									:class="{
										'border-pinkDark': formError.tags,
										'border-pinkOrange': !formError.tags,
										'text-opacity-100 bg-opacity-100 text-pinkDark':
											mode === 'detail', // When not readonly
									}"
									@keypress.enter.prevent
								/>

								<!-- Tombol Add di sebelah kanan input dengan gaya yang serupa -->
								<button
									v-if="mode !== 'detail'"
									type="button"
									@click="addTag"
									class="ml-2 px-4 py-2 bg-pinkGray border border-pinkOrange border-opacity-25 rounded-lg text-pinkDark hover:bg-pinkDark hover:text-white focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25 transition duration-300 ease-in-out"
								>
									Add
								</button>
							</div>
							<div class="mt-2 flex flex-wrap gap-2">
								<!-- Menampilkan tag yang sudah dimasukkan -->
								<span
									v-for="(tag, index) in form.tags"
									:key="index"
									class="inline-flex items-center bg-pinkLight text-pinkDark text-sm font-semibold rounded-full px-4 py-2"
								>
									{{ tag }}
									<button
										v-if="mode !== 'detail'"
										type="button"
										@click="removeTag(index)"
										class="ml-2 text-pinkDark"
									>
										×
									</button>
								</span>
							</div>
						</div>
					</div>
					<div class="space-y-3">
						<!-- Description -->
						<TextareaForm
							v-model="form.description"
							id="description"
							label="Description"
							placeholder="Description"
							:error="formError.description"
							:readonly="mode === 'detail'"
						/>
					</div>
				</div>
			</form>
			<form @submit.prevent="generateCode" v-if="mode !== 'add'">
				<FormSectionHeader title="Generate Product Code" icon="build" />
				<!-- Choose Generate Code From Purchase / Trade / Supplier -->
				<div class="grid grid-cols-2 gap-4 mb-3">
					<div>
						<button
							type="button"
							class="w-full rounded-lg py-2 px-4 transition duration-300"
							@click="switchForm(1)"
							:class="{
								'bg-pinkGray text-pinkOrange ':
									selectedType == 2,
								'bg-pinkDark text-white hover:bg-pinkOrange':
									selectedType == 1,
							}"
						>
							Item from Supplier
						</button>
					</div>
					<div>
						<button
							type="button"
							class="w-full rounded-lg py-2 px-4 transition duration-300"
							@click="switchForm(2)"
							:class="{
								'bg-pinkGray text-pinkOrange':
									selectedType == 1,
								'bg-pinkDark text-white hover:bg-pinkOrange':
									selectedType == 2,
							}"
						>
							Item from Customer Purchase / Trade
						</button>
					</div>
				</div>
				<div
					v-if="selectedType == 2"
					class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
				>
					<div class="col-span-1">
						<!-- Transaction Purchase / Trade -->
						<label
							for="transref_id"
							class="block text-sm text-grey-900 font-medium mt-4"
						>
							Purchase / Trade Reference
							<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="transrefs"
							v-model="formCode.transref_id"
							placeholder="Select a transaction reference"
							:multiple="false"
							:searchable="true"
							:disabled="false"
							id="transref_id"
						/>
					</div>
				</div>
				<!-- Generate Code Details -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
					<!-- Kolom 1: Weight & Kas/Bank -->
					<div class="col-span-1">
						<!-- Weight -->
						<InputForm
							v-model="formCode.weight"
							type="number"
							id="weight"
							label="Weight"
							placeholder="Weight"
							required
							:readonly="selectedType == 2"
						/>
						<!-- Kas/Bank -->
						<label
							for="account_id"
							class="block text-sm text-grey-900 font-medium mt-4"
						>
							Kas/Bank <span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="accounts"
							v-model="formCode.account_id"
							placeholder="Select an account"
							:multiple="false"
							:searchable="true"
							:disabled="
								mode === 'detail' ||
								(selectedType == 2 && account_id_disabled)
							"
							:addRoute="'/master/account/add'"
							id="account_id"
						/>
					</div>

					<!-- Kolom 2: Image -->
					<div class="col-span-1">
						<label
							for="image"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Upload Image<span class="text-pinkDark">*</span>
						</label>
						<ImageUpload
							v-model="formCode.image"
							:uploadFile="'/upload-product'"
							:readonly="mode === 'detail'"
						/>
					</div>

					<!-- Kolom 3: Harga Beli, PPN Beli, & Generate -->
					<div class="col-span-1">
						<!-- Harga Beli (sebelum pajak) -->
						<InputForm
							v-model="formCode.buy_price"
							type="number"
							id="buy_price"
							label="Harga Beli (sebelum pajak)"
							placeholder="Harga Beli (sebelum pajak)"
							:readonly="selectedType == 2"
							required
						/>
						<!-- PPN Beli -->
						<InputForm
							v-model="formCode.tax_purchase"
							type="number"
							id="tax_purchase"
							class="mt-4"
							:label="'PPN Beli (' + taxPurchasePercentage + '%)'"
							:placeholder="
								'PPN Beli (' + taxPurchasePercentage + '%)'
							"
							:editPath="'/master/store/edit/' + form.store_id"
							:readonly="true"
							required
						/>

						<!-- Generate Button -->
						<div class="flex justify-end items-end mt-6">
							<button
								type="button"
								@click="generateCode"
								class="w-full px-4 py-2 border border-pinkDark bg-pinkDark text-white hover:bg-pinkOrange rounded-lg transition duration-300 ease-in-out hover:ring hover:ring-pinkOrange hover:ring-opacity-25"
							>
								Generate
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
		<div
			class="w-full bg-white h-auto rounded-lg shadow-sm mt-4"
			v-if="mode !== 'add'"
		>
			<h1 class="text-xl text-pinkDark font-bold pt-3 px-4">
				Product Codes
			</h1>
			<TableData
				ref="refTable"
				:columns="columns"
				:addPath="''"
				:export="false"
				:reload="true"
				:ajaxPath="`/inventory/product-codes/${id}`"
				:editPath="''"
				:deletePath="'/inventory/product-code'"
				:infoPath="''"
				:defData="{
					transaction_id: id,
				}"
				:options="{
					scrollX: true,
				}"
			/>
			<!-- Modal for Image Preview -->
			<teleport to="body">
				<div
					v-if="showImageModal"
					class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
					@click.self="closeImageModal"
				>
					<div class="bg-white p-4 rounded-lg shadow-lg max-w-md">
						<img
							:src="selectedImage"
							class="w-full h-auto rounded-lg"
						/>
						<button
							class="mt-2 px-4 py-2 bg-pinkDark text-white rounded-lg w-full"
							@click="closeImageModal"
						>
							Close
						</button>
					</div>
				</div>
			</teleport>
		</div>
	</div>
	<teleport to="#modal-container">
		<div
			v-if="showModal"
			class="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 transition duration-300"
			@click.self="closeModal"
		>
			<div
				class="bg-white w-1/4 max-w-3/4 h-auto max-h-3/4 rounded-lg shadow-lg relative overflow-hidden"
			>
				<!-- Modal Header -->
				<div class="flex justify-between items-center p-4 border-b">
					<h2 class="text-xl font-bold">QR Code</h2>
					<button
						class="text-pinkMed text-2xl hover:text-pinkDark transition duration-300 ease-in-out"
						@click="closeModal"
					>
						&times;
					</button>
				</div>

				<!-- Modal Body -->
				<div class="px-12 py-4 h-auto">
					<img
						:src="dataModalQR"
						alt="QR Code"
						class="w-full h-auto"
					/>
				</div>

				<!-- Modal Footer -->
				<div class="flex justify-end p-4 border-t">
					<button
						class="px-4 py-2 bg-pinkLight text-PinkDark rounded-lg hover:bg-pinkMed mr-2 transition duration-300 ease-in-out"
						@click="closeModal"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</teleport>
</template>

<style scoped>
/* Transition Animations */
.image-transition-enter-active,
.image-transition-leave-active {
	transition:
		opacity 0.3s ease,
		transform 0.3s ease;
}

.image-transition-enter-from {
	opacity: 0;
	transform: translateY(-10px);
}

.image-transition-leave-to {
	opacity: 0;
	transform: translateY(10px);
}

.image-transition-move {
	transition: transform 0.3s ease;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import axiosInstance from '../../axios'

// Components
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'
import Dropdown from '../../components/Dropdown.vue'
import ImageUpload from '../../components/ImageUpload.vue'
import TableData from '../../components/TableData.vue'

const props = defineProps({
	mode: { type: String, required: true },
})
const router = useRouter()
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const id = router.currentRoute.value.params.id

// Constant for Product Code
const columns = Object.freeze([
	{
		data: 'no',
		title: 'No',
		width: '5%',
	},
	{
		data: 'id',
		title: 'Id',
		visible: false,
	},
	{
		data: 'barcode',
		title: 'Code',
	},
	{
		data: 'weight',
		title: 'Weight',
		render: (data) => `<div class="text-end">${data} gr</div>`,
	},
	{
		data: 'fixed_price',
		title: 'Price per Gram',
		render: (data) =>
			`<div class="text-end">${new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(data)}</div>`,
	},
	{
		data: 'status',
		title: 'Status',
		render: (data) =>
			data === 0
				? 'In Stock'
				: data === 3
					? 'Taken Out'
					: data === 2
						? 'Bought Back'
						: 'Sold',
	},
	{
		data: 'buy_price',
		title: 'Harga beli',
		render: (data, type, row) => {
			return `<div class="text-end">${new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(parseFloat(data) + parseFloat(row.tax_purchase))}</div>`
		},
	},
	{
		data: 'id',
		title: 'QR Code',
		render: (data) => `
			<button
				class="bg-pinkDark text-white px-2 py-1 rounded-lg hover:bg-pinkDarker transition duration-300 ease-in-out"
				onclick="showQrCode('${data}')"
			>
				Show QR
			</button>
		`,
	},
	{
		data: 'image',
		title: 'Image',
		render: (data) => {
			if (!data) return 'No Image'

			// Ubah backslash ke forward slash
			const formattedData = data.replace(/\\/g, '/')

			return `<img src="http://127.0.0.1:3000/${formattedData}" onclick="window.showImage('${formattedData}')" class="w-12 h-12 cursor-pointer rounded-md shadow-md hover:shadow-lg transition" />`
		},
	},
	{
		data: 'action',
		title: 'Action',
		width: '5%',
	},
])

window.showImage = (imagePath) => {
	openImageModal(imagePath)
}
// Function to fetch data QRCode
window.showQrCode = async (id) => {
	try {
		const response = await axiosInstance.post(
			`/inventory/generate-product-code-qr/${id}`
		)
		dataModalQR.value = await response.data.data
		openModal()
		console.log(response.data.data) // Replace this with modal logic
	} catch (e) {
		alert('Error: ' + (e.response?.data?.message || 'Something went wrong'))
	}
}
const showModal = ref(false)
const dataModalQR = ref('')
const showImageModal = ref(false)
const selectedImage = ref('')
const openModal = () => {
	showModal.value = true
}
const closeModal = () => {
	showModal.value = false
	dataModalQR.value = null
}
const openImageModal = (imagePath) => {
	// const sanitizedPath = imagePath.replace(/\\/g, '/');

	selectedImage.value = `http://127.0.0.1:3000/${imagePath}`
	showImageModal.value = true
}

const closeImageModal = () => {
	showImageModal.value = false
	selectedImage.value = ''
}

// Form Data for Product
const form = ref({
	code: '',
	name: '',
	category_id: [],
	type_id: [],
	price: '',
	description: '',
	tags: [],
	store_id: '',
})
const formCopy = ref({ ...form.value })
const formError = ref({
	code: '',
	name: '',
	category_id: '',
	type_id: '',
	price: '',
	tags: '',
	description: '',
	product_codes: '',
})
const onSubmit = ref(false)

// Constant category
const categories = ref([])
const fetchCategory = async () => {
	try {
		const response = await axiosInstance.get('/inventory/category', {
			params: {
				store_id: decryptData(Cookies.get('userdata')).store_id,
			},
		})
		if (response.data) {
			const res = response.data.data.data
			categories.value = res.map((category) => ({
				id: category.id,
				label: `${category.code}-${category.name}`,
			}))
		}
	} catch (error) {
		showAlert('error', 'Error!', 'Failed to fetch category data.')
		categories.value = []
	}
}

const addTag = () => {
	if (form.value.tagsInput.trim() !== '') {
		form.value.tags.push(form.value.tagsInput.trim()) // Menambahkan tag ke array tags
		form.value.tagsInput = '' // Reset input field setelah menambahkan tag
	}
}

const removeTag = (index) => {
	form.value.tags.splice(index, 1) // Menghapus tag berdasarkan index
}

// watch category
watch(
	() => form.value.category_id,
	async (newVal) => {
		if (newVal.length > 0 && !onSubmit.value) {
			await fetchType(newVal[0])
		}
	}
)
// Constant type
const types = ref([])
const fetchType = async (category_id) => {
	try {
		const response = await axiosInstance.get('/inventory/type', {
			params: {
				category_id,
			},
		})
		if (response.data) {
			const res = response.data.data.data
			types.value = res.map((type) => ({
				id: type.id,
				label: `${type.code}-${type.name}`,
			}))
		}
	} catch (error) {
		showAlert('error', 'Error!', 'Failed to fetch type data.')
		types.value = []
	}
}
// watch Type
watch(
	() => form.value.type_id,
	async (newVal) => {
		if (newVal.length > 0 && !onSubmit.value) {
			await fetchPrice(newVal[0])
		}
	}
)
// Fetch Default Price
const fetchPrice = async (type_id) => {
	try {
		const response = await axiosInstance.get('/inventory/price', {
			params: {
				order_by: { date: 'desc' },
				filter: { type_id: type_id, is_active: true },
			},
		})
		if (response.data) {
			const res = response.data.data.data
			form.value.price = res[0].price
			formCode.value.fixed_price = res[0].price
		}
	} catch (error) {
		showAlert('error', 'Error!', 'Failed to fetch price data.')
		form.price = ''
	}
}

const startIndex = ref(0)

const prevPage = async () => {
	if (startIndex.value > 0) {
		startIndex.value -= 1
	}
}

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}
const resetForm = () => {
	form.value = { ...formCopy.value }
}
const hasUnsavedChanges = computed(() => {
	return Object.keys(form.value).some(
		(key) => form.value[key] !== formCopy.value[key]
	)
})
const excludedKeys = ['code', 'description', 'tags', 'tagsInput']
const hasFullyFilled = computed(() => {
	return Object.keys(form.value)
		.filter((key) => !excludedKeys.includes(key))
		.every((key) => {
			return (
				form.value[key] !== '' &&
				form.value[key] !== null &&
				form.value[key] !== undefined &&
				form.value[key].length > 0
			)
		})
})

const submitProduct = async () => {
	try {
		const endpoint =
			props.mode === 'edit'
				? `/inventory/product/${id}`
				: '/inventory/product'
		const method = props.mode === 'edit' ? 'put' : 'post'
		if (Array.isArray(form.value.category_id)) {
			form.value.category_id = form.value.category_id[0]
		}
		if (Array.isArray(form.value.type_id)) {
			form.value.type_id = form.value.type_id[0]
		}

		const response = await axiosInstance[method](endpoint, form.value)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			showAlert('success', 'Success!', `Product ${action} successfully.`)
			return response.data.data
		}
	} catch (error) {
		const errors = error.response.data.errors || []
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		showAlert('error', 'Error!', 'Failed to submit product data.')
	}
}
// Submit Form
const submit = async () => {
	onSubmit.value = true
	if (!hasFullyFilled.value && props.mode === 'add') {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'You are missing some fields.',
		})
		return
	}
	if (!hasUnsavedChanges.value && props.mode === 'edit') {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'No changes detected.',
		})
		return
	}
	resetError()
	const data = await submitProduct()
	router.push(`/inventory/product/detail/${data.id}`)
	if (!Array.isArray(form.value.type_id)) {
		form.value.type_id = [form.value.type_id]
	}
	if (!Array.isArray(form.value.category_id)) {
		form.value.category_id = [form.value.category_id]
	}
	onSubmit.value = false
}

// Generate Code [For mode EDIT and VIEW only]
const formCode = ref({
	weight: 0,
	fixed_price: '',
	buy_price: 0,
	tax_purchase: 0,
	account_id: [''],
	image: '',
	transref_id: [],
})

// submit generate code
const generateCode = async () => {
	console.log('refTable', refTable.value)
	try {
		if (formCode.value.account_id.length > 0) {
			formCode.value.account_id = formCode.value.account_id[0]
		}
		if (formCode.value.transref_id.length > 0) {
			formCode.value.transref_id = formCode.value.transref_id[0]
		} else {
			formCode.value.transref_id = null
		}
		const response = await axiosInstance.post(
			`/inventory/generate-product-code/${id}`,
			formCode.value
		)
		// console.log('response generate product code frontend', response)

		if (response.data) {
			if (selectedType.value == 2) {
				switchForm(1)
			}
			showAlert('success', 'Success!', response.data.message)
			refTable.value?.reloadData()
			formCode.value.weight = 0
			formCode.value.buy_price = 0
			formCode.value.tax_purchase = 0
			formCode.value.account_id = []
			formCode.value.transref_id = []
			formCode.value.image = ''
		}
	} catch (error) {
		formCode.value.account_id = [formCode.value.account_id]
		formCode.value.transref_id = [formCode.value.transref_id]
		console.log(error)
		showAlert(
			'error',
			'Error!',
			error?.message,
			error?.response?.data?.errors
		)
	}
	formCode.value.weight = 0
	formCode.value.buy_price = 0
}

const showAlert = (
	type: 'success' | 'error' | 'warning',
	title: string,
	message: string,
	errors?: any
) => {
	if (errors) {
		message += `<br><ul>
			${errors.map((err: any) => `<li>${err.field}: ${err.message}</li>`).join('')}
		</ul>`
	}
	store.dispatch('triggerAlert', {
		type,
		title,
		message,
		actions: [
			{
				label: 'close',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
		],
	})
}
// Formatter
const formatNumber = (value: number) => {
	// value = Math.round(value)
	if (!value) return 'Rp 0'
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
	}).format(value)
}

// Generate Code if reference Purchase or Trade
const selectedType = ref(1)
const transrefs = ref([])
const axiosFetchTransRef = async (id = null) => {
	try {
		const response = await axiosInstance.get(
			'/transaction/transproduct-notset',
			{
				params: {
					type: encodeURIComponent(
						typeSelected.value.code +
							' - ' +
							categorySelected.value.name
					),
					...(id != null ? { id: id } : {}), // ⬅️ Hanya tambahkan jika id tidak null
				},
			}
		)
		return response
	} catch (error) {
		console.error('Error fetching transaction reference:', error)
	}
}
const fetchTransRef = async () => {
	transrefs.value = []
	try {
		const response = await axiosFetchTransRef()
		if (response.data) {
			const res = response.data.data.data
			// console.log('response ',res);
			for (let prod of res) {
				// console.log('product value id', prod.id);
				transrefs.value.push({
					id: prod.id,
					label: `${prod.transaction.code} | ${prod.weight} gr | ${formatNumber(Math.abs(prod.total_price))}`,
				})
			}
		}
	} catch (error) {
		console.log(error)
		showAlert(
			'error',
			'Error!',
			'Failed to fetch transaction reference data.'
		)
		categories.value = []
	}
}
const switchForm = async (selectedForm) => {
	// selectedFomm 1 -> item from supplier
	// selectedFomm 2 -> item from customer purchase / trade
	selectedType.value = selectedForm
	// reset formCode
	formCode.value.weight = 0
	formCode.value.buy_price = 0
	formCode.value.tax_purchase = 0
	formCode.value.account_id = []
	formCode.value.transref_id = []
	formCode.value.image = ''
	if (selectedForm == 2) {
		await fetchTransRef()
	}
}
// watch transref_id changed deep true
const account_id_disabled = ref(false)
watch(
	() => formCode.value.transref_id,
	async (newVal) => {
		if (
			Array.isArray(formCode.value.transref_id) &&
			formCode.value.transref_id.length > 0
		) {
			const transRefData = await axiosFetchTransRef(
				formCode.value.transref_id[0]
			)
			const val = transRefData.data.data.data[0]
			formCode.value.weight = parseFloat(Math.abs(val.weight))
			formCode.value.account_id = [val.transaction.account_id]
			if (
				val.transaction.account_id != null &&
				val.transaction.account_id != ''
			) {
				account_id_disabled.value = true
			} else {
				account_id_disabled.value = false
			}
			formCode.value.buy_price = Math.abs(parseFloat(val.total_price))
			formCode.value.tax_purchase = 0
		} else {
			account_id_disabled.value = false
			formCode.value.weight = 0
			formCode.value.account_id = ['']
			formCode.value.buy_price = 0
			formCode.value.tax_purchase = 0
		}
	}
)

// Reload Child REF
const refTable = ref('')
const taxPurchasePercentage = ref(0)
const accounts = ref([])
const typeSelected = ref({})
const categorySelected = ref({})
onMounted(async () => {
	await fetchCategory()
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/inventory/product/${id}`)
			// Populate form with fetched data
			form.value = { ...response.data.data }
			form.value.category_id = [form.value.type.category_id]
			categorySelected.value = form.value.type.category
			form.value.type_id = [form.value.type_id]
			typeSelected.value = form.value.type
			form.value.price = 0
			formCopy.value = await JSON.parse(JSON.stringify(form.value))
		} catch (error) {
			showAlert('error', 'Error!', 'Failed to fetch Product data.')
		}
	}
	form.value.store_id = decryptData(Cookies.get('userdata')).store_id

	// PPN Beli
	const store = await axiosInstance.get(
		`/master/store/${form.value.store_id}`
	)
	taxPurchasePercentage.value = parseFloat(store.data.data.tax_purchase)
	const accresponse = await axiosInstance.get('/finance/account', {
		params: {
			account_type_id: [1, 3, 4],
		},
	})
	accounts.value = accresponse.data.data.map((account) => ({
		id: account.id,
		label: `${account.code} - ${account.name}`,
	}))
})

// harga beli on change
watch(
	() => formCode.value.buy_price,
	(newVal) => {
		if (
			formCode.value.transref_id != null &&
			formCode.value.transref_id != ''
		) {
			formCode.value.tax_purchase = 0
		} else {
			formCode.value.tax_purchase =
				(newVal * taxPurchasePercentage.value) / 100
		}
	},
	{ deep: true }
)
</script>
