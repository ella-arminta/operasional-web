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
							? 'Edit Receivable/Payable'
							: mode === 'add'
								? 'Add Receivable/Payable'
								: 'Receivable/Payable Detail'
					}}
				</h1>
				<div class="flex gap-4">
				</div>
			</div>
			<!-- Form Basic Information -->
			<FormSectionHeader
				title="Basic Receivable/Payable Information"
				icon="info"
			/>
			<div class="grid sm:grid-cols-1 md:grid-cols-3 gap-6 mt-4">
				<!-- First Grid -->
				<div class="space-y-3">
					<!-- Code -->
					<div class="space-y-1 w-full">
						<label for="code" class="block  text-gray-900 font-medium">
							Code
						</label>
						<p class=" text-pinkDark font-bold">
							{{ form.code }}
						</p>
					</div>
					<!-- account -->
					<div>
						<label
							for="account"
							class="block  text-grey-900 font-medium mb-1"
						>
							Account
						</label>
						<p class=" text-pinkDark font-bold">
							{{ form.account.code + ' - ' + form.account.name }}
						</p>
					</div>
					<!-- Set Reminder -->
					<div>
						<label
							for="dropdown"
							class="block  text-grey-900 font-medium mb-1"
						>
							Due Date
						</label>
						<!-- Button due date -->
						<button @click="showModalDueDate()" type="button" class="px-4 py-2 bg-pinkDark text-white rounded-md hover:bg-pinkOrange">
							{{ dueDateText }}
						</button>
					</div>
				</div>
				<!-- Second Grid -->
				<div class="space-y-3">
					<!-- Type -->
					<div class="space-y-1 w-full">
						<label for="type" class="block  text-gray-900 font-medium">
							Type
						</label>
						<p class=" text-pinkDark font-bold">
							{{ form.account.account_type_id == 3 ? 'Payable' : 'Receivable' }}
						</p>
					</div>
					<!-- Open Date  -->
					<div class="space-y-1 w-full">
						<label for="trans_date" class="block  text-gray-900 font-medium">
							Transaction Date
						</label>
						<p class=" text-pinkDark font-bold">
							{{ form.trans_date }}
						</p>
					</div>
					<!-- Trans type -->
					<div class="space-y-1 w-full">
						<label for="trans_type" class="block  text-gray-900 font-medium">
							Transaction Type
						</label>
						<p class=" text-pinkDark font-bold">
							{{ form.trans_type }}
						</p>
					</div>
				</div>
				<!-- Thid grid -->
				<div class="space-y-3">
					<!-- Amount must be payed -->
					<div class="space-y-1 w-full">
						<label for="amount" class="block  text-gray-900 font-medium">
							Amount
						</label>
						<p class=" text-pinkDark font-bold">
							{{ 'Rp. ' + formatIDR(form.amount) }}
						</p>
					</div>
					<!-- Status -->
					<div class="space-y-1 w-full">
						<label for="status" class="block text-gray-900 font-medium">
							Status
						</label>
						<span
							class="inline-block px-2 py-1 text-xs font-semibold rounded"
							:class="statusClass"
						>
							{{ statusText }}
						</span>
					</div>

					<!-- Description -->
					<div class="space-y-1 w-full">
						<label for="description" class="block  text-gray-900 font-medium">
							Description
						</label>
						<p class=" text-pinkDark font-bold">
							{{ form.description }}
						</p>
					</div>
				</div>
			</div>
			<div class="mt-8">
				<RemindersTable
					:title="'Reminders'"
					:dueDate="dueDate"
					:initialRows="remindersList"
					@update:rows="remindersUpdated"
				/>
			</div>
			<div class="mt-8">
				<!-- Detail pelunasan -->
				<RPTable
					:columns="columns"
					:title="'Payment List'"
					:initialRows="paymentList"
					@update:rows="updateAmountPayed"
				/>
			</div>
			<div class="grid sm:grid-cols-1 md:grid-cols-2 gap-3 mt-4">
				<!-- First Grid -->
				<div class="space-y-2">
				</div>
				<!-- Second Grid -->
				<div class="space-y-2">
					<div class="col-start-4 col-span-2 space-y-2">
						<div class=" grid grid-cols-2 w-full items-center">
							<div class="text-start">Amount payable/receivable</div>
							<div class="text-pinkDark text-md text-end">
								Rp. {{ formatIDR(form.amount) }}
							</div>
						</div>
						<div class=" grid grid-cols-2 w-full items-center">
							<div class="text-start">Amount payed</div>
							<div class="text-pinkDark text-md text-end">
								Rp. {{ formatIDR(form.amount_paid) }}
							</div>
						</div>
						<hr />
						<div class=" grid grid-cols-2 w-full items-center">
							<div class="text-start font-bold">Payment Due</div>
							<div class="text-pinkDark text-md text-end font-bold">
								Rp. {{ form.amount_paid ? formatIDR(form.amount - form.amount_paid) : formatIDR(form.amount) }}
							</div>
						</div>
					</div>
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
import RPTable from './RPTable.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import CheckboxForm from '../../components/form/CheckboxForm.vue'
import RecurringSelector from '../../components/RecurringSelector.vue'
import { formatDate, formatDatetime, formatIDR } from '../../utils/common'
import RemindersTable from './RemindersTable.vue'
const smallMenu = computed(() => store.getters.smallMenu)

