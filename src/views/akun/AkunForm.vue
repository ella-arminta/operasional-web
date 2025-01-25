<template>
	<div class="content min-h-screen">
		<PageTitle />
		<!--  Form section -->
		<form
			class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
			@submit.prevent="submit"
		>
			<div class="flex items-center justify-between">
				<h1 class="text-xl text-pinkDark">
					{{
						mode === 'edit'
							? 'Edit Akun'
							: mode === 'add'
								? 'Add Akun'
								: 'Akun Detail'
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
						type="submit"
					>
						<i class="material-icons text-md">save</i>
						Save
					</button>
				</div>
			</div>
			<!-- Form Session -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
				<!-- First Grid -->
				<div class="space-y-3">
					<!-- Code -->
					<InputForm
						v-model.number="form.code"
						id="code"
						type="number"
						label="Nomor"
            			:required="true"
						placeholder="Nomor"
						:readonly="mode === 'view'"
						:error="formError.code"
					/>
					<!-- Name -->
					<InputForm
						v-model="form.name"
						id="name"
						type="text"
						label="Nama"
						placeholder="Nama"
            :required="true"
						:readonly="mode === 'view'"
						:error="formError.name"
					/>
					<!-- Dropdown Company -->
					<div>
						<label
							for="dropdown"
							class="block text-sm text-grey-900 font-medium mb-1"
						>
							Company<span class="text-pinkDark">*</span>
						</label>
						<Dropdown
							:items="companyItems"
							v-model="form.company_id"
							@update:modelValue="onCompanyChange"
							placeholder="Select a company"
							:multiple="false"
							:searchable="true"
						/>
						<p
							v-if="formError.company_id"
							class="text-pinkDark text-xs italic transition duration-300"
						>
							{{ formError.company_id }}
						</p>
					</div>
          <!-- Dropdown Store -->
          <div>
            <label
              for="dropdown"
              class="block text-sm text-grey-900 font-medium mb-1"
            >
              Store
            </label>
            <Dropdown
              :items="storeItems"
              v-model="form.store_id"
              placeholder="Select a store"
              :multiple="false"
              :searchable="true"
            />
            <p
              v-if="formError.store_id"
              class="text-pinkDark text-xs italic transition duration-300"
            >
              {{ formError.store_id }}
            </p>
          </div>
				</div>
				<div class="space-y-3">
          <!-- Dropdown account type -->
          <div>
            <label
              for="dropdown"
              class="block text-sm text-grey-900 font-medium mb-1"
            >
              Type <span class="text-pinkDark">*</span>
            </label>
            <Dropdown
              :items="accountItems"
              v-model="form.account_type_id"
              placeholder="Select a type"
              :multiple="false"
              :searchable="true"
            />
            <p
              v-if="formError.account_type_id"
              class="text-pinkDark text-xs italic transition duration-300"
            >
              {{ formError.account_type_id }}
            </p>
          </div>
					<!-- Description -->
					<TextareaForm
						v-model="form.description"
						id="description"
						label="Description"
						placeholder="Description"
						:readonly="mode === 'view'"
						:error="formError.description"
					/>
				</div>
			</div>
		</form>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import PageTitle from '../../components/PageTitle.vue'
import Dropdown from '../../components/Dropdown.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'

const companyItems = ref([])
const storeItems = ref([])
const accountItems = ref([])

const props = defineProps({
	mode: { type: String, required: true },
})
// Form Data
const form = ref({
	code: null,
	name: '',
	description: '',
	company_id: null,
	account_type_id: null,
	store_id: null,
})
const formCopy = ref({
	code: null ,
	name: '',
	description: '',
	company_id: null,
	account_type_id: null,
	store_id: null,
})
const formError = ref({
	code: '',
	name: '',
	description: '',
	company_id: '',
	account_type_id: '',
	store_id: '',
})

const router = useRouter()
const store = useStore()

const id = router.currentRoute.value.params.id

onMounted(async () => {
  const companyData = await axiosInstance.get('/master/company')
  companyItems.value = companyData.data.data.map((company) => ({
    label: company.name,
    id: company.id,
  }))
  const storeData = await axiosInstance.get('/master/store')
  storeItems.value = storeData.data.data.map((store) => ({
    label: store.name,
    id: store.id,
  }))
  const accountData = await axiosInstance.get('/finance/account-type')
  accountItems.value = accountData.data.data.map((account) => ({
    label: account.name,
    id: account.id,
  }))

	if (props.mode !== 'add' && id) {
		try {
			const response = await axiosInstance.get(`/finance/account/${id}`)
			form.value = { ...response.data.data }
			formCopy.value = { ...form.value }
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
	}
})

const resetError = () => {
	formError.value = {
		code: '',
		name: '',
		description: '',
		company_id: '',
		account_type_id: '',
		store_id: '',
	}
}

const resetForm = () => {
	form.value = { ...formCopy.value }
}

const hasUnsavedChanges = computed(() => {
	return (
		form.value.code !== formCopy.value.code ||
		form.value.name !== formCopy.value.name
	)
})

const onCompanyChange = async () => {
	const storeData = await axiosInstance.get(`/master/store?company_id=${form.value.company_id[0]}`)
	storeItems.value = storeData.data.data.map((store) => ({
		label: store.name,
		id: store.id,
	}))
}

const submit = async () => {
	resetError()
	try {
		if (form.value.account_type_id != null) {
			form.value.account_type_id = form.value.account_type_id[0]
		}
		if (form.value.company_id != null) {
			form.value.company_id = form.value.company_id[0]
		}
		if (form.value.store_id != null) {
			form.value.store_id = form.value.store_id[0]
		}
		const endpoint =
			props.mode === 'edit' ? `/finance/account/${id}` : '/finance/account'
		const method = props.mode === 'edit' ? 'put' : 'post'
		const response = await axiosInstance[method](endpoint, form.value)
		console.log(response);
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
			router.push('/master/akun')
		}
	} catch (error) {
		const errors = error.response.data.errors || []

		if (error.response.status.toString().startsWith('4')) {
			errors.forEach((err) => {
				formError.value[err.field] = err.message
			})
			if (!Array.isArray(errors)) {
				store.dispatch('triggerAlert', {
					type: 'warning',
					title: 'Error!',
					message: `Account ${props.mode === 'edit' ? 'update' : 'creation'} failed.` + errors.response.data.message,
				})
				return
			}
			store.dispatch('triggerAlert', {
				type: 'warning',
				title: 'Error!',
				message: 'Please check the form again.',
			})
		} else {
			store.dispatch('triggerAlert', {
				type: 'error',
				title: 'Error!',
				message: `Account ${props.mode === 'edit' ? 'update' : 'creation'} failed.`,
			})
		}
	}
}
</script>