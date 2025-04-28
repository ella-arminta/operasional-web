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
							? 'Edit Recurring Transaction'
							: mode === 'add'
								? 'Add Recurring Transaction'
								: 'Recurring Transaction Detail'
					}}
				</h1>
				<div class="flex gap-4">
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
				title="Basic Recurring Information"
				icon="info"
			/>
			<div class="grid grid-cols-2 gap-3 mt-4">
				<!-- First Grid -->
				<div class="space-y-2">
					<!-- Type expense / income -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Type<span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="types" v-model="form.trans_type_id" />
						<p
							v-if="formError.trans_type_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.trans_type_id }}
						</p>
					</div>
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
					<!-- Recurring Period -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Recurring Period<span class="text-pinkDark">*</span>
						</label>
						<RecurringSelector
							v-model="formRecurring"
							ref="recurringFormRef"
						/>
					</div>
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
		</form>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, readonly, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
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
	pageTitle: { type: String, default: 'Recurring Form' },
	redirect: { type: String, default: '/finance/recurring' },
})
// Dropdown Items
const accounts = ref([])
const types = ref([
	{
		label: 'Expense',
		id: 1,
	},
	{
		label: 'Income',
		id: 2,
	},
])
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
	accounts: [],
	trans_type_id: '',
	recurring: true,
	store_id: '',
})
const formCopy = ref({ ...form.value })
const formError = ref({
	code: '',
	account_cash_id: '',
	total: '',
	description: '',
	accounts: '',
	recurring: '',
	trans_type_id: '',
	store_id: '',
})
const formRecurring = ref({
	recurringType: '',
	interval: 1,
	daysOfWeek: [],
	dayOfMonth: null,
	dayOfMonthCustom: null,
	monthOfYear: null,
	dayOfYear: null,
	dayOfYearCustom: null,
	startDate: null,
	endDate: null,
})
const formRecurringCopy = ref({ ...formRecurring.value })
const recurringFormRef = ref()

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	// GET ACCOUNTS
	var response = await axiosInstance.get('/finance/account')
	var allAccounts = response.data.data
	var ownedAccountsKas = response.data.data.filter(
		(account) => account.account_type_id === 1 || account.account_type_id === 3 || account.account_type_id === 4
	)
	// GET ACCOUNTS
	var acc = ownedAccountsKas.map((account) => ({
		label: account.code +  ' - ' + account.name,
		id: account.id,
	}))
	// GET ALL ACCOUNTS
	var accAll = allAccounts.map((account) => ({
		label: account.code + ' - ' +  account.name,
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
})

const mountUpdatedData = async () => {
	const response = await axiosInstance.get(`/finance/recurring/${id}`)
	const data = response.data.data
	console.log('mount data', JSON.stringify(data))
	form.value.total = Math.abs(data.total)
	form.value.description = data.description
	var tempaccounts = []
	data.trans_details_recurring.forEach((details) => {
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
	form.value.trans_type_id = [data.trans_type_id]
	form.value.accounts = tempaccounts
	form.value.store_id = [data.store_id]
	formCopy.value.accounts = tempaccounts
	formCopy.value = { ...form.value }
	formRecurring.value = {
		recurringType:[data.recurringType],
		interval: data.interval,
		daysOfWeek: data.daysOfWeek,
		dayOfMonth: data.dayOfMonth,
		dayOfMonthCustom: data.dayOfMonth != 1 && data.dayOfMonth != -1 ? ['custom'] : [data.dayOfMonth],
		monthOfYear:data.monthOfYear,
		dayOfYear: data.dayOfYear,
		dayOfYearCustom: data.dayOfYear != 1 && data.dayOfYear != -1 ? ['custom'] : [data.dayOfYear],
		startDate: formatDate(data.startDate),
		endDate: formatDate(data.endDate),
	}
}

const formatDate = (date) => {
	console.log('date', date)
	if (!date) return ''
	return new Date(date).toISOString().split('T')[0] // Extract only the date part
}

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}

const hasUnsavedChanges = computed(() => {
	return Object.keys(form.value).some(
		(key) => form.value[key] !== formCopy.value[key]
	) || Object.keys(formRecurring.value).some(
		(key) => formRecurring.value[key] != formRecurringCopy.value[key]
	)
})

const submit = async () => {
	resetError()
	if (props.mode === 'detail') return;
	if (!hasUnsavedChanges.value && props.mode === 'edit') return;
	if(!recurringFormRef.value.validate()) return;
	try {
		const endpoint =
			props.mode === 'edit'
				? `/finance/recurring/${id}`
				: '/finance/recurring'
		const method = props.mode === 'edit' ? 'put' : 'post'

		// Preprocess form data
		form.value.accounts = form.value.accounts.map((account) => {
			account.account_id = account.account_id
				? account.account_id[0]
				: null
			return account
		})
		if (form.value.store_id != '') {
			form.value.store_id = form.value.store_id[0]
		}
		if (form.value.trans_type_id != '') {
			form.value.trans_type_id = form.value.trans_type_id[0]
		}
		// Preprocess form recurring
		formRecurring.value.recurringType = formRecurring.value.recurringType[0]
		formRecurring.value.dayOfMonth = formRecurring.value.dayOfMonthCustom == 'custom' ? formRecurring.value.dayOfMonth :
			( formRecurring.value.dayOfMonthCustom.length > 0 ? formRecurring.value.dayOfMonthCustom[0] : null )
		formRecurring.value.dayOfYear = formRecurring.value.dayOfYearCustom == 'custom' ? formRecurring.value.dayOfYear :
			( formRecurring.value.dayOfYearCustom.length > 0 ? formRecurring.value.dayOfYearCustom[0] : null )
			
		const response = await axiosInstance[method](endpoint, {
			...form.value,
			...formRecurring.value,
		})
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
			console.log('the redirect', redirect)
			await nextTick()
			router.push(redirect)
			if (props.mode === 'edit') {
				mountUpdatedData()
			}
		}
	} catch (error) {
		console.log('error', error)
		form.value.accounts = form.value.accounts.map((account) => {
			account.account_id = [account.account_id]
			return account
		})
		form.value.store_id = [form.value.store_id]
		form.value.trans_type_id = [form.value.trans_type_id]
		formRecurring.value.recurringType = [formRecurring.value.recurringType]
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
</script>
