<template>
	<!-- table -->
	<div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
		<!-- Header -->
		<div class="flex justify-between items-center">
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
			class="overflow-hidden transition-all duration-300"
			:class="{
				'max-h-0': !isFiltersOpen,
				'max-h-[500px]': isFiltersOpen,
			}"
		>
			<div class="mt-4 bg-gray-100 p-4 rounded-lg shadow">
				<!-- Filter content goes here -->
				<p class="text-gray-700">
					This is where your filter inputs can go.
				</p>
			</div>
		</div>

		<DataTable
			:columns="columns"
			:options="options"
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
div.dt-container select.dt-input {
	padding: 3px !important;
	border-radius: 8px !important;
	margin-right: 4px !important;
	border-color: var(--pink-dark) !important;
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
</style>
<script setup lang="ts">
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import { ref, onMounted, computed } from 'vue'
import Select from 'datatables.net-select'
import { defineProps } from 'vue'
import Cookies from 'js-cookie'
import axiosInstance from '../axios.js'
import { useStore } from 'vuex'

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
})

DataTable.use(DataTablesCore)
DataTable.use(Select)
// Declaration
const isFiltersOpen = ref(false)
const table = ref()
let dt
const bearerToken = Cookies.get('token') || ''
const store = useStore()

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

const baseUrl = import.meta.env.VITE_BASE_URL

// Define ajax options in a computed property
const ajaxOptions = computed(() => ({
	url: baseUrl + props.ajaxPath,
	type: 'GET',
	cache: true,
	headers: {
		Authorization: `Bearer ${bearerToken}`,
		'Content-Type': 'application/json',
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
</script>
