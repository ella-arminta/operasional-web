<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="pageTitle" />
		<!--  Form section -->
		<form
			class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
			@submit.prevent="submit"
		>
			<div class="flex items-center justify-between">
				<h1 class="text-xl text-pinkDark">
					{{
						mode === 'edit'
							? 'Edit Cashier Closing'
							: mode === 'add'
								? 'Add Cashier Closing'
								: 'Cashier Closing Detail'
					}}
				</h1>
				<div class="flex gap-4">
					<button
						v-if="mode === 'edit' && hasUnsavedChanges"
						class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
						type="button"
						@click="resetForm"
					>
						<i class="material-icons text-md">history</i>
						Reset
					</button>
					<button
						v-if="mode !== 'detail'"
						class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
						:class="{
							'cursor-not-allowed disabled hover:bg-pinkMed ':
								!hasUnsavedChanges,
						}"
						type="submit"
					>
						<i class="material-icons text-md">save</i>
						Save
					</button>
				</div>
			</div>
			<!-- Form Basic Information -->
			<FormSectionHeader
				title="Basic Cashier Closing Information"
				icon="info"
			/>
			<div class="grid grid-cols-2 gap-3 mt-4">
				<!-- First Grid -->
				<div class="space-y-2">
					<!-- Code -->
					<InputForm
						v-model="form.code"
						id="code"
						type="text"
						label="Code"
						placeholder="Code"
						:readonly="true"
						:error="formError.code"
					/>
					<!-- Tanggal -->
					<InputForm
						v-model="formattedDate"
						id="date"
						type="date"
						label="Date"
						placeholder="Date"
						:error="formError.date"
						:required="true"
					/>
					<!-- Dropdown Accounts -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Account Cash/Bank<span class="text-pinkDark"
								>*</span
							>
						</label>
						<Dropdown
							:items="accounts"
							v-model="form.account_id"
							placeholder="Select an account"
							:multiple="false"
							:searchable="true"
							:disabled="mode === 'detail'"
						/>
						<p
							v-if="formError.account_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.account_id }}
						</p>
					</div>
					<!-- saldo awal float -->
					<InputForm
						v-model="form.saldo_awal"
						id="saldo_awal"
						type="number"
						label="Initial Balance"
						placeholder="Initial Balance"
						:required="true"
						:error="formError.saldo_awal"
					/>
					<!-- penjualan cash  -->
					<InputForm
						v-model="form.penjualan_cash"
						id="penjualan_cash"
						type="number"
						label="Cash Sales"
						placeholder="Cash Sales"
						:required="true"
						:error="formError.penjualan_cash"
					/>
					<!-- penjualan transfer -->
					<InputForm
						v-model="form.penjualan_transfer"
						id="penjualan_transfer"
						type="number"
						label="Transfer Sales"
						placeholder="Transfer Sales"
						:required="true"
						:error="formError.penjualan_transfer"
					/>
					<!-- total penjualan -->
					<InputForm
						v-model="form.total_penjualan"
						id="total_penjualan"
						type="number"
						label="Total Sales"
						placeholder="Total Sales"
						:required="true"
						:error="formError.total_penjualan"
					/>
					<!-- pembelian -->
					<InputForm
						v-model="form.pembelian"
						id="pembelian"
						type="number"
						label="Purchases"
						placeholder="Purchases"
						:required="true"
						:error="formError.pembelian"
					/>
					<!-- pengeluaran lain-lain -->
					<InputForm
						v-model="form.pengeluaran"
						id="pengeluaran"
						type="number"
						label="Other Expenses"
						placeholder="Other Expenses"
						:required="true"
						:error="formError.pengeluaran"
					/>
					<!-- gadai -->
					<InputForm
						v-model="form.gadai"
						id="gadai"
						type="number"
						label="Pawn"
						placeholder="Pawn"
						:required="true"
						:error="formError.gadai"
					/>
					<!-- ambil gadai -->
					<InputForm
						v-model="form.ambil_gadai"
						id="ambil_gadai"
						type="number"
						label="Pawn Withdrawal"
						placeholder="Pawn Withdrawal"
						:required="true"
						:error="formError.ambil_gadai"
					/>
					<!-- setor pusat -->
					<InputForm
						v-model="form.setor_pusat"
						id="setor_pusat"
						type="number"
						label="Central Deposit Amount"
						placeholder="Central Deposit"
						:required="true"
						:error="formError.setor_pusat"
					/>
					<!-- dropdown akun setor pusat -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Central Deposit Account<span class="text-pinkDark"
								>*</span
							>
						</label>
						<Dropdown
							:items="accounts"
							v-model="form.account_pusat_id"
							placeholder="Select an account"
							:multiple="false"
							:searchable="true"
							:disabled="mode === 'detail'"
						/>
						<p
							v-if="formError.account_pusat_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.account_pusat_id }}
						</p>
					</div>
					<!-- saldo akhir kas -->
					<InputForm
						v-model="form.saldo_akhir"
						id="saldo_akhir"
						type="number"
						label="Final Balance"
						placeholder="Final Balance"
						:required="true"
						:error="formError.saldo_akhir"
					/>
					<!-- tanggal buka selanjutnya -->
					<InputForm
						v-model="form.tanggal_buka"
						id="tanggal_buka"
						type="date"
						label="Next Opening Date"
						placeholder="Next Opening Date"
						:required="true"
						:error="formError.tanggal_buka"
					/>
				</div>
			</div>
		</form>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, readonly, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import axiosInstance from '../../axios'
import PageTitle from '../../components/PageTitle.vue'
import Dropdown from '../../components/Dropdown.vue'
import InputForm from '../../components/InputForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
const smallMenu = computed(() => store.getters.smallMenu)

