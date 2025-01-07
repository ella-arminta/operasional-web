import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import InternalLayout from '../layouts/InternalLayout.vue'
import Logout from '../components/Logout.vue'
import Cookies from 'js-cookie'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            component: Login
        },
        {
          path: '/logout',
          component: Logout
        },
        {
            path: '/',
            component: InternalLayout, // Wraps internal pages
            meta: { requiresAuth: true },
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

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      const token = Cookies.get('token');
      if (token) {
        next();
      } else {
        next('/login');
      }
    } catch (error) {
      next('/login'); 
    }
  } else {
    next();
  }
});


export default router