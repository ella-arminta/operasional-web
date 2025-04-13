<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import DropdownFinance from '../../components/DropdownFinance.vue'
import { formatIDR } from '../../utils/common'
import { decryptData } from '../../utils/crypto'
import Cookies from 'js-cookie'

const columns = [
	{ data: 'name', title: 'Name' },
	{ data: 'debit', title: 'Debit', render:function(data, type, row){
		return row.debit ? `<div style="text-align:right;">${formatIDR(data)}</div>` : '<div style="text-align:right;">0</div>'
	} },
	{ data: 'credit', title: 'Credit' , render: function(data, type, row){
		return row.credit ? `<div style="text-align:right;">${formatIDR(data)}</div>` : '<div style="text-align:right;">0</div>'
	}},
	{ data: 'balance', title: 'Balance', render: function(data, type, row){
		return row.balance ? `<div style="text-align:right;">${formatIDR(data)}</div>` : '<div style="text-align:right;">0</div>'
	}},
	{
		data: 'action',
		title: 'Action',
		width: '5%',
		searchable: false,
		orderable: false,
	},
]
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

const filters = ref([])

onMounted(async () => {
	const companyData = await axiosInstance.get('/master/company')
	var companyOptions = companyData.data.data.data.map((company) => {
		return { label: company.name, id: company.id }
	})
    const userdata = decryptData(Cookies.get('userdata'))
	const selectedCompany = userdata.company_id;
	const selectedStore = userdata.store_id;

	const storeData = await axiosInstance.get('/master/store')
	var storeOptions = storeData.data.data.data.map((store) => {
		return { label: store.name, id: store.id }
	})

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
			multiple: false,
			options: [
				...companyOptions,
			],
			value: selectedCompany,
		},
		{
			type: 'select',
			label: 'Store',
			name: 'store_id',
			multiple: false,
			options: [
				{ label: 'All Store', value: '' },
				...storeOptions,
			],
		},
	]
})

const prevDatas = ref({});
const handleFilterChange = (data) => {
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
  const keys = ['company_id','store_id'];
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
  setValuePrev(data);
};
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle />

		<TableData
			:columns="columns"
			:reload="true"
			:filters="filters"
			ajaxPath="/finance/journal"
			:infoPath="'/finance/journal/detail'"
			:options="{
				scrollX: true,
			}"
			@filterValuesChanged="handleFilterChange"
		/>
	</div>
</template>
