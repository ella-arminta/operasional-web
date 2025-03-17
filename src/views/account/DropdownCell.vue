<script setup>
import { ref } from "vue";
import Dropdown from "../../components/Dropdown.vue";
import { mode } from "crypto-js";
import axiosInstance from "../../axios";

const props = defineProps({
  rowData: Object,
  columnData: Object,
  options: Array, // Use directly
  store: Object
});
const modelValue = ref([props.rowData.trans_Account_settings?.[0]?.account?.id] || []);
const prevModelValue = ref([...modelValue.value]); // Store previous value

const updateAccount = async (value) => {
  console.log('value',value);
  props.store.dispatch('triggerAlert', {
			type: 'warning',
			title: 'Warning!',
			message: `Yakin ingin mengubah akun pada aksi ini?`,
			actions: [
        // Tidak jadi
				{
					label: 'cancel',
					type: 'secondary',
					handler: () => {
            modelValue.value = [...prevModelValue.value]; // Revert selection
						props.store.dispatch('hideAlert')
					},
				},
        // jadi
				{
					label: 'proceed',
					type: 'primary',
					handler: async () => {
            console.log('rowdata id',props.rowData.id);
            const postAccountSetting = await axiosInstance.post('/finance/trans-account-setting', {
              account_id: value[0],
              action: props.rowData.action
            });
            console.log('postAccountSetting',postAccountSetting);
            if (postAccountSetting.data.success) {
              modelValue.value = value; // Update selection
              prevModelValue.value = [...modelValue.value]; // Update previous value
              props.store.dispatch('triggerAlert', {
                type: 'success',
                title: 'Success!',
                message: `Akun berhasil diubah`,
              });
            } else {
              modelValue.value = [...prevModelValue.value]; // Revert selection
              props.store.dispatch('triggerAlert', {
                type: 'error',
                title: 'Error!',
                message: `Akun gagal diubah`,
              });
            }
					},
				},
			],
		})
};
</script>

<template>
  <Dropdown
    :items="options" 
    v-model="modelValue"
    :multiple="false"
    @update:modelValue="updateAccount"
  />
</template>