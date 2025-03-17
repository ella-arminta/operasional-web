<script setup lang="ts">
import { ref, onMounted, computed, render,h,createApp, nextTick } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import { Title } from 'chart.js'
import DropdownCell from './DropdownCell.vue'
import { useRouter } from 'vue-router'

const filterValues = ref({});
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const options = ref([]);
const isLoading = ref(true); // Track loading state

onMounted(async () => {
  const accountData = await axiosInstance.get('/finance/account');
  options.value = accountData.data.data.map((account) => ({
    label: account.code + ' - ' + account.name,
    id: account.id
  }));

  isLoading.value = false; // Data is ready
});
const router = useRouter(); // Get the router instance


const columns = [
  { data: "no", title: "No" },
  { data: "name", title: "Aksi" },
  { data: "description", title: "Deskripsi" },
  {
    data: "trans_Account_settings",
    title: "Account",
    width: "25%",
    createdCell: (td, cellData, rowData) => {
      td.innerHTML = "";

      const app = createApp(DropdownCell, {
        rowData,
        columnData: cellData,
        options: options.value, // Pass the preloaded options
        store: store
      });

      app.use(router); // ✅ Attach the Vue Router instance
      app.mount(td);
    }
  }
];

</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle 
            :title="'Account Settings'"
        />

    <TableData
      v-if="!isLoading"
      :columns="columns"
      :reload="true"
      ajaxPath="/finance/trans-account-setting"
    />
    <p v-else>Loading...</p> 

	</div>
</template>
