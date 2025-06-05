<template>
    <div class="content" :class="{ 'full-width': smallMenu }">
        <PageTitle :title="'Profit & Loss Statement'" />

        <!-- Content Container -->
        <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
            <!-- Header -->
            <div class="flex justify-between flex-wrap items-center">
                <div class="flex justify-center items-center gap-4">
                </div>
                <!-- Action Button -->
                <div class="flex items-center gap-2 justify-center">
                    <div
                        @click="printPdf"
                        class="bg-pinkDark hover:bg-pinkMed text-white cursor-pointer font-bold py-1 px-2 flex justify-evenly items-center rounded-lg gap-2">
                        <div><i class="material-icons text-xl">download</i></div>
                        <div class="text-sm">PDF</div>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="transition-all duration-300" :class="{
                'max-h-0 overflow-hidden': !isFiltersOpen,
                'max-h-[500px]': isFiltersOpen,
            }">
                <div class="mt-3 flex flex-wrap justify-center gap-3 md:gap-6">
                    <div v-for="filter in filters" :key="filter.name" class="w-[100%] md:w-[30%]">
                        <!-- Filter type:"select" -->
                        <div v-if="filter.type === 'select'" class="border px-3 py-2 rounded-lg w-full">
                            <label :for="filter.name" class="block mb-1">{{
                                filter.label
                                }}</label>
                            <Dropdown :items="filter.options" :multiple="filter.multiple || false"
                                v-model="filterValues[filter.name]" />
                        </div>
                        <!-- Filter type:"SelectRangeFinance" -->
                        <div v-if="filter.type == 'selectRangeFinance'" class="border px-3 py-2 rounded-lg w-full">
                            <label :for="filter.name" class="block mb-1">{{
                                filter.label
                                }}</label>
                            <DropdownFinance @range-selected="handleRangeSelected" />
                        </div>
                        <!-- Filter for Date Range -->
                        <div v-if="filter.type === 'date'">
                            <!-- <label :for="filter.name" class="block mb-1">{{ filter.label }}</label> -->
                            <InputForm :id="filter.name" :label="filter.label" type="date"
                                v-model="filterValues[filter.name]" class="border px-3 py-2 rounded-lg w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- The Profit & Loss -->
            <br>
            <div v-if="!isLoading" class="w-full bg-white shadow-lg rounded-lg md:px-14 md:py-12 sm:py-4" id="profit-loss">
                <h1 class="text-center text-lg font-bold">Proft & Lost Statement</h1>
                <h1 class="text-center text-lg font-bold">{{ labelRangeSelected }}</h1>
                <span class="h-[10px]"></span>
                <table class="w-full" id="profit-loss-table">
                    <thead style="visibility: collapse;">
                        <tr>
                            <th class="w-[40%]">Name</th>
                            <th class="w-[30%]">Debit</th>
                            <th class="w-[30%]">Credit</th>
                        </tr>
                    </thead>
                    <tbody class="text-xs md:text-lg">
                        <template v-for="(category, index) in profitLossData" :key="index">
                            <!-- Title Row -->
                            <tr class="border-b border-gray-200" v-if="category.data.length > 1">
                                <td>{{ category.label }}</td>
                                <td></td>
                                <td></td>
                            </tr>

                            <!-- Subcategories -->
                            <tr v-for="(item, subIndex) in category.data" :key="subIndex" class="border-b border-gray-200">
                                <td
                                :class="{ 'md:pl-6' : subIndex != category.data.length - 1, 'font-bold': subIndex == category.data.length - 1 }"
                                >
                                {{ item.name }}
                                </td>
                                <td :class="{'font-bold': subIndex == category.data.length - 1 }">
                                    <template v-if="item.amount < 0 && subIndex != category.data.length - 1">
                                        {{ formatAmount(item.amount) }}
                                    </template>
                                </td>
                                <td :class="{'font-bold': subIndex == category.data.length - 1 }">
                                    <template v-if="item.amount >= 0 || subIndex == category.data.length - 1">
                                        {{ formatAmount(item.amount) }}
                                    </template>
                                </td>
                            </tr>
                        </template>
                    </tbody>   
                </table>
            </div>
            <div v-else>
                <div class="flex justify-center items-center h-40 text-lg text-pinkDark">
                    <svg class="mr-3 ml-1 size-10 animate-spin text-pinkDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ... Loading
                </div>
            </div>
            <br>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import Dropdown from '../../components/Dropdown.vue';
