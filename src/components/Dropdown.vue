<template>
	<div
		class="relative w-full"
		ref="dropdown"
		:class="{ 'cursor-not-allowed': props.disabled }"
	>
		<!-- Input Field -->
		<div
			@click="toggleDropdown"
			class="border rounded-lg px-3 py-2 flex items-center justify-between gap-2 cursor-pointer bg-pinkGray border-pinkOrange border-opacity-25 transition duration-300 ease-in-out"
			:class="{
				'bg-opacity-25': disabled,
			}"
		>
			<div class="flex flex-wrap gap-1">
				<!-- Selected Items -->
				<template v-if="props.multiple">
					<span
						v-for="item in selectedItems"
						:key="item.id"
						class="bg-pinkMed text-white px-2 py-1 rounded-lg text-xs flex items-center gap-2"
					>
						{{ item.label }}
						<button
							v-if="!props.disabled"
							@click.stop="removeItem(item)"
							class="text-pinkLight hover:text-white"
						>
							&times;
						</button>
					</span>
				</template>
				<span
					v-else
					v-if="selectedItems.length"
					class="text-pinkOrange"
				>
					{{ selectedItems[0].label }}
				</span>
				<div
					v-if="selectedItems.length === 0"
					class="text-pinkOrange text-opacity-75"
				>
					{{ placeholder }}
				</div>
			</div>
			<i class="material-icons text-pinkDark">{{
				disabled
					? ''
					: isOpen
						? 'keyboard_arrow_up'
						: 'keyboard_arrow_down'
			}}</i>
		</div>

		<!-- Dropdown Menu -->
		<div
			ref="dropdownMenu"
			v-show="isOpen && !disabled"
			:class="props.position"
			class="z-10 bg-white border border-pinkOrange border-opacity-25 shadow-lg rounded-lg w-full overflow-y-auto bg-pinkGray"
		>
			<ul>
				<li v-if="searchable" class="px-4 py-2 border-b bg-pinkGray">
					<input
						type="text"
						v-model="search"
						class="w-full outline-none bg-pinkGray text-sm flex-grow placeholder-pinkOrange placeholder-opacity-50 text-pinkOrange text-opacity-100"
						:disabled="disabled"
						placeholder="search..."
					/>
				</li>
				<li
					v-for="item in filteredItems"
					:key="item.id"
					@click="!props.disabled && selectItem(item)"
					class="px-4 py-2 bg-pinkGray cursor-pointer hover:bg-pinkLight hover:bg-opacity-50 transition duration-300"
					:class="{ 'bg-pinkLight bg-opacity-50': isSelected(item) }"
				>
					<div
						class="flex items-center justify-between text-pinkOrange text-opacity-50 hover:text-opacity-100"
						:class="{
							'text-opacity-100 text-pinkDark': isSelected(item),
						}"
					>
						{{ item.label }}
						<i
							v-if="isSelected(item)"
							class="material-icons text-pinkDark text-sm"
							>check</i
						>
					</div>
				</li>
				<li
					v-if="!filteredItems.length"
					class="px-4 py-2 bg-pinkGray text-pinkOrange text-opacity-75"
				>
					<div
						v-if="props.addRoute !== ''"
						class="flex items-center justify-between"
						@click="router.push(props.addRoute)"
					>
						<p>Create New</p>
						<i class="material-icons text-sm">add</i>
					</div>
					<div v-else>No items found</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { defineProps, defineEmits,nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
	items: {
		type: Array as () => Array<{ id: number | string; label: string; }>,
		required: true,
	},
	multiple: {
		type: Boolean,
		default: false,
	},
	placeholder: {
		type: String,
		default: 'Select an option',
	},
	modelValue: {
		type: Array as () => Array<number | string> | string | number,
		default: () => [],
	},
	searchable: {
		type: Boolean,
		default: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	addRoute: {
		type: String,
		default: '',
	},
	position: {
		type: String,
		default: 'absolute',
	},
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const search = ref('')
const dropdown = ref(null)

const selectedItems = ref(
	Array.isArray(props.modelValue)
		? props.items.filter((item) => props.modelValue.includes(item.id))
		: []
)

// Watch for changes in `modelValue` and update `selectedItems`
watch(
	() => props.modelValue,
	(newValue) => {
		selectedItems.value = Array.isArray(newValue)
			? props.items.filter((item) => newValue.includes(item.id))
			: []
	}
)
watch(
	() => props.items,
	(newValue) => {
		selectedItems.value = Array.isArray(newValue)
			? props.items.filter((item) => props.modelValue.includes(item.id))
			: []
	}
)

const toggleDropdown = () => {
	if (!props.disabled) {
		isOpen.value = !isOpen.value
		if (isOpen.value) {
			nextTick(() => {
				adjustDropdownHeight()
			})
		}
	}
}

const closeDropdown = () => {
	isOpen.value = false
}

const filteredItems = computed(() => {
	return search.value
		? props.items.filter((item) =>
				item.label.toLowerCase().includes(search.value.toLowerCase())
			)
		: props.items
})

const selectItem = (item) => {
	if (props.disabled) return

	if (props.multiple) {
		if (isSelected(item)) {
			removeItem(item)
		} else {
			selectedItems.value.push(item)
			emitValue()
		}
	} else {
		selectedItems.value = [item]
		emitValue()
		closeDropdown()
	}
}

const removeItem = (item) => {
	selectedItems.value = selectedItems.value.filter(
		(selected) => selected.id !== item.id
	)
	emitValue()
}

const isSelected = (item) => {
	return selectedItems.value.some((selected) => selected.id === item.id)
}

const emitValue = () => {
	const ids = selectedItems.value.map((item) => item.id)
	emit('update:modelValue', ids)
}

// Add the listener when the component is mounted
onMounted(() => {
	document.addEventListener('click', handleClickOutside)
	window.addEventListener('resize', adjustDropdownHeight)
})

// Remove the listener when the component is unmounted
onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
	window.removeEventListener('resize', adjustDropdownHeight)
})

// Handle the click event
const handleClickOutside = (e) => {
	if (dropdown.value && !dropdown.value.contains(e.target)) {
		closeDropdown()
	}
}

// handle dropdown not overflow screen
const dropdownMenu = ref(null)
const adjustDropdownHeight = () => {
	if (!dropdownMenu.value || !dropdown.value) return

	// Get dropdown's position on screen
	const dropdownRect = dropdown.value.getBoundingClientRect()
	const dropdownTop = dropdownRect.bottom

	// Calculate available space
	const spaceBelow = window.innerHeight - dropdownTop - 10 // padding bottom

	// Apply max-height
	dropdownMenu.value.style.maxHeight = `${spaceBelow}px`
}
</script>
