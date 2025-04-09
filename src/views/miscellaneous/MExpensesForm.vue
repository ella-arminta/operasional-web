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
							? 'Edit Miscellaneous Expenses'
							: mode === 'add'
								? 'Add Miscellaneous Expenses'
								: 'Miscellaneous Expenses Detail'
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
				title="Basic Miscellaneous Expenses Information"
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
							v-model="form.account_cash_id"
							placeholder="Select an account"
							:multiple="false"
							:searchable="true"
							:disabled="mode === 'detail'"
						/>
						<p
							v-if="formError.account_cash_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.account_cash_id }}
						</p>
					</div>
				</div>
				<!-- Second Grid -->
				<div class="space-y-2">
					<!-- Open Date (DatePicker) -->
					<InputForm
						v-model="formattedDate"
						id="trans_date"
						type="date"
						label="Transaction Date"
						placeholder="Transaction Date Date"
						:readonly="true"
						:error="formError.trans_date"
					/>
				</div>
			</div>
			<div class="mt-8">
				<EdiTable
					:columns="columns"
					:initialRows="form.accounts"
					:required="true"
					:title="'Accounts List'"
					@update:rows="handleRowsUpdate"
				/>
			</div>
			<div class="grid grid-cols-2 gap-3 mt-4">
				<!-- First Grid -->
				<div class="space-y-2">
					<!-- Keterangan -->
					<TextareaForm
						v-model="form.description"
						id="description"
						label="description"
						placeholder="description"
						:readonly="mode === 'detail'"
					/>
				</div>
				<!-- Second Grid -->
				<div class="space-y-2">
					<!-- Total -->
					<InputForm
						v-model="form.total"
						id="total"
						type="number"
						label="Total"
						placeholder="Total"
						:readonly="true"
					/>
				</div>
			</div>
			<FormSectionHeader
				title="Recurring Setting"
				icon="settings"
				v-if="mode == 'add'"
			/>
			<div class="grid grid-cols-2 gap-3 mt-4" v-if="mode == 'add'">
				<div class="space-y-2">
					<!-- Recurring -->
					<div>
						<label
							for="defect"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Recurring
						</label>
						<div
							class="space-y-3 px-3 py-3 rounded-lg border border-pinkOrange border-opacity-25"
						>
							<!-- True or False -->
							<div class="w-full">
								<CheckboxForm
									v-model="form.recurring"
									label="Recurring ?"
								/>
							</div>

							<!-- recurring_period -->
							<label
								for="defect"
								class="block text-sm text-grey-900 font-medium mb-1"
								v-if="form.recurring"
							>
								Recurring Period
								<span class="text-pinkDark">*</span>
							</label>
							<!-- <RecurringSelector v-if="form.recurring" @update="handleRecurring" /> -->
							<RecurringSelector
								v-show="form.recurring"
								v-model="formRecurring"
  								ref="recurringFormRef"
							/>
						</div>
					</div>
				</div>
				<div class="space-y-2"></div>
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
import EdiTable from '../../components/EdiTable.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import CheckboxForm from '../../components/form/CheckboxForm.vue'
import RecurringSelector from '../../components/RecurringSelector.vue'
const smallMenu = computed(() => store.getters.smallMenu)

const props = defineProps({
	mode: { type: String, required: true },
	trans_type_id: { type: Number, default: 1 },
	pageTitle: { type: String, default: 'Miscellaneous Expenses Form' },
	redirect: { type: String, default: '/finance/mexpenses' },
})
// Dropdown Items
const accounts = ref([])
const columns = ref([
	{ label: 'Amount', key: 'amount', type: 'number', required: true },
	{ label: 'Description', key: 'description', type: 'text' },
])

const handleRowsUpdate = (updatedRows) => {
	form.value.total =
		Math.round(
			updatedRows.reduce(
				(sum, row) => sum + parseFloat(row.amount || 0),
				0
			) * 100
		) / 100

	form.value.accounts = [...updatedRows]
}