import InputForm from '../../components/InputForm.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';
import DropdownFinance from '../../components/DropdownFinance.vue';
import { decryptData } from '../../utils/crypto';
import Cookies from 'js-cookie'

const columns = [
    { data: 'name', title: 'Name' },
    { data: 'code', title: 'Code' },
    { data: 'debit', title: 'Debit' },
    { data: 'credit', title: 'Credit' },
    { data: 'balance', title: 'Balance' },
    {
        data: 'action',
        title: 'Action',
        width: '5%',
        searchable: false,
        orderable: false,
    },
];
const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);
const filters = ref([]);
const isFiltersOpen = ref(true);
const filterValues = ref({});
const isLoading = ref(false);
const labelRangeSelected = ref('');
const profitLossData = ref([]);
const isPdfLoading = ref(false);

onMounted(async () => {
    const companyData = await axiosInstance.get('/master/company');
    const companyFormated = companyData.data.data.data.map((item) => {
        return {
            label: item.name,
            id: item.id,
        };
    });
    var userdata = decryptData(Cookies.get('userdata'))
	const selectedCompany = userdata.company_id;

    const storeData = await axiosInstance.get('/master/store');
    const storeFormated = storeData.data.data.data.map((item) => {
        return {
            label: item.name,
            id: item.id,
        };
    });
    filters.value = [
        {
            type: 'selectRangeFinance',
            label: 'Range',
            name: 'range',
        },
        {
            type: 'select',
            label: 'Company',
            name: 'company_id',
            options: [
                { label: 'All Company', id: '' },
                ...companyFormated
            ],
            value: selectedCompany,
        },
        {
            type: 'select',
            label: 'Store',
            name: 'store',
            options: [
                { label: 'All Store', id: '' },
                ...storeFormated
            ],
        }
    ];
});
const prevDatas = ref({});
const handleFilterChange = (data) => {
    console.log('changed')
  const updateFilter = (key, fetchFunctions) => {
    if (data[key] && data[key] != null && data[key][0] != prevDatas.value[key]) {
      prevDatas.value[key] = data[key][0] || '';
      fetchFunctions.forEach(fn => refetchData(fn, data));
    }
  };

// 0 -> value yg keupdate user, 1 -> value yg diupdate sesuai value 0
  updateFilter('company_id', ['store']);
};

const setValuePrev = (data) => {
  const keys = ['company_id','store'];
  keys.forEach((key, index) => {
    filters.value[index + 1].value = data[key]?.[0] || '';
  });
};
const refetchData = async (type, data) => {
  const endpoints = {
	company: { url: '/master/company', params: [], filterIndex: 1, label: 'All Company' },
    store: { url: '/master/store', params: ['company_id'], filterIndex: 2, label: 'All Store' },
  };

  const { url, params, filterIndex, label } = endpoints[type];
  const queryParams = new URLSearchParams();

  params.forEach(param => {
    if (data[param] && data[param][0]) {
      queryParams.append(param, data[param][0]);
    }
  });

  const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
  const response = await axiosInstance.get(fullUrl);

  const formattedData = response.data.data.data.map(item => ({
    label: item.name,
    id: item.id,
  }));

  filters.value[filterIndex].options = [{ label, value: '' }, ...formattedData];
  console.log('fiter values', filters.value[filterIndex].options)
  setValuePrev(data);
};
watch(filterValues, () => {
    handleFilterChange(filterValues.value);
    getProfitLossData();
}, { deep: true });

