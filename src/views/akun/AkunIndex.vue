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
  const typeData = await axiosInstance.get('/finance/account-type');
  var typesFormated = typeData.data.data.map((type) => ({
    label: type.name,
    value: type.id,
  }));

  filters.value = [
    {
      type: 'select',
      label: 'Store',
      name: 'store_id',
      options: [
        { label: 'All Store', value: '' },
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
    {
      type: 'select',
      label: 'Type',
      name: 'account_type_id',
      options: [
        { label: 'All Type', value: '' },
        ...typesFormated,
      ],
    }
  ];
});
</script>

<template>
  <div class="content">
    <PageTitle />
    <TableData 
      :columns="columns"
      :addPath="'/master/akun/add'"
      :export="true"
      :reload="true"
      :filters="filters"
      ajaxPath="/finance/account"
    />
  </div>
</template>