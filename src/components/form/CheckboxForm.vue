<template>
    <label for="checkboxid" class="text-sm text-grey-900 font-medium flex justify-between items-center cursor-pointer select-none">
        {{ label }}
        <input
            type="checkbox"
            id="checkboxid"
            :checked="modelValue"
            @change="$emit('update:modelValue', $event.target.checked)"
            class="peer hidden"
        />
        <div class="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer peer-checked:bg-pinkDark peer-checked:border-pinkDark text-white flex justify-center items-center">
            <i class="material-icons text-sm select-none">check</i>
        </div>							
    </label>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
    modelValue: { type: Boolean, required: true },
    label: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>