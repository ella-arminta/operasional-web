<template>
    <div class="container">
        <h1>Login Page</h1>
        <div class="w-full max-w-xs">
            <form @submit.prevent="submit" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                        Email
                    </label>
                    <input  v-model="data.email"  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="email">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                        Password
                    </label>
                    <input v-model="data.password" class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
                </div>
                <div class="flex items-center justify-between">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Sign In
                    </button>
                </div>
            </form>
            <p class="text-center text-gray-500 text-xs">
                &copy;2020 Acme Corp. All rights reserved.
            </p>
         </div>

    </div>

</template>

<script>
import { reactive } from 'vue';
import axiosInstance from '../axios';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import { useStore } from "vuex";

export default {
    name: 'Login',
    setup() {
        const data = reactive({
            email: '',
            password: ''
        });

        const router = useRouter();
        const store = useStore(); // Access Vuex store

        const submit = async () => {
            try {
                const response = await axiosInstance.post('/login', data);
                console.log(response);

                // Check if response contains token
                if (response.data) {
                    // Save JWT token in a cookie for 5 hours
                    Cookies.set('token', response.data.token, { expires: 5 / 24 });
                    Cookies.set('userdata', JSON.stringify(response.data), { expires: 5 / 24 }); // 5 hours
                    console.log('Token saved in cookie');

                    store.dispatch('triggerAlert', {
                        message: 'This is a success alert!',
                        type: 'success',
                    });


                    router.push('/about');
                }
            } catch (error) {
                alert('Login failed', error);
                console.error('Login failed', error);
            }

        }

        return {
            data,
            submit
        }
    }
}

</script>