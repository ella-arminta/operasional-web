<template>
    <div class="editable rounded">
        <table class="table-auto border border-pinkOrange w-full h-full">
            <!-- Table Header -->
            <thead class="bg-pinkGray">
                <tr>
                    <!-- colspan count columns -->
                    <th class="px-4 py-2 text-start" :colspan="columns.length">{{ title }}</th>
                    <!-- Add Row Button -->
                    <th class="flex justify-end items-center mx-4 my-2">
                        <button @click="addRow" type="button"
                            class="bg-pinkDark text-white px-3 py-2 rounded-lg shadow hover:bg-pinkMed flex items-center"><i
                                class="material-icons">add</i>
                        </button>
                    </th>
                </tr>
                <tr>
                    <th v-for="(col, index) in columns" :key="index" class="border border-pinkOrange px-4 py-2">
                        {{ col.label }}
                    </th>
                    <th class="border px-4 py-2 border-pinkOrange">Actions</th>
                </tr>
            </thead>

            <!-- Table Body -->
            <tbody>
                <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
                    <td v-for="(col, colIndex) in columns" :key="colIndex" class="border border-pinkOrange px-0 h-full">
                        <input 
                            v-if="['int', 'number', 'text'].includes(col.type)" 
                            v-model="rows[rowIndex][col.key]" 
                            :type="col.type == 'number' ? 'text' : col.type"
                            class="border border-pinkLight rounded px-2 py-1 w-full h-full"
                            @input="handleInput($event, col, rowIndex)" 
                            />
                        <Dropdown v-else-if="col.type === 'dropdown'" v-model="rows[rowIndex][col.key]" :items="col.items" :position="'sticky'" />
                    </td>
                    <td class="!border !border-pinkOrange border-2 px-4 py-2 text-center">
                        <button @click="deleteRow(rowIndex)" type="button" class="text-red-500 hover:underline">
                            <!-- material icons delete -->
                            <i class="material-icons">delete</i>
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