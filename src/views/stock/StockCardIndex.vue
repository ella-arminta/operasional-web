<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';
import { formatIDR } from '../../utils/common'

const columns = [
    { 
        data: 'date', 
        title: 'Date', 
        type: 'date',
        render: (data) => {
            const date = new Date(data);
            return date.toLocaleDateString('id-ID') + ' ' + 
                   date.toLocaleTimeString('id-ID', { hour12: false });
        } 
    },
    { data: 'code', title: 'Code' },
    { data: 'name', title: 'Name' },
    { data: 'description', title: 'Description', render: (data,type,row) => {
      if (row.trans_code != null && row.trans_code != '') {
        return data + ' ' + row.trans_code;
      } else {
        return data;
      }
    } },
    { data: 'in', title: 'In' },
    { data: 'out', title: 'Out' },
    { 
      data: 'balance', 
      title: 'Balance', 
      render: (data) => data != null ? Number(data) : 0
    },
    { data: 'weight_in', title: 'In (gr)' },
    { data: 'weight_out', title: 'Out (gr)' },
    { 
      data: 'balance_weight', 
      title: 'Balance (gr)', 
      render: (data) => data != null ? Number(data) : 0
    },
    {
      data: 'price',
      title: 'In Price (per gram)',
      render: function(data, type, row) {
        if (row.in > 0) {
          let angka = parseFloat(data).toFixed(2);
          return 'Rp. ' + formatIDR(angka);
        } else {
          return '-';
        }
      }
    },
    { data: 'unit_price', title: 'Unit Price (per gram)', name: 'unit_price', render:function(data) {
      return 'Rp. '+ formatIDR(data);
    } },
    {
      data: 'stock_value', 
      title: 'Stock Value (Rp)', 
      render: function(data, type, row) {
        if (!row || typeof row.stock_value === 'undefined' || typeof row.stock_value === 'undefined') {
          return '-';
        }
        return 'Rp. ' + formatIDR(data);
      }
    }
];
const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);

const ajaxPath = '/finance/stock-card';
const pageTitle = 'Stock Card';

const filters = ref([]);

onMounted(async () => {
	var prodData = await axiosInstance.get('/inventory/product');
	var prodFormat = prodData.data.data.data.map((prod) => ({
		label: prod.name,
		id: prod.id,
	}))
	var companyData = await axiosInstance.get('/master/company');
	var companyFormat = companyData.data.data.data.map((company) => ({
		label: company.name,
		id: company.id,
	}))
	var storeData = await axiosInstance.get('/master/store');
	var storeFormat = storeData.data.data.data.map((store) => ({
		label: store.name,
		id: store.id,
	}));
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
			options: [{ label: 'All Company', value: '' }, ...companyFormat],
		},
		{
			type: 'select',
			label: 'Store',
			name: 'store_id',
			options: [{ label: 'All Store', value: '' }, ...storeFormat],
		},
		{
			type: 'select',
			label: 'Product',
			name: 'product_id',
			options: [{ label: 'All Product', value: '' }, ...prodFormat],
		},
	]
  if (prodFormat.length > 0) {
    // Set value di filters
    filters.value.find(f => f.name === 'product_id').value = prodFormat[0].id;
    
    // Simulasikan event filterValuesChanged untuk trigger pengambilan data
    handleFilterChange({
      product_id: [prodFormat[0].id],
      company_id: filters.value.find(f => f.name === 'company_id')?.value ? [filters.value.find(f => f.name === 'company_id').value] : [''],
      store_id: filters.value.find(f => f.name === 'store_id')?.value ? [filters.value.find(f => f.name === 'store_id').value] : ['']
    });
  }

});
const prevDatas = ref({});
const handleFilterChange = (data) => {
  const updateFilter = (key, fetchFunctions) => {
    if (data[key] && data[key] != null && data[key][0] != prevDatas.value[key]) {
      prevDatas.value[key] = data[key][0] || '';
      fetchFunctions.forEach(fn => refetchData(fn, data));
    }
  };

// 0 -> value yg keupdate user, 1 -> value yg diupdate sesuai value 0
  updateFilter('company_id', ['store', 'product']);
  updateFilter('store_id', ['product']);
};

const setValuePrev = (data) => {
  const keys = ['company_id', 'store_id', 'product_id'];
  keys.forEach((key, index) => {
    filters.value[index + 1].value = data[key]?.[0] || '';
  });
};

const refetchData = async (type, data) => {
  const endpoints = {
    store: { url: '/master/store', params: ['company_id'], filterIndex: 2, label: 'All Store', deeper: true },
    product: { url: '/inventory/product', params: ['company_id', 'store_id'], filterIndex: 3, label: 'All Product', deeper: true },
  };

  const { url, params, filterIndex, label, deeper } = endpoints[type];
  const queryParams = new URLSearchParams();

  params.forEach(param => {
    if (data[param] && data[param][0]) {
      queryParams.append(param, data[param][0]);
    }
  });

  const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
  const response = await axiosInstance.get(fullUrl);

  let formattedData;
  console.log('this is the response', response);
  try {
    if (deeper) {
      console.log('masuk deeper')
      formattedData = response.data.data.data.map(item => ({
        label: item.name,
        id: item.id,
      }));
    } else {
      console.log('gak masuk deeper');
      formattedData = response.data.data.map(item => ({
        label: item.name,
        id: item.id,
      }));
    }
  } catch (error) {
    console.error('Error formatting data:' + url , error);
  }

  filters.value[filterIndex].options = [{ label, value: '' }, ...formattedData];
  setValuePrev(data);
};
</script>

<template>
  <div class="content" :class="{ 'full-width': smallMenu }">
    <PageTitle
      :title="pageTitle"
    />
    <TableData 
      :columns="columns"
      :export="true"
      :reload="true"
      :filters="filters"
      :ajaxPath="ajaxPath"
      :filterOpen="true"
      :options="{
				scrollX: true,
			}"
	  @filterValuesChanged="handleFilterChange"
    />
  </div>
</template>