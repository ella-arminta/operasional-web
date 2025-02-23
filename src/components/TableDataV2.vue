<template>
    <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
        <!-- Header -->
        <div class="flex justify-between flex-wrap items-center mb-4">
            <div class="flex justify-center items-center gap-4">
                <input type="text" v-model="searchQuery" placeholder="Search..."
                    class="pl-3 pr-4 py-2 border rounded-lg text-sm placeholder-font-light placeholder-text-sm focus:border-pinkDark focus:outline-none transition duration-300" />
            </div>
            <div v-if="exportable" class="flex items-center gap-2 justify-center">
                <button @click="exportTable"
                    class="bg-pinkDark hover:bg-pinkMed text-white cursor-pointer font-bold py-1 px-2 flex justify-evenly items-center rounded-lg gap-2">
                    <i class="material-icons text-xl">border_all</i>
                    <span class="text-sm">Export</span>
                </button>
            </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 rounded-lg shadow-sm">
                <thead class="!bg-pinkDark text-white">
                    <tr>
                        <th v-for="column in columns.filter(c => c.visible !== false)" :key="column.data"
                            class="px-4 py-3 text-left text-sm font-semibold">
                            {{ column.title }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in filteredData" :key="row.id" class="border-b hover:bg-gray-100 transition">
                        <td v-for="column in columns.filter(c => c.visible !== false)" :key="column.data"
                            class="px-4 py-3 text-sm text-gray-700">
                            <template v-if="column.render">
                                <span v-html="column.render(row[column.data], row)"></span>
                            </template>
                            <template v-else>
                                {{ row[column.data] }}
                            </template>
                        </td>
                    </tr>
                </tbody>

            </table>
            <p v-if="filteredData.length === 0" class="text-center text-gray-500 py-4">No data available</p>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, computed, onMounted } from 'vue'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    columns: {
        type: Array,
        required: true,
    },
    data: {
        type: Array,
        required: true,
    },
    exportable: {
        type: Boolean,
        default: false,
    }
})

const searchQuery = ref('')
const showModal = ref(false);
const modalImage = ref('');

const openModal = (imageUrl) => {
    modalImage.value = `http://127.0.0.1:3000/${imageUrl}`; // Tambahkan base URL
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const filteredData = computed(() => {
    if (!searchQuery.value) return props.data
    return props.data.filter(row => {
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })
})

const exportTable = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(props.title)

    // Add headers
    worksheet.addRow(props.columns.map(col => col.title))

    // Add data
    props.data.forEach(row => {
        worksheet.addRow(props.columns.map(col => row[col.data]))
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    FileSaver.saveAs(blob, `${props.title}.xlsx`)
}

// Menangkap event klik pada tombol "Lihat Bukti"
onMounted(() => {
    document.addEventListener("click", (event) => {
        const target = event.target.closest(".proof-btn");
        if (target) {
            openModal(target.dataset.proof);
        }
    });
});
</script>

<style scoped>
th,
td {
    border: 1px solid #e5e7eb;
    text-align: left;
    padding: 10px;
}

th {
    font-size: 14px;
    font-weight: 600;
}

td {
    font-size: 14px;
}
</style>
