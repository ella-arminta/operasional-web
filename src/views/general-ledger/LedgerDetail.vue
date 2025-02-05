<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';
import DropdownFinance from '../../components/DropdownFinance.vue';
import { name } from 'eslint-plugin-prettier/recommended';

const columns = [
  { data: 'infoacc', title: 'Info Acc' },
  { data: 'date', title: 'Date' },
  { data: 'code', title: 'Trans Code' },
  { data: 'description', title: 'Description' },
  { data: 'Debit', title: 'Debit', sum:true },
  { data: 'Kredit', title: 'Kredit', sum:true },
  { data: 'Balance', title: 'Balance', sum:true },
];
const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);

const filters = ref([]);

onMounted(async () => {
  filters.value = [
    {
      type: 'selectRangeFinance',
      label: 'Date Range',
      name: 'range',
    },
  ];
});
</script>

<template>
  <div class="content" :class="{ 'full-width': smallMenu }">
    <PageTitle 
    :title="'General Ledger Detail'"
    />

    <TableData 
      :columns="columns"
      :reload="true"
      :filters="filters"
      :totalFooter="true"
      :export="true"
      ajaxPath="/finance/ledger"
    />
  </div>
</template>