import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import axiosInstance from './axios'
import alert from './vuex/alert'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.config.globalProperties.$axios = axiosInstance
app.use(pinia)
app.use(alert)
app.use(router)
app.mount('#app')
