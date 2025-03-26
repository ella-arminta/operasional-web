<template>
	<div class="editable rounded-lg shadow-lg">
		<table class="table-auto shadow-xl border-none w-full h-full">
			<!-- Table Header -->
			<thead class="bg-pinkDark border-none">
				<tr>
					<!-- colspan count columns -->
					<th
						class="px-4 py-2 text-start text-white"
						:colspan="columns.filter((c) => !c.hidden).length + 1"
					>
						<div class="flex justify-between items-center">
							<div>
								{{ title }}
								<span v-if="required" class="text-white"
									>*</span
								>
							</div>

							<!-- Add Row Button -->
							<div class="flex gap-2 justify-end items-end">
								<button
									v-if="activeRow === null && allActive"
									@click="editAll"
									type="button"
									class="bg-pinkLight text-white px-3 py-2 rounded-lg shadow hover:bg-pinkMed flex items-center transition duration-300 ease-in-out"
								>
									<i class="material-icons">edit</i>
								</button>
								<button
									v-if="activeRow !== null && allActive"
									@click="saveAll"
									type="button"
									class="bg-pinkLight text-white px-3 py-2 rounded-lg shadow hover:bg-pinkMed flex items-center transition duration-300 ease-in-out"
								>
									<i class="material-icons">done</i>
								</button>
								<button
									v-if="addable"
									@click="addRow"
									type="button"
									class="bg-pinkLight text-white px-3 py-2 rounded-lg shadow hover:bg-pinkMed flex items-center transition duration-300 ease-in-out"
								>
									<i class="material-icons">add</i>
								</button>
							</div>
						</div>
					</th>
				</tr>
				<tr>
					<th
						v-for="(col, index) in columns.filter((c) => !c.hidden)"
						:key="index"
						class="px-4 py-2 text-white text-start"
					>
						{{ col.label }}
					</th>
					<th v-if="!readonly" class="px-4 py-2 text-white">
						Actions
					</th>
				</tr>
			</thead>

			<!-- Table Body -->
			<tbody class="border-none">
				<tr
					v-for="(row, rowIndex) in rows"
					:key="rowIndex"
					:class="{
						'bg-white': rowIndex % 2 === 0,
						'bg-pinkGray': rowIndex % 2 !== 0,
					}"
				>
					<template
						v-if="
							(!allActive && activeRow !== rowIndex) ||
							activeRow === null
						"
					>
						<td
							v-for="(col, colIndex) in columns.filter(
								(c) => !c.hidden
							)"
							:key="colIndex"
							:style="{ width: col.width ? col.width : 'auto' }"
							class="relative px-0 h-full after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-4/5 after:w-[1px] after:bg-gray-300 text-start"
						>
							<div
								class="px-4 py-2 w-full h-full flex flex-col items-start"
							>
								<div
									:class="
										col.formatCurrency ? 'text-end' : ''
									"
								>
									{{
										col.formatCurrency
											? formatCurrency(row[col.key])
											: row[col.key]
									}}
								</div>
								<span
									v-if="errorRows[rowIndex]?.[col.key]"
									class="text-red-500 text-xs"
								>
									{{ errorRows[rowIndex]?.[col.key] }}
								</span>
							</div>
						</td>
						<td class="px-4 py-2 w-12 text-center" v-if="!readonly">
							<div class="flex items-center justify-center gap-2">
								<div
									v-if="!allActive"
									class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out"
									title="Edit"
									@click="editRow(rowIndex)"
								>
									<i class="material-icons text-sm">edit</i>
								</div>
								<div
									v-if="deletable"
									class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out"
									title="Delete"
									@click="deleteRow(rowIndex)"
								>
									<i class="material-icons text-sm">delete</i>
								</div>
							</div>
						</td>
					</template>
					<template v-else>
						<td
							v-for="(col, colIndex) in columns.filter(
								(c) => !c.hidden
							)"
							:key="colIndex"
							:style="{ width: col.width ? col.width : 'auto' }"
							class="relative px-0 h-full after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-4/5 after:w-[1px] after:bg-gray-300"
						>
							<div
								class="flex flex-col items-start justify-between px-4 py-2 w-full h-full"
							>
								<input
									v-if="
										['int', 'number', 'text'].includes(
											col.type
										)
									"
									v-model="rows[rowIndex][col.key]"
									:type="
										col.type == 'number' ? 'text' : col.type
									"
									class="border-none w-full rounded focus:border-none focus:ring-0 focus:outline-none bg-transparent"
									@input="
										rows[rowIndex][col.key] =
											col.type === 'number'
												? validateAndParseInput(
														$event,
														rowIndex,
														col.key
													)
												: $event.target.value
									"
									:readonly="col.readonly"
									:placeholder="
										col.readonly ? 'To be generated' : ''
									"
								/>
								<Dropdown
									v-else-if="col.type === 'dropdown'"
									v-model="rows[rowIndex][col.key]"
									:items="col.items"
									:position="'sticky'"
								/>
								<span
									v-if="errorRows[rowIndex]?.[col.key]"
									class="text-red-500 text-xs"
								>
									{{ errorRows[rowIndex]?.[col.key] }}
								</span>
							</div>
						</td>
						<td class="px-4 py-2 w-12 text-center" v-if="!readonly">
							<div class="flex items-center justify-center gap-2">
								<div
									v-if="!allActive"
									class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out"
									title="Approve"
									@click="saveRow(rowIndex)"
								>
									<i class="material-icons text-sm">done</i>
								</div>
								<div
									v-if="deletable"
									class="w-8 h-8 bg-pinkLight text-white flex justify-center items-center rounded-full cursor-pointer hover:bg-pinkDark delete-btn transition duration-300 ease-in-out"
									title="Delete"
									@click="deleteRow(rowIndex)"
								>
									<i class="material-icons text-sm">delete</i>
								</div>
							</div>
						</td>
					</template>
				</tr>
			</tbody>

			<!-- Table Footer -->
			<tfoot v-if="rows.length === 0">
				<tr>
					<td
						:colspan="columns.filter((c) => !c.hidden).length + 1"
						v-html="noDataState"
					></td>
				</tr>
			</tfoot>
		</table>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Dropdown from './Dropdown.vue'
