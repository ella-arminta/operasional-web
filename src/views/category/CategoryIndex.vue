<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/master/category/add' : ''"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/category'"
			:editPath="actions.includes('edit') ? '/master/category/edit' : ''"
			:deletePath="
				actions.includes('delete') ? '/inventory/category' : ''
			"
			:infoPath="
				actions.includes('detail') ? '/master/category/detail' : ''
			"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const metals = Object.freeze([
	{ id: 1, label: 'Gold' },
	{ id: 2, label: 'Silver' },
	{ id: 3, label: 'Red Gold' },
	{ id: 4, label: 'White Gold' },
	{ id: 5, label: 'Platinum' },
])
const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'code', title: 'Code', width: '10%' },
	{ data: 'name', title: 'Name', width: '15%' },
	{ data: 'company.name', title: 'Company' },
	{ data: 'purity', title: 'Purity' },
	{
		data: 'metal_type',
		title: 'Metal Type',
		render: function (data, type, row) {
			return metals.find((metal) => metal.id === data)?.label
		},
	},
	{ data: 'weight_tray', title: 'Weight Tray', visible: false },
	{ data: 'weight_paper', title: 'Weight Paper', visible: false },
	{
		data: 'types', // Reference the entire `types` array
		title: 'Sub Category',
		render: function (data, type, row) {
			// Check if `types` exists and is an array
			if (!Array.isArray(data) || data.length === 0) return '-'
			return data.map((type) => type.name).join(', ')
		},
		visible: false,
		width: '25%',
	},
	{
		data: 'description',
		title: 'Description',
		orderable: false,
		visible: false,
	},
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]

// META-ACTIONS RBAC
const router = useRouter()
const authStore = useAuthStore()
const actions = ref([])
onMounted(() => {
	const currentPath = router.currentRoute.value.path
	const path = authStore.allowedPaths.find(
		(item) => item.path === currentPath
	)
	actions.value = path ? path.action : []
})
</script>
