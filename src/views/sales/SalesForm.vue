<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<form class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4" @submit.prevent="submit">
			<FormHeader :title="mode === 'edit'
				? 'Edit Sales Transaction'
				: mode === 'add'
					? 'Sales Transaction Form'
					: 'Sales Transaction Detail'
				" :showResetButton="mode === 'edit' && hasUnsavedChanges" :showSaveButton="mode !== 'view'" @reset="resetForm" />
			<FormSectionHeader title="Transaction Information" icon="info" />
			<div class="grid grid-cols-3 gap-6 mt-4">
				<div class="space-y-3">
					<InputForm v-if="mode !== 'add'" v-model="form.code" id="code" label="Code" placeholder="Code"
						required :error="formError.code" :readonly="mode !== 'add'" />
					<InputForm v-model="form.date" id="date" type="date" label="Date" placeholder="Date" required
						:error="formError.date" :readonly="mode !== 'add'" />
					<InputForm v-if="mode !== 'add'" v-model="form.employee" id="employee" label="employee"
						placeholder="employee" required :error="formError.employee" :readonly="mode !== 'add'" />
					<!-- Toogle Button to either SELECT from DROPDOWN or QR CODE SCANNER -->
					<div v-if="mode === 'add'">
						<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Select Customer<span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="customerSelection" v-model="selectedWay"
							placeholder="Select a way to select customer" :multiple="false" :searchable="false"
							:disabled="mode === 'view'" :addRoute="''" />
						<a href="/customer" class="text-pinkDark text-sm underline">+ Add Customer</a>
					</div>
					<!-- Use Dropdown Search email -->
					<div v-if="mode === 'add' && selectedWay == 2">
						<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Customer ID<span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="customers" v-model="form.customer_id" placeholder="Select a customer"
							:multiple="false" :searchable="true" :disabled="mode === 'view'" :addRoute="'/customer'" />
						<p v-if="formError.customer_id" class="text-pinkDark text-xs italic transition duration-300">
							{{ formError.customer_id }}
						</p>
					</div>
					<!-- Use Barcode -- QR Code -- TODO: CHANGE INTO QR CODE ACTIVATION CAMERA LATER!! -->
					<div v-if="mode === 'add' && selectedWay == 1">
						<InputForm v-model="form.customer_id" id="customer_id" label="Customer ID"
							placeholder="Customer ID" required :error="formError.customer_id"
							:readonly="mode !== 'add'" />
					</div>
				</div>
				<div class="space-y-3">
					<InputForm v-model="form.name" id="name" label="Customer Name" placeholder="Customer" required
						:error="formError.name" :readonly="true" />
					<InputForm v-model="form.email" id="email" label="Email" placeholder="Email" required
						:error="formError.email" :readonly="true" />
					<InputForm v-model="form.phone" id="phone" label="Phone Number" placeholder="Phone Number" required
						:error="formError.phone" :readonly="true" />
				</div>
				<div class="space-y-3">
					<div class="space-y-3 px-3 py-3 rounded-lg border border-pinkOrange border-opacity-25">
						<div>
							<h4 class="text-md mb-0">Pembayaran</h4>
							<h1 class="text-pinkDark text-2xl mt-0 pt-0">
								{{ formatNumber(form.total_price) }}
							</h1>
						</div>
						<div>
							<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">Payment
								Method<span class="text-pinkDark">*</span></label>
							<Dropdown :items="paymentMethod" v-model="form.payment_method"
								placeholder="Select a payment method" :multiple="false" :searchable="false"
								:disabled="mode === 'view'" :addRoute="''" />
						</div>
						<div>
							<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">Status<span
									class="text-pinkDark">*</span></label>
							<Dropdown :items="status" v-model="form.status" placeholder="Select a status"
								:multiple="false" :searchable="false" :disabled="mode === 'view'" :addRoute="''" />
						</div>
					</div>
				</div>
			</div>
			<FormSectionHeader title="Transaction Details" icon="shopping_cart" />
			<div class="mt-4">
				<div v-if="mode !== 'view'" class="grid grid-cols-3 gap-6 mb-4">
					<div>
						<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Type of Sales<span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="type" v-model="selectedType" placeholder="Select a type of sales"
							:multiple="false" :searchable="false" :disabled="mode === 'view'" :addRoute="''" />
					</div>
					<div v-if="selectedType == 1">
						<InputForm v-model="itemSelected" id="item" label="Product Code" placeholder="Product Code"
							required :readonly="mode === 'view'" />
					</div>
					<div v-if="selectedType == 2">
						<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Operation<span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="operations" v-model="operationSelected" placeholder="Select an Operation"
							:multiple="false" :searchable="true" :disabled="mode === 'view'"
							:addRoute="'/inventory/operation'" />
					</div>
					<div v-if="selectedType.length > 0" class="flex items-end">
						<button type="button"
							class="w-full bg-pinkDark text-white rounded-lg py-2 px-4 hover:bg-pinkOrange transition duration-300"
							@click="handleInsert">
							Add Item
						</button>
					</div>
				</div>
				<EditableCat :initialRows="form.transaction_details" :columns="transactionDetailsColumns"
					:required="false" :readonly="mode === 'view'" :allActive="false" :independent="mode !== 'add'"
					:addable="false" title="Items Detail" @update:rows="handleRowsUpdate"
					:addPath="'/transaction/detail'" :editPath="'/transaction/detail'"
					:deletePath="'/transaction/detail'" :noDataState="noDataState" />
				<div class="grid grid-cols-5 gap-6 mt-8 place-items-end mr-4">
					<div class="col-start-4 space-y-2">
						<h5>Weight Total</h5>
						<h5>Sub Total</h5>
						<h5>
							Tax
							<span class="text-sm text-pinkDark">({{ tax }}%)</span>
						</h5>
						<h5>Total</h5>
					</div>
					<div class="space-y-2 flex flex-col items-end text-pinkDark text-md">
						<h5>{{ form.weight_total }} gram</h5>
						<h5>{{ formatNumber(form.sub_total_price) }}</h5>
						<h5>{{ formatNumber(form.tax_price) }}</h5>
						<h5>{{ formatNumber(form.total_price) }}</h5>
					</div>
				</div>
			</div>
			<!-- Customer Reviews Section -->
			<div v-if="mode !== 'add'" class="mt-6">
				<FormSectionHeader title="Customer Reviews" icon="star" />

				<div v-if="form.transaction_details.some(item => item.TransactionReview)">
					<div v-for="item in form.transaction_details" :key="item.id"
						class="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4">

						<h5 class="font-semibold text-gray-800">
							{{ item.product_code ? item.product_code.barcode : "Unknown Product" }}
						</h5>
						<p class="text-gray-600 text-sm">{{ item.name || "Unnamed Product" }}</p>

						<!-- Display Review If Available -->
						<p v-if="item.TransactionReview">
							<span class="text-yellow-500 font-bold">⭐ {{ item.TransactionReview.rating }} / 5</span>
							<br />
							<span class="text-gray-700 italic">"{{ item.TransactionReview.review }}"</span>
							<br />

							<!-- Show admin reply (read-only) if reply_admin exists -->
						<p v-if="item.TransactionReview.reply_admin" class="text-gray-700 text-sm mt-2">
							<b class="text-gray-800">Admin Reply:</b> {{ item.TransactionReview.reply_admin }}
						</p>

						<!-- Show input field for reply only if there's no reply_admin yet -->
						<div v-else-if="mode === 'edit'" class="mt-2">
							<label class="text-gray-700 text-sm font-semibold">Admin Reply:</label>
							<input v-model="item.adminReply" type="text"
								class="border rounded px-2 py-1 w-full mt-1 text-gray-800 focus:border-pinkDark focus:ring-pinkDark"
								placeholder="Type your reply here..." />
							<button @click="submitAdminReply(item)"
								class="mt-2 px-3 py-1 bg-pinkDark text-white text-sm rounded hover:bg-pinkOrange transition">
								Submit Reply
							</button>
						</div>
						</p>

						<p v-else class="text-gray-500 italic">No review available for this product.</p>
					</div>
				</div>

				<p v-else class="text-gray-500 text-sm italic">No customer reviews found for this transaction.</p>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import PageTitle from '../../components/PageTitle.vue'