import { useStore } from 'vuex'
import axiosInstance from '../axios'

// Props for parent-to-child configuration
const props = defineProps({
	columns: {
		type: Array,
		required: true,
		default: () => [],
	},
	initialRows: {
		type: Array,
		default: () => [],
	},
	title: {
		type: String,
		default: '',
	},
	required: {
		type: Boolean,
		default: false,
	},
	independent: {
		type: Boolean,
		default: false,
	},
	allActive: {
		type: Boolean,
		default: true,
	},
	addable: {
		type: Boolean,
		default: true,
	},
	deletable: {
		type: Boolean,
		default: true,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
	defData: {
		type: Object,
		default: () => ({}),
	},

	// Optional For Add and Edit Data Not by emit(value) [Only for independent]
	addPath: {
		type: String,
		default: '',
	},
	editPath: {
		type: String,
		default: '',
	},
	deletePath: {
		type: String,
		default: '',
	},
	noDataState: {
		type: String,
		default: '',
	},
})

const store = useStore()

// Reactive state
const activeRow = ref(null)
const copyRows = ref([])
const errorRows = ref([])
const rows = ref([])
watch(
	() => props.initialRows,
	(newRows) => {
		console.log('newRows:', newRows)
		if (Array.isArray(newRows)) {
			rows.value = JSON.parse(JSON.stringify(newRows)) // Deep copy
			copyRows.value = JSON.parse(JSON.stringify(newRows)) // Deep copy
		}
	},
	{ immediate: true }
)

// Methods
const addRow = () => {
	if (!props.allActive && activeRow.value !== null) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: 'Please save the current row before adding a new one.',
			actions: [
				{
					label: 'close',
					type: 'secondary',
					handler: () => store.dispatch('hideAlert'),
				},
			],
		})
		return
	}
	// Create a new empty row based on column keys
	const newRow = props.columns.reduce((acc, col) => {
		if (col.default !== undefined) {
			acc[col.key] = col.default
		} else {
			acc[col.key] = col.type === 'number' ? 0.0 : '' // Use '0.00' for int types
		}
		return acc
	}, {})

	rows.value.push(newRow)
	activeRow.value = rows.value.length - 1
}

const editRow = (index) => {
	if (!props.allActive && activeRow.value !== null) {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message:
				'Please save the current active row before editing another one.',
			actions: [
				{
					label: 'close',
					type: 'secondary',
					handler: () => store.dispatch('hideAlert'),
				},
			],
		})
		return
	}
	activeRow.value = index
}

const changes = (index) => {
	return (
		JSON.stringify(rows.value[index]) !==
		JSON.stringify(copyRows.value[index])
	)
}

const editAll = () => {
	activeRow.value = 'all'
}

const saveAll = () => {
	activeRow.value = null
	emit('update:rows', rows.value)
}

const saveRow = async (index: number) => {
	if (!changes(index)) {
		activeRow.value = null
		errorRows.value[index] = {}
		return
	}
	if (!hasFullyFilled(index)) {
		store.dispatch('triggerAlert', {
			type: 'error',
			title: 'Error!',
			message: 'Please fill all required fields before saving.',
			actions: [
				{
					label: 'close',
					type: 'secondary',
					handler: () => store.dispatch('hideAlert'),
				},
			],
		})
		return
	}

	const agree = await confirmDialog('save') // Wait for confirmation
	if (!agree) return

	let id = rows.value[index].id
	let result = false
	if (props.independent) {
		if (props.addPath !== '' && id === '') {
			result = await addLogic(index)
		} else if (props.editPath !== '' && id !== '') {
			result = await editLogic(index)
		}
	} else {
		console.log('rows:', rows.value[index])
		result = true
	}
	if (result) {
		activeRow.value = null
		copyRows.value = [...rows.value]
		errorRows.value[index] = {}
		emit('update:rows', rows.value)
	}
}

