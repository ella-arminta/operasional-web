<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/inventory/product/add'"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/product'"
			:editPath="'/inventory/product/edit'"
			:deletePath="'/inventory/product'"
			:infoPath="'/inventory/product/detail'"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, render } from 'vue'
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'id', title: 'Id', visible: false },
	{ data: 'code', title: 'Code' },
	{ data: 'name', title: 'Name' },
	{
		data: 'type',
		title: 'Category',
		render: (data) => {
			return `${data.category.code} - ${data.category.name}`
		},
	},
	{
		data: 'type',
		title: 'Type',
		render: (data) => {
			return `${data.code} - ${data.name}`
		},
		visible: false,
	},
	{
		data: 'product_codes',
		title: 'Stock',
		render: (data) => {
			return data.length
		},
	},
	{
		data: 'product_codes',
		title: 'Avg. Price',
		render: (data) => {
			const total = data.reduce(
				(acc, curr) => acc + (parseFloat(curr.fixed_price) ?? 0),
				0
			)
			return formatPrice(total / (data.length > 0 ? data.length : 1))
		},
	},
	{ data: 'description', title: 'Description', visible: false },
	{ data: 'images', title: 'images', visible: false },
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]
const formatPrice = (price) => {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
	}).format(price)
}
</script>
