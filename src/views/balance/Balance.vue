<template>
    <div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
        <PageTitle title="Store Balance" />
        <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
            <h2 class="text-xl font-bold">Current Balance: Rp {{ formatNumber(balance) }}</h2>

            <!-- Payout Request Form -->
            <div class="mt-6">
                <h3 class="text-lg font-semibold">Request Payout</h3>
                <form @submit.prevent="submitPayoutRequest">
                    <!-- Dropdown untuk memilih Bank Account -->
                    <div>
                        <label for="bank_account" class="block text-sm text-grey-900 font-medium mb-1">
                            Bank Account<span class="text-pinkDark">*</span>
                        </label>
                        <Dropdown :items="bankAccounts" v-model="payout.bank_account_id"
                            placeholder="Select a bank account" :multiple="false" :searchable="true" :addRoute="'/marketplace/bank_account/add'
                                " :disabled="mode === 'detail'" />
                        <p v-if="formError.bank_account_id"
                            class="text-pinkDark text-xs italic transition duration-300">
                            {{ formError.bank_account_id }}
                        </p>
                    </div>

                    <!-- Input Amount -->
                    <InputForm id="amount" v-model="payout.amount" label="Amount" type="number" required />

                    <!-- Input Reason -->
                    <TextareaForm id="reason" v-model="payout.reason" label="Reason" required />

                    <!-- Submit Button -->
                    <button type="submit"
                        class="w-full mt-4 px-4 py-2 bg-pinkDark text-white rounded-lg hover:bg-pinkDarker transition duration-300">
                        Request Payout
                    </button>
                </form>
            </div>
        </div>

        <!-- Payout Requests Table -->
        <h3 class="mt-6 text-lg font-semibold">Payout Requests</h3>
        <!-- <TableData :columns="payoutColumns" :data="payoutRequests" /> -->

        <!-- Balance Logs Table -->
        <h3 class="mt-6 text-lg font-semibold">Balance Logs</h3>
        <!-- <TableData :columns="balanceColumns" :data="balanceLogs" /> -->
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import Cookies from 'js-cookie'
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import TableData from '../../components/TableData.vue'
import Dropdown from '../../components/Dropdown.vue'
import { decryptData } from '../../utils/crypto'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const storeId = decryptData(Cookies.get('userdata')).store_id
const balance = ref(0)
const payoutRequests = ref([])
const balanceLogs = ref([])
const bankAccounts = ref([])

const payout = ref({
    bank_account_id: '',
    amount: '',
    reason: '',
})

const formError = ref({
    bank_account_id: '',
})

const payoutColumns = [
    { data: 'id', title: 'ID', visible: false },
    { data: 'amount', title: 'Amount', render: data => `Rp ${formatNumber(data)}` },
    { data: 'status', title: 'Status', render: data => (data === 1 ? 'Approved' : 'Pending') },
    { data: 'created_at', title: 'Created At', render: data => new Date(data).toLocaleString('id-ID') }
]

const balanceColumns = [
    { data: 'id', title: 'ID', visible: false },
    { data: 'amount', title: 'Amount', render: data => `Rp ${formatNumber(data)}` },
    { data: 'type', title: 'Type' },
    { data: 'information', title: 'Description' },
    { data: 'created_at', title: 'Created At', render: data => new Date(data).toLocaleString('id-ID') }
]

const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num)
}

const fetchBalanceData = async () => {
    try {
        const response = await axiosInstance.get(`/transaction/store/${storeId}`)
        const data = response.data.data

        balance.value = data.balance
        payoutRequests.value = data.PayoutRequest
        balanceLogs.value = data.BalanceLog

        // Mengubah format Bank Account untuk Dropdown
        bankAccounts.value = data.BankAccount.map(acc => ({
            value: acc.id,
            label: `${acc.bank_name} - ${acc.account_number} (${acc.account_holder})`
        }))

        // Jika ada Bank Account, pilih yang pertama secara default
        if (bankAccounts.value.length > 0) {
            payout.value.bank_account_id = bankAccounts.value[0].value
        }
    } catch (error) {
        console.error('Error fetching balance data:', error)
    }
}

const submitPayoutRequest = async () => {
    try {
        if (!payout.value.bank_account_id) {
            formError.value.bank_account_id = 'Bank account is required.'
            return
        }

        await axiosInstance.post('/transaction/payout_request', {
            store_id: storeId,
            bank_account_id: payout.value.bank_account_id,
            amount: payout.value.amount,
            reason: payout.value.reason,
        }, {
            headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        })

        store.dispatch('triggerAlert', {
            type: 'success',
            title: 'Success!',
            message: 'Payout request submitted successfully.',
        })

        fetchBalanceData()
    } catch (error) {
        store.dispatch('triggerAlert', {
            type: 'error',
            title: 'Error!',
            message: 'Failed to submit payout request.',
        })
    }
}

onMounted(fetchBalanceData)
</script>