import FormHeader from '../../components/FormHeader.vue'
import InputForm from '../../components/InputForm.vue'
import axiosInstance from '../../axios'
import Dropdown from '../../components/Dropdown.vue'
import EditableCat from '../../components/EditableCat.vue'

// Declaration of props, store, router
const props = defineProps({
	mode: String,
})
const store = useStore()
const router = useRouter()
const smallMenu = computed(() => store.getters.smallMenu)
const id = router.currentRoute.value.params.id
const tax = ref(0)

// columns for EditableCat
const transactionDetailsColumns = [
	{
		key: 'name',
		label: 'Name',
		type: 'text',
		readonly: true,
		width: '10%',
	},
	{ key: 'type', label: 'Type', type: 'text', readonly: true, width: '10%' },
	{
		key: 'quantity',
		label: 'Qty',
		type: 'number',
		width: '5%',
	},
	{ key: 'unit', label: 'Unit', type: 'text', readonly: true, width: '1%' },
	{
		key: 'price',
		label: 'Price/unit',
		type: 'number',
		readonly: true,
		formatCurrency: true,
	},
	{
		key: 'adjustment_price',
		label: 'Adj. Price',
		type: 'number',
		formatCurrency: true,
	},
	{
		key: 'total_price',
		label: 'Sub Total',
		type: 'number',
		readonly: true,
		formatCurrency: true,
	},
]
const noDataState = `<p class="text-center text-gray-500 w-full py-2 px-4">Add Transaction Details</p>`

