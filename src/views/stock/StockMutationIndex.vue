<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
const columns = [
	{ data: 'no', title: 'No' },
	{ data: 'code', title: 'Code' },
	{ data: 'name', title: 'Name' },
	{ data: 'category_id', title: 'Category' },
	{ data: 'initial_stock', title: 'Initial Stock' },
	{ data: 'initial_stock_gram', title: 'Initial Stock (gram)' },
	{ data: 'incoming_basic_goods', title: 'Incoming Basic Goods' },
	{ data: 'incoming_basic_goods_gram', title: 'Incoming Basic Goods (gram)' },
	{ data: 'sales', title: 'Sales' },
	{ data: 'sales_gram', title: 'Sales (gram)' },
	{ data: 'outgoing_basic_goods', title: 'Outgoing Basic Goods' },
	{ data: 'outgoing_basic_goods_gram', title: 'Outgoing Basic Goods (gram)' },
	{ data: 'purchase', title: 'Purchase' },
	{ data: 'purchase_gram', title: 'Purchase (gram)' },
	{ data: 'tukar_tambah_tukar_kurang', title: 'tukar tambah/tukar kurang' },
	{ data: 'final_stock', title: 'Final Stock' },
	{ data: 'final_stock_gram', title: 'Final Stock (gram)' },
	{ data: 'unit_price_per_gram', title: 'Unit Price (per gram)' },
	{ data: 'total_price_rp', title: 'Total Price (Rp)' },
]
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

const ajaxPath = '/inventory/stock-mutation'
const pageTitle = 'Stock Mutation Report'

const filters = ref([])

onMounted(async () => {
	const categoryData = await axiosInstance.get('/inventory/category')
	var categoriesFormated = categoryData.data.data.map((category) => ({
		label: category.name,
		id: category.id,
	}))
	const storeData = await axiosInstance.get('/master/store')
	var storesFormated = storeData.data.data.map((store) => ({
		label: store.name,
		id: store.id,
	}))
	filters.value = [
		{
			type: 'selectRangeFinance',
			label: 'Date Range',
			name: 'date_range',
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
		{
			type: 'select',
			label: 'Store',
			name: 'store_id',
			options: [{ label: 'All Store', value: '' }, ...storesFormated],
		},
	]
})
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
			:fixedColumns="{ start: 2 }"
			:options="{ scrollX: true }"
		/>
	</div>
</template>
