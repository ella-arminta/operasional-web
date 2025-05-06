<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';
import DropdownFinance from '../../components/DropdownFinance.vue';
import { name } from 'eslint-plugin-prettier/recommended';
import { useRoute } from 'vue-router';
import { formatDatetime, formatIDR } from '../../utils/common';

const columns = [
  { data: 'infoacc', title: 'Info Acc' },
  { data: 'date', title: 'Date', 
    render: function (data) {
      return formatDatetime(data);
    }
   },
  {
    data: 'account_name', title: 'Account Name'
  },
  { data: 'code', title: 'Trans Code' },
  { data: 'description', title: 'Description' },
  { data: 'debit', title: 'Debit', sum:true, 
    render: function (data) {
			return `<div style="text-align:right;">${formatIDR(data)}</div>`;
		} 
   },
  { data: 'credit', title: 'Kredit', sum:true, 
    render: function (data) {
			return `<div style="text-align:right;">${formatIDR(data)}</div>`;
		}  
  },
  { data: 'balance', title: 'Balance', sum:false, 
    // totalValue: (sums) => sums.debit - sums.credit, // key part
    render: function (data) {
			return `<div style="text-align:right;">${formatIDR(data)}</div>`;
		} 
  },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0'); 
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);
const route = useRoute();
const id = route.params.id || null;
const filters = ref([]);

onMounted(async () => {
  const companyData = await axiosInstance.get('/master/company')
	var companyOptions = companyData.data.data.data.map((company) => {
		return { label: company.name, id: company.id }
	})
	const selectedCompany = companyOptions.length > 0 ? companyOptions[0].id : ''

	const storeData = await axiosInstance.get('/master/store')
	var storeOptions = storeData.data.data.data.map((store) => {
		return { label: store.name, id: store.id }
	})

  const accountData = await axiosInstance.get('/finance/account')
  var accountOptions = accountData.data.data.map((account) => {
    return { label: account.name, id: account.id }
  })

  filters.value = [
  {
      type: 'selectRangeFinance',
      label: 'Date Range',
      name: 'range',
    },
    {
      type: 'select',
      label: 'Account',
      name: 'account_id',
      multiple: false,
      options: [
        { label: 'All Account', id: '' },
        ...accountOptions
      ],
      value: id !== null ? id : '',
    },
  ];
});
</script>

<template>
  <div class="content" :class="{ 'full-width': smallMenu }">
    <PageTitle 
    :title="'General Ledger Detail'"
    />

    <TableData 
      :columns="columns"
      :reload="true"
      :filters="filters"
      :totalFooter="true"
      :export="true"
      :filterOpen="true"
      :ajaxPath="`/finance/ledger`"
      :options="{
				scrollX: true,
			}"
    />
  </div>
</template>