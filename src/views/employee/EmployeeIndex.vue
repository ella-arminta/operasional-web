<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/master/employee/add' : ''"
			:export="false"
			:reload="true"
			:options="{
				scrollX: true,
			}"
			:ajaxPath="'/master/employee'"
			:editPath="actions.includes('edit') ? '/master/employee/edit' : ''"
			:deletePath="actions.includes('delete') ? '/master/employee' : ''"
			:infoPath="
				actions.includes('detail') ? '/master/employee/detail' : ''
			"
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
	{ data: 'name', title: 'Name' },
	{ data: 'email', title: 'Email' },
	{
		data: 'action',
		title: 'Action',
		width: '15%',
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
