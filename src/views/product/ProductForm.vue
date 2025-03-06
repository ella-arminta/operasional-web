<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<!-- Form section -->
		<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
			<form @submit.prevent="submit">
				<FormHeader :title="mode === 'edit'
					? 'Edit Product'
					: mode === 'add'
						? 'Add Product'
						: 'Product Detail'
					" :showResetButton="mode === 'edit' && hasUnsavedChanges.value
						" :showSaveButton="mode !== 'detail'" @reset="resetForm" />
				<FormSectionHeader title="Basic Product Information" icon="info" />
				<div class="grid grid-cols-3 gap-6 mt-4">
					<div class="space-y-3">
						<!-- Code -->
						<InputForm v-if="mode !== 'add'" v-model="form.code" id="code" label="Code" placeholder="Code"
							required :error="formError.code" :readonly="mode !== 'add'" />
						<!-- Name -->
						<InputForm v-model="form.name" id="name" label="Name" placeholder="Name" required
							:error="formError.name" :readonly="mode === 'detail'" />
						<!-- Category -->
						<div>
							<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
								Category<span class="text-pinkDark">*</span>
							</label>
							<Dropdown :items="categories" v-model="form.category_id" placeholder="Select a category"
								:multiple="false" :searchable="true" :disabled="mode === 'detail'"
								:addRoute="'/master/category/add'" />
							<p v-if="formError.category_id"
								class="text-pinkDark text-xs italic transition duration-300">
								{{ formError.category_id }}
							</p>
						</div>
						<!-- Type -->
						<div>
							<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
								Type<span class="text-pinkDark">*</span>
							</label>
							<Dropdown :items="types" v-model="form.type_id" placeholder="Select a type"
								:multiple="false" :searchable="true" :disabled="mode === 'detail'"
								:addRoute="`/master/category/view/${form.category_id}`" />
							<p v-if="formError.type_id" class="text-pinkDark text-xs italic transition duration-300">
								{{ formError.type_id }}
							</p>
						</div>
						<!-- Price -->
						<InputForm v-model="form.price" id="price" label="Active Price" placeholder="Active Price"
							required :error="formError.price" :readonly="true" />
					</div>
					<div class="space-y-3">
						<!-- Images -->
						<div>
							<label for="image" class="block text-sm text-grey-900 font-medium mb-1">
								Images<span class="text-pinkDark">*</span>
							</label>

							<!-- Pagination Buttons at the Top -->
							<button v-if="startIndex > 0" type="button" @click="prevPage"
								class="w-full mb-2 pt-1 px-4 bg-pinkGray text-pinkOrange border border-pinkOrange border-opacity-25 rounded-lg hover:bg-pinkDark hover:text-white transition duration-300 justify-center items-center">
								<i class="material-icons">keyboard_double_arrow_up</i>
							</button>

							<!-- Transition Group for Animated Scrolling Effect -->
							<TransitionGroup tag="div" name="scroll-transition" class="space-y-2">
								<div v-for="(image, index) in paginatedImages" :key="startIndex + index"
									class="rounded-lg shadow-sm bg-white">
									<ImageUpload v-model="form.images[startIndex + index]
										" :readonly="mode === 'detail'" :uploadFile="'/upload-product'" />
								</div>
							</TransitionGroup>

							<!-- Pagination Buttons at the Bottom -->
							<button v-if="
								startIndex + pageSize < form.images.length
							" type="button" @click="nextPage"
								class="mt-2 w-full pt-1 px-4 bg-pinkGray text-pinkOrange border border-pinkOrange border-opacity-25 rounded-lg hover:bg-pinkDark hover:text-white transition duration-300 justify-center items-center">
								<i class="material-icons">keyboard_double_arrow_down</i>
							</button>

							<!-- Add Image Button (only on last page) -->
							<button v-if="mode !== 'detail' && isLastPage" @click="addImage" type="button"
								class="w-full px-4 py-2 bg-pinkDark text-white rounded-lg hover:bg-pinkDarker transition duration-300 mt-2">
								+ Add Image
							</button>
							<p v-if="formError.images" class="text-pinkDark text-xs italic transition duration-300">
								{{ formError.images }}
							</p>
						</div>
					</div>
					<div class="space-y-3">
						<div class="space-y-3">
							<!-- Description -->
							<TextareaForm v-model="form.description" id="description" label="Description"
								placeholder="Description" :error="formError.description"
								:readonly="mode === 'detail'" />
						</div>
						<!-- Tags -->
						<div class="space-y-3">
							<label for="tags" class="block text-sm text-grey-900 font-medium mb-1">
								Tags
							</label>
							<div class="relative flex items-center">
								<input v-model="form.tagsInput" id="tags" type="text" placeholder="Add a tag" class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300
							placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark
							focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25" :class="{
								'border-pinkDark': formError.tags,
								'border-pinkOrange': !formError.tags,
								'placeholder-opacity-50 bg-opacity-25': readonly,
								'text-opacity-100 bg-opacity-100 text-pinkDark': !readonly,
							}" />
								<!-- Tombol Add di sebelah kanan input dengan gaya yang serupa -->
								<button type="button" @click="addTag" class="ml-2 px-4 py-2 bg-pinkGray border border-pinkOrange border-opacity-25 rounded-lg
								text-pinkDark hover:bg-pinkDark hover:text-white focus:outline-none focus:ring
								focus:ring-pinkOrange focus:ring-opacity-25 transition duration-300 ease-in-out">
									Add
								</button>
							</div>
							<div class="mt-2 flex flex-wrap gap-2">
								<!-- Menampilkan tag yang sudah dimasukkan -->
								<span v-for="(tag, index) in form.tags" :key="index"
									class="inline-flex items-center bg-pinkLight text-pinkDark text-xs font-semibold rounded-full px-2 py-1">
									{{ tag }}
									<button type="button" @click="removeTag(index)" class="ml-2 text-pinkDark">
										×
									</button>
								</span>
							</div>
						</div>
					</div>

				</div>
			</form>
			<form @submit.prevent="generateCode" v-if="mode !== 'add'">
				<FormSectionHeader title="Generate Product Code" icon="build" />
				<div class="grid grid-cols-3 gap-6 mt-4">
					<div>
						<!-- Weight -->
						<InputForm v-model="formCode.weight" type="number" id="weight" label="Weight"
							placeholder="Weight" required />
					</div>
					<!-- Upload Image for Product Code -->
					<div>
						<label for="image" class="block text-sm text-grey-900 font-medium mb-1">
							Upload Image<span class="text-pinkDark">*</span>
						</label>
						<ImageUpload v-model="formCode.image" :uploadFile="'/upload-product'"
							:readonly="mode === 'detail'" />
					</div>
					<div>
						<!-- Harga Beli (sebelum pajak) -->
						<InputForm v-model="formCode.buy_price" type="number" id="buy_price"
							label="Harga Beli (sebelum pajak)" placeholder="Harga Beli (sebelum pajak)" required />
					</div>
					<div>
						<!-- PPN Beli -->
						<InputForm v-model="formCode.tax_purchase" type="number" id="tax_purchase"
							:label="'PPN Beli (' + taxPurchasePercentage + '%)'"
							:placeholder="'PPN Beli (' + taxPurchasePercentage + '%)'"
							:editPath="'/master/store/edit/' + form.store_id" required />
					</div>
					<div>
						<!-- Akun cash / bank -->
						<!-- Label -->
						<label :for="account_id" class="block text-sm text-gray-900 font-medium">
							Kas/Bank <span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="accounts" v-model="formCode.account_id" placeholder="Select an account"
							:multiple="false" :searchable="true" :disabled="mode === 'detail'"
							:addRoute="'/master/account/add'" id="account_id" />
					</div>

					<div class="flex justify-end items-end">
						<!-- Generate -->
						<button type="button" @click="generateCode"
							class="w-full px-4 py-2 border border-pinkDark bg-pinkDark text-white hover:bg-pinkOrange rounded-lg transition duration-300 ease-in-out hover:ring hover:ring-pinkOrange hover:ring-opacity-25">
							Generate
						</button>
					</div>
				</div>
			</form>
		</div>
		<div class="w-full bg-white h-auto rounded-lg shadow-sm mt-4" v-if="mode !== 'add'">
			<h1 class="text-xl text-pinkDark font-bold pt-3 px-4">
				Product Codes
			</h1>
			<TableData ref="refTable" :columns="columns" :addPath="''" :export="false" :reload="true"
				:ajaxPath="`/inventory/product-codes/${id}`" :editPath="''" :deletePath="'/inventory/product-code'"
				:infoPath="''" :defData="{
					transaction_id: id,
				}" />
			<!-- Modal for Image Preview -->
			<teleport to="body">
				<div v-if="showImageModal"
					class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
					@click.self="closeImageModal">
					<div class="bg-white p-4 rounded-lg shadow-lg max-w-md">
						<img :src="selectedImage" class="w-full h-auto rounded-lg" />
						<button class="mt-2 px-4 py-2 bg-pinkDark text-white rounded-lg w-full"
							@click="closeImageModal">
							Close
						</button>
					</div>
				</div>
			</teleport>
		</div>
	</div>
	<teleport to="#modal-container">
		<div v-if="showModal"
			class="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 transition duration-300"
			@click.self="closeModal">
			<div class="bg-white w-1/4 max-w-3/4 h-auto max-h-3/4 rounded-lg shadow-lg relative overflow-hidden">
				<!-- Modal Header -->
				<div class="flex justify-between items-center p-4 border-b">
					<h2 class="text-xl font-bold">QR Code</h2>
					<button class="text-pinkMed text-2xl hover:text-pinkDark transition duration-300 ease-in-out"
						@click="closeModal">
						&times;
					</button>
				</div>

				<!-- Modal Body -->
				<div class="px-12 py-4 h-auto">
					<img :src="dataModalQR" alt="QR Code" class="w-full h-auto" />
				</div>

				<!-- Modal Footer -->
				<div class="flex justify-end p-4 border-t">
					<button
						class="px-4 py-2 bg-pinkLight text-PinkDark rounded-lg hover:bg-pinkMed mr-2 transition duration-300 ease-in-out"
						@click="closeModal">
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
	},
	{
		data: 'fixed_price',
		title: 'Price per Gram',
	},
	{
		data: 'status',
		title: 'Status',
		render: (data) =>
			data === 0 ? 'In Stock' : data === 3 ? 'Taken Out' : 'Sold',
	},
	{
		data: 'buy_price',
		title: 'Harga beli',
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
		data: "image",
		title: "Image",
		render: (data) => {
			if (!data) return "No Image";

			// Ubah backslash ke forward slash
			const formattedData = data.replace(/\\/g, "/");

			return `<img src="http://127.0.0.1:3000/${formattedData}" onclick="window.showImage('${formattedData}')" class="w-12 h-12 cursor-pointer rounded-md shadow-md hover:shadow-lg transition" />`;
		},
	},
	{
		data: 'action',
		title: 'Action',
		width: '5%',
	},
])

