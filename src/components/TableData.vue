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
					<div class="text-sm">Export</div>
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
			class="transition-all duration-300"
			:class="{ 'max-h-0 overflow-hidden': !isFiltersOpen, 'max-h-[500px]': isFiltersOpen }"
		>
			<div class="m-3 flex flex-wrap justify-center gap-3 md:gap-6">
				<div v-for="filter in props.filters" :key="filter.name" class="w-[100%] md:w-[18.8%]">
					<!-- Filter type:"select" -->
					<div v-if="filter.type === 'select'">
						<label :for="filter.name" class="block mb-1">{{ filter.label }}</label>
						<select
						v-if="filter.type === 'select'"
						:id="filter.name"
						v-model="filterValues[filter.name]"
						class="border px-3 py-2 rounded-lg w-full"
						>
						<option v-for="option in filter.options" :key="option.value" :value="option.value">
							{{ option.label }}
						</option>
						</select>
					</div>
					<!-- Filter type:"SelectRangeFinance" -->
					<div v-if="filter.type == 'selectRangeFinance'">
						<label :for="filter.name" class="block mb-1">{{ filter.label }}</label>
						<DropdownFinance @range-selected="handleRangeSelected" />
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
			class="display rounded-lg border border-gray-400 overflow-hidden shadow-sm"
			width="100%"
		>
			<thead>
				<tr class="bg-pinkDark text-white">
					<th v-for="column in columns" :key="column.data">
						{{ column.data.replace('_', ' ').toUpperCase() }}
					</th>
				</tr>
			</thead>
		</DataTable>
	</div>
</template>
<style scoped>
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
</style>
<script setup lang="ts">
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import Buttons from 'datatables.net-buttons'
import 'datatables.net-buttons-dt/css/buttons.dataTables.css' // Include Buttons CSS
import ColumnVisibility from 'datatables.net-buttons/js/buttons.colVis.js' // Column Visibility Extension

import { ref, onMounted, computed, watch } from 'vue'
import Select from 'datatables.net-select'
import { defineProps } from 'vue'
import Cookies from 'js-cookie'
import { useStore } from 'vuex'
import axiosInstance from '../axios'
import DropdownFinance from './DropdownFinance.vue'

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

// Declaration
const isFiltersOpen = ref(true)
const table = ref()
let dt
const bearerToken = Cookies.get('token') || ''
const store = useStore()
const filterValues = ref({})
const baseUrl = import.meta.env.VITE_BASE_URL

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
    dt.ajax.reload(null, false);
  }
};
watch(filterValues, () => {
  if (dt) dt.ajax.reload(null, false); // Reload DataTable on filter change
}, { deep: true });
watch(() => props.filters, () => {
  filterValues.value = props.filters.reduce((acc, filter) => {
	if (filter.type == 'selectRangeFinance') {
		// this month start and end in string format
		const today = new Date();
		const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
		const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
		acc.dateStart = start;
		acc.dateEnd = end;
		return acc;
	}
	acc[filter.name] = filter.options[0].value;
	return acc;
  }, {} as Record<string, string>);
});

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

// Define ajax options in a computed property
const ajaxOptions = computed(() => ({
	url: baseUrl + props.ajaxPath,
	type: 'GET',
	cache: true,
	headers: {
		Authorization: `Bearer ${bearerToken}`,
		'Content-Type': 'application/json',
	},
	data: (d) => {
		for (const key in filterValues.value) {
			if (filterValues.value[key] !== '') {
				d[key] = filterValues.value[key]
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
	scrollX: props.options.scrollX || false,
}))

const handleRangeSelected = (range) => {
	console.log('selected');
	console.log(range);
	console.log(filterValues);
	filterValues.value.dateStart = range.start;
	filterValues.value.dateEnd = range.end;
};
</script>
