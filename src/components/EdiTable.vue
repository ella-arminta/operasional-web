<template>
    <div class="editable rounded-lg shadow-md">
        <table class="table-auto border-none w-full h-full">
            <!-- Table Header -->
            <thead class="bg-pinkDark border-none">
                <tr>
                    <!-- colspan count columns -->
                    <th class="px-4 py-2 text-start text-white" :colspan="columns.length">{{ title }}
                        <span class="text-white inline" v-if="required">*</span>
                    </th>
                    <!-- Add Row Button -->
                    <th class="flex justify-end items-center mx-4 my-2">
                        <button @click="addRow" type="button"
                            class="bg-pinkLight text-white px-3 py-2 rounded-lg shadow hover:bg-pinkMed flex items-center transition duration-300 ease-in-out"><i
                                class="material-icons">add</i>
                        </button>
                    </th>
                </tr>
                <tr>
                    <th v-for="(col, index) in columns" :key="index" class="text-white px-4 py-2">
                        {{ col.label }}
                        <span v-if="col.required" class="text-white inline">*</span>
                    </th>
                    <th class="text-white px-4 py-2">Actions</th>
                </tr>
            </thead>

            <!-- Table Body -->
            <tbody class="border-none">
                <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
                    <td v-for="(col, colIndex) in columns" 
                        :key="colIndex" 
                        class="px-0 h-full border-r"
                        :class="{
                            'bg-white': rowIndex % 2 === 0,
                            'bg-pinkGray': rowIndex % 2 !== 0,
                            'border-gray-300': colIndex !== columns.length - 1, 
                        }"
                        >
                        <input 
                            v-if="['int', 'number', 'text'].includes(col.type)" 
                            v-model="rows[rowIndex][col.key]" 
                            :type="col.type == 'number' ? 'text' : col.type"
                            class="bg-transparent rounded px-2 py-1 w-full h-full focus:outline-none"
                            @input="handleInput($event, col, rowIndex)" 
                            />
                        <Dropdown v-else-if="col.type === 'dropdown'" v-model="rows[rowIndex][col.key]" :items="col.items" :position="'sticky !h-[200px]'" />
                    </td>
                    <td class="px-4 py-2 text-center"
                    :class="{
                            'bg-white': rowIndex % 2 === 0,
                            'bg-pinkGray': rowIndex % 2 !== 0,
                        }"
                    >
                        <button @click="deleteRow(rowIndex)" type="button" class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out m-auto">
                            <!-- material icons delete -->
                            <i class="material-icons text-sm">delete</i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Dropdown from './Dropdown.vue';

const props = defineProps({
    columns: {
        type: Array,
        required: true,
        default: () => [],
        // Example: [{ label: "Name", key: "name", type: "string" }, { label: "Age", key: "age", type: "int" }]
    },
    initialRows: {
        type: Array,
        default: () => [],
    },
    title: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
});

// Emit rows update to parent if needed
const emit = defineEmits(['update:rows']);
const emitUpdate = () => {
    emit('update:rows', rows.value);
};

// Reactive state
const rows = ref([...props.initialRows]);
watch(
    () => props.initialRows,
    (newRows) => {
        rows.value = [...newRows]; // Update rows when initialRows changes
    },
    { deep: true, immediate: true } // Ensure immediate and deep watching
);

// Methods
const addRow = () => {
    // Create a new empty row based on column keys
    const newRow = props.columns.reduce((acc, col) => {
        acc[col.key] = col.type === 'number' ? 0.00 : ''; // Use '0.00' for int types
        return acc;
    }, {});

    rows.value.push(newRow);
    emitUpdate();
};

const deleteRow = (index) => {
    rows.value.splice(index, 1);
    emitUpdate();
};

if (props.required) {
    addRow();
}

const handleInput = (event, col, rowIndex) => {
    // col.type === 'number' ? validateAndParseInput($event, rowIndex, col.key) : $event.target.value;
    if (col.type === 'number') {
        validateAndParseInput(event, rowIndex, col.key);
    } else {
        rows.value[rowIndex][col.key] = event.target.value;
    }

    emitUpdate();
};

watch (
    () => props.initialRows,
    (newRows) => {
        rows.value = [...newRows];
    },
    { deep: true }
)

const validateAndParseInput = (event, rowIndex, key) => {
    let value = event.target.value;

    // Pastikan input hanya memiliki angka, titik desimal (.), atau koma (,)
    value = value.replace(/[^0-9.,]/g, '');

    // Ganti koma (,) dengan titik (.) untuk memastikan format float konsisten
    value = value.replace(/,/g, '.');

    // Pastikan hanya ada satu titik desimal dalam angka
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    rows.value[rowIndex][key] = value; 

    emitUpdate();
};

</script>

<style>
.editable {
    max-width: 100%;
    overflow-x: auto;
}

.table-auto {
    width: 100%;
}
</style>