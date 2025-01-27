<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle 
            title="Miscellaneous Expenses Form"
        />
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
						v-if="mode !== 'view'"
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
			<FormSectionHeader title="Basic Miscellaneous Expenses Information" icon="info" />
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
							Account Cash/Bank<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="accounts"
							v-model="form.account_cash.id"
							placeholder="Select an account"
							:multiple="false"
							:searchable="true"
							:disabled="mode === 'view'"
						/>
						<p
							v-if="formError.account_cash"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.account_cash }}
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
                        :readonly="mode === 'view'"
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
			<!-- Form Advanced Settings -->
			<!-- <FormSectionHeader
				title="Advanced Store Settings"
				icon="settings"
			/>
			<div class="grid grid-cols-3 gap-6 mt-4">
				<div class="space-y-3">
					Marketplace poin
					<InputForm
						v-model="form.poin_config"
						id="poin_config"
						type="number"
						label="Marketplace Poin"
						placeholder="Marketplace Poin"
						:readonly="mode === 'view'"
						:error="formError.poin_config"
					/>
					Activation Status
					<ToggleForm
						v-model="form.is_active"
						label="Active Status"
						:disabled="mode === 'view'"
					/>
					Flexible Price
					<ToggleForm
						v-model="form.is_flex_price"
						label="Flexible Sold Product Price"
						:disabled="mode === 'view'"
					/>
					Floating Price
					<ToggleForm
						v-model="form.is_float_price"
						label="Floating Product Price"
						:disabled="mode === 'view'"
					/>
				</div>
			</div> -->
		</form>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, readonly } from 'vue'
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
const smallMenu = computed(() => store.getters.smallMenu)

const props = defineProps({
	mode: { type: String, required: true },
	trans_type_id : { type: Number, default: 1 },
})
// Dropdown Items
const accounts = ref([])
const columns = ref([
  { label: 'Account', key: 'account', type: 'string' },
  { label: 'Amount', key: 'amount', type: 'number' },
  { label: 'Description', key: 'desc', type: 'string' },
]);

const handleRowsUpdate = (updatedRows) => {
  console.log('Updated Rows:', updatedRows);
};

// Form Data
const form = ref({
    code: '',
    account_cash: { id: '' },
})
const formCopy = ref({ ...form.value })
const formError = ref({
    code: '',
    account_cash: '',
})

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/finance/uang-keluar-masuk/${id}`)
			form.value = { ...response.data.data }
			form.value.company_id = [form.value.company_id]
			formCopy.value = { ...form.value }
			prevLocation.value = {
				lat: form.value.latitude,
				lng: form.value.longitude,
			}
		} catch (error) {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: 'Failed to fetch store data.',
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
		form.value.company_id = [form.value.company_id]
	}

	if (props.mode == 'add') {
		// Set form code
		var userdata = JSON.parse(Cookies.get('userdata'))
		var store_id = '';
		if (userdata.store > 0) {
			store_id = userdata.store[0].id
		}
		var ajax =`/finance/trans-code?trans_type_id=${props.trans_type_id}`;
		if (store_id != '') {
			ajax += `&store_id=${store_id}`
		}
		const response = await axiosInstance.get(ajax);
		const transCode = response.data.data
		form.value.code = transCode
		// set form date to today 
		formattedDate.value = formatDate(new Date().toISOString().split('T')[0])
	}
	const response = await axiosInstance.get('/finance/account')
    const ownedAccounts = response.data.data.filter(
        (account) => account.account_type_id === 1
    )
    const acc = ownedAccounts.map((account) => ({
        label: account.name,
        id: account.id,
    }))
    console.log(acc)
    accounts.value = acc;
	columns.value.push(
		{ label: 'Account', key: 'account', type: 'dropdown', items: acc },
	)
})

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

const resetForm = () => {
	form.value = { ...formCopy.value }
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
			props.mode === 'edit' ? `/master/store/${id}` : '/master/store'
		const method = props.mode === 'edit' ? 'put' : 'post'
		if (Array.isArray(form.value.company_id)) {
			form.value.company_id = form.value.company_id[0]
		}

		const response = await axiosInstance[method](endpoint, form.value)

		if (response.data) {
			const action = props.mode === 'edit' ? 'Updated' : 'Created'
			store.dispatch('triggerAlert', {
				type: 'success',
				title: 'Success!',
				message: `Store ${response.data.data.name} ${action}.`,
				actions: [
					{
						label: 'close',
						type: 'secondary',
						handler: () => store.dispatch('hideAlert'),
					},
				],
			})
			router.push('/master/store')
		}
	} catch (error) {
		console.error(error.response.data)
		const errors = error.response.data.errors || []
		form.value.company_id = [form.value.company_id] // resetting the state to array
		errors.forEach((err) => {
			formError.value[err.field] = err.message
		})
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: `Store ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
		})
	}
}
</script>