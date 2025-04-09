<template>
	<div
		v-if="alert.visible"
		class="fixed inset-0 flex items-center justify-center bg-slate-400/5 z-index transition duration-300 ease-in-out max-h-screen"
	>
		<div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
			<!-- Alert Icon -->
			<div class="flex items-center mb-4">
				<div
					class="flex items-center justify-center w-12 h-12 rounded-full animation-ping"
					:class="iconBackground"
				>
					<i class="text-2xl" :class="iconClass"></i>
				</div>
				<h3 class="text-lg font-semibold ml-4">{{ alert.title }}</h3>
				<button
					@click="closeAlert"
					v-if="alert.type !== 'loading'"
					class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
				>
					✖
				</button>
			</div>

			<!-- Alert Message -->
			<p class="text-sm text-gray-500 mb-4" v-html="alert.message"></p>

			<!-- Alert Inputs -->
			<div v-if="alert.inputs?.length">
				<div v-for="(input, index) in alert.inputs" :key="index" class="mb-3" :v-if="checkInputCondition(input)">
					<label class="block text-sm font-medium text-gray-700" v-if="checkInputCondition(input)">{{ input.label }}</label>
					<input
						v-if="input.type !== 'select' && checkInputCondition(input)"
						v-model="inputData[input.model]"
						:type="input.type || 'text'"
						class="w-full border p-2 rounded"
					/>

					<Dropdown
						v-if="input.type === 'select' && checkInputCondition(input)"
						:items="dropdownOptions[input.model]"
						:multiple="input.multiple || false"
						v-model="inputData[input.model]"
					/>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex justify-end space-x-3">
				<button
					v-for="(action, index) in alert.actions"
					:key="index"
					:class="['px-4 py-2 rounded-lg text-sm', buttonClass(action.type)]"
					@click="handleAction(action)"
				>
					{{ action.label }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import Dropdown from './Dropdown.vue';
import axiosInstance from '../axios';

const store = useStore();
const alert = computed(() => store.state.alert);
const inputData = ref({});
const dropdownOptions = ref({});

const iconBackground = computed(() => {
	const type = alert.value.type;
	return {
		warning: 'bg-yellow-100 text-yellow-600',
		error: 'bg-red-100 text-red-600',
		success: 'bg-green-100 text-green-600',
		info: 'bg-blue-100 text-blue-600',
		loading: 'bg-pinkDark text-white',
	}[type] || 'bg-gray-100 text-gray-600';
});

const iconClass = computed(() => {
	const type = alert.value.type;
	return {
		warning: 'fas fa-exclamation-triangle',
		error: 'fas fa-times-circle',
		success: 'fas fa-check-circle',
		info: 'fas fa-info-circle',
		loading: 'fas fa-spinner fa-spin animate-spin',
	}[type] || 'fas fa-bell';
});

watch(alert, async (newAlert) => {
	inputData.value = newAlert.inputs?.reduce((acc, input) => {
		console.log('selectedModel:', input.selectedModel);
		if (input.selectedModel) {
			acc[input.model] = input.selectedModel;
		} else {
			acc[input.model] = '';
		}
		return acc;
	}, {}) || {};

	if (newAlert.inputs) {
		for (const input of newAlert.inputs) {
			if (input.type === 'select') {
				if (input.selectedModel) {
					inputData.value[input.model] = input.selectedModel;
				} else {
					inputData.value[input.model] = [];
				}
				dropdownOptions.value[input.model] = [];
				try {
					if (input.ajaxOptions) {
						const response = await axiosInstance.get(input.ajaxOptions);
						dropdownOptions.value[input.model] = response.data.data.map(option => ({
							id: option.id,
							label: option.name,
						}));
					} else if (input.options) {
						dropdownOptions.value[input.model] = input.options.map(option => ({
							id: option.value,
							label: option.text,
						}));
					}
					
				} catch (error) {
					console.error('Error fetching dropdown options:', error);
				}
			}
		}
	}
}, { deep: true });

onMounted(() => {
	if (alert.value.inputs) {
		alert.value.inputs.forEach(async (input) => {
			if (input.type === 'select') {
				inputData.value[input.model] = [];
				dropdownOptions.value[input.model] = [];
				try {
					if (input.ajaxOptions) {
						const response = await axiosInstance.get(input.ajaxOptions);
						dropdownOptions.value[input.model] = response.data.data.map(option => ({
							id: option.id,
							label: option.name,
						}));
					} else if (input.options) {
						dropdownOptions.value[input.model] = input.options.map(option => ({
							id: option.value,
							label: option.text,
						}));
					}
				} catch (error) {
					console.error('Error fetching dropdown options:', error);
				}
			}
		});
	}
});

const closeAlert = () => {
	store.commit('hideAlert');
	inputData.value = {};
};

const buttonClass = (type) => {
	return {
		primary: 'bg-green-600 text-white hover:bg-green-500',
		secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
		danger: 'bg-red-600 text-white hover:bg-red-500',
	}[type] || 'bg-gray-200 text-gray-700 hover:bg-gray-300';
};

const handleAction = (action) => {
	if (alert.value.inputs?.length) {
		action.handler(inputData.value);
	} else {
		action.handler();
	}
};
const checkInputCondition = (input) => {
	if (!input.condition) return true;

	// console.log('condition function:', input.condition.toString());
	// console.log('inputData.value:', inputData.value);

	const result = typeof input.condition === 'function'
		? input.condition(inputData.value)
		: !!input.condition;

	// console.log('Condition result:', result);
	return result;
};
</script>

<style scoped>
.z-index {
	z-index: 9999;
}
</style>