const type = [
	{ id: 1, label: 'Product' },
	{ id: 2, label: 'Operation' },
]

const status = [
	{ id: 0, label: 'Pending' },
	{ id: 1, label: 'Paid' },
	{ id: 2, label: 'Done' },
]

const selectedType = ref([])
const operationSelected = ref([])
const itemSelected = ref([])

// Handle From insert Operation
const handleInsert = async () => {
	if (selectedType.value[0] == 1) {
		// Handle for Product
		const response = await axiosInstance.get(
			`/inventory/product-barcode/${itemSelected.value}`,
			{
				params: {
					store: JSON.parse(Cookies.get('userdata')).store_id,
				},
			}
		)
		if (response.data.success) {
			console.log(response.data.data)
			const data = {
				detail_type: 'product',
				id: null,
				product_code_id: response.data.data.id,
				type: response.data.data.type,
				name: response.data.data.name,
				price: parseFloat(response.data.data.price),
				quantity: parseFloat(response.data.data.weight),
				unit: 'gram',
				adjustment_price: 0,
				total_price: 0,
			}
			form.value.transaction_details = [
				...form.value.transaction_details,
				data,
			]
			itemSelected.value = []
		} else {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: response.data.message,
			})
		}
	} else if (selectedType.value[0] == 2) {
		// Handle for Operation
		var data = {
			detail_type: 'operation',
			id: null,
			operation_id: operationSelected.value[0],
			type: 'Operation',
			name: operations.value.find(
				(operation) => operation.id == operationSelected.value
			).label,
			price: parseFloat(
				operations.value.find(
					(operation) => operation.id == operationSelected.value
				).price
			),
			quantity: 1,
			unit: operations.value.find(
				(operation) => operation.id == operationSelected.value
			).uom,
			adjustment_price: 0,
			total_price: 0,
		}
		form.value.transaction_details = [
			...form.value.transaction_details,
			data,
		]
		operationSelected.value = []
	}
	selectedType.value = []
	console.log(form.value.transaction_details)
}

// Form Data
const form = ref({
	code: '',
	employee: '',
	date: '',
	customer_id: '',
	name: '',
	email: '',
	phone: '',
	store_id: '',
	employee_id: '',
	payment_method: [1],
	transaction_type: [1], //sales
	transaction_details: [],
	weight_total: 0,
	sub_total_price: 0,
	tax_price: 0,
	total_price: 0,
	status: [0],
})
const formCopy = ref({ ...form.value })

