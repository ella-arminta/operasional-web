<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';

const columns = [
  { data: 'code', title: 'Code' },
  { data: 'date', title: 'Date', render: (data) => new Date(data).toLocaleDateString(), type: 'date' },
  { data: 'saldo_awal', title: 'Initial Balance' },
  { data: 'penjualan_cash', title: 'Cash Sales' },
  { data:'penjualan_transfer', title: 'Transfer Sales' },
  { data: 'total_penjualan', title: 'Total Sales' },
  { data: 'pembelian', title: 'Purchases' },
  { data: 'pengeluaran', title: 'Other Expenses' },
  { data: 'gadai', title: 'Pawn' },
  { data: 'ambil_gadai', title: 'Pawn Withdrawal' },
  { data: 'saldo_akhir', title: 'Final Balance' },
  {
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
];
const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);

const addPath = '/finance/cashier-closing/add';
const editPath = '/finance/cashier-closing/edit';
const infoPath = '/finance/cashier-closing/view';
const ajaxPath = '/finance/tutup-kasir';
const pageTitle = 'Cashier Closing';

const filters = ref([]);

onMounted(async () => {
  filters.value = [
    {
      type: 'date',
      label: 'Start Date',
      name: 'start_date',
    },
    {
      type: 'date',
      label: 'End Date',
      name: 'end_date',
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
      :addPath="addPath"
      :export="true"
      :reload="true"
      :filters="filters"
      :ajaxPath="ajaxPath"
      :editPath="editPath"
      :deletePath="'/finance/transaction'"
	    :infoPath="infoPath"
    />
  </div>
</template>