watch(
	() => filters,
	() => {
		filterValues.value = filters.value.reduce(
			(acc, filter) => {
                if (filter.type == 'selectRangeFinance') {
					// this month start and end in string format
					const today = new Date()
					const start = new Date(
						today.getFullYear(),
						today.getMonth(),
						1
					)
						.toISOString()
						.split('T')[0]
					const end = new Date(
						today.getFullYear(),
						today.getMonth() + 1,
						0
					)
						.toISOString()
						.split('T')[0]
					acc.start_date = start
					acc.end_date = end
					return acc
				}
				if (filter.type == 'select') {
					if (filter.value) {
						acc[filter.name] = [filter.value]
					}
					return acc
				}
				return acc
			},
			{} as Record<string, string>
		)
        getProfitLossData()
	},
	{ deep: true }
)

const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Default start_date and end_date this month
filterValues.value.start_date = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
filterValues.value.end_date = formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
labelRangeSelected.value = new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();

const handleRangeSelected = (range) => {
    filterValues.value.start_date = range.start
    filterValues.value.end_date = range.end
    labelRangeSelected.value = range.label;
}

const getProfitLossData = () => {
    isLoading.value = true;
    const params = { ...filterValues.value };

    if (Array.isArray(params.company_id) && params.company_id.length > 0) {
        if (params.company_id[0] == '') {
            delete params.company_id;
        } else {
            params.company_id = params.company_id[0];
        }
    }

    if (Array.isArray(params.store) && params.store.length > 0) {
        if (params.store[0] == '') {
            delete params.store;
        } else {
            params.store = params.store[0];
        }
    }

    const data = axiosInstance.get('/finance/profit-loss', {
        params,
    }).then((response) => {
        // console.log(JSON.stringify(response.data));
        profitLossData.value = response.data.data;
    }).catch((error) => {
        console.log(error);
    }).finally(() => {
        isLoading.value = false;
    });
};

const formatAmount = (amount) => {
    // amount is type integer
    var positive = amount >= 0;
    amount = Math.abs(amount);
    var amountFormated  =  amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
    });
    // remove the "Rp" prefix
    amountFormated = amountFormated.substring(2);
    if (positive) {
        return amountFormated;
    } else {
        return '(' + amountFormated + ' )';
    }
};

const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
};

const printPdf = async () => {
    try {
        isPdfLoading.value = true;
        store.dispatch("triggerAlert", {
            type: "loading",
            title: "Generating PDF...",
            message: "Please wait while the PDF is being generated.",
        });

        const params = { ...filterValues.value };

        if (Array.isArray(params.company_id) && params.company_id.length > 0) {
            if (params.company_id[0] == '') {
                delete params.company_id;
            } else {
                params.company_id = params.company_id[0];
            }
        }

        if (Array.isArray(params.store) && params.store.length > 0) {
            if (params.store[0] == '') {
                delete params.store;
            } else {
                params.store = params.store[0];
            }
        }



        const response = await axiosInstance.post("/finance/pdf-profit-loss", {
            ...params,
            'labelRangeSelected': labelRangeSelected.value,
        });
        if (response.data.success) {
            const pdfBase64 = response.data.data.pdf;
            const pdfBlob = base64ToBlob(pdfBase64, "application/pdf");
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const today = new Date();
            const formattedDate = `${today.getFullYear()}${(today.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;


            // Create a link and trigger download
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `ProfitLoss_${formattedDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error("Failed to generate PDF:", response.data.message);
            store.dispatch("triggerAlert", {
                type: "error",
                title: "Error!",
                message: "Failed to generate PDF. Please try again.",
            });
        }
        isPdfLoading.value = false;
        store.dispatch("hideAlert");
    } catch (error) {
        isPdfLoading.value = false;
        store.dispatch("hideAlert");
        console.error("Error downloading PDF:", error);
    }
};


</script>

<style>
#profit-loss-table tbody td:nth-child(2), #profit-loss-table tbody td:nth-child(3) {
    text-align: right;
}
/* borderbottom */
#profit-loss-table tbody tr:last-child td {
    border-bottom: 1px solid #000;
}
#profit-loss-table td {
    padding-top: 0.8rem;
    padding-bottom: 0.3rem;
}
</style>