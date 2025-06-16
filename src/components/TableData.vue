<template>
	<!-- table -->
	<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
		<!-- Header -->
		<div class="flex justify-between flex-wrap items-center">
			<div class="flex justify-center items-center gap-4">
				<div
					@click="toggleFilters"
					v-if="props.filters && props.filters.length > 0"
					:class="{
						'text-white hover:bg-pinkMed px-2 py-1 cursor-pointer rounded-md flex items-center': true,
						'bg-pinkDark': !isFiltersOpen,
						'bg-pinkLight': isFiltersOpen,
					}"
				>
					<!-- icon filter -->
					<i class="material-icons text-xl text-white">filter_alt</i>
				</div>
				<input
					type="text"
					placeholder="Search..."
					class="pl-3 pr-4 py-2 border rounded-lg text-sm placeholder-font-light placeholder-text-sm focus:border-pinkDark focus:outline-none transition duration-300"
					@input="onSearch"
				/>
			</div>
			<div class="flex items-center gap-2 justify-center">
				<div
					v-if="export"
					class="bg-pinkDark hover:bg-pinkMed text-white cursor-pointer font-bold py-1 px-2 flex justify-evenly items-center rounded-lg gap-2"
				>
					<div><i class="material-icons text-xl">border_all</i></div>
					<div class="text-sm" @click="exportTable">Export</div>
				</div>
				<div
					v-if="reload"
					class="bg-pinkDark hover:bg-pinkMed text-white cursor-pointer font-bold py-1 px-2 flex justify-evenly items-center rounded-lg gap-2"
					@click="reloadData"
				>
					<div><i class="material-icons text-xl">sync</i></div>
					<div class="text-sm">Reload</div>
				</div>
				<router-link
					v-if="addPath != ''"
					:to="addPath"
					class="bg-gradient-pink hover:bg-pinkMed text-white font-bold py-1 px-2 flex justify-evenly items-center rounded-lg gap-2"
				>
					<div><i class="material-icons text-xl">add</i></div>
					<div class="text-sm">Add</div>
				</router-link>
			</div>
		</div>

		<!-- Filters -->
		<div
			v-if="props.filters && props.filters.length > 0"
			class="transition-all duration-300 mt-3 rounded-lg"
			:class="{
				'max-h-0 overflow-hidden border-none': !isFiltersOpen,
				'max-h-90 border border-pinkLight': isFiltersOpen,
			}"
		>
			<div
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center gap-2 px-1 py-2"
			>
				<div
					v-for="filter in props.filters"
					:key="filter.name"
					class="w-full"
				>
					<!-- Filter type:"select" -->
					<div
						v-if="filter.type === 'select'"
						class="borde-none px-3 rounded-lg w-full"
					>
						<label :for="filter.name" class="block">{{
							filter.label
						}}</label>
						<Dropdown
							:items="filter.options"
							:multiple="filter.multiple || false"
							:disabled="filter.disabled || false"
							v-model="filterValues[filter.name]"
							class="border-none py-2 rounded-lg w-full"
						/>
					</div>
					<!-- Filter type:"SelectRangeFinance" -->
					<div
						v-if="filter.type == 'selectRangeFinance'"
						class="border-none px-3 rounded-lg w-full"
					>
						<label :for="filter.name" class="block mb-2">{{
							filter.label
						}}</label>
						<DropdownFinance
							@range-selected="handleRangeSelected"
						/>
					</div>
					<!-- Filter for Date Range -->
					<div v-if="filter.type === 'date'">
						<!-- <label :for="filter.name" class="block mb-1">{{ filter.label }}</label> -->
						<InputForm
							:id="filter.name"
							:label="filter.label"
							type="date"
							v-model="filterValues[filter.name]"
							class="border-none px-3 py-2 rounded-lg w-full"
						/>
					</div>
				</div>
			</div>
		</div>

		<DataTable
			:columns="columns"
			:options="options"
			id="table-id"
			ref="table"
			:ajax="ajaxOptions"
			:class="{
				'display rounded-lg overflow-hidden shadow-sm':
					!props.options.scrollX,
				'display rounded-t-lg overflow-hidden shadow-sm':
					props.options.scrollX,
			}"
			width="100%"
		>
			<thead>
				<tr class="!bg-pinkDark text-white">
					<th v-for="column in columns" :key="column.data">
						{{ column.data != null ? column.data.replace('_', ' ').toUpperCase() : '' }}
					</th>
				</tr>
			</thead>
			<tfoot v-if="props.totalFooter" class="bg-white">
				<tr>
					<th
						v-for="(column, index) in columns"
						:key="index"
						class="text-end"
					>
						{{ index === 0 ? 'Total' : column.sum ? 'Total' : '' }}
					</th>
				</tr>
			</tfoot>
		</DataTable>
	</div>
