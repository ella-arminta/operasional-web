<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/master/price/add'"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/price-category'"
			:deletePath="'/inventory/bulk-price'"
			:infoPath="'/master/price/view'"
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
	{
		data: 'date',
		title: 'Date',
		width: '15%',
		render: function (data, type, row) {
			// Check if `types` exists and is an array
			if (!data) return '-'
			return formattedDate(data)
		},
	},
	{
		data: 'category',
		title: 'Category',
		width: '20%',
		render: (data) => `${data.code} - ${data.name}`,
	},
	{
		data: 'types',
		title: 'Prices',
		render: (data, type, row) => {
			return data
				.map(
					(d) =>
						`<p>${d.code}-${d.name} : ${formatPrice(d.price)}</p>`
				)
				.join('')
		},
	},
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]
const formattedDate = (date) => {
	const d = new Date(date)
	const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
	const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
	const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
	return `${da}-${mo}-${ye}`
}

const formatPrice = (price) => {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
	}).format(price)
}
</script>
