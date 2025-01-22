<template>
    <div class="content min-h-screen">
      <PageTitle />
      <TableData 
      :columns="columns"
      :addPath="'/master/company/add'"
      :export="false"
      :reload="true"
      ajaxPath="/master/company"
    />
    </div>
</template>

<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';

const columns = [
    { data: 'no', title: 'No' },
    { data: 'code', title: 'Code' },
    { data: 'name', title: 'Name' },
    { data: 'description', title: 'Description'}
    // { data: 'action', title: 'Action' },
]
</script>