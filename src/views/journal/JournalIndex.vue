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

onMounted(async () => {
  filters.value = [
    {
      type: 'selectRangeFinance',
      label: 'Range',
      name: 'range',
    },
  ];
});
</script>

<template>
  <div class="content" :class="{ 'full-width': smallMenu }">
    <PageTitle />

    <TableData 
      :columns="columns"
      :reload="true"
      :filters="filters"
      ajaxPath="/finance/journal"
	  :infoPath="'/finance/journal/view'"
      :infoLabel="'Buku besar'"
    />
  </div>
</template>