const props = defineProps({
	mode: { type: String, required: true },
	trans_type_id: { type: Number, default: 1 },
	pageTitle: { type: String, default: 'Receivable/Payable Form' },
	redirect: { type: String, default: '/finance/receivable-payable' },
})
// Dropdown Items
const columns = ref([
	{ label: 'Date', key: 'trans_date', type: 'text' },
	{ label: 'Account', key: 'account_id', type: 'text' },
	{ label: 'Amount Paid', key: 'amount_paid', type: 'text' },
	{ label: 'Description', key: 'detail_description', type: 'text' },
])

// Form Data
const form = ref({
	code: '',
	trans_date: '',
    trans_type: '',
	account: '',
	amount: 0,
	amount_paid: 0,
    description: '',
	status: 0,
})
const formCopy = ref({ ...form.value })
const formError = ref({
	code: '',
	trans_date: '',
    trans_type: '',
	account: '',
	amount: 0,
	amount_paid: 0,
    description: '',
	status: 0,
})

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	// MOUNT UPDATED DATA
	if (props.mode != 'add' && id) {
		try {
			console.log('mounted again')
			mountUpdatedData();
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
	}
	
})

const mountUpdatedData = async () => {
	const response = await axiosInstance.get(`/finance/receivable-payable/${id}`)
	const data = response.data.data
	console.log('receivable payable data one',data);
	form.value.code = data.code
	form.value.trans_date = formatDatetime(data.trans_date)
	form.value.trans_type = data.trans_type.name
	form.value.amount = Math.abs(parseFloat(data.amount))
	form.value.amount_paid = data.payable_receivables != null ? (parseFloat(data.payable_receivables.amount_paid)) : 0
	form.value.description = data.Description
	form.value.account = data.account
	form.value.status = data.payable_receivables?.status ?? 0
	formCopy.value = { ...form.value }

	if (data.payable_receivables != null && data.payable_receivables.due_date != null) {
		const isoDate = new Date(data.payable_receivables.due_date);
		const yyyy = isoDate.getFullYear();
		const mm = String(isoDate.getMonth() + 1).padStart(2, '0');
		const dd = String(isoDate.getDate()).padStart(2, '0');

		dueDate.value = `${yyyy}-${mm}-${dd}`;
		dueDateText.value = formatDate(data.payable_receivables.due_date);
	} else {
		dueDateText.value = 'Set Due Date'
	}
	

	paymentList.value = data.payable_receivables?.payable_receivables_detail?.map(
		(item) => {
		const journal = item.report_journal
		return {
			trans_date: formatDatetime(journal.trans_date),
			account_id: journal.account.code + ' - ' + journal.account.name,
			amount_paid: 'Rp. ' + formatIDR(journal.amount),
			detail_description: journal.detail_description,
			detail_id: item.id,
			total_amount_paid: data.payable_receivables.amount_paid
		}
	}) || [];

	remindersList.value = data.payable_receivables?.reminder_payable_receivables?.map(
		(item) => {
			return {
				reminder_id: item.id,
				interval: item.interval ? item.interval : '-',
				period: item.period ? item.period + '(s) before due date' : '-',
				date_remind: item.date_remind ? formatDate(item.date_remind) : countBackwardDate(item.interval, item.period, dueDate.value),
				emails: item.emails.join(', '),
			}
		}
	) || [];
}