window.showImage = (imagePath) => {
	openImageModal(imagePath);
};
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
const showImageModal = ref(false);
const selectedImage = ref("");
const openModal = () => {
	showModal.value = true
}
const closeModal = () => {
	showModal.value = false
	dataModalQR.value = null
}
const openImageModal = (imagePath) => {
	// const sanitizedPath = imagePath.replace(/\\/g, '/');

	selectedImage.value = `http://127.0.0.1:3000/${imagePath}`;
	showImageModal.value = true;
};


const closeImageModal = () => {
	showImageModal.value = false;
	selectedImage.value = "";
};

// Form Data for Product
const form = ref({
	code: '',
	name: '',
	category_id: [],
	type_id: [],
	price: '',
	images: [''],
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
	images: '',
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
				company_id: decryptData(Cookies.get('userdata')).company_id,
			},
		})
		if (response.data) {
			const res = response.data.data
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
		form.value.tags.push(form.value.tagsInput.trim()); // Menambahkan tag ke array tags
		form.value.tagsInput = ''; // Reset input field setelah menambahkan tag
	}
}

const removeTag = (index) => {
	form.value.tags.splice(index, 1); // Menghapus tag berdasarkan index
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
			const res = response.data.data
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
			const res = response.data.data
			form.value.price = res[0].price
			formCode.value.fixed_price = res[0].price
		}
	} catch (error) {
		showAlert('error', 'Error!', 'Failed to fetch price data.')
		form.price = ''
	}
}

