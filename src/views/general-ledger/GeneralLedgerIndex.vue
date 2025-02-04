<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';
import DropdownFinance from '../../components/DropdownFinance.vue';
import { name } from 'eslint-plugin-prettier/recommended';

const columns = [
  { data: 'code', title: 'Code' },
  { data: 'name', title: 'Name' },
  { data: 'debit', title: 'Debit', sum:true },
  { data: 'credit', title: 'Credit', sum:true },
  { data: 'balance', title: 'Balance',sum:true },
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
const pageTitle = 'General Ledger';

const filters = ref([]);

onMounted(async () => {
  const journalsData = await axiosInstance.get('/finance/journal');
  var journalsFormated = journalsData.data.data.map((journal) => ({
    label: journal.name,
    id: journal.id,
  }));
  journalsFormated = [
    { label: 'Journal 1', id: 1 },
    { label: 'Journal 2', id: 2 },
    { label: 'Journal 3', id: 3 },
  ];
  filters.value = [
    {
      type: 'selectRangeFinance',
      label: 'Date Range',
      name: 'range',
    },
    {
      type: 'select',
      label: 'Journals',
      name: 'journals',
      multiple:true,
      options: [
        { label: 'All Journals', value: '' },
        ...journalsFormated,
      ],
    },
  ];
});
</script>

<template>
  <div class="content" :class="{ 'full-width': smallMenu }">
    <PageTitle 
      :title="pageTitle"
    />

    <TableData 
      :columns="columns"
      :reload="true"
      :filters="filters"
      ajaxPath="/finance/journal"
	    :infoPath="'/finance/general-ledger/view'"
      :infoLabel="'General Ledger Detail'"
      :export="true"
      :totalFooter="true"
    />
  </div>
</template>