<template>
	<div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
		<PageTitle />
		<form
			class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
			@submit.prevent="submit"
		>
			<FormHeader
				:title="'Assign User Role'"
				:showResetButton="false"
				:showSaveButton="true"
				@reset="null"
			/>
			<FormSectionHeader title="Assign User Role" icon="person" />
			<div class="grid grid-cols-1 gap-8 md:gap-24 md:grid-cols-2 h-full">
				<!-- Employee -->
				<div class="w-full shadow-xl rounded-lg bg-white">
					<div
						class="flex items-center justify-between bg-pinkDark px-4 py-2 text-white rounded-t-lg font-bold"
					>
						<span>Employee Section</span>
						<span class="text-xs font-light"
							>{{ activeEmployees.length }} employee active</span
						>
					</div>
					<div
						class="flex items-center justify-between px-4 py-2 border-b border-gray-200"
					>
						<input
							v-model="filterEmployee"
							type="text"
							class="w-full border-none rounded-sm focus:outline-none focus:ring-none"
							placeholder="Search employee"
						/>
						<div class="flex items-center justify-center gap-1 h-6">
							<RouterLink
								to="/master/employee/add"
								class="flex items-center justify-center text-pinkDark text-sm rounded-lg hover:bg-pinkGray hover:bg-opacity-75 h-6"
							>
								<i class="material-icons">add</i>
							</RouterLink>
						</div>
					</div>
					<div class="scroll-smooth max-h-96 snap overflow-y-auto">
						<template v-for="employee in employees">
							<div
								class="flex items-center justify-between px-4 py-2 border-b border-gray-200 hover:bg-pinkGray hover:bg-opacity-75 cursor-pointer"
								@click="clickEmployee(employee)"
							>
								<div class="text-md text-gray-800">
									{{ `${employee.name} - ${employee.email}` }}
								</div>
								<input
									:checked="
										activeEmployees.includes(employee.id)
									"
									type="checkbox"
									class="accent-pinkDark w-4 h-4 border-1 rounded-sm"
									@click.stop="clickEmployee(employee)"
								/>
							</div>
						</template>
						<div
							v-if="employees.length === 0"
							class="text-center py-2 text-md text-gray-800"
						>
							{{
								filterEmployee !== ''
									? 'No Employee with that name or email'
									: 'No Employee Found create new one'
							}}
						</div>
					</div>
				</div>
				<!-- Role -->
				<div class="w-full shadow-xl rounded-lg bg-white">
					<div
						class="flex items-center justify-between bg-pinkDark px-4 py-2 text-white rounded-t-lg font-bold"
					>
						<span>Role Section</span>
						<span class="text-xs font-light"
							>{{ activeRoles.length }} roles active</span
						>
					</div>
					<div
						class="flex items-center justify-between px-4 py-2 border-b border-gray-200"
					>
						<input
							v-model="filterRole"
							type="text"
							class="w-full border-none rounded-sm focus:outline-none focus:ring-none"
							placeholder="Search Role"
						/>
						<div class="flex items-center justify-center gap-1 h-6">
							<RouterLink
								to="/settings/role/add"
								class="flex items-center justify-center text-pinkDark text-sm rounded-lg hover:bg-pinkGray hover:bg-opacity-75 h-6"
							>
								<i class="material-icons">add</i>
							</RouterLink>
						</div>
					</div>
					<div class="scroll-smooth max-h-96 snap overflow-y-auto">
						<template v-for="role in roles">
							<div
								class="flex items-center justify-between px-4 py-2 border-b border-gray-200 hover:bg-pinkGray hover:bg-opacity-75 cursor-pointer"
								@click="clickRole(role)"
							>
								<div class="text-md text-gray-800">
									{{ role.name }}
								</div>
								<input
									:checked="activeRoles.includes(role.id)"
									type="checkbox"
									class="accent-pinkDark w-4 h-4 border-1 rounded-sm"
									@click.prevent="clickRole(role)"
								/>
							</div>
						</template>
					</div>
					<div
						class="text-center py-2 text-md text-gray-800"
						v-if="roles.length === 0"
					>
						{{
							filterRole !== ''
								? 'No Role with that name'
								: 'No Role Found create new one'
						}}
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import PageTitle from '../../components/PageTitle.vue'
import axiosInstance from '../../axios'
import FormHeader from '../../components/FormHeader.vue'

// Store
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
// ID
const id = decryptData(Cookies.get('userdata')).id

// Selecting 0-> idle, 1-> employee, 2-> role, 3-> lock
const selecting = ref(0)