</template>
<style>
@import 'datatables.net-dt';

.dtfc-fixed-start {
	background: none !important;
}

.dt-search {
	display: none !important;
}

.dataTable > tbody > tr:nth-child(odd) > td {
	background-color: #ffffff !important;
	border: none !important;
	box-shadow: none !important;
	font-size: small !important;
}

.dataTable > tbody > tr:nth-child(even) > td {
	background-color: #fcf8f5 !important;
	border: none !important;
	box-shadow: none !important;
	font-size: small !important;
	font-weight: light !important;
}

.dataTable > tbody > tr > td.dt-type-numeric {
	text-align: start !important;
}

.dataTable > thead > tr > th {
	text-align: start !important;
	font-weight: bold !important;
}

div.dt-container .dt-length,
div.dt-container .dt-search,
div.dt-container .dt-info,
div.dt-container .dt-processing,
div.dt-container .dt-paging {
	color: var(--grey) !important;
	font-size: smaller !important;
}

div.dt-container .dt-paging .dt-paging-button.current {
	color: inherit !important;
	border: 1px solid var(--pink-dark) !important;
	box-shadow: none !important;
	background: none !important;
	border-radius: 8px;
	padding: 4px 10px;
}

div.dt-container .dt-paging .dt-paging-button.current:hover {
	background-color: var(--pink-light) !important;
	transition: all 0.3s ease;
	color: var(--white) !important;
}

div.dt-container .dt-paging .dt-paging-button:hover {
	background-color: var(--pink-light) !important;
	transition: all 0.3s ease;
	color: var(--white) !important;
}

div.dt-container .dt-paging .dt-paging-button.disabled:hover {
	background-color: var(--white) !important;
	transition: none !important;
	color: inherit !important;
}

div.dt-container .dt-paging .dt-paging-button {
	color: inherit !important;
	border: none !important;
	box-shadow: none !important;
	background: none !important;
	border-radius: 8px;
	padding: 4px 10px;
}

/* Align header elements */
.dt-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 10px 0px;
}

.dt-left .dt-length > select {
	display: inline-block;
	padding: 3px !important;
	border-radius: 8px !important;
	margin-right: 4px !important;
	border-color: var(--pink-dark) !important;
}

.dt-right .dt-buttons > button {
	display: inline-block;
	margin-left: auto;
	padding: 2px 8px !important;
	box-shadow: none !important;
	background: none !important;
	border-color: var(--pink-dark) !important;
	border-radius: 8px !important;
	font-size: smaller !important;
	color: var(--pink-dark) !important;
	text-align: center;
}

/* Footer layout */
.dt-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10px;
}

.dt-footer-left {
	display: inline-block;
}

.dt-footer-right {
	display: inline-block;
	margin-left: auto;
}

.dt-button-background {
	display: none !important;
}

.dt-button-collection {
	border-color: var(--pink-dark) !important;
	color: var(--pink-dark) !important;
	max-width: 150px !important;
	min-width: 100px !important;
	padding: 0px !important;
}

.dt-button-collection .dt-button {
	font-size: smaller !important;
}

.dt-button-collection .dt-button:hover {
	font-size: smaller !important;
	background-color: var(--pink-light) !important;
	color: var(--white) !important;
}

.dt-search {
	display: none !important;
}

tbody > tr:nth-child(odd) > td {
	background-color: #ffffff !important;
	border: none !important;
	box-shadow: none !important;
}

