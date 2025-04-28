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
			:options="{
				scrollX: true,
			}"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../vuex/auth'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import { computed, ref, onMounted } from 'vue'
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

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
