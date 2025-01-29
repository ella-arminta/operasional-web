<script setup lang="ts">
import { ref, onMounted, computed, render } from 'vue';
import PageTitle from '../../components/PageTitle.vue';
import TableData from '../../components/TableData.vue';
import axiosInstance from '../../axios';
import { useStore } from 'vuex';

const columns = [
  { data: 'code', title: 'No' },
  { data: 'trans_date', title: 'Date', render: (data) => new Date(data).toLocaleDateString() },
  { data: 'account_name', title: 'Account' },
  { data: 'total', title: 'Total' },
  { data: 'description', title: 'Description' },
  { data: 'created_by', title: 'Created By' },
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

const props = defineProps({
    addPath: {
        type: String,
        default: '/finance/mexpenses/add',
    },
    editPath: {
        type: String,
        default: '/finance/mexpenses/edit',
    },
    infoPath: {
        type: String,
        default: '/finance/mexpenses/view',
    },
    ajaxPath: {
        type: String,
        default: '/finance/uang-keluar-masuk?trans_type_id=1',
    },
    pageTitle: {
        type: String,
        default: 'Miscellaneous Expenses',
    },
});

const filters = ref([]);

onMounted(async () => {
  const accountData = await axiosInstance.get('/finance/account');
  var accountsFormated = accountData.data.data.map((company) => ({
    label: company.name,
    id: company.id,
  }));

  filters.value = [
    {
      type: 'select',
      label: 'Account',
      name: 'account_name',
      options: [
        { label: 'All Account', id: '' },
        ...accountsFormated,
      ],
    },
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