tbody > tr:nth-child(even) > td {
	background-color: #fcf8f5 !important;
	border: none !important;
	box-shadow: none !important;
}
.dataTable tfoot th {
	text-align: right !important;
}
</style>
<script setup lang="ts">
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import Buttons from 'datatables.net-buttons'
import 'datatables.net-buttons-dt/css/buttons.dataTables.css' // Include Buttons CSS
import ColumnVisibility from 'datatables.net-buttons/js/buttons.colVis.js' // Column Visibility Extension
import FixedColumns from 'datatables.net-fixedcolumns-dt'
import 'datatables.net-fixedcolumns-dt/css/fixedColumns.dataTables.css' // include fixedcolumns css

import { ref, onMounted, computed, watch, defineEmits } from 'vue'
import Select from 'datatables.net-select'
import Cookies from 'js-cookie'
import { decryptData } from '../utils/crypto'
import { useStore } from 'vuex'
import axiosInstance from '../axios'
import DropdownFinance from './DropdownFinance.vue'
import Dropdown from './Dropdown.vue'
import InputForm from './InputForm.vue'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'
import { useRouter } from 'vue-router'
import { formatDate, formatDatetime, formatIDR } from '../utils/common'

// Define props
const props = defineProps({
	columns: {
		type: Array,
		required: true,
	},
	export: {
		type: Boolean,
		default: false,
	},
	reload: {
		type: Boolean,
		default: true,
	},
	addPath: {
		type: String,
		default: '',
	},
	ajaxPath: {
		type: String,
		default: '',
	},
	editPath: {
		type: String,
		default: '',
	},
	deletePath: {
		type: String,
		default: null,
	},
	infoPath: {
		type: String,
		default: '',
	},
	approvePath: {
		type: String,
		default: '',
	},
	disapprovePath: {
		type: String,
		default: '',
	},
	filters: {
		type: [Array, null],
		default: () => [],
	},
	options: {
		type: Object,
		default: () => ({}),
	},
	totalFooter: {
		type: Boolean,
		default: false,
	},
	filterOpen: {
		type: Boolean,
		default: false,
	},
})

DataTable.use(DataTablesCore)
DataTable.use(Select)
DataTable.use(Buttons)
DataTable.use(ColumnVisibility)
DataTable.use(FixedColumns)
// Declaration
const isFiltersOpen = ref(false)
const table = ref()
let dt
const bearerToken = decryptData(Cookies.get('token')) || ''
const store = useStore()
const filterValues = ref({})
const baseUrl = import.meta.env.VITE_BASE_URL
let router = useRouter()

onMounted(() => {
	dt = table.value.dt
	if (props.filterOpen) {
		isFiltersOpen.value = true
	}
})

const toggleFilters = () => {
	isFiltersOpen.value = !isFiltersOpen.value
}
// function to search data within datatable
const onSearch = (event: Event) => {
	const input = event.target as HTMLInputElement
	dt.search(input.value || '').draw()
}
// function to reload data in datatable
const reloadData = () => {
	if (!props.reload) return
	if (dt) {
		dt.ajax.reload(null, false)
	}
}
watch(
	filterValues,
	() => {
		// console.log('filterValues', JSON.stringify(filterValues.value))
		if (dt) dt.ajax.reload(null, true) // Reload DataTable on filter change
	},
	{ deep: true }
)
watch(
	() => props.filters,
	() => {
		filterValues.value = props.filters.reduce(
			(acc, filter) => {
				if (filter.type === 'selectRangeFinance') {
					const today = new Date();

					const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
					const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

					// Manual format YYYY-MM-DD pakai lokal waktu
					const formatDate = (date) => {
						const year = date.getFullYear();
						const month = (date.getMonth() + 1).toString().padStart(2, '0'); // bulan 1-12
						const day = date.getDate().toString().padStart(2, '0'); // tanggal 1-31
						return `${year}-${month}-${day}`;
					};

					acc.dateStart = formatDate(startDate);
					acc.dateEnd = formatDate(endDate);

					console.log('handleRangeSelected', acc.dateStart, acc.dateEnd);

					return acc;
				}
				if (filter.type == 'select') {
					if (filter.value) {
						if (Array.isArray(filter.value)) {
							acc[filter.name] = filter.value;
						} else {
							acc[filter.name] = [filter.value]
						}
					} else {
						acc[filter.name] = filter.options[0].value
					}
					return acc
				}
				return acc
			},
			{} as Record<string, string>
		)
	},
	{ deep: true }
)

