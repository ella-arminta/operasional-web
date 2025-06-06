<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import { decryptData } from '../../utils/crypto'
import Cookies from 'js-cookie'

const columns = [
	{ data: 'code', title: 'Code' },
	{ data: 'name', title: 'Name' },
	{ data: 'company.name', title: 'Company' },
	{ data: 'store.name', title: 'Store' },
	{ data: 'account_type.name', title: 'Type' },
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

const filters = ref([])

onMounted(async () => {
	const storeData = await axiosInstance.get('/master/store')
	var storesFormated = storeData.data.data.data.map((store) => ({
		label: store.name,
		id: store.id,
	}))
	const typeData = await axiosInstance.get('/finance/account-type')
	var typesFormated = typeData.data.data.map((type) => ({
		label: type.name,
		id: type.id,
	}))
	const companyData = await axiosInstance.get('/master/company')
	var companiesFormated = companyData.data.data.data.map((company) => ({
		label: company.name,
		id: company.id,
	}))
	const userdata = decryptData(Cookies.get('userdata'))
	const selectedCompany = userdata.company_id;

	filters.value = [
		{
			type: 'select',
			label: 'Company',
			name: 'company_id',
			options: [
				{ label: 'All Company', value: '' },
				...companiesFormated,
			],
			value: selectedCompany,
		},
		{
			type: 'select',
			label: 'Store',
			name: 'store_id',
			options: [{ label: 'All Store', value: '' }, ...storesFormated],
		},
		{
			type: 'select',
			label: 'Type',
			name: 'account_type_id',
			options: [{ label: 'All Type', value: '' }, ...typesFormated],
		},
	]
})
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="'/master/account/add'"
			:reload="true"
			:filters="filters"
			ajaxPath="/finance/account"
			:editPath="'/master/account/edit'"
			:deletePath="'/finance/account'"
			:infoPath="'/master/account/detail'"
			:infoLabel="'Buku besar'"
			:options="{
				scrollX: true,
			}"
		/>
	</div>
</template>