// Pagination state
const pageSize = 2 // Show max 2 images at a time
const startIndex = ref(0)

// Compute paginated images
const paginatedImages = computed(() =>
	form.value.images.slice(startIndex.value, startIndex.value + pageSize)
)

// Function to add images
const addImage = () => {
	if (form.value.images.some((image) => image === '')) {
		showAlert(
			'warning',
			'Warning!',
			'Please fill the existing image form first.'
		)
		return
	}
	form.value.images.push('')
	if (startIndex.value + pageSize < form.value.images.length) {
		startIndex.value += 1
	}
}

// Pagination controls
const nextPage = async () => {
	if (startIndex.value + pageSize - 1 < form.value.images.length) {
		startIndex.value += pageSize - 1
	}
}

const prevPage = async () => {
	if (startIndex.value > 0) {
		startIndex.value -= 1
	}
}

// Check if last page
const isLastPage = computed(() => {
	return startIndex.value + pageSize >= form.value.images.length
})

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
const excludedKeys = ['code', 'description']
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
	account_id: [],
	image: '',
})

// submit generate code
const generateCode = async () => {
	console.log('refTable', refTable.value)
	try {
		if (formCode.value.account_id.length > 0) {
			formCode.value.account_id = formCode.value.account_id[0]
		}
		const response = await axiosInstance.post(
			`/inventory/generate-product-code/${id}`,
			formCode.value
		)
		if (response.data) {
			showAlert('success', 'Success!', response.data.message)
			refTable.value?.reloadData()
			formCode.value.weight = 0
			formCode.value.buy_price = 0
			formCode.value.tax_purchase = 0
			formCode.value.account_id = []
			formCode.value.image = ''
		}
	} catch (error) {
		formCode.value.account_id = [formCode.value.account_id]
		console.log(error);
		showAlert('error', 'Error!', error?.message, error?.response?.data?.errors)
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
		</ul>`;
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

// Reload Child REF
const refTable = ref('')
const taxPurchasePercentage = ref(0);
const accounts = ref([]);
onMounted(async () => {
	await fetchCategory()
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/inventory/product/${id}`)
			// Populate form with fetched data
			form.value = { ...response.data.data }
			form.value.category_id = [form.value.type.category_id]
			form.value.type_id = [form.value.type_id]
			form.value.price = 0
			formCopy.value = await JSON.parse(JSON.stringify(form.value))
		} catch (error) {
			showAlert('error', 'Error!', 'Failed to fetch Product data.')
		}
	}
	form.value.store_id = decryptData(Cookies.get('userdata')).store_id

	// PPN Beli
	const store = await axiosInstance.get(`/master/store/${form.value.store_id}`);
	taxPurchasePercentage.value = parseFloat(store.data.data.tax_purchase);
	const accresponse = await axiosInstance.get('/finance/account');
	accounts.value = accresponse.data.data.map((account) => ({
		id: account.id,
		label: `${account.code} - ${account.name}`,
	}));
})

// harga beli on change
watch(
	() => formCode.value.buy_price,
	(newVal) => {
		formCode.value.tax_purchase = (newVal * taxPurchasePercentage.value) / 100
	},
	{ deep: true }
)

</script>
