<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';

const columns = [
    { data: 'date', title: 'Date', render: (data) => new Date(data).toLocaleDateString() },
    { data: 'code', title: 'Code' },
    { data: 'name', title: 'Name' },
    { data: 'description', title: 'Description' },
    { data:'in', title: 'In' },
    { data: 'out', title: 'Out' },
    { data: 'balance', title: 'Balance' },
];
const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);

const ajaxPath = '/inventory/stock-mutation';
const pageTitle = 'Stock Mutation';

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
      :export="true"
      :reload="true"
      :filters="filters"
      :ajaxPath="ajaxPath"
    />
  </div>
</template>