import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import axiosInstance from './axios';
import alert from './vuex/alert';

const app = createApp(App);
app.config.globalProperties.$axios = axiosInstance;
app.use(alert);
app.use(router)
.mount('#app')
