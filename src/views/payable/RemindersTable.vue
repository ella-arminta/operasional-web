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
                        :class="[
                            col.className,
                            rowIndex % 2 === 0 ? 'bg-white' : 'bg-pinkGray',
                            colIndex !== columns.length - 1 ? 'border-gray-300' : '',
                        ]"
                        >
                        <input 
                            disabled="true"
                            v-if="['int', 'number', 'text'].includes(col.type)" 
                            v-model="rows[rowIndex][col.key]" 
                            :type="col.type == 'number' ? 'text' : col.type"
                            :class="`bg-transparent rounded px-2 py-1 w-full h-full focus:outline-none ${col.className}`"
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
                        <button @click="deleteRow(rowIndex, rows[rowIndex].reminder_id ? rows[rowIndex].reminder_id : null)" type="button" class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out m-auto">
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
import { formatDate } from '../../utils/common';

const store = useStore()
const router = useRouter()
const report_journal_id = router.currentRoute.value.params.id;
const userdata = decryptData(Cookies.get('userdata'))
const props = defineProps({
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
    dueDate: {
        type: [String, Date, null],
        default: null,
    },
});
const columns = ref([
    { label: 'Interval', key: 'interval', type: 'text', className:'text-right' },
    { label: 'Period', key: 'period', type: 'text', render: (data) => data + '(s) before due date' },
    { label: 'Date remind', key: 'date_remind', type: 'text', render: (data) =>'('+  formatDate(data) + ')' },
    { label: 'Emails', key: 'emails', type: 'text', render: (data) => data.join(', ') },
])
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
    if (props.dueDate == null || props.dueDate == '') {
        store.dispatch('triggerAlert', {
            type: 'warning',
            title: 'Warning!',
            message: `Please fill the due date first`,
        });
        return;
    }
    const newRow = showModal();
    if (!newRow) return;
};