const countBackwardDate = (interval, period, duedate) => {
	const dueDate = new Date(duedate);
	if (period === 'day') {
		dueDate.setDate(dueDate.getDate() - interval);
	} else if (period === 'week') {
		dueDate.setDate(dueDate.getDate() - interval * 7);
	} else if (period === 'month') {
		dueDate.setMonth(dueDate.getMonth() - interval);
	} else if (period === 'year') {
		dueDate.setFullYear(dueDate.getFullYear() - interval);
	}
	return formatDate(dueDate)
}

const resetError = () => {
	Object.keys(formError.value).forEach((key) => {
		formError.value[key] = ''
	})
}

const resetForm = async () => {
	mountUpdatedData();
}

const submit = async () => {
	resetError()
	if (props.mode === 'detail') return
	try {
		const endpoint =
			props.mode === 'edit'
				? `/finance/uang-keluar-masuk/${id}`
				: '/finance/uang-keluar-masuk'
		const method = props.mode === 'edit' ? 'put' : 'post'


		var submittedForm = form.value;
		const response = await axiosInstance[method](endpoint, submittedForm)
		console.log('submit response', response)
		if (response.data.success) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Payable / Receivable Form ${action}.`,
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
const paymentList = ref([]);

const updateAmountPayed = (data) => {
	console.log('update amount payed in parent', data[0]);
	// form.value.amount_paid = data[data.length - 1]?.total_amount_paid ?? 0;
	mountUpdatedData();
}

// Set Due Date
const dueDateText = ref('Set Due Date');
const dueDate = ref();
function showModalDueDate() {
  console.log('due date value', dueDate.value);
  store.dispatch('triggerAlert', {
    type: 'info',
    title: 'Set Due Date',
    inputs: [
      { label: 'Due Date', model: 'dueDate', type: 'date', selectedModel: dueDate.value, required: true },
    ],
    actions: [
      {
        label: 'Cancel',
        type: 'secondary',
        handler: () => store.dispatch('hideAlert'),
      },
      {
        label: 'Save',
        type: 'primary',
        handler:async (data) => {
			console.log('Collected data:', data)
			try {
				const response = await axiosInstance.post('/finance/receivable-payable-duedate/', {
					due_date: data.dueDate,
					report_journal_id: id,
				}, {
					validateStatus: (status) => status < 500 // prevent axios from throwing error on 4xx
				});
				console.log('the response due date', response);
				if (response?.data?.success) {
					store.dispatch('triggerAlert', {
						type: 'success',
						title: 'Success',
						message: response.data.message,
					});
					dueDate.value = data.dueDate;
					dueDateText.value = formatDate(data.dueDate);
					mountUpdatedData();
				}else {
					const errorMessages = response?.data?.errors?.issues?.map(issue => issue.message).join(', ') || response?.data?.message;
					store.dispatch('triggerAlert', {
						type: 'error',
						title: 'Error',
						message: errorMessages,
					});
				}
			} catch (error) {
				console.error('Error saving due date:', error);
				store.dispatch('triggerAlert', {
					type: 'error',
					title: 'Error',
					message: 'Failed to save due date.',
				});
			}
        },
      },
    ],
  })
}
const remindersList = ref([]);
const remindersUpdated = (data) => {
	console.log('update amount payed in parent', data[0]);
	// form.value.amount_paid = data[data.length - 1]?.total_amount_paid ?? 0;
	mountUpdatedData();
}

const statusText = computed(() => {
	const status = form.value.status
	const dueDateStr = form.value.due_date
	const dueDate = dueDateStr ? new Date(dueDateStr) : null
	const now = new Date()

	if (status === 1) return 'Paid'
	if (status === 0 && (dueDate === null || dueDate >= now)) return 'On Progress'
	if (status === 0 && dueDate < now) return 'Overdue'
	return '-'
})

const statusClass = computed(() => {
	const status = form.value.status
	const dueDateStr = form.value.due_date
	const dueDate = dueDateStr ? new Date(dueDateStr) : null
	const now = new Date()

	if (status === 1) return 'text-green-700 bg-green-100'
	if (status === 0 && (dueDate === null || dueDate >= now)) return 'text-yellow-700 bg-yellow-100'
	if (status === 0 && dueDate < now) return 'text-red-700 bg-red-100'
	return 'text-gray-500 bg-gray-100'
})

</script>
