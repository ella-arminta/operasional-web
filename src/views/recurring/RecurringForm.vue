<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="pageTitle" />
		<!--  Form section -->
		<form class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4" @submit.prevent="submit">
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
					<button v-if="mode === 'edit' && hasUnsavedChanges"
						class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
						type="button" @click="resetForm">
						<i class="material-icons text-md">history</i>
						Reset
					</button>
					<button v-if="mode !== 'view'"
						class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
						:class="{
							'cursor-not-allowed disabled hover:bg-pinkMed ':
								!hasUnsavedChanges,
						}" type="submit">
						<i class="material-icons text-md">save</i>
						Save
					</button>
				</div>
			</div>
			<!-- Form Basic Information -->
			<FormSectionHeader title="Basic Recurring Information" icon="info" />
			<div class="grid grid-cols-2 gap-3 mt-4">
				<!-- First Grid -->
				<div class="space-y-2">
                    <!-- Type expense / income -->
                    <div>
                        <label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Type<span class="text-pinkDark">*</span>
						</label>
                        <Dropdown
                            :items="types"
                            v-model="form.trans_type_id"
                        />
                        <p v-if="formError.trans_type_id" class="text-pinkDark text-xs italic transition duration-300">
							{{ formError.trans_type_id }}
						</p>
                    </div>
					<!-- Dropdown Accounts -->
					<div>
						<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Account Cash/Bank<span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="accounts" v-model="form.account_cash_id" placeholder="Select an account"
							:multiple="false" :searchable="true" :disabled="mode === 'view'" />
						<p v-if="formError.account_cash_id" class="text-pinkDark text-xs italic transition duration-300">
							{{ formError.account_cash_id }}
						</p>
					</div>
                    <!-- Recurring Period -->
                    <div>
                        <label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Recurring Period<span class="text-pinkDark">*</span>
						</label>
                        <Dropdown
                            v-if="form.recurring"
                            :items="recurringPeriod"
                            v-model="form.recurring_period_code"
                            placeholder="Select Recurring Period"
                            :multiple="false"
                            :searchable="false"
                            :disabled="mode === 'view'"
                        />
                        <p v-if="formError.recurring_period_code" class="text-pinkDark text-xs italic transition duration-300">
							{{ formError.recurring_period_code }}
						</p>
                    </div>
				</div>
				<!-- Second Grid -->
				<div class="space-y-2">
                    <!-- Dropdown STORE -->
                    <div>
						<label for="dropdown" class="block text-sm text-grey-900 font-medium mb-1">
							Store<span class="text-pinkDark">*</span>
						</label>
						<Dropdown :items="stores" v-model="form.store_id" placeholder="Select a store"
							:multiple="false" :searchable="true" :disabled="mode === 'view'" />
						<p v-if="formError.store_id" class="text-pinkDark text-xs italic transition duration-300">
							{{ formError.store_id }}
						</p>
					</div>
					<!-- Open Date (DatePicker) -->
					<InputForm v-model="formattedDate" id="trans_date" type="date" label="Start Date"
						placeholder="Date" :error="formError.trans_date" />
				</div>
			</div>
			<div class="mt-8">
				<EdiTable 
					:columns="columns" 
					:initialRows="form.accounts"
					:required="true" 
					:title="'Accounts List'"
					@update:rows="handleRowsUpdate" />
			</div>
			<div class="grid grid-cols-2 gap-3 mt-4">
				<!-- First Grid -->
				<div class="space-y-2">
					<!-- Keterangan -->
					<TextareaForm v-model="form.description" id="description" label="description"
						placeholder="description" :readonly="mode === 'view'" />
				</div>
				<!-- Second Grid -->
				<div class="space-y-2">
					<!-- Total -->
					<InputForm v-model="form.total" id="total" type="number" label="Total" placeholder="Total"
						:readonly="true" />
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
const smallMenu = computed(() => store.getters.smallMenu)
const props = defineProps({
	mode: { type: String, required: true },
	pageTitle: { type: String, default: 'Recurring Form' },
	redirect: { type: String, default: '/finance/recurring' },
})
// Dropdown Items
const accounts = ref([])
const stores = ref([])
const types = ref([
    {
        label: 'Expense',
        id: 1,
    },
    {
        label: 'Income',
        id: 2,
    }
])
const columns = ref([
	{ label: 'Amount', key: 'amount', type: 'number', required:true },
	{ label: 'Description', key: 'description', type: 'text' },
]);

const handleRowsUpdate = (updatedRows) => {
	form.value.total = Math.round(
		updatedRows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0) * 100
	) / 100;

	form.value.accounts = [...updatedRows];
};

