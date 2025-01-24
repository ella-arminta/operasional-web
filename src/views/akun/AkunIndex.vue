<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';

const columns = [
  { data: 'code', title: 'Code' },
  { data: 'name', title: 'Name' },
  { data: 'company.name', title: 'Company' },
  { data: 'store.name', title: 'Store' },
  { data: 'account_type.name', title: 'Type' },
];

const filters = ref([]);

onMounted(async () => {
  const storeData = await axiosInstance.get('/master/store');
  var storesFormated = storeData.data.data.map((store) => ({
    label: store.name,
    value: store.id,
  }));

  filters.value = [
    {
      type: 'select',
      label: 'Cabang',
      name: 'store_id',
      options: [
        { label: 'All Cabang', value: '' },
        ...storesFormated,
      ],
    },
    {
      type: 'select',
      label: 'Company',
      name: 'company_id',
      options: [
        { label: 'All Company', value: '' },
        { label: 'Company 1', value: 1 },
        { label: 'Company 2', value: 2 },
      ],
    },
  ];
  console.log('Filters in Parent:', filters.value);
});
</script>

<template>
  <div class="content">
    <PageTitle />
    <TableData 
      :columns="columns"
      :addPath="'/akun/tambah'"
      :export="true"
      :reload="true"
      :filters="filters"
      ajaxPath="/finance/account"
    />
  </div>
</template>