<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/settings/role/add' : ''"
			:export="false"
			:reload="true"
			:ajaxPath="'/auth/role'"
			:editPath="actions.includes('edit') ? '/settings/role/edit' : ''"
			:deletePath="actions.includes('delete') ? '/auth/role' : ''"
			:infoPath="
				actions.includes('detail') ? '/settings/role/detail' : ''
			"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { useAuthStore } from '../../vuex/auth'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, ref, onMounted } from 'vue'
const store = useStore()
const authStore = useAuthStore()
const smallMenu = computed(() => store.getters.smallMenu)

// META-ACTIONS RBAC
const actions = ref([])

const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'name', title: 'Name', width: '15%' },
	{ data: 'company', title: 'Company', render: (data) => data.name },
	{
		data: 'store',
		title: 'Store',
		render: (data) => {
			if (!data) return 'All'
			return data.name
		},
	},
	{
		data: 'users',
		title: 'Users',
		render: (data) => data.length,
	},
	{
		data: 'action',
		title: 'Action',
		width: '10%',
		searchable: false,
		orderable: false,
	},
]
onMounted(() => {
	const path = authStore.allowedPaths.find(
		(item) => item.path === '/settings/role'
	)
	actions.value = path ? path.action : []
})
</script>