const deleteRow = (index, initialRowId) => {
    console.log('delete row', index, initialRowId);
    store.dispatch('triggerAlert', {
        type: 'warning',
        title: 'Warning!',
        message: `Are you sure you want to delete this reminder?`,
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
                    const response = await axiosInstance.delete('/finance/receivable-payable-reminder/'+ initialRowId);
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

const companyEmailsList = ref([]);
onMounted(async () => {
    // Fetch company emails from the API
    try {
        const response = await axiosInstance.get('/master/company-emails');
        console.log('response company emails', response);
        companyEmailsList.value = response.data.data.map((email) => ({
            text: email,
            value: email,
        }));
    } catch (error) {
        console.error('Error fetching company emails:', error);
    }
});
const reminderForm = ref({
    interval: 0,
    period: [],
    date_remind: '',
    mode: ['interval'],
    company_emails: [],
    custom_emails: ''
});
// Helper function untuk validasi email
const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};
const validatereminderForm = (data) => {
        // Update reminderForm dengan data yang diterima
    for (const key in data) {
        reminderForm.value[key] = data[key];
    }
    // Validasi berdasarkan logika yang diberikan
    if (!data.mode || data.mode.length === 0) {
        store.dispatch('triggerAlert', {
            type: 'warning',
            title: 'Input not valid',
            message: 'Mode is required',
        });
        return;
    }

    if (data.mode.includes('interval')) {
        if (typeof data.interval !== 'number' || isNaN(data.interval)) {
            store.dispatch('triggerAlert', {
                type: 'warning',
                title: 'Input not valid',
                message: 'Interval must be a number when mode is "interval"',
            });
            return;
        }
        
        if (!data.period || data.period.length === 0) {
            store.dispatch('triggerAlert', {
                type: 'warning',
                title: 'Input not valid',
                message: 'Period is required when mode is "interval"',
            });
            return;
        }
    }

    if (data.mode.includes('customdate') && !data.date_remind) {
        store.dispatch('triggerAlert', {
            type: 'warning',
            title: 'Input not valid',
            message: 'Date Remind is required when mode is "customdate"',
        });
        return;
    }

    var countEmails = 0;
    if (data.company_emails && data.company_emails.length > 0) {
        const validCompanyEmails = data.company_emails.filter(email => validateEmail(email));
        countEmails += validCompanyEmails.length;
        if (data.company_emails.length !== validCompanyEmails.length) {
            store.dispatch('triggerAlert', {
                type: 'warning',
                title: 'Input not valid',
                message: 'Some company emails are invalid',
            });
            return;
        }
    }
    if (data.custom_emails) {
        const emailArray = data.custom_emails.split(',').map(email => email.trim());
        const validEmails = emailArray.filter(email => validateEmail(email));
        countEmails += validEmails.length;
        if (emailArray.length !== validEmails.length) {
            store.dispatch('triggerAlert', {
                type: 'warning',
                title: 'Input not valid',
                message: 'Some custom emails are invalid',
            });
            return;
        }
    }
    if (countEmails === 0) {
        store.dispatch('triggerAlert', {
            type: 'warning',
            title: 'Input not valid',
            message: 'Please fill at least one email',
        });
        return;
    }

    submitreminderForm();
}
function showModal() {
    reminderForm.trans_date = new Date().toISOString().split('T')[0];
    console.log('company email lsit', companyEmailsList.value);
    store.dispatch('triggerAlert', {
        type: 'info',
        title: 'Add Reminder',
        inputs: [
            { 
                label: 'Mode', 
                model: 'mode', 
                type: 'select', 
                required: true,
                selectedModel: reminderForm.value.mode,
                options: [
                    { value: 'interval', text: 'Interval' },
                    { value: 'customdate', text: 'Custom Date' },
                ],
            },
            { 
                label: 'Interval (x Period)', 
                model: 'interval', 
                type: 'number', 
                selectedModel: reminderForm.value.interval, 
                required:true ,
                watchModel: ['mode'],
                condition: (data) => data.mode.includes('interval'),
            },
            {
                label: 'Period',
                model: 'period',
                type: 'select',
                required: true,
                options: [
                    { value: 'day', text: 'Day(s) before due date' },
                    { value: 'week', text: 'Week(s) before due date' },
                    { value: 'month', text: 'Month(s) before due date' },
                    { value: 'year', text: 'Year(s) before due date' },
                ],
                selectedModel: reminderForm.value.period,
                condition: (data) => data.mode.includes('interval'),
            },
            {
                label: 'Date Remind',
                model: 'date_remind',
                type: 'date',
                selectedModel: reminderForm.value.date_remind,
                condition: (data) => data.mode.includes('customdate'),
                required: true,
            },
            {
                label: 'send to Company Emails',
                model: 'company_emails',
                type: 'select',
                selectedModel: reminderForm.value.company_emails,
                options: companyEmailsList.value,
                multiple: true,
            }, 
            {
                label: 'send to Custom Emails',
                model: 'custom_emails',
                type: 'text',
                selectedModel: reminderForm.value.custom_emails,
                placeholder: 'emailq@gmail.com, emailb@gmail.com'
            }
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
                validatereminderForm(data);
            },
        },
        ],
    })
}
const submitreminderForm = async () => {
    try {
        const formData = {
            report_journal_id: report_journal_id,
            interval: reminderForm.value.interval,
            period: reminderForm.value.period[0],
            date_remind: reminderForm.value.date_remind,
            mode: reminderForm.value.mode[0],
            emails: [
                ...reminderForm.value.company_emails,
                ...reminderForm.value.custom_emails.split(',').map(email => email.trim()).filter(email => validateEmail(email))
            ]
        };
        const response = await axiosInstance.post('/finance/receivable-payable-reminder', formData);
        store.dispatch('triggerAlert', {
            type: 'success',
            title: 'Payment Success',
            message: response.data.message,
        });
        const updatedReminder = response.data.data;
        console.log('ini response create',response);
        console.log('ini updatedReminder', updatedReminder);
        // // add to the visual the row
        // console.log('ini account',updatedPayabale.first_journal.account.code + ' ' + updatedPayabale.first_journal.account.name)
    //     { label: 'Interval', key: 'interval', type: 'text' },
    // { label: 'Period', key: 'period', type: 'text', render: (data) => data + ' before due date' },
    // { label: 'Date remind', key: 'date_remind', type: 'text', render: (data) =>'('+  formatDate(data) + ')' },
    // { label: 'Emails', key: 'emails', type: 'text', render: (data) => data.join(', ') },
        const newRow = {
            interval: updatedReminder.interval ? updatedReminder.interval : '-',
            period: updatedReminder.period ? updatedReminder.period : '-',
            date_remind: updatedReminder.date_remind ? formatDate(updatedReminder.date_remind) : '-',
            emails: updatedReminder.emails.join(', '),
            reminder_id: updatedReminder.reminder_id,
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
        reminderForm.value.account_id = [reminderForm.value.account_id];
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