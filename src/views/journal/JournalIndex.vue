<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import DropdownFinance from '../../components/DropdownFinance.vue'
import { formatIDR } from '../../utils/common'

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
	filters.value = [
		{
			type: 'selectRangeFinance',
			label: 'Range',
			name: 'range',
		},
	]
})
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
		/>
	</div>
</template>
