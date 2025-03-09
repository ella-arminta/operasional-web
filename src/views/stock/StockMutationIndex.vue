<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import { formatIDR } from '../../utils/common'

const columns = [
	{ data: 'no', title: 'No' },
	{ data: 'product_code', title: 'Code', name:'product_code' },
	{ data: 'product_name', title: 'Name', name: 'product_name' },
	{ data: 'category_name', title: 'Category', name: 'category_name' },
	{ data: 'initial_stock', title: 'Initial Stock', name: 'initial_stock' },
	{ data: 'initial_stock_gram', title: 'Initial Stock (gram)', name: 'initial_stock_gram' },
	{ data: 'in_goods', title: 'Incoming Basic Goods', name: 'in_goods' },
	{ data: 'in_goods_gram', title: 'Incoming Basic Goods (gram)', name: 'in_goods_gram' },
	{ data: 'sales', title: 'Sales', name: 'sales' },
	{ data: 'sales_gram', title: 'Sales (gram)', name: 'sales_gram' },
	{ data: 'out_goods', title: 'Outgoing Basic Goods', name: 'out_goods' },
	{ data: 'out_goods_gram', title: 'Outgoing Basic Goods (gram)', name: 'out_goods_gram' },
	{ data: 'purchase', title: 'Purchase', name: 'purchase' },
	{ data: 'purchase_gram', title: 'Purchase (gram)', name:'purchase_gram' },
	{ data: 'trade', title: 'tukar tambah/tukar kurang', name: 'trade' },
	{ data: 'trade_gram', title: 'tukar tambah/tukar kurang (gram)', name: 'trade_gram' },
	{ data: 'final', title: 'Final Stock', name: 'final' },
	{ data: 'final_gram', title: 'Final Stock (gram)', name: 'final_gram' },
	{ data: 'unit_price', title: 'Unit Price (per gram)', name: 'unit_price', render:function(data) {
		return 'Rp. '+ formatIDR(data);
	} },
	{ 
		data: 'final_gram',
		title: 'Stock Value (Rp)', 
		render: function(data, type, row) {
			if (!row || typeof row.final_gram === 'undefined' || typeof row.unit_price === 'undefined') {
				return '-';
			}
			return 'Rp. '+formatIDR(row.final_gram * row.unit_price);
		}
	},
]
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

const ajaxPath = '/finance/stock-mutation'
const pageTitle = 'Stock Mutation Report'

const filters = ref([])

onMounted(async () => {
	const storeData = await axiosInstance.get('/master/store')
	var storesFormated = storeData.data.data.map((store) => ({
		label: store.name,
		id: store.id,
	}))
	const categoryData = await axiosInstance.get('/inventory/category')
	var categoriesFormated = categoryData.data.data.map((category) => ({
		label: category.name,
		id: category.id,
	}))
	filters.value = [
		{
			type: 'selectRangeFinance',
			label: 'Date Range',
			name: 'date_range',
		},
		{
			type: 'select',
			label: 'Store',
			name: 'store_id',
			options: [{ label: 'All Store', value: '' }, ...storesFormated],
		},
		{
			type: 'select',
			label: 'Category',
			name: 'category_id',
			options: [
				{ label: 'All Category', value: '' },
				...categoriesFormated,
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
  updateFilter('store_id', ['category']);
};

const setValuePrev = (data) => {
  const keys = ['store_id', 'category_id'];
  keys.forEach((key, index) => {
    filters.value[index + 1].value = data[key]?.[0] || '';
  });
};
const refetchData = async (type, data) => {
  const endpoints = {
    store: { url: '/master/store', params: [], filterIndex: 1, label: 'All Store' },
    category: { url: '/inventory/category', params: ['store_id'], filterIndex: 2, label: 'All Category' },
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

  const formattedData = response.data.data.map(item => ({
    label: item.name,
    id: item.id,
  }));

  filters.value[filterIndex].options = [{ label, value: '' }, ...formattedData];
  setValuePrev(data);
};
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle :title="pageTitle" />
		<TableData
			:columns="columns"
			:export="true"
			:reload="true"
			:filters="filters"
			:ajaxPath="ajaxPath"
			:options="{ 
				scrollX: true, 
				fixedColumns: { start: 3 } 
			}"
			@filterValuesChanged="handleFilterChange"
		/>
	</div>
</template>
