<template>
    <div class="container">
        <h1>Login Page</h1>
        <form @submit.prevent="submit">
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" v-model="data.email" aria-describedby="emailHelp">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="data.password">
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>

</template>

<script>
import { reactive } from 'vue';
import axiosInstance from '../axios';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';

export default {
    name: 'Login',
    setup() {
        const data = reactive({
            email: '',
            password: ''
        });

        const router = useRouter();

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