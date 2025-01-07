import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import InternalLayout from '../layouts/InternalLayout.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            component: Login
        },
        {
            path: '/',
            component: InternalLayout, // Wraps internal pages
            children: [
              {
                path: '/',
                component: Home,
              },
              {
                path: 'about',
                component: About,
              },
            ],
        },
    ]
})

export default router