// function to delete data by id
const deleteData = (id: string) => {
	store.dispatch('triggerAlert', {
		type: 'warning',
		title: 'Warning!',
		message: `Are you sure you want to delete this data?`,
		actions: [
			{
				label: 'cancel',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
			{
				label: 'proceed',
				type: 'primary',
				handler: async () => {
					try {
						const response = await axiosInstance.delete(
							`${props.deletePath}/${id}`
						)
						if (response.data) {
							store.dispatch('triggerAlert', {
								type: 'success',
								title: 'Success!',
								message: 'Data deleted successfully.',
								actions: [
									{
										label: 'close',
										type: 'secondary',
										handler: () => {
											store.dispatch('hideAlert')
											reloadData()
										},
									},
								],
							})
						}
					} catch (error) {
						store.dispatch('triggerAlert', {
							type: 'error',
							title: 'Error!',
							message:
								error.response?.data.message ??
								'Failed to delete data.',
							actions: [
								{
									label: 'close',
									type: 'secondary',
									handler: () => store.dispatch('hideAlert'),
								},
							],
						})
					}
				},
			},
		],
	})
}

const toggleApprove = (id: string, status: number) => {
	const message =
		status == 1
			? 'Are you sure you want to approve this data?'
			: 'Are you sure you want to disapprove this data?'
	const ajaxUrl = status == 1 ? props.approvePath : props.disapprovePath
	store.dispatch('triggerAlert', {
		type: 'warning',
		title: 'Warning!',
		message: message,
		actions: [
			{
				label: 'cancel',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
			{
				label: 'proceed',
				type: 'primary',
				handler: async () => {
					try {
						const response = await axiosInstance.put(
							`${ajaxUrl}/${id}`,
							{ approve: status }
						)
						if (response.data) {
							const message =
								status == 1
									? 'Data approved successfully.'
									: 'Data disapproved successfully.'
							store.dispatch('triggerAlert', {
								type: 'success',
								title: 'Success!',
								message: message,
								actions: [
									{
										label: 'close',
										type: 'secondary',
										handler: () => {
											store.dispatch('hideAlert')
											reloadData()
										},
									},
								],
							})
						}
					} catch (error) {
						const message =
							status == 1
								? 'Failed to approve data.'
								: 'Failed to disapprove data.'
						store.dispatch('triggerAlert', {
							type: 'error',
							title: 'Error!',
							message: error.response?.data?.message ?? message,
							actions: [
								{
									label: 'close',
									type: 'secondary',
									handler: () => store.dispatch('hideAlert'),
								},
							],
						})
					}
				},
			},
		],
	})
}

const checkAjaxHasQuery = () => {
	return props.ajaxPath.includes('?')
}
const userdata = decryptData(Cookies.get('userdata'))

// Define ajax options in a computed property
const ajaxOptions = computed(() => ({
	url: !checkAjaxHasQuery()
		? baseUrl +
			props.ajaxPath +
			`?auth[company_id]=${userdata.company_id}&auth[store_id]=${userdata.store_id}`
		: baseUrl +
			props.ajaxPath +
			`&auth[company_id]=${userdata.company_id}&auth[store_id]=${userdata.store_id}`,
	type: 'GET',
	cache: true,
	headers: {
		Authorization: `Bearer ${bearerToken}`,
		'Content-Type': 'application/json',
	},
	data: (d) => {
		for (const key in filterValues.value) {
			if (
				filterValues.value[key] != '' &&
				filterValues.value[key] != undefined &&
				filterValues.value[key] != null && 
				(Array.isArray(filterValues.value[key]) ? 
					(filterValues.value[key].length > 0 ? 
						(filterValues.value[key][0] != null && filterValues.value[key][0] != undefined && filterValues.value[key][0] != '')
					: false) 
				: true) 
			) {
				if (filterValues.value[key].length <= 1) {
					d[key] = filterValues.value[key][0]
				} else {
					if (key != 'dateStart' && key != 'dateEnd') {
						d[key] = JSON.stringify(filterValues.value[key])
					} else {
						d[key] = filterValues.value[key];
					}
				}
			}
		}
		// // implicitly attach company and store at every query request for authorization
		// d.company_id = userdata.companyId
		// d.store_id = userdata.storeId
	},
	dataSrc: (json) => {
		var res = json.data?.data || json.data
		json.data = res.map((item, index) => {
			if (props.columns.find((col) => col.data === 'no')) {
				item.no = index + 1
			}
			if (props.columns.find((col) => col.data === 'action')) {
				let actionHtml = '<div class="flex gap-2">'
				if (
					props.editPath == '' &&
					props.deletePath == '' &&
					props.infoPath == '' &&
					props.approvePath == '' &&
					props.disapprovePath == ''
				) {
					actionHtml += ' - '
				}

				// Does not have Approval
				if (props.approvePath == '' && props.disapprovePath == '') {
					// Info button
					if (props.infoPath && props.infoPath !== '') {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out redirect"
								title="Info"
								data-redirect="${props.infoPath}/${item.id}"
							>
								i
							</div>`
					}

					// Edit button
					if (props.editPath && props.editPath !== '') {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out redirect"
								title="Edit"
								data-redirect="${props.editPath}/${item.id}"
							>
								<i class="material-icons text-sm">edit</i>
							</div>`
					}

					// Delete button
					if (props.deletePath && props.deletePath !== '') {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out"
								title="Delete"
								data-id="${item.id}"
							>
								<i class="material-icons text-sm">delete</i>
							</div>`
					}
				}
				// Has Approval
				else {
					// Info button
					if (props.infoPath && props.infoPath !== '') {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out redirect"
								title="Info"
								data-redirect="${props.infoPath}/${item.id}"
							>
								i
							</div>`
					}

					// Edit button
					if (
						props.editPath &&
						props.editPath !== '' &&
						item.approve != 1
					) {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out redirect"
								title="Edit"
								data-redirect="${props.editPath}/${item.id}"
							>
								<i class="material-icons text-sm">edit</i>
							</div>`
					}

					// Delete button
					if (
						props.deletePath &&
						props.deletePath !== '' &&
						item.approve != 1
					) {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out"
								title="Delete"
								data-id="${item.id}"
							>
								<i class="material-icons text-sm">delete</i>
							</div>`
					}

					// Approve button
					// display approve button
					console.log('item.approve', item.approve)
					console.log('item', item)
					if (props.approvePath != '' && item.approve == 0) {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark approve-btn transition duration-300 ease-in-out"
								title="Approve"
								data-id="${item.id}"
								data-title="Approve"
							>
								<i class="material-icons text-sm">check</i>
							</div>`
					}
					// display dissaprove button
					else if (props.disapprovePath != '' && item.approve == 1) {
						actionHtml += `
							<div
								class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark approve-btn transition duration-300 ease-in-out"
								title="Disapprove"
								data-id="${item.id}"
								data-title="Disapprove"
							>
								<i class="material-icons text-sm">close</i>
							</div>`
					}
				}

				actionHtml += '</div>'
				item.action = actionHtml
			}
			return item
		})
		setTimeout(() => {
			document.querySelectorAll('.delete-btn').forEach((btn) => {
				btn.addEventListener('click', (e) => {
					const id = e.target.closest('.delete-btn').dataset.id
					deleteData(id)
				})
			})

			document.querySelectorAll('.approve-btn').forEach((btn) => {
				btn.addEventListener('click', (e) => {
					const id = e.target.closest('.approve-btn').dataset.id
					const status =
						e.target.closest('.approve-btn').dataset.title ===
						'Approve'
							? 1
							: 0
					toggleApprove(id, status)
				})
			})

			document.querySelectorAll('.redirect').forEach((btn) => {
				btn.addEventListener('click', (e) => {
					const redirect =
						e.target.closest('.redirect').dataset.redirect
					router.push(redirect)
				})
			})
		})
		return json.data
	},
}))

// Define options in a computed property
const options = computed(() => ({
	dom: '<"dt-header"<"dt-left"l><"dt-right"B>>rt<"dt-footer"<"dt-footer-left"i><"dt-footer-right"p>>', // Add Buttons to the DataTable
	buttons: [
		{
			extend: 'colvis', // Add Column Visibility button
			text: 'Columns',
			columns: ':not(:first-child)', // Exclude the first column from toggling
		},
	],
	ajax: ajaxOptions.value,
	scrollX: props.options.scrollX || false,
	stateSave: true,
	fixedColumns: props.options.fixedColumns,
	drawCallback: attachDrawCallBack,
	order: [[1, 'desc']],
	footerCallback: function (row, data, start, end, display) {
		if (dt && props.totalFooter) {
			const columnSums = {};
			
			dt.columns().every(function () {
				const column = this
				const columnIndex = column.index()
				const colDef = props.columns[columnIndex];

				if (props.columns[columnIndex]?.sum) {
					let total = column
						.data()
						.reduce((sum, value) => sum + parseFloat(value) || 0, 0)
					
					columnSums[colDef.data] = total;

					const footer = column.footer()
					if (footer) {
						footer.innerHTML = formatIDR(total)
					}
				}
			})

			// Second pass: handle columns with `totalValue`
			dt.columns().every(function () {
				const column = this;
				const columnIndex = column.index();
				const colDef = props.columns[columnIndex];

				if (colDef?.totalValue && typeof colDef.totalValue === 'function') {
					const computed = colDef.totalValue(columnSums) || 0;
					const footer = column.footer();
					if (footer) {
					footer.innerHTML = computed.toLocaleString();
					}
				}
			});
		}
	},
	initComplete: function(settings, json) {
		settings.oInstance.api().columns.adjust().draw(false);
	}
}))
const attachDrawCallBack = () => {
	document.querySelectorAll('.delete-btn').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const id = e.target.closest('.delete-btn').dataset.id
			deleteData(id)
		})
	})

	document.querySelectorAll('.approve-btn').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const id = e.target.closest('.approve-btn').dataset.id
			const status =
				e.target.closest('.approve-btn').dataset.title === 'Approve'
					? 1
					: 0
			toggleApprove(id, status)
		})
	})

	document.querySelectorAll('.redirect').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const redirect = e.target.closest('.redirect').dataset.redirect
			router.push(redirect)
		})
	})
}
const handleRangeSelected = (range) => {
	filterValues.value.dateStart = range.start
	filterValues.value.dateEnd = range.end
}

defineExpose({
	reloadData,
})

// Helper to apply render logic from columns
const getRenderedValue = (column, rawValue, row) => {
	if (typeof column.render === 'function') {
		// Some render functions accept 3 params (data, type, row)
		if (column.render.length === 3) {
			return column.render(rawValue, 'display', row);
		}
		return column.render(rawValue);
	}
	return rawValue;
};

const stripHtml = (html) => {
    // Buat elemen DOM sementara di memori
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Ambil konten teks dari body, atau kembalikan string kosong jika tidak ada
    return doc.body.textContent || "";
};


const exportTable = async () => {
	const data = dt.rows().data().toArray();
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Exported Data');

	const columns = dt.settings()[0].aoColumns;
	const visibleColumns = dt.columns().header().toArray().map((header, index) => ({
		header: header.innerText,
		key: columns[index].data,
		render: columns[index].render, // 👈 include render function
		index: index,
		hiddenExport: columns[index].hiddenExport || false,
	})).filter(col => !col.hiddenExport && col.header !== 'Action');

	// Header
	worksheet.addRow(visibleColumns.map(col => col.header));
	worksheet.columns = visibleColumns.map(col => ({
		header: col.header,
		key: col.header,
		width: 25,
	}));

	// Rows
	data.forEach(row => {
		const filteredRow = {};

		visibleColumns.forEach(col => {
			const rawValue = row[col.key];
			const renderedValue = getRenderedValue(col, rawValue, row);
			filteredRow[col.header] = stripHtml(renderedValue);
		});

		worksheet.addRow(filteredRow);
	});

	// Optional footer
	if (props.totalFooter) {
		const footer = dt.columns().footer().toArray()
			.map((footer, index) => !columns[index].hiddenExport ? footer.innerText : null)
			.filter(value => value !== null);
		worksheet.addRow(footer);
	}

	// Export file
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});
	const filename = `${Date.now()}_${window.location.pathname.split('/').pop().replace(/-/g, '_')}.xlsx`;
	FileSaver.saveAs(blob, filename);
};

// Emit filterValues value when change
const emit = defineEmits(['filterValuesChanged']) // Define emit event
watch(
	filterValues,
	() => {
		emit('filterValuesChanged', filterValues.value)
	},
	{ deep: true }
)
</script>
