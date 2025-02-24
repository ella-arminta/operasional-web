<template>
    <div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
        <PageTitle title="Store Balance" />
        <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
            <h2 class="text-xl font-bold">Current Balance: Rp {{ formatNumber(balance) }}</h2>

            <!-- Payout Request Form -->
            <div class="mt-6">
                <h3 class="text-lg font-semibold">Request Payout</h3>
                <form @submit.prevent="submitPayoutRequest">
                    <div>
                        <label for="bank_account" class="block text-sm text-grey-900 font-medium mb-1">
                            Bank Account<span class="text-pinkDark">*</span>
                        </label>
                        <Dropdown :items="bankAccounts" v-model="selectedBankAccount"
                            placeholder="Select a bank account" :multiple="false" :searchable="true"
                            :addRoute="'/marketplace/bank_account/add'" />

                        <p v-if="formError.bank_account_id" class="text-pinkDark text-xs italic">
                            {{ formError.bank_account_id }}
                        </p>
                    </div>

                    <InputForm id="amount" v-model="payout.amount" label="Amount" type="number" required />
                    <TextareaForm id="reason" v-model="payout.reason" label="Reason" required />

                    <button type="submit"
                        class="w-full mt-4 px-4 py-2 bg-pinkDark text-white rounded-lg hover:bg-pinkDarker transition">
                        Request Payout
                    </button>
                </form>
            </div>
        </div>

        <!-- Payout Requests Table -->
        <h3 class="mt-6 text-lg font-semibold">Payout Requests</h3>
        <TableDataV2 :columns="payoutColumns" :data="payoutRequests" :exportable="true" />

        <!-- Balance Logs Table -->
        <h3 class="mt-6 text-lg font-semibold">Balance Logs</h3>
        <TableDataV2 :columns="balanceColumns" :data="balanceLogs" :exportable="true" />

        <!-- Modal untuk Bukti -->
        <div v-if="showProofModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4">
            <div class="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
                <h2 class="text-lg font-semibold mb-2 text-center">Bukti Payout</h2>
                <div class="flex justify-center">
                    <img :src="proofImage"
                        class="w-auto max-w-full max-h-[500px] object-contain rounded-md shadow-md border border-gray-300">
                </div>
                <div class="text-center mt-4">
                    <button @click="closeModal"
                        class="bg-pinkDark text-white px-6 py-2 rounded-lg hover:bg-pinkDarker transition">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import axiosInstance from '../../axios'
import Cookies from 'js-cookie'
import PageTitle from '../../components/PageTitle.vue'
import InputForm from '../../components/InputForm.vue'
import TextareaForm from '../../components/TextareaForm.vue'
import TableDataV2 from '../../components/TableDataV2.vue'
import Dropdown from '../../components/Dropdown.vue'
import { decryptData } from '../../utils/crypto'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const storeId = decryptData(Cookies.get('userdata')).store_id
const balance = ref(0)
const payoutRequests = ref([])
const balanceLogs = ref([])
const bankAccounts = ref([])
const selectedBankAccount = ref(null)

// Modal Reactive State
const showProofModal = ref(false)
const proofImage = ref('')

const payout = ref({
    bank_account_id: '',
    amount: '',
    reason: '',
})

const formError = ref({
    bank_account_id: '',
})

const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num)
}

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Fungsi untuk menampilkan modal bukti transaksi
const showProof = (proofUrl) => {
    proofImage.value = proofUrl;
    showProofModal.value = true;
}

// Fungsi untuk menutup modal
const closeModal = () => {
    showProofModal.value = false;
}

const payoutColumns = [
    { data: 'amount', title: 'Amount', render: data => `Rp ${formatNumber(data)}` },
    { data: 'status', title: 'Status', render: data => (data === 1 ? '✅ Approved' : '⏳ Pending') },
    {
        data: 'proof',
        title: 'Bukti',
        render: (data) => data ? `<button class="proof-btn bg-pinkDark text-white px-2 py-1 rounded" data-proof="http://127.0.0.1:3000/${data}">Lihat Bukti</button>` : `<span class="text-gray-500">Tidak Ada Bukti</span>`
    },
    { data: 'created_at', title: 'Tanggal Payout', render: data => formatDate(data) }
];

const balanceColumns = [
    {
        data: 'amount',
        title: 'Amount',
        render: data => {
            const formattedAmount = `Rp ${formatNumber(data)}`;
            const color = data < 0 ? 'text-red-500' : 'text-green-500';
            return `<span class="${color} font-semibold">${formattedAmount}</span>`;
        }
    },
    { data: 'type', title: 'Type' },
    { data: 'information', title: 'Description' },
    {
        data: 'created_at',
        title: 'Tanggal',
        render: data => formatDate(data)
    }
]

const fetchBalanceData = async () => {
    try {
        const response = await axiosInstance.get(`/transaction/store/${storeId}`);
        const data = response.data.data;

        balance.value = data.balance;
        payoutRequests.value = data.PayoutRequest.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        balanceLogs.value = data.BalanceLog.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        bankAccounts.value = data.BankAccount.map(acc => ({
            id: acc.id,
            label: `${acc.bank_name} - ${acc.account_number} (${acc.account_holder})`
        }));

        if (bankAccounts.value.length > 0) {
            selectedBankAccount.value = [bankAccounts.value[0].value];
        }

        setTimeout(() => {
            document.querySelectorAll('.proof-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const proof = e.target.dataset.proof;
                    showProof(proof);
                })
            })
        }, 500);


    } catch (error) {
        console.error('Error fetching balance data:', error);
    }
};

// Watcher untuk update `bank_account_id`
watch(
    () => selectedBankAccount.value,
    async (newValue) => {
        if (!newValue || newValue.length === 0) return; // Pastikan ada nilai baru

        console.log("✅ Bank Account Changed:", newValue[0]); // Debugging

        payout.value.bank_account_id = newValue[0]; // Update payout.bank_account_id

    },
    { immediate: true }
);


const submitPayoutRequest = async () => {
    try {
        if (!payout.value.bank_account_id) {
            formError.value.bank_account_id = 'Bank account is required.';
            return;
        }

        await axiosInstance.post('/transaction/payout_request', {
            store_id: storeId,
            bank_account_id: payout.value.bank_account_id,
            amount: payout.value.amount,
            reason: payout.value.reason,
        }, {
            headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        });

        store.dispatch('triggerAlert', {
            type: 'success',
            title: 'Success!',
            message: 'Payout request submitted successfully.',
        });

        fetchBalanceData();

    } catch (error) {
        console.error("Error submitting payout request:", error);
    }
};

onMounted(fetchBalanceData)
</script>
