<template>
    <div class="editable rounded-lg shadow-md">
        <table class="table-auto border-none w-full h-full">
            <!-- Table Header -->
            <thead class="bg-pinkDark border-none">
                <tr>
                    <!-- colspan count columns -->
                    <th class="px-4 py-2 text-start text-white" :colspan="columns.length">{{ title }}
                        <span class="text-white inline" v-if="required">*</span>
                    </th>
                    <!-- Add Row Button -->
                    <th class="flex justify-end items-center mx-4 my-2">
                        <button @click="addRow" type="button"
                            class="bg-pinkLight text-white px-3 py-2 rounded-lg shadow hover:bg-pinkMed flex items-center transition duration-300 ease-in-out"><i
                                class="material-icons">add</i>
                        </button>
                    </th>
                </tr>
                <tr>
                    <th v-for="(col, index) in columns" :key="index" class="text-white px-4 py-2">
                        {{ col.label }}
                        <span v-if="col.required" class="text-white inline">*</span>
                    </th>
                    <th class="text-white px-4 py-2">Actions</th>
                </tr>
            </thead>

            <!-- Table Body -->
            <tbody class="border-none">
                <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
                    <td v-for="(col, colIndex) in columns" 
                        :key="colIndex" 
                        class="px-0 h-full border-r"
                        :class="{
                            'bg-white': rowIndex % 2 === 0,
                            'bg-pinkGray': rowIndex % 2 !== 0,
                            'border-gray-300': colIndex !== columns.length - 1, 
                        }"
                        >
                        <input 
                            disabled="true"
                            v-if="['int', 'number', 'text'].includes(col.type)" 
                            v-model="rows[rowIndex][col.key]" 
                            :type="col.type == 'number' ? 'text' : col.type"
                            class="bg-transparent rounded px-2 py-1 w-full h-full focus:outline-none"
                            @input="handleInput($event, col, rowIndex)" 
                            />
                        <Dropdown v-else-if="col.type === 'dropdown'" v-model="rows[rowIndex][col.key]" :items="col.items" :position="'sticky !h-[200px]'" />
                    </td>
                    <td class="px-4 py-2 text-center"
                    :class="{
                            'bg-white': rowIndex % 2 === 0,
                            'bg-pinkGray': rowIndex % 2 !== 0,
                        }"
                    >
                        <button @click="deleteRow(rowIndex, rows[rowIndex].detail_id ? rows[rowIndex].detail_id : null)" type="button" class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out m-auto">
                            <!-- material icons delete -->
                            <i class="material-icons text-sm">delete</i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { onMounted, readonly, ref, watch } from 'vue';
import Dropdown from '../../components/Dropdown.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router';
import { decryptData } from '../../utils/crypto';
import Cookies from 'js-cookie';
import { formatIDR } from '../../utils/common';

const store = useStore()
const router = useRouter()
const report_journal_id = router.currentRoute.value.params.id;
const userdata = decryptData(Cookies.get('userdata'))
const props = defineProps({
    columns: {
        type: Array,
        required: true,
        default: () => [],
        // Example: [{ label: "Name", key: "name", type: "string" }, { label: "Age", key: "age", type: "int" }]
    },
    initialRows: {
        type: Array,
        default: () => [],
    },
    title: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
});

// Emit rows update to parent if needed
const emit = defineEmits(['update:rows']);
const emitUpdate = () => {
    emit('update:rows', rows.value);
};

// Reactive state
const rows = ref([...props.initialRows]);
watch(
    () => props.initialRows,
    (newRows) => {
        rows.value = [...newRows]; // Update rows when initialRows changes
    },
    { deep: true, immediate: true } // Ensure immediate and deep watching
);

// Methods
const addRow = () => {
    // Create a new empty row based on column keys
    // const newRow = props.columns.reduce((acc, col) => {
    //     acc[col.key] = col.type === 'number' ? 0.00 : ''; // Use '0.00' for int types
    //     return acc;
    // }, {});
    const newRow = showModal();
    if (!newRow) return;
};

const deleteRow = (index, initialRowId) => {
    console.log('delete row', index, initialRowId);
    store.dispatch('triggerAlert', {
        type: 'warning',
        title: 'Warning!',
        message: `Are you sure you want to delete this data?`,
        actions: [
            {
                label: 'cancel',
                type: 'secondary',
                handler: () => {
                    store.dispatch('hideAlert')
                },
            },
            {
                label: 'proceed',
                type: 'primary',
                handler: async () => {
                    store.dispatch('hideAlert')
                    const response = await axiosInstance.delete('/finance/receivable-payable-payment/'+ initialRowId);
                    if (response?.data?.success) {
                        store.dispatch('triggerAlert', {
                            type: 'success',
                            title: 'Success',
                            message: 'Data deleted successfully',
                        });
                        rows.value.splice(index, 1);
                        emitUpdate();
                    }else {
                        store.dispatch('triggerAlert', {
                            type: 'error',
                            title: 'Error',
                            message: response.data.message,
                        });
                    }
                },
            },
        ],
    })
};

