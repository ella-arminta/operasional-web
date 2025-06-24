<template>
    <div class="w-full">
        <label :for="id" class="block text-sm text-gray-900 font-medium">
            {{ label }} <span v-if="required" class="text-red-500">*</span>
        </label>

        <input :id="id" :type="type" :placeholder="placeholder" :value="modelValue" :readonly="readonly"
            :disabled="disabled" :min="min" :max="max" @input="$emit('update:modelValue', $event.target.value)"
            class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
            :class="{
                'border-pinkDark': error,
                'border-pinkOrange': !error,
                'placeholder-opacity-50 bg-opacity-25': readonly,
                'text-opacity-100 bg-opacity-100 text-pinkDark': !readonly,
            }" />

        <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
    </div>
</template>

<script setup>
defineProps({
    id: String,
    label: String,
    modelValue: [String, Number],
    type: {
        type: String,
        default: 'text',
    },
    placeholder: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    min: {
        type: String,
        default: '',
    },
    max: {
        type: String,
        default: '',
    },
    error: {
        type: String,
        default: '',
    },
})
</script>
