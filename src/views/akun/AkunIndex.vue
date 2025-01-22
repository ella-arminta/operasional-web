<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';

const columns = [
  { data: 'company.name', title: 'Company' },
  { data: 'account_type.name', title: 'Account Type' },
  // Add other columns as needed
];
</script>

<template>
  <div class="content">
    <PageTitle />
    <TableData 
      :columns="columns"
      :addPath="'/akun/tambah'"
      :export="true"
      :reload="true"
      ajaxPath="/finance/account"
    />
  </div>
</template>