const props = defineProps({
	mode: { type: String, required: true },
	pageTitle: { type: String, default: 'Cashier Closing Form' },
	redirect: { type: String, default: '/finance/cashier-closing' },
})
// Dropdown Items
const accounts = ref([])

// Form Data
const form = ref({
	account_id: '',
	date: '',
	code: '',
	saldo_awal: '',
	penjualan_cash: '',
	penjualan_transfer: '',
	total_penjualan: '',
	pembelian: '',
	pengeluaran: '',
	gadai: '',
	ambil_gadai: '',
	setor_pusat: '',
	account_pusat_id: '',
	saldo_akhir: '',
	tanggal_buka: '',
})
const formCopy = ref({ ...form.value })
const formError = ref({
	account_id: '',
	date: '',
	code: '',
	saldo_awal: '',
	penjualan_cash: '',
	penjualan_transfer: '',
	total_penjualan: '',
	pembelian: '',
	pengeluaran: '',
	gadai: '',
	ambil_gadai: '',
	setor_pusat: '',
	account_pusat_id: '',
	saldo_akhir: '',
	tanggal_buka: '',
})

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	// get accounts
	var response = await axiosInstance.get('/finance/account')
	var ownedAccountsKas = response.data.data.filter(
		(account) => account.account_type_id === 1 || account.account_type_id === 3 || account.account_type_id === 4
	)
	var acc = ownedAccountsKas.map((account) => ({
		label: account.code + ' - ' + account.name,
		id: account.id,
	}))
	accounts.value = acc

	if (props.mode != 'add' && id) {
		try {
			console.log('mounted again')
			mountUpdatedData()
		} catch (error) {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch transaction data.',
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
		}
	} else {
		form.value.account_pusat_id = [form.value.account_pusat_id]
		form.value.account_id = [form.value.account_id]
	}

	if (props.mode == 'add') {
		// Set form code
		var userdata = decryptData(Cookies.get('userdata'))
		var store_id = ''
		if (userdata.store > 0) {
			store_id = userdata.store[0].id
		}
		var ajax = `/finance/generate-tk-code`
		if (store_id != '') {
			ajax += `&store_id=${store_id}`
		}
		const response = await axiosInstance.get(ajax)
		const transCode = response.data.data
		form.value.code = transCode
		// set form date to today
		formattedDate.value = formatDate(new Date().toISOString().split('T')[0])
	}
})

const mountUpdatedData = async () => {
	// TODOELLA FIX THIS
	const response = await axiosInstance.get(`/finance/tutup-kasir/${id}`)
	const data = response.data.data
	console.log('data fetched start', JSON.stringify(data))
	form.value = {
		account_id: [data.account_id],
		date: new Date(data.date).toISOString().split('T')[0],
		code: data.code,
		saldo_awal: data.saldo_awal,
		penjualan_cash: data.penjualan_cash,
		penjualan_transfer: data.penjualan_transfer,
		total_penjualan: data.total_penjualan,
		pembelian: data.pembelian,
		pengeluaran: data.pengeluaran,
		gadai: data.gadai,
		ambil_gadai: data.ambil_gadai,
		setor_pusat: data.setor_pusat,
		account_pusat_id: [data.account_pusat_id],
		saldo_akhir: data.saldo_akhir,
		tanggal_buka: new Date(data.tanggal_buka).toISOString().split('T')[0],
	}
	formCopy.value = { ...form.value }
}

const formatDate = (date) => {
	if (!date) return ''
	return new Date(date).toISOString().split('T')[0] // Extract only the date part
}

const formattedDate = computed({
	get: () => formatDate(form.value.date),
	set: (newValue) => {
		form.value.date = newValue
	},
})
// set next opening date to tomorrow
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
form.value.tanggal_buka = formatDate(tomorrow)

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}

const resetForm = async () => {
	form.value = { ...formCopy.value }
}

const hasUnsavedChanges = computed(() => {
	return Object.keys(form.value).some(
		(key) => form.value[key] !== formCopy.value[key]
	)
})

const submit = async () => {
	resetError()
	if (props.mode === 'detail') return
	if (!hasUnsavedChanges.value && props.mode === 'edit') return
	try {
		const endpoint =
			props.mode === 'edit'
				? `/finance/tutup-kasir/${id}`
				: '/finance/tutup-kasir'
		const method = props.mode === 'edit' ? 'put' : 'post'

		form.value.account_pusat_id = form.value.account_pusat_id[0]
		form.value.account_id = form.value.account_id[0]

		const response = await axiosInstance[method](endpoint, form.value)
		console.log('submit response', response)
		if (response.data.success) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Transaction ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			const redirect =
				props.mode === 'edit'
					? `${props.redirect}/edit/${id}`
					: props.redirect
			router.push(redirect)
			if (props.mode === 'edit') {
				mountUpdatedData()
			}
		}
	} catch (error) {
		console.log('error', error)
		form.value.account_pusat_id = [form.value.account_pusat_id]
		form.value.account_id = [form.value.account_id]

		if (error.response.data.statusCode.toString().startsWith('4')) {
			console.log('hellowwhaha')
			const errors = error.response.data.errors || []
			var errormessagelist = ''
			errors.forEach((err) => {
				formError.value[err.field] = err.message
				errormessagelist += err.message + '\n'
			})
			console.log(formError.value)
			store.dispatch('triggerAlert', {
				type: 'warning',
				title: `Please check form input again`,
				message: `Transaction ${props.mode === 'edit' ? 'update' : 'creation'} failed!`,
			})
		} else {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: `Transaction ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
			})
		}
	}
}
</script>
