<template>
	<!-- table -->
	<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
		<!-- Header -->
		<div class="flex justify-between flex-wrap items-center">
			<div class="flex justify-center items-center gap-4">
				<div
					@click="toggleFilters"
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
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center gap-2 px-1 py-2">
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
					<div v-if="filter.type == 'selectRangeFinance'"
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
				<tr class="bg-pinkDark text-white">
					<th v-for="column in columns" :key="column.data">
						{{ column.data.replace('_', ' ').toUpperCase() }}
					</th>
				</tr>
			</thead>
			<tfoot>
				<tr>
					<th v-for="column in columns" :key="column.data">
						<!-- Show total for debit & credit columns -->
						<span v-if="column.data === 'debit'">Total Debit: <span id="total-debit">0</span></span>
						<span v-else-if="column.data === 'credit'">Total Credit: <span id="total-credit">0</span></span>
					</th>
				</tr>
			</tfoot>

		</DataTable>
	</div>
</template>
<style>
@import 'datatables.net-dt';
.dt-search {
	display: none !important;
}
tbody > tr:nth-child(odd) > td {
	background-color: #ffffff !important;
	border: none !important;
	box-shadow: none !important;
	font-size: small !important;
}
tbody > tr:nth-child(even) > td {
	background-color: #fcf8f5 !important;
	border: none !important;
	box-shadow: none !important;
	font-size: small !important;
	font-weight: light !important;
}
tbody > tr > td.dt-type-numeric {
	text-align: start !important;
}
thead > tr > th {
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
</style>
<script setup lang="ts">
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import Buttons from 'datatables.net-buttons'
import 'datatables.net-buttons-dt/css/buttons.dataTables.css' // Include Buttons CSS
import ColumnVisibility from 'datatables.net-buttons/js/buttons.colVis.js' // Column Visibility Extension
import RowGroup from 'datatables.net-rowgroup-dt'

import { ref, onMounted, computed, watch } from 'vue'
import Select from 'datatables.net-select'
import { defineProps } from 'vue'
import Cookies from 'js-cookie'
import { decryptData } from '../utils/crypto'
import { useStore } from 'vuex'
import axiosInstance from '../axios'
import DropdownFinance from './DropdownFinance.vue'
import Dropdown from './Dropdown.vue'
import InputForm from './InputForm.vue'
import FileSaver from 'file-saver'
import ExcelJS from 'exceljs'
import { useRouter } from 'vue-router'
import { formatDate, formatIDR } from '../utils/common'

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
	filters: {
		type: [Array, null],
		default: () => [],
	},
	options: {
		type: Object,
		default: () => ({}),
	},
})

DataTable.use(DataTablesCore)
DataTable.use(Select)
DataTable.use(Buttons)
DataTable.use(ColumnVisibility)
DataTable.use(RowGroup)

// Declaration
const isFiltersOpen = ref(true)
const table = ref()
let dt
const bearerToken = decryptData(Cookies.get('token')) || ''
const store = useStore()
const filterValues = ref({})
const baseUrl = import.meta.env.VITE_BASE_URL
let router = useRouter()

