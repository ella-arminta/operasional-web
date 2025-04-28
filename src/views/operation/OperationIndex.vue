<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<TableData
			:columns="columns"
			:addPath="actions.includes('add') ? '/inventory/operation/add' : ''"
			:export="false"
			:reload="true"
			:ajaxPath="'/inventory/operation'"
			:editPath="
				actions.includes('edit') ? '/inventory/operation/edit' : ''
			"
			:deletePath="
				actions.includes('delete') ? '/inventory/operation' : ''
			"
			:infoPath="
				actions.includes('detail') ? '/inventory/operation/detail' : ''
			"
			:options="{
				scrollX: true,
			}"
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
const columns = [
	{ data: 'no', title: 'No', width: '5%' },
	{ data: 'code', title: 'Code', width: '10%' },
	{ data: 'name', title: 'Name', width: '15%' },
	{ data: 'price', title: 'Price' },
	{ data: 'uom', title: 'Unit of Measure' },
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
