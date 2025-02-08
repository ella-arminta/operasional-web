<template>
    <div class="content" :class="{ 'full-width': smallMenu }">
        <PageTitle :title="'Profit & Loss Statement'" />

        <!-- Content Container -->
        <div class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4">
            <!-- Header -->
            <div class="flex justify-between flex-wrap items-center">
                <!-- Filter Button -->
                <div class="flex justify-center items-center gap-4">
                    <div :class="{
                        'text-white hover:bg-pinkMed px-2 py-1 cursor-pointer rounded-md flex items-center': true,
                        'bg-pinkDark': !isFiltersOpen,
                        'bg-pinkLight': isFiltersOpen,
                    }">
                        <i class="material-icons text-xl text-white">filter_alt</i>
                    </div>
                </div>
                <!-- Action Button -->
                <div class="flex items-center gap-2 justify-center">
                    <div
                        class="bg-pinkDark hover:bg-pinkMed text-white cursor-pointer font-bold py-1 px-2 flex justify-evenly items-center rounded-lg gap-2">
                        <div><i class="material-icons text-xl">download</i></div>
                        <div class="text-sm" @click="printPdf">PDF</div>
                    </div>
                </div>
            </div>

            
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';
import DropdownFinance from '../../components/DropdownFinance.vue';

const columns = [
    { data: 'name', title: 'Name' },
    { data: 'code', title: 'Code' },
    { data: 'debit', title: 'Debit' },
    { data: 'credit', title: 'Credit' },
    { data: 'balance', title: 'Balance' },
    {
        data: 'action',
        title: 'Action',
        width: '5%',
        searchable: false,
        orderable: false,
    },
];
const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);

const filters = ref([]);
const isFiltersOpen = ref(true);

onMounted(async () => {
    filters.value = [
        {
            type: 'selectRangeFinance',
            label: 'Range',
            name: 'range',
        },
    ];
});

const printPdf = () => {
    console.log('Print PDF');
};
</script>