const addLogic = async (index: number) => {
	var data = rows.value[index]
	const path = props.addPath

	try {
		data = { ...data, ...props.defData }
		data.total_price = data.price * data.qty + data.adjustment_price
		console.log('Insert : ', data)
		const response = await handleAxios(path, 'post', data)

		if (response.data) {
			showAlert('success', 'Success!', 'Data added successfully.')
			rows.value[index].id = response.data.data.id // Assign the new ID
			rows.value[index].code = response.data.data.code // Assign the new ID
			return true
		}
	} catch (error) {
		console.error('Error:', error)
		error.response.data.errors.forEach((err) => {
			if (!errorRows.value[index]) {
				errorRows.value[index] = {}
			}
			errorRows.value[index][err.field] = err.message
		})
		showAlert('error', 'Error!', error.response.data.message)
		return false
	}
}

const editLogic = async (index: number) => {
	const id = rows.value[index]?.id
	if (!id) return

	const data = rows.value[index]
	const path = `${props.editPath}/${id}`

	try {
		const res = await handleAxios(path, 'put', data)
		showAlert('success', 'Success!', 'Data updated successfully.')
		console.log('res:', res.data.data)
		rows.value[index].adjustment_price =
			res.data.data.updatedDetail.adjustment_price
		return true
	} catch (error) {
		error.response.data.errors.forEach((err) => {
			if (!errorRows.value[index]) {
				errorRows.value[index] = {}
			}
			errorRows.value[index][err.field] = err.message
		})
		showAlert('error', 'Error!', error.response.data.message)
		return false
	}
}

const deleteRow = async (index) => {
	if (!props.allActive && activeRow.value === index) {
		activeRow.value = null
	}
	const confirm = await confirmDialog('delete')
	if (!confirm) return
	await deleteLogic(index)
	emit('update:rows', rows.value)
}

const deleteLogic = async (index: number) => {
	const id = rows.value[index]?.id
	if (!id || !props.deletePath || !props.independent) {
		// Remove locally without API call
		rows.value.splice(index, 1)
		return
	}

	const path = `${props.deletePath}/${id}`

	try {
		await handleAxios(path, 'delete')
		showAlert('success', 'Success!', 'Data deleted successfully.')
		rows.value.splice(index, 1)
	} catch (error) {
		console.log(error)
		showAlert(
			'error',
			'Error!',
			error.response?.data.message ?? 'Failed to delete data.'
		)
	}
}

const handleAxios = async (
	path: string,
	method: 'post' | 'put' | 'delete',
	data?: object
) => {
	try {
		const response = await axiosInstance[method](
			path,
			method !== 'delete' ? data : undefined
		)

		return response
	} catch (error) {
		throw error
	}
}

const showAlert = (
	type: 'success' | 'error' | 'warning',
	title: string,
	message: string
) => {
	store.dispatch('triggerAlert', {
		type,
		title,
		message,
		actions: [
			{
				label: 'close',
				type: 'secondary',
				handler: () => store.dispatch('hideAlert'),
			},
		],
	})
}

const confirmDialog = (mode) => {
	return new Promise((resolve) => {
		store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: `Are you sure you want to ${mode} this data?`,
			actions: [
				{
					label: 'cancel',
					type: 'secondary',
					handler: () => {
						store.dispatch('hideAlert')
						resolve(false) // Reject the promise
					},
				},
				{
					label: 'proceed',
					type: 'primary',
					handler: () => {
						store.dispatch('hideAlert')
						resolve(true) // Resolve the promise
					},
				},
			],
		})
	})
}

const hasFullyFilled = (index) => {
	const data = rows.value[index]
	const columnsRequired = props.columns
		.filter((c) => c.required)
		.map((c) => c.key)
	return Object.keys(data)
		.filter((key) => columnsRequired.includes(key))
		.every((key) => {
			return (
				data[key] !== '' &&
				data[key] !== null &&
				data[key] !== undefined &&
				data[key].length > 0
			)
		})
}
// Emit rows update to parent if needed
const emit = defineEmits(['update:rows'])

const validateAndParseInput = (event, rowIndex, key) => {
	let value = event.target.value

	// Allow digits, '.', ',', and '-' (only at the start)
	value = value.replace(/[^0-9.,-]/g, '')

	// Ensure '-' is only at the beginning
	value = value.replace(/(?!^)-/g, '')

	// Replace multiple dots with a single dot
	value = value.replace(/\.{2,}/g, '.')

	// Replace multiple commas with a single comma
	value = value.replace(/,{2,}/g, ',')

	// Update the row value
	rows.value[rowIndex][key] = parseFloat(value)
	return value
}

// Formatter
const formatCurrency = (value: number) => {
	// value = Math.round(value)
	if (!value) return 'Rp 0'
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
	}).format(value)
}

onMounted(() => {
	if (props.required && props.addable) {
		if (props.initialRows.length === 0) {
			addRow()
			activeRow.value = 0
		}
	} else if (props.required && props.allActive) {
		activeRow.value = 'all'
	}
})
</script>

<style scoped>
.editable {
	max-width: 100%;
	overflow-x: auto;
}

.table-auto {
	width: 100%;
}
</style>
