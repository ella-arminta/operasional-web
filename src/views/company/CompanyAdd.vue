<template>
    <div class="content min-h-screen">
        <PageTitle />
        <!-- Form section -->
        <form class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4" @submit.prevent="submit">
            <div class="flex items-center justify-between">
                <h1 class="text-xl text-pinkDark">Add Company</h1>
                <button class="flex items-center bg-pinkDark text-white px-4 py-2 rounded-lg" type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                    Save
                </button>            
            </div>
            <div class="grid grid-cols-3 gap-6 mt-4">
                <div class="space-y-3">
                    <div>
                        <label for="code" class="block text-sm text-grey-900 font-medium mb-1">Code<span class="text-pinkDark">*</span></label>
                        <input 
                            v-model="form.code"
                            type="text" 
                            id="code" 
                            name="code" 
                            placeholder="Code"
                            class="w-full bg-pinkGray border border-pinkOrange rounded-lg px-3 py-3 text-pinkDark focus:outline-none focus:border-pinkDark"
                        />
                        <p v-if="formError.code != ''" class="text-pinkDark text-xs italic">{{ formError.code }}</p>
                    </div>
                    <div>
                        <label for="name" class="block text-sm text-grey-900 font-medium mb-1">Name<span class="text-pinkDark">*</span></label>
                        <input 
                            v-model="form.name"
                            type="text" 
                            id="name" 
                            name="name" 
                            placeholder="Name"
                            class="w-full bg-pinkGray border border-pinkOrange rounded-lg px-3 py-3 text-pinkDark focus:outline-none focus:border-pinkDark"
                        />
                        <p v-if="formError.name != ''" class="text-pinkDark text-xs italic">{{ formError.name }}</p>
                    </div>
                </div>

                <div>
                    <label for="description" class="block text-sm text-grey-900 font-medium mb-1">Description</label>
                    <textarea 
                        v-model="form.description"
                        id="description" 
                        name="description" 
                        placeholder="Type your description..."
                        rows="5"
                        class="w-full bg-pinkGray border border-pinkOrange rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:border-pinkDark"
                    ></textarea>
                    <p v-if="formError.description != ''" class="text-pinkDark text-xs italic">{{ formError.description }}</p>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axiosInstance from '../../axios';

        const form = ref({
            code: '',
            name: '',
            description: ''
        });
        const formError = ref({
            code: '',
            name: '',
            description: ''
        });
        const resetError = () => {
            formError.value = {
                code: '',
                name: '',
                description: ''
            };
        }
        const router = useRouter();
        const store = useStore(); 
        const submit = async () => {
            // reset form error
            resetError();
            try {
                const response = await axiosInstance.post('/master/company', form.value);
                // Check if response contains token
                if (response.data) {
                    // Success
                    store.dispatch('triggerAlert', {
                        type: "success",
                        title: "Success!",
                        message: `Company ${response.data.name} Created.`,
                        actions: [
                            { label: "close", type: "secondary", handler: () => store.dispatch('hideAlert') },
                        ],
                    });
                    router.push('/master/company');
                }
            } catch (error) {
                console.log(error.response.data);
                const errors = error.response.data.errors;
                errors.map((err) => {
                    formError.value[err.field] = err.message;
                });
                console.log(formError.value);
                store.dispatch('triggerAlert', {
                    type: "error",
                    title: "Error!",
                    message: "Company creation failed. Please try again.",
                    actions: [
                        { label: "close", type: "secondary", handler: () => store.dispatch('hideAlert') },
                    ],
                });
            }

        }
</script>