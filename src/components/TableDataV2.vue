<template>
    <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
        <!-- Header -->
        <div class="flex justify-between flex-wrap items-center mb-4">
            <div class="flex justify-center items-center gap-4">
                <div v-if="filters.length > 0" @click="toggleFilters"
                    class="bg-pinkDark text-white cursor-pointer px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-pinkMed">
                    <i class="material-icons">filter_alt</i>
                    <span>Filters</span>
                </div>
                <input type="text" v-model="searchQuery" placeholder="Search..."
                    class="pl-3 pr-4 py-2 border rounded-lg text-sm focus:border-pinkDark focus:outline-none transition duration-300"
                    @input="onSearch" />
            </div>
            <div class="flex items-center gap-2">
                <button v-if="exportable" @click="exportTable"
                    class="bg-pinkDark text-white font-bold py-1 px-2 flex items-center gap-2 rounded-lg hover:bg-pinkMed">
                    <i class="material-icons text-xl">border_all</i>
                    <span class="text-sm">Export</span>
                </button>
                <button v-if="reloadable" @click="reloadData"
                    class="bg-pinkDark text-white font-bold py-1 px-2 flex items-center gap-2 rounded-lg hover:bg-pinkMed">
                    <i class="material-icons text-xl">sync</i>
                    <span class="text-sm">Reload</span>
                </button>
            </div>
        </div>

        <!-- Filters -->
        <div v-if="filters.length > 0" class="transition-all duration-300"
            :class="isFiltersOpen ? 'max-h-[500px]' : 'max-h-0 overflow-hidden'">
            <div class="m-3 flex flex-wrap justify-center gap-4">
                <div v-for="filter in filters" :key="filter.name" class="w-full md:w-1/5">
                    <label :for="filter.name" class="block mb-1 font-medium">{{ filter.label }}</label>
                    <select v-model="filterValues[filter.name]" class="border px-3 py-2 rounded-lg w-full">
                        <option v-for="option in filter.options" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- DataTable -->
        <DataTable class="display" ref="table" :columns="columns" :data="tableData" :options="tableOptions">
            <thead>
                <tr class="!bg-pinkDark text-white">
                    <th v-for="column in columns" :key="column.data">{{ column.title }}</th>
                </tr>
            </thead>
        </DataTable>
    </div>
</template>

<script setup>
import { defineProps, ref, computed, onMounted } from 'vue'
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import Buttons from 'datatables.net-buttons'
import 'datatables.net-buttons-dt/css/buttons.dataTables.css' // Include Buttons CSS
import ColumnVisibility from 'datatables.net-buttons/js/buttons.colVis.js' // Column Visibility Extension
import FixedColumns from 'datatables.net-fixedcolumns-dt'
import 'datatables.net-fixedcolumns-dt/css/fixedColumns.dataTables.css'
import Select from 'datatables.net-select'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'

const props = defineProps({
    title: { type: String, required: true },
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
    exportable: { type: Boolean, default: false },
    reloadable: { type: Boolean, default: true },
    filters: { type: Array, default: () => [] }
})

const searchQuery = ref('')
const isFiltersOpen = ref(false)
const filterValues = ref({})
const table = ref()
DataTable.use(DataTablesCore)
DataTable.use(Select)
DataTable.use(Buttons)
DataTable.use(ColumnVisibility)
DataTable.use(FixedColumns)

const tableData = computed(() => {
    return props.data.filter(row => {
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })
})

const tableOptions = computed(() => {
    const createdAtIndex = getCreatedAtColumnIndex(props.columns);
    return {
        searching: true,
        paging: true,
        ordering: true,
        autoWidth: false,
        order: createdAtIndex !== -1 ? [[createdAtIndex, 'desc']] : [] // Urutkan hanya jika ada kolom `created_at`
    };
});



const getCreatedAtColumnIndex = (columns) => {
    console.log(columns);
    return columns.findIndex(col => col.data === 'created_at');
};


const toggleFilters = () => {
    isFiltersOpen.value = !isFiltersOpen.value
}

const onSearch = (event) => {
    const input = event.target
    table.value.dt.search(input.value || '').draw()
}

const reloadData = () => {
    table.value.dt.ajax.reload()
}

const exportTable = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(props.title)

    worksheet.addRow(props.columns.map(col => col.title))

    props.data.forEach(row => {
        worksheet.addRow(props.columns.map(col => row[col.data]))
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    FileSaver.saveAs(blob, `${props.title}.xlsx`)
}
</script>

<style>
/* @import 'datatables.net-dt/css/dataTables.dataTables.min.css'; */
@import 'datatables.net-dt';

.display {
    width: 100%;
    border-collapse: collapse;
}

.dtfc-fixed-start {
    background: none !important;
}

.dt-search {
    display: none !important;
}

.dataTable>tbody>tr:nth-child(odd)>td {
    background-color: #ffffff !important;
    border: none !important;
    box-shadow: none !important;
    font-size: small !important;
}

.dataTable>tbody>tr:nth-child(even)>td {
    background-color: #fcf8f5 !important;
    border: none !important;
    box-shadow: none !important;
    font-size: small !important;
    font-weight: light !important;
}

.dataTable>tbody>tr>td.dt-type-numeric {
    text-align: start !important;
}

.dataTable>thead>tr>th {
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

.dt-left .dt-length>select {
    display: inline-block;
    padding: 3px !important;
    border-radius: 8px !important;
    margin-right: 4px !important;
    border-color: var(--pink-dark) !important;
}

.dt-right .dt-buttons>button {
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

tbody>tr:nth-child(odd)>td {
    background-color: #ffffff !important;
    border: none !important;
    box-shadow: none !important;
}

tbody>tr:nth-child(even)>td {
    background-color: #fcf8f5 !important;
    border: none !important;
    box-shadow: none !important;
}

.dataTable tfoot th {
    text-align: start !important;
}
</style>
