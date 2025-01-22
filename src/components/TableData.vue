<script setup lang="ts">
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';
import { ref, onMounted } from 'vue';
import Select from 'datatables.net-select';
import { defineProps } from 'vue';
import Cookies from 'js-cookie';

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
    }
});

DataTable.use(DataTablesCore);
DataTable.use(Select);

const isFiltersOpen = ref(false);
const options = {
};
let dt;
const table = ref();
const bearerToken = Cookies.get('token') || '';

onMounted(function () {
  dt = table.value.dt;
});

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};
const onSearch = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.value != '' && input.value.length > 0) {
        dt.search(input.value).draw();
    }else {
        dt.search('').draw();
    }
};
const reloadData = () => {
  if (dt) {
    dt.ajax.reload(null, false); // Reload data without resetting pagination
  }
};

const baseUrl = import.meta.env.VITE_BASE_URL;
</script>

<template>
    <!-- table -->
    <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div class="flex justify-center items-center gap-4">
                <div 
                @click="toggleFilters" 
                :class="{
                    'text-white hover:bg-pinkMed px-3 py-2 cursor-pointer rounded-md flex items-center': true,
                    'bg-pinkDark': !isFiltersOpen,
                    'bg-pinkLight': isFiltersOpen
                }"
                >

                <!-- icon filter -->
                <i class="material-icons text-2xl text-white">filter_alt</i>
                </div>
                <span class="text-gray-700">Cari</span>
                <input
                    type="text"
                    placeholder="Cari..."
                    class="px-4 py-3 border rounded-lg"
                    @input="onSearch"
                />
            </div>
            <div class="flex items-center gap-4 justify-center">
                <div v-if="export" class="bg-pinkDark hover:bg-pinkMed text-white  cursor-pointer font-bold py-2 px-3 flex justify-evenly items-center rounded-lg">
                    <div><i class="material-icons text-3xl">border_all</i></div>
                    <div>Export</div>
                </div>
                <div v-if="reload" class="bg-pinkDark hover:bg-pinkMed text-white  cursor-pointer font-bold py-2 px-3 flex justify-evenly items-center rounded-lg" @click="reloadData">
                    <div><i class="material-icons text-3xl">sync</i></div>
                    <div>Reload</div>
                </div>
                <router-link v-if="addPath != ''" :to="addPath" class="bg-gradient-pink hover:bg-pinkMed text-white font-bold py-2 px-3 flex justify-evenly items-center rounded-lg">
                <div><i class="material-icons text-3xl">add</i></div>
                <div>Add</div>
                </router-link>
            </div>
        </div>

        <!-- Filters -->
        <div
            class="overflow-hidden transition-all duration-300"
            :class="{ 'max-h-0': !isFiltersOpen, 'max-h-[500px]': isFiltersOpen }"
            >
            <div class="mt-4 bg-gray-100 p-4 rounded-lg shadow">
                <!-- Filter content goes here -->
                <p class="text-gray-700">This is where your filter inputs can go.</p>
            </div>
        </div>

        <DataTable
            :columns="columns"
            :options="options"
            ref="table"
            :ajax="{
                url: baseUrl + ajaxPath,
                type: 'GET',
                cache:true,
                headers: {
                'Authorization': `Bearer ${bearerToken}`, // Replace with dynamic token
                'Content-Type': 'application/json'
                },
                dataSrc: function (json) {
                    json.data = json.data.map((item, index) => {
                        item.no = index + 1;
                        return item;
                    });
                    return json.data;
                },
            }"
            class="display"
            width="100%"
        >
            <thead>
                <tr>
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
</style>