const formError = ref({
	code: '',
	employee: '',
	date: '',
	customer_id: '',
	store_id: '',
	employee_id: '',
	payment_method: '',
	transaction_type: '', //sales
	transaction_details: [],
	weight_total: '',
	sub_total_price: '',
	tax_price: '',
	total_price: '',
})

// Handle Form Data for Types
const handleRowsUpdate = (newRows) => {
	if (props.mode === 'edit') {
		form.value.transaction_details = newRows
		formCopy.value.transaction_details = newRows
	}
	form.value.transaction_details = newRows
}

// Data Customers
const customerSelection = [
	{ id: 1, label: 'Via QR CODE' },
	{ id: 2, label: 'Via PhoneNumber/Email' },
]
const selectedWay = ref([1])
watch(
	() => selectedWay.value,
	async (newValue) => {
		if (newValue[0] == 1) {
			// Use QR CODE TODO: LATER FOR CAMERA ACCESS QR CODE SCANNER
		} else if (newValue[0] == 2) {
			// Use Phone Number or Email
			await fetchCustomer()
		}
	}
)
const customers = ref([])
const fetchCustomer = async () => {
	const response = await axiosInstance.get('/transaction/customer')

	if (response.data.success) {
		customers.value = response.data.data.map((customer) => ({
			...customer,
			label: `${customer.email} - ${customer.phone}`,
		}))
	} else {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: response.data.message,
		})
	}
}
watch(
	() => form.value.customer_id,
	(newValue) => {
		if (newValue) {
			const customer = customers.value.find(
				(customer) => customer.id == newValue
			)
			form.value.name = customer.name
			form.value.email = customer.email
			form.value.phone = customer.phone
		}
	}
)

const submitAdminReply = async (item) => {
	if (!item.adminReply || item.adminReply.trim() === '') {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: 'Reply cannot be empty.',
		});
		return;
	}

	try {
		const response = await axiosInstance.put(
			`/transaction/review/${item.TransactionReview.id}`,
			{
				reply_admin: item.adminReply,
			}
		);

		if (response.status === 201) {
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: 'Reply submitted successfully.',
			});

			// Update the UI without reloading
			item.TransactionReview.reply_admin = item.adminReply;
			item.adminReply = ''; // Clear input field
		} else {
			throw new Error(response.data.message);
		}
	} catch (error) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: error.response?.data?.message || 'Failed to submit reply.',
		});
	}
};


// Data Operations
const operations = ref([])
const fetchOperation = async () => {
	const response = await axiosInstance.get('/inventory/operation')

	if (response.data.success) {
		operations.value = response.data.data.map((operation) => ({
			...operation,
			label: `${operation.code} - ${operation.name}`,
		}))
	} else {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: response.data.message,
		})
	}
}

// Payment Method
const paymentMethod = [
	{ id: 1, label: 'Cash' },
	{ id: 2, label: 'Transfer' },
	{ id: 3, label: 'Credit Card' },
	{ id: 4, label: 'Debit' },
	{ id: 5, label: 'MidTrans' },
]

// Reset Form
const resetForm = () => { }

// Formatter
const formatNumber = (value: number) => {
	// value = Math.round(value)
	if (!value) return 'Rp 0'
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
	}).format(value)
}

// Watch of Change in EDITABLE
watch(
	() => form.value.transaction_details,
	(newValue) => {
		// CHANGE OF SUB TOTAL WITH ADJUSTMENT_PRICE
		if (props.mode === 'view') return
		const tax_price = parseFloat(form.value.tax_price)
		newValue.forEach((item) => {
			item.total_price =
				parseFloat(item.price) * parseFloat(item.quantity)
			item.total_price += parseFloat(item.adjustment_price)
		})
		// Change of TOTAL WEIGHT and TOTAL PRICE
		let total = 0
		let weight = 0
		newValue.forEach((item) => {
			console.log(item);
			if (item.detail_type != 'operation') {
				weight += item.quantity
			}
			total += item.total_price
		})
		form.value.sub_total_price = total
		form.value.tax_price = tax_price + total * parseFloat(tax.value / 100)
		form.value.total_price = total + form.value.tax_price
		form.value.weight_total = weight
	}
)

