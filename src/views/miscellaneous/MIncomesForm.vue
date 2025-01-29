<template>
<div class="content" :class="{ 'full-width': smallMenu }">
    <MexpensesForm
        :trans_type_id=2
        :pageTitle="'Miscellaneous Incomes Form'"
        :mode="mode"
        :redirect="'/finance/mincomes'"
    />
</div>
</template>
<script setup>
import { useStore } from 'vuex';
import { ref, onMounted, computed, render } from 'vue';
import MexpensesForm from './MexpensesForm.vue';
const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);

const props = defineProps({
	mode: { type: String, required: true },
})
</script>