// Form Data
const form = ref({
	code: '',
	account_cash_id: '',
	total: 0,
	description: '',
	trans_date: '',
	accounts: [],
	trans_type_id: props.trans_type_id,
	recurring: false,
	recurring_period_code: '',
})
const formCopy = ref({ ...form.value })
const formError = ref({
	code: '',
	account_cash_id: '',
	total: '',
	description: '',
	trans_date: '',
	accounts: '',
	recurring: '',
	recurring_period_code: '',
})

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	// get accounts
	var response = await axiosInstance.get('/finance/account')
	var allAccounts = response.data.data
	var ownedAccountsKas = response.data.data.filter(
		(account) => account.account_type_id === 1
	)
	// GET ACCOUNTS
	var acc = ownedAccountsKas.map((account) => ({
		label: account.name,
		id: account.id,
	}))
	// GET ALL ACCOUNTS
	var accAll = allAccounts.map((account) => ({
		label: account.name,
		id: account.id,
	}))
	accounts.value = acc
	columns.value.unshift({
		label: 'Account',
		key: 'account_id',
		type: 'dropdown',
		items: accAll,
		required: true,
	})

	// MOUNT UPDATED DATA
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
		form.value.account_cash_id = [form.value.account_cash_id]
	}

	// SET FORM CODE
	if (props.mode == 'add') {
		// Set form code
		var userdata = decryptData(Cookies.get('userdata'))
		var store_id = ''
		if (userdata.store > 0) {
			store_id = userdata.store[0].id
		}
		var ajax = `/finance/trans-code?trans_type_id=${props.trans_type_id}`
		if (store_id != '') {
			ajax += `&store_id=${store_id}`
		}
		const response = await axiosInstance.get(ajax)
		const transCode = response.data.data
		form.value.code = transCode
		// set form date to today
		formattedDate.value = formatDate(new Date().toISOString().split('T')[0])
	}

	// set form recurring
	formRecurring.value = {
		recurringType: 'DAY',
		interval: 1,
		daysOfWeek: [],
		dayOfMonth: null,
		monthOfYear: null,
		dayOfYear: null,
		startDate: '2023-10-01',
		endDate: '2023-10-31',
	}
})

const mountUpdatedData = async () => {
	const response = await axiosInstance.get(`/finance/transaction/${id}`)
	const data = response.data.data
	form.value.code = data.code
	form.value.total = Math.abs(data.total)
	form.value.description = data.description
	form.value.trans_date = formatDate(data.trans_date)
	var tempaccounts = []
	data.trans_details.forEach((details) => {
		if (details.kas && details.kas == true) {
			form.value.account_cash_id = [details.account_id]
		} else {
			tempaccounts.push({
				account_id: [details.account_id],
				amount: Math.abs(details.amount).toString(),
				description: details.description,
			})
		}
	})
	form.value.accounts = tempaccounts
	formCopy.value.accounts = tempaccounts
	formCopy.value = { ...form.value }
}

const formatDate = (date) => {
	if (!date) return ''
	return new Date(date).toISOString().split('T')[0] // Extract only the date part
}

const formattedDate = computed({
	get: () => formatDate(form.value.trans_date),
	set: (newValue) => {
		form.value.trans_date = newValue
	},
})

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}

const resetForm = async () => {
	const response = await axiosInstance.get(`/finance/transaction/${id}`)
	const data = response.data.data
	form.value.code = data.code
	form.value.total = Math.abs(data.total)
	form.value.description = data.description
	form.value.trans_date = formatDate(data.trans_date)
	var tempaccounts = []
	data.trans_details.forEach((details) => {
		if (details.kas && details.kas == true) {
			form.value.account_cash_id = [details.account_id]
		} else {
			tempaccounts.push({
				account_id: [details.account_id],
				amount: details.amount,
				description: details.description,
			})
		}
	})
	console.log('tempaccounts', JSON.stringify(tempaccounts))
	form.value.accounts = tempaccounts
	formCopy.value.accounts = tempaccounts
	formCopy.value = { ...form.value }
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
				? `/finance/uang-keluar-masuk/${id}`
				: '/finance/uang-keluar-masuk'
		const method = props.mode === 'edit' ? 'put' : 'post'

		form.value.accounts = form.value.accounts.map((account) => {
			account.account_id = account.account_id
				? account.account_id[0]
				: null
			return account
		})
		if (form.value.recurring_period_code != '') {
			form.value.recurring_period_code =
				form.value.recurring_period_code[0]
		}
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
			mountUpdatedData()
		}
	} catch (error) {
		console.log('error', error)
		form.value.accounts = form.value.accounts.map((account) => {
			account.account_id = [account.account_id]
			return account
		})
		form.value.recurring_period_code = [form.value.recurring_period_code]
		if (
			error.response &&
			error.response.data.statusCode.toString().startsWith('4')
		) {
			const errors = error.response.data.errors || []
			console.log('the errors hehe', errors)

			let errormessagelist = errors
				.map((err) => `- ${err.message}`)
				.join('<br>')

			errors.forEach((err) => {
				formError.value[err.field] = err.message
			})

			store.dispatch('triggerAlert', {
				type: 'error',
				title: `Transaction ${props.mode === 'edit' ? 'update' : 'creation'} failed!`,
				message: errormessagelist,
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

const formRecurring = ref({
	recurringType: '',
	interval: 1,
	daysOfWeek: [],
	dayOfMonth: null,
	monthOfYear: null,
	dayOfYear: null,
	startDate: null,
	endDate: null,
})
const recurringFormRef = ref()
watch(() => formRecurring, (newVal) => {
  console.log('[Parent] formRecurring updated from child:', formRecurring.value)
}, { deep: true })
</script>
