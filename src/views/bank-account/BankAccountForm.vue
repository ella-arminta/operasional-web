<template>
    <div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
        <PageTitle />
        <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
            <form @submit.prevent="submit">
                <FormHeader
                    :title="mode === 'edit' ? 'Edit Bank Account' : mode === 'detail' ? 'Bank Account Detail' : 'Add Bank Account'"
                    :showSaveButton="mode !== 'detail'" />
                <FormSectionHeader title="Bank Account Information" icon="bank" />

                <div class="grid grid-cols-2 gap-6 mt-4">
                    <InputForm id="bank_name" v-model="form.bank_name" label="Bank Name" placeholder="Enter bank name"
                        required :readonly="mode === 'detail'" />
                    <InputForm id="account_number" v-model="form.account_number" label="Account Number"
                        placeholder="Enter account number" required :readonly="mode === 'detail'" />
                    <InputForm id="account_holder" v-model="form.account_holder" label="Account Holder"
                        placeholder="Enter account holder name" required :readonly="mode === 'detail'" />
                </div>
                <button v-if="mode !== 'detail'" type="submit"
                    class="w-full mt-4 px-4 py-2 bg-pinkDark text-white rounded-lg hover:bg-pinkDarker transition duration-300">
                    {{ mode === 'edit' ? 'Update Bank Account' : 'Create Bank Account' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import FormHeader from '../../components/FormHeader.vue'

const router = useRouter()
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const mode = computed(() => router.currentRoute.value.params.mode)
const id = computed(() => router.currentRoute.value.params.id)

const form = ref({
    bank_name: '',
    account_number: '',
    account_holder: '',
    store_id: decryptData(Cookies.get('userdata')).store_id,
})

const formError = ref({
    bank_name: '',
    account_number: '',
    account_holder: '',
})

const submit = async () => {
    try {
        const url = mode.value === 'edit' ? `/transaction/bank_account/${id.value}` : '/transaction/bank_account'
        const method = mode.value === 'edit' ? 'put' : 'post'
        const headers = { Authorization: `Bearer ${Cookies.get('token')}` }
        const response = await axiosInstance[method](url, form.value, { headers })

        if (response.data.success) {
            store.dispatch('triggerAlert', {
                type: 'success',
                title: 'Success!',
                message: `Bank Account ${mode.value === 'edit' ? 'Updated' : 'Created'} successfully.`,
            })
            router.push('/marketplace/bank_account')
        }
    } catch (error) {
        store.dispatch('triggerAlert', {
            type: 'error',
            title: 'Error!',
            message: 'Failed to process bank account data.',
        })
    }
}

onMounted(async () => {
    if (mode.value !== 'add' && id.value) {
        try {
            const response = await axiosInstance.get(`/transaction/bank_account/${id.value}/id`)
            const account = response.data.data
            form.value = {
                bank_name: account.bank_name,
                account_number: account.account_number,
                account_holder: account.account_holder,
                store_id: account.store_id,
            }
        } catch (error) {
            console.error('Error fetching bank account:', error)
        }
    }
})
</script>