// Employees
const employees = ref([])
const copyEmployees = ref([])
const filterEmployee = ref('')
const fetchEmployees = async () => {
	const response = await axiosInstance.get('/master/employee', {
		params: {
			owner_id: id,
		},
	})

	if (response.data.success) {
		employees.value = response.data.data
		copyEmployees.value = response.data.data
	} else {
	}
	console.log(employees.value)
}
const sortEmployee = () => {
	// if active on top
	employees.value = employees.value.sort((a, b) => {
		if (activeEmployees.value.includes(a.id)) return -1
		if (activeEmployees.value.includes(b.id)) return 1
		return 0
	})
}
const activeEmployees = ref([])
const clickEmployee = async (employee: any) => {
	if (selecting.value === 0) {
		selecting.value = 3
		activeEmployees.value = [employee.id]
		await fetchRole(employee.id)
		selecting.value = 1
	} else if (selecting.value === 1) {
		selecting.value = 3
		if (activeEmployees.value.includes(employee.id)) {
			activeRoles.value = []
			activeEmployees.value = []
			selecting.value = 0
			return
		}
		activeEmployees.value = [employee.id]
		await fetchRole(employee.id)
		// fetch roles
		selecting.value = 1
	} else if (selecting.value === 2) {
		if (activeEmployees.value.includes(employee.id)) {
			activeEmployees.value.splice(
				activeEmployees.value.indexOf(employee.id),
				1
			)
			// Deselect
			return
		}
		// Select
		activeEmployees.value = [...activeEmployees.value, employee.id]
	} else {
		return
	}
	console.log(selecting.value, activeEmployees.value)
}
const fetchRole = async (employee_id: string) => {
	try {
		const response = await axiosInstance.get(
			`/auth/role-user/${employee_id}`
		)

		if (response.data.success) {
			activeRoles.value = response.data.data.map(
				(userRole) => userRole.role_id
			)
		}
	} catch (e) {
		handleAlert('error', 'Error!', 'Failed to fetch role-user data.')
	}
}
watch(filterEmployee, () => {
	employees.value = copyEmployees.value.filter(
		(employee) =>
			employee.name
				.toLowerCase()
				.includes(filterEmployee.value.toLowerCase()) ||
			employee.email
				.toLowerCase()
				.includes(filterEmployee.value.toLowerCase())
	)
})
// If NEEDED SORTED BY ACTIVATION
// watch(activeEmployees, () => {
// 	sortEmployee()
// })

// Roles
const roles = ref([])
const rolesCopy = ref([])
const filterRole = ref('')
const fetchRoles = async () => {
	const response = await axiosInstance.get('/auth/role', {
		params: {
			owner_id: id,
		},
	})

	if (response.data.success) {
		roles.value = response.data.data
		rolesCopy.value = response.data.data
	} else {
	}
	console.log(roles.value)
}
const activeRoles = ref([])
const clickRole = async (role: any) => {
	if (selecting.value === 0) {
		selecting.value = 3
		activeRoles.value = [role.id]
		await fetchEmployee(role.id)
		selecting.value = 2
	} else if (selecting.value === 2) {
		selecting.value = 3
		if (activeRoles.value.includes(role.id)) {
			activeRoles.value = []
			activeEmployees.value = []
			selecting.value = 0
			return
		}
		activeRoles.value = [role.id]
		await fetchEmployee(role.id)
		selecting.value = 2
	} else if (selecting.value === 1) {
		if (activeRoles.value.includes(role.id)) {
			activeRoles.value.splice(activeRoles.value.indexOf(role.id), 1)
			// Deselect
			return
		}
		// Select
		activeRoles.value = [...activeRoles.value, role.id]
	} else {
		return
	}
	console.log(selecting.value, activeRoles.value)
}
const fetchEmployee = async (role_id: string) => {
	try {
		const response = await axiosInstance.get(`/auth/user-role/${role_id}`)

		if (response.data.success) {
			activeEmployees.value = response.data.data.map(
				(userRole) => userRole.user_id
			)
		}
	} catch (e) {
		handleAlert('error', 'Error!', 'Failed to fetch role-user data.')
	}
}
watch(filterRole, () => {
	roles.value = rolesCopy.value.filter((role) =>
		role.name.toLowerCase().includes(filterRole.value.toLowerCase())
	)
})

const submit = async () => {
	if (selecting.value === 3) return
	if (selecting.value === 0) {
		handleAlert(
			'warning',
			'Warning!',
			'Please select employee and role to be associated.'
		)
		return
	}

	const data = {
		selecting: selecting.value,
		user_ids: activeEmployees.value,
		role_ids: activeRoles.value,
	}

	try {
		const response = await axiosInstance.post(
			'/auth/mass-assign-role',
			data
		)

		if (response.data.success) {
			handleAlert('success', 'Success!', response.data.message)
		} else {
			handleAlert('error', 'Error!', response.data.message)
		}
	} catch (e) {
		console.log(e)
		handleAlert('error', 'Error!', e.data.message)
	}
}

const handleAlert = (type: string, title: string, message: string) => {
	store.dispatch('triggerAlert', {
		type: type,
		title: title,
		message: message,
		actions: [
			{
				label: 'close',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
		],
	})
}

onMounted(() => {
	fetchEmployees()
	fetchRoles()
})
</script>