const handleInput = (event, col, rowIndex) => {
    // col.type === 'number' ? validateAndParseInput($event, rowIndex, col.key) : $event.target.value;
    if (col.type === 'number') {
        validateAndParseInput(event, rowIndex, col.key);
    } else {
        rows.value[rowIndex][col.key] = event.target.value;
    }

    emitUpdate();
};

watch (
    () => props.initialRows,
    (newRows) => {
        rows.value = [...newRows];
    },
    { deep: true }
)

const validateAndParseInput = (event, rowIndex, key) => {
    let value = event.target.value;

    // Pastikan input hanya memiliki angka, titik desimal (.), atau koma (,)
    value = value.replace(/[^0-9.,]/g, '');

    // Ganti koma (,) dengan titik (.) untuk memastikan format float konsisten
    value = value.replace(/,/g, '.');

    // Pastikan hanya ada satu titik desimal dalam angka
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    rows.value[rowIndex][key] = value; 

    emitUpdate();
};

onMounted(async () => {
    var response = await axiosInstance.get('/finance/account')
	var allAccounts = response.data.data;
    fetchAccounts.value = allAccounts.map((account) => {
        return {
            value: account.id,
            text:  account.code + ' ' + account.name,
        };
    });
    paymentForm.value.report_journal_id = report_journal_id;
});
const fetchAccounts = ref([]);
const paymentForm = ref({
    report_journal_id: '',
    trans_date: '',
    detail_description: '',
    account_id: '',
    amount_paid: 0.00,
    id: null,
    created_by: userdata.id,
});
const validatePaymentForm = (data) => {
    // foreach data update the paymentForm
    for (const key in data) {
        paymentForm.value[key] = data[key];
    }
    for (const key in data) {
        if (data[key] === null || data[key] === undefined || data[key] === '') {
            store.dispatch('triggerAlert', {
                type: 'warning',
                title: 'Input not valid',
                message: 'Please fill all fields',
            });
            return;
        }
    }

    submitPaymentForm();
}
function showModal() {
    paymentForm.trans_date = new Date().toISOString().split('T')[0];
    store.dispatch('triggerAlert', {
        type: 'info',
        title: 'Add payment',
        inputs: [
        { label: 'Transaction Date', model: 'trans_date', type: 'date', selectedModel: paymentForm.trans_date, required:true },
        {
            label: 'Amount Paid',
            model: 'amount_paid',
            type: 'number',
            required: true,
            selectedModel: paymentForm.amount_paid,
            required:true
        },
        {
            label: 'Account',
            model: 'account_id',
            type: 'select',
            multiple: false,
            options: fetchAccounts,
            required: true,
            selectedModel: paymentForm.account_id,
            required:true
        },
        {
            label: 'Description',
            model: 'detail_description',
            type: 'text',
            required: true,
            selectedModel: paymentForm.detail_description,
            required:true
        },
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
            handler: (data) => {
                validatePaymentForm(data);
            },
        },
        ],
    })
}
const submitPaymentForm = async () => {
    try {
        if (paymentForm.value.account_id != null) {
            paymentForm.value.account_id = paymentForm.value.account_id[0];
        }
        const response = await axiosInstance.post('/finance/receivable-payable-payment', paymentForm.value);
        store.dispatch('hideAlert');
        store.dispatch('triggerAlert', {
            type: 'success',
            title: 'Payment Success',
            message: response.data.message,
        });
        const updatedPayabale = response.data.data;
        console.log('ini response create',response);
        console.log('ini updatedPayable', updatedPayabale);
        // add to the visual the row
        console.log('ini account',updatedPayabale.first_journal.account.code + ' ' + updatedPayabale.first_journal.account.name)
        const newRow = {
            'trans_date':   updatedPayabale.first_journal.trans_date,
            'account_id' : updatedPayabale.first_journal.account.code + ' - ' + updatedPayabale.first_journal.account.name,
            'amount_paid' :'Rp. ' +  formatIDR(updatedPayabale.first_journal.amount),
            'detail_description' : updatedPayabale.first_journal.detail_description,
            'detail_id': updatedPayabale.detail_id,
            'total_amount_paid': updatedPayabale.amount_paid
        };
        rows.value.push(newRow);
        emitUpdate();
    } catch (error) {
        console.error('Error submitting payment form:', error);
        store.dispatch('triggerAlert', {
            type: 'error',
            title: 'Payment Failed',
            message: error.response.data.message,
        });
        paymentForm.value.account_id = [paymentForm.value.account_id];
    }
}
</script>

<style>
.editable {
    max-width: 100%;
    overflow-x: auto;
}

.table-auto {
    width: 100%;
}
</style>