// Form Data
const form = ref({
	code: '',
	account_cash_id: '',
	total: 0,
	description: '',
	trans_date: '',
	accounts: [],
	trans_type_id:'',
	recurring: true,
	recurring_period_code: '',
    store_id: ''
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
    trans_type_id: '',
    store_id: '',
})
const recurringPeriod = ref({})

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	// GET ACCOUNTS 
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
	accounts.value = acc;
	columns.value.unshift(
		{ label: 'Account', key: 'account_id', type: 'dropdown', items: accAll, required:true },
	)
    // GET ALL STORES
    var storeData = await axiosInstance.get('/master/store')
    var storesFormated = storeData.data.data.map((store) => ({
        label: store.name,
        id: store.id,
    }));
    stores.value = storesFormated;

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

	// GET ALL RECURRING PERIOD
	var recper = await axiosInstance.get('/finance/recurring-period')
	recurringPeriod.value = recper.data.data.map((rec) => ({
		label: rec.name,
		id: rec.code,
	}))
})

const mountUpdatedData = async () => {
	const response = await axiosInstance.get(`/finance/recurring/${id}`)
	const data = response.data.data;
    console.log('mount data',JSON.stringify(data));
	form.value.total = Math.abs(data.total);
	form.value.description = data.description;
	form.value.trans_date = formatDate(data.trans_date);
	var tempaccounts = [];
	data.trans_details_recurring.forEach(details => {
		if (details.kas && details.kas == true) {
			form.value.account_cash_id = [details.account_id]
		}else {
			tempaccounts.push({
				account_id: [details.account_id],
				amount: Math.abs(details.amount).toString(),
				description: details.description,
			});
		}
	});
    form.value.recurring_period_code = [data.recurring_period_code];
    form.value.trans_type_id = [data.trans_type_id];
	form.value.accounts = tempaccounts;
    form.value.store_id = [data.store_id];
	formCopy.value.accounts = tempaccounts;
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
	const data = response.data.data;
	form.value.total =Math.abs(data.total);
	form.value.description = data.description;
	form.value.trans_date = formatDate(data.trans_date);
	var tempaccounts = [];
	data.trans_details.forEach(details => {
		if (details.kas && details.kas == true) {
			form.value.account_cash_id = [details.account_id]
		}else {
			tempaccounts.push({
				account_id: [details.account_id],
				amount: details.amount,
				description: details.description,
			});
		}
	});
	console.log('tempaccounts', JSON.stringify(tempaccounts))
	form.value.accounts = tempaccounts;
	formCopy.value.accounts = tempaccounts;
	formCopy.value = { ...form.value }
}

const hasUnsavedChanges = computed(() => {
	return Object.keys(form.value).some(
		(key) => form.value[key] !== formCopy.value[key]
	)
})

const submit = async () => {
	resetError()
	if (props.mode === 'view') return
	if (!hasUnsavedChanges.value && props.mode === 'edit') return
	try {
		const endpoint =
			props.mode === 'edit' ? `/finance/recurring/${id}` : '/finance/recurring'
		const method = props.mode === 'edit' ? 'put' : 'post'

		form.value.accounts = form.value.accounts.map((account) => {
			account.account_id = account.account_id ? account.account_id[0] : null;
			return account
		})
		if (form.value.recurring_period_code != '') {
			form.value.recurring_period_code = form.value.recurring_period_code[0]
		}
        if (form.value.store_id != '') {
            form.value.store_id = form.value.store_id[0]
        }
        if (form.value.trans_type_id != '') {
            form.value.trans_type_id = form.value.trans_type_id[0]
        }
		const response = await axiosInstance[method](endpoint, form.value)
		console.log('submit response', response);
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
			const redirect = props.mode === 'edit' ? `${props.redirect}/edit/${id}` : props.redirect
            console.log('the redirect',redirect);
            await nextTick() 
			router.push(redirect);
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
		form.value.recurring_period_code = [form.value.recurring_period_code]
        form.value.trans_type_id = [form.value.trans_type_id]
		if (error.response && error.response.data.statusCode.toString().startsWith('4')) {
			const errors = error.response.data.errors || [];
			console.log('the errors hehe', errors);

			let errormessagelist = errors.map(err => `- ${err.message}`).join('<br>');

			errors.forEach((err) => {
				formError.value[err.field] = err.message;
			});

			store.dispatch('triggerAlert', {
				type: 'error',
				title: `Transaction ${props.mode === 'edit' ? 'update' : 'creation'} failed!`,
				message: errormessagelist,
			});


		} else  {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: `Transaction ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
			})
		}
		
	}
}
</script>