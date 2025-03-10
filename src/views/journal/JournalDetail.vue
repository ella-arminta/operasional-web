<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PageTitle from '../../components/PageTitle.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import TableDataGroup from '../../components/TableDataGroup.vue'
import { useRoute } from 'vue-router';
import { formatDate, formatIDR } from '../../utils/common'

const columns = [
	{ data: 'code', title: 'Journal Entry', visible: false },
	{ data: 'date', title: 'Date', 
		render: function (data) {
		return formatDate(data);
		}
	},
	{ data: 'account', title: 'Account' },
	{ data: 'label', title: 'Label' },
	{ data: 'debit', title: 'Debit', name: 'debit', render: function (data) {
			return `<div style="text-align:right;">${formatIDR(data)}</div>`;
	}},
	{ data: 'credit', title: 'Credit', name:'credit', render: function (data) {
			return `<div style="text-align:right;">${formatIDR(data)}</div>`;
		}  
	},
]
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const route = useRoute();
const id = route.params.id || null;
const filters = ref([])
onMounted(async () => {
	filters.value = [
		{
			type: 'selectRangeFinance',
			label: 'Range',
			name: 'range',
		},
	]
})
</script>

<template>
	<div class="content" :class="{ 'full-width': smallMenu }">
		<PageTitle />

		<TableDataGroup
			:columns="columns"
			:reload="true"
			:export="true"
			:filters="filters"
			:ajaxPath="`/finance/journal/${id}`"
			:infoLabel="'Jurnal'"
		/>
	</div>
</template>