const validateForm = () => {
	let isValid = true

	// Reset error messages
	formError.value = {
		code: '',
		employee: '',
		date: '',
		customer_id: '',
		store_id: '',
		employee_id: '',
		payment_method: '',
		transaction_type: '', //sales
		transaction_details: [],
		weight_total: '',
		sub_total_price: '',
		tax_price: '',
		total_price: '',
	}

	if (!form.value.date) {
		formError.value.date = 'Date is required'
		isValid = false
	}
	if (!form.value.customer_id) {
		formError.value.customer_id = 'Customer is required'
		isValid = false
	}
	if (!form.value.payment_method) {
		formError.value.payment_method = 'Payment Method is required'
		isValid = false
	}
	if (form.value.transaction_details.length == 0) {
		formError.value.transaction_details = 'Transaction Details is required'
		isValid = false
	}

	return isValid
}

const submit = async () => {
	if (!validateForm()) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Validation Error!',
			message: 'Please fill in all required fields correctly.',
		})
		return
	}
	if (Array.isArray(form.value.payment_method)) {
		form.value.payment_method = form.value.payment_method[0]
	}
	if (Array.isArray(form.value.status)) {
		form.value.status = form.value.status[0]
	}
	if (Array.isArray(form.value.transaction_type)) {
		form.value.transaction_type = form.value.transaction_type[0]
	}
	if (Array.isArray(form.value.customer_id)) {
		form.value.customer_id = form.value.customer_id[0]
	}
	console.log(form.value)
	const response = await axiosInstance.post(
		`/transaction/transaction`,
		form.value
	)

	if (response.data.success) {
		store.dispatch('triggerAlert', {
			type: 'success',
			title: 'Success!',
			message: response.data.message,
		})
		router.push('/transaction/sales')
	} else {
		const errors = error.response.data.errors || []
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		// Reset State array
		form.value.transaction_type = [form.value.transaction_type]
		form.value.payment_method = [form.value.payment_method]
		form.value.customer_id = [form.value.customer_id]
		form.value.status = [form.value.status]
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: response.data.message,
		})
	}
}

const fetchTax = async () => {
	const store_id = form.value.store_id
	const response = await axiosInstance.get(`/master/store/${store_id}`)

	if (response.data.success) {
		tax.value = parseFloat(response.data.data.tax_percentage)
	} else {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: response.data.message,
		})
	}
}

const fetchTransaction = async () => {
	const response = await axiosInstance.get(`/transaction/transaction/${id}`);

	if (response.data.success) {
		const data = response.data.data;
		console.log(data);

		form.value = {
			...data,
			employee: data.employee ? data.employee.email : "N/A", // ✅ Handle null employee
			date: data.date.split('T')[0],
			transaction_details: [
				...data.transaction_products.map((product) => {
					product.detail_type = 'product';
					product.quantity = parseFloat(product.weight);
					product.unit = 'gram';
					product.TransactionReview = product.TransactionReview || null; // ✅ Handle null review
					return product;
				}),
				...data.transaction_operations.map((operation) => {
					operation.detail_type = 'operation';
					operation.quantity = parseFloat(operation.unit);
					operation.unit = operation.operation.uom;
					return operation;
				}),
			],
			weight_total: data.transaction_products.reduce(
				(acc, product) => acc + parseFloat(product.weight),
				0
			),
		};

		form.value.status = [form.value.status];
		form.value.payment_method = [form.value.payment_method];
		formCopy.value = { ...form.value };
		console.log("Ini Form Copy", formCopy.value);
	} else {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: response.data.message,
		});
	}
};


onMounted(async () => {
	await fetchOperation()
	await fetchCustomer()
	if (props.mode === 'add') {
		form.value.store_id = JSON.parse(Cookies.get('userdata')).store_id
		form.value.employee_id = JSON.parse(Cookies.get('userdata')).id
		form.value.date = new Date().toISOString().split('T')[0]
	} else {
		// Fetch Data
		selectedWay.value = [2]
		await fetchTransaction()
	}
	await fetchTax()
})
</script>
