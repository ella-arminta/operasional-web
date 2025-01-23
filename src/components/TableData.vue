<script setup lang="ts">
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net";
import { ref, onMounted, computed } from "vue";
import Select from "datatables.net-select";
import { defineProps } from "vue";
import Cookies from "js-cookie";
import axiosInstance from "../axios.js";
import { useStore } from "vuex";

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
    default: "",
  },
  ajaxPath: {
    type: String,
    default: "",
  },
  editPath: {
    type: String,
    default: "",
  },
  deletePath: {
    type: String,
    default: null,
  },
  infoPath: {
    type: String,
    default: "",
  },
});

DataTable.use(DataTablesCore);
DataTable.use(Select);
// Declaration
const isFiltersOpen = ref(false);
const table = ref();
let dt;
const bearerToken = Cookies.get("token") || "";
const store = useStore();

onMounted(() => {
  dt = table.value.dt;
});

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};
// function to search data within datatable
const onSearch = (event: Event) => {
  const input = event.target as HTMLInputElement;
  dt.search(input.value || "").draw();
};
// function to reload data in datatable
const reloadData = () => {
  if (dt) {
    dt.ajax.reload(null, false);
  }
};
// function to delete data by id
const deleteData = (id: string) => {
  store.dispatch("triggerAlert", {
    type: "warning",
    title: "Warning!",
    message: `Are you sure you want to delete this data?`,
    actions: [
      {
        label: "cancel",
        type: "secondary",
        handler: () => store.dispatch("hideAlert"),
      },
      {
        label: "proceed",
        type: "primary",
        handler: async () => {
          try {
            const response = await axiosInstance.delete(
              `${props.deletePath}/${id}`,
            );
            if (response.data) {
              store.dispatch("triggerAlert", {
                type: "success",
                title: "Success!",
                message: "Data deleted successfully.",
                actions: [
                  {
                    label: "close",
                    type: "secondary",
                    handler: () => {
                      store.dispatch("hideAlert");
                      reloadData();
                    },
                  },
                ],
              });
            }
          } catch (error) {
            store.dispatch("triggerAlert", {
              type: "error",
              title: "Error!",
              message: "Failed to delete data.",
              actions: [
                {
                  label: "close",
                  type: "secondary",
                  handler: () => store.dispatch("hideAlert"),
                },
              ],
            });
          }
        },
      },
    ],
  });
};

const baseUrl = import.meta.env.VITE_BASE_URL;

// Define ajax options in a computed property
const ajaxOptions = computed(() => ({
  url: baseUrl + props.ajaxPath,
  type: "GET",
  cache: true,
  headers: {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
  },
  dataSrc: (json) => {
    json.data = json.data.map((item, index) => {
      if (props.columns.find((col) => col.data === "no")) {
        item.no = index + 1;
      }
      if (props.columns.find((col) => col.data === "action")) {
        let actionHtml = '<div class="flex gap-2">';

        // Info button
        if (props.infoPath && props.infoPath !== "") {
          actionHtml += `
          <div
            class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark"
            title="Info"
            onclick="location.href='${props.infoPath}/${item.id}'"
          >
            i
          </div>`;
        }

        // Edit button
        if (props.editPath && props.editPath !== "") {
          actionHtml += `
          <div
            class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark"
            title="Edit"
            onclick="location.href='${props.editPath}/${item.id}'"
          >
            <i class="material-icons text-sm">edit</i>
          </div>`;
        }

        // Delete button
        if (props.deletePath && props.deletePath !== "") {
          actionHtml += `
          <div
            class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn"
            title="Delete"
            data-id="${item.id}"
          >
            <i class="material-icons text-sm">delete</i>
          </div>`;
        }

        actionHtml += "</div>";
        item.action = actionHtml;
      }
      return item;
    });
    setTimeout(() => {
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.closest(".delete-btn").dataset.id;
          deleteData(id);
        });
      });
    });
    return json.data;
  },
}));
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
            'bg-pinkLight': isFiltersOpen,
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
        <div
          v-if="export"
          class="bg-pinkDark hover:bg-pinkMed text-white cursor-pointer font-bold py-2 px-3 flex justify-evenly items-center rounded-lg"
        >
          <div><i class="material-icons text-3xl">border_all</i></div>
          <div>Export</div>
        </div>
        <div
          v-if="reload"
          class="bg-pinkDark hover:bg-pinkMed text-white cursor-pointer font-bold py-2 px-3 flex justify-evenly items-center rounded-lg"
          @click="reloadData"
        >
          <div><i class="material-icons text-3xl">sync</i></div>
          <div>Reload</div>
        </div>
        <router-link
          v-if="addPath != ''"
          :to="addPath"
          class="bg-gradient-pink hover:bg-pinkMed text-white font-bold py-2 px-3 flex justify-evenly items-center rounded-lg"
        >
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
      :ajax="ajaxOptions"
      class="display rounded-lg border border-gray-400 overflow-hidden shadow-sm"
      width="100%"
    >
      <thead>
        <tr class="bg-pinkDark text-white">
          <th v-for="column in columns" :key="column.data">
            {{ column.data.replace("_", " ").toUpperCase() }}
          </th>
        </tr>
      </thead>
    </DataTable>
  </div>
</template>
<style>
@import "datatables.net-dt";
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