onMounted(() => {
	dt = table.value.dt
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
	if (dt) {
		dt.ajax.reload(null, false)
	}
}
watch(
	filterValues,
	() => {
		if (dt) dt.ajax.reload(null, false) // Reload DataTable on filter change
	},
	{ deep: true }
)
watch(
	() => props.filters,
	() => {
		filterValues.value = props.filters.reduce(
			(acc, filter) => {
				if (filter.type == 'selectRangeFinance') {
					// this month start and end in string format
					const today = new Date()
					const start = new Date(
						today.getFullYear(),
						today.getMonth(),
						1
					)
						.toISOString()
						.split('T')[0]
					const end = new Date(
						today.getFullYear(),
						today.getMonth() + 1,
						0
					)
						.toISOString()
						.split('T')[0]
					acc.dateStart = start
					acc.dateEnd = end
					return acc
				}
				if (filter.type == 'select') {
					if (filter.value) {
						acc[filter.name] = [filter.value]
					} else  {
						acc[filter.name] = filter.options[0].value
					}
					return acc
				}
				return acc
			},
			{} as Record<string, string>
		)
	}
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
							message: 'Failed to delete data.',
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
				filterValues.value[key] !== '' &&
				filterValues.value[key] !== undefined
			) {
				if (filterValues.value[key].length <= 1) {
					d[key] = filterValues.value[key][0]
				} else {
					d[key] = JSON.stringify(filterValues.value[key])
				}
			}
		}
	},
	dataSrc: (json) => {
		json.data = json.data.map((item, index) => {
			if (props.columns.find((col) => col.data === 'no')) {
				item.no = index + 1
			}
			if (props.columns.find((col) => col.data === 'action')) {
				let actionHtml = '<div class="flex gap-2">'

				// Info button
				if (props.infoPath && props.infoPath !== '') {
					actionHtml += `
          <div
            class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out"
            title="Info"
            onclick="location.href='${props.infoPath}/${item.id}'"
          >
            i
          </div>`
				}

				// Edit button
				if (props.editPath && props.editPath !== '') {
					actionHtml += `
          <div
            class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark transition duration-300 ease-in-out"
            title="Edit"
            onclick="location.href='${props.editPath}/${item.id}'"
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
	scrollX: true,
	rowGroup: {
		dataSrc: 'code', // Group by the "Journal Entry" column
		startRender: (rows, group) => {
			const totalDebit = rows
				.data()
				.reduce((sum, row) => sum + parseFloat(row.debit || 0), 0)
			const totalCredit = rows
				.data()
				.reduce((sum, row) => sum + parseFloat(row.credit || 0), 0)

			// get thead Datatable columns width
			const thead = document.querySelector('thead')
			const theadColumns = thead.querySelectorAll('th')
			const theadColumnsWidth = Array.from(theadColumns).map(
				(col) => col.offsetWidth
			)
			console.log(JSON.stringify(theadColumnsWidth))
			var newthead = ''
			var outerIndex = 0
			props.columns.forEach((col) => {
				if (col.bVisible == undefined) {
					col.bVisible = true
				}
				if (col.bVisible == false) {
				} else {
					newthead += `<th style="width:${theadColumnsWidth[outerIndex++]}px;">${col.title.replace('_', ' ').toUpperCase()}</th>`
				}
			})

			return `
			<table class="w-full dt-scroll-head">
				<thead style="visibility: collapse;">
					<tr>
						${newthead}
					</tr>
				</thead>
				<tbody>
				<tr class="group-header" data-group="${group}" style="color:#b6848a;">
					<td colspan="1" class="text-start" style="padding: 10px 30px 10px 10px;">
						<div class="flex gap-2">
							<strong>${group}</strong>
						</div>
					</td>
					<td colspan="1" style="padding: 10px 30px 10px 10px;"></td>
					<td colspan="1" style="padding: 10px 30px 10px 10px;"></td>
					<td colspan="1" class="text-end" style="padding: 10px 30px 10px 10px;"><strong>${formatIDR(totalDebit)}</strong></td>
					<td colspan="1" class="text-end" style="padding: 10px 30px 10px 10px;"><strong>${formatIDR(totalCredit)}</strong></td>
				</tr>
				</tbody>
			</table>
			`
		},
	},
	footerCallback: function (row, data, start, end, display) {
		console.log(dt);
		if (!dt) return; // Ensure dt is initialized

		// Helper function to sum a column for all pages
		const sumColumn = (columnIndex) => {
			return dt
				.column(columnIndex) // Remove { page: 'current' } to sum all data
				.data()
				.reduce((a, b) => (parseFloat(a) || 0) + (parseFloat(b) || 0), 0);
		};

		// Ensure dt is ready before accessing columns
		if (!dt.columns().count()) return;

		// Get column indexes
		console.log('column', dt.column());
		const debitIndex = dt.column('debit:name').index();
		const creditIndex = dt.column('credit:name').index();
		console.log('debit', debitIndex, 'credit', creditIndex);

		// Calculate sums for all pages
		const totalDebit = sumColumn(debitIndex);
		const totalCredit = sumColumn(creditIndex);
		console.log('totalDebit', totalDebit, 'totalCredit', totalCredit);

		// Update the footer
		document.getElementById('total-debit').innerText = formatIDR(totalDebit);
		document.getElementById('total-credit').innerText = formatIDR(totalCredit);
	}
}))
const handleRangeSelected = (range) => {
	console.log('selected')
	console.log(range)
	filterValues.value.dateStart = range.start
	filterValues.value.dateEnd = range.end
}
const exportTable = async () => {
	const data = dt.rows().data().toArray();
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Exported Data');

	// Get all column indexes
	const columns = dt.settings()[0].aoColumns;

	// Filter visible columns and prepare for date handling
	const visibleColumns = dt.columns().header().toArray().map((header, index) => ({
		header: header.innerText,
		key: columns[index].data,
		index: index,
		hiddenExport: columns[index].hiddenExport || false,
		type: columns[index].type || null, // Ensure type is stored
	})).filter(col => !col.hiddenExport && col.header !== "Action");

	// Identify which columns are dates
	const dateColumns = new Set(visibleColumns.filter(col => col.type === 'date').map(col => col.header));

	// Add headers
	worksheet.addRow(visibleColumns.map(col => col.header));

	// Define column widths
	worksheet.columns = visibleColumns.map(col => ({
		header: col.header,
		key: col.header,
		width: 20,
	}));

	// Add rows with formatted dates
	data.forEach(row => {
		let filteredRow = {};

		visibleColumns.forEach(col => {
			let value = row[col.key];

			// Format date columns
			if (dateColumns.has(col.header) && value) {
				value = new Date(value);
			}

			filteredRow[col.header] = value;
		});

		const rowData = worksheet.addRow(filteredRow);

		// Apply Excel date formatting
		rowData.eachCell((cell, colNumber) => {
			if (dateColumns.has(visibleColumns[colNumber - 1].header)) {
				cell.numFmt = 'dd/mm/yyyy';
			}
		});
	});

	// Add footer row if needed
	if (props.totalFooter) {
		const footer = dt.columns().footer().toArray().map((footer, index) =>
			!columns[index].hiddenExport ? footer.innerText : null
		).filter(value => value !== null);

		worksheet.addRow(footer);
	}

	// Generate and save file
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

	const filename = `${Date.now()}_${window.location.pathname.split('/').pop().replace(/-/g, '_')}.xlsx`;
	FileSaver.saveAs(blob, filename);
};
const checkAjaxHasQuery = () => {
	return props.ajaxPath.includes('?')
}
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
<style>
@import 'datatables.net-dt';
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

table.dataTable tbody tr.group-header {
    background-color: #f5e1e4 !important;
    color: #b6848a !important;
    font-weight: bold;
    border-bottom: 2px solid #b6848a;
}


</style>
