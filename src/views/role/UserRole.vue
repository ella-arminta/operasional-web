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
						class="bg-pinkDark px-4 py-2 text-white rounded-t-lg font-bold"
					>
						Employee Section
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
					</div>
				</div>
				<!-- Role -->
				<div class="w-full shadow-xl rounded-lg bg-white">
					<div
						class="bg-pinkDark px-4 py-2 text-white rounded-t-lg mb-1 font-bold"
					>
						Role Section
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
				</div>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
import FormSectionHeader from '../../components/FormSectionHeader.vue'
import PageTitle from '../../components/PageTitle.vue'
import axiosInstance from '../../axios'
import FormHeader from '../../components/FormHeader.vue'

// Store
const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
// ID
const id = JSON.parse(Cookies.get('userdata')).id

// Selecting 0-> idle, 1-> employee, 2-> role, 3-> lock
const selecting = ref(0)

// Employees
const employees = ref([])
const fetchEmployees = async () => {
	const response = await axiosInstance.get('/master/employee', {
		params: {
			owner_id: id,
		},
	})

	if (response.data.success) {
		employees.value = response.data.data
	} else {
	}
	console.log(employees.value)
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

// Roles
const roles = ref([])
const fetchRoles = async () => {
	const response = await axiosInstance.get('/auth/role', {
		params: {
			owner_id: id,
		},
	})

	if (response.data.success) {
		roles.value = response.data.data
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
