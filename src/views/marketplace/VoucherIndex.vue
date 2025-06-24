<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle title="Voucher List" />
		<TableData :columns="columns" :addPath="'/marketplace/voucher/add'" :export="false" :reload="true"
			:ajaxPath="`/transaction/voucher/${storeId}/store`" :editPath="'/marketplace/voucher/edit'"
			:deletePath="'/transaction/voucher'" :infoPath="'/marketplace/voucher/detail'" />
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const storeId = decryptData(Cookies.get('userdata')).store_id

const formatDate = (dateString) => {
	const options = { year: 'numeric', month: 'long', day: 'numeric' }
	return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatNumber = (num) => {
	return new Intl.NumberFormat('id-ID').format(num)
}

const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'id', title: 'ID', visible: false },
	{ data: 'code', title: 'Code' },
	{ data: 'name', title: 'Voucher Name' },
	{
		data: 'discount_amount',
		title: 'Discount Amount',
		render: (data) => `${data}%`,
	},
	{
		data: 'max_discount',
		title: 'Max Discount',
		render: (data) => formatNumber(data),
	},
	{
		data: 'min_purchase',
		title: 'Min Purchase',
		render: (data) => formatNumber(data),
	},
	{
		data: 'poin_price',
		title: 'Poin Price',
		render: (data) => formatNumber(data),
	},
	{
		data: 'start_date',
		title: 'Start Date',
		render: (data) => formatDate(data),
	},
	{
		data: 'end_date',
		title: 'End Date',
		render: (data) => formatDate(data),
	},
	{
		data: 'is_active',
		title: 'Status',
		render: function (data, type, row) {
			const now = new Date()
			const endDate = new Date(row.end_date)

			if (now > endDate) {
				return `<span style="color: gray; font-weight: bold;">Expired</span>`
			}

			return `<span style="color: ${data ? 'green' : 'red'}; font-weight: bold;">${data ? 'Active' : 'Inactive'}</span>`
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
</script>
