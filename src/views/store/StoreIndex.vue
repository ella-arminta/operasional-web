<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/master/store/add' : ''"
			:export="false"
			:reload="true"
			:ajaxPath="'/master/store'"
			:editPath="actions.includes('edit') ? '/master/store/edit' : ''"
			:deletePath="actions.includes('delete') ? '/master/store' : ''"
			:infoPath="actions.includes('detail') ? '/master/store/detail' : ''"
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
	{ data: 'code', title: 'Code', width: '10%' },
	{ data: 'name', title: 'Name', width: '15%' },
	{ data: 'npwp', title: 'Npwp' },
	{ data: 'open_date', title: 'Open Date', visible: false },
	{ data: 'address', title: 'Address', orderable: false, visible: true },
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
