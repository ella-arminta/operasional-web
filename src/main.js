import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import axiosInstance from './axios';

const app = createApp(App);
app.config.globalProperties.$axios = axiosInstance;

app.use(router)
.mount('#app')
