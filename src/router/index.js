import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Login from "../views/Login.vue";
import InternalLayout from "../layouts/InternalLayout.vue";
import Logout from "../components/Logout.vue";
import Cookies from "js-cookie";
import AkunIndex from "../views/akun/AkunIndex.vue";
import AkunForm from "../views/akun/AkunForm.vue";
import CompanyIndex from "../views/company/CompanyIndex.vue";
import CompanyForm from "../views/company/CompanyForm.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Login,
    },
    {
      path: "/logout",
      component: Logout,
    },
    {
      path: "/",
      component: InternalLayout, // Tetap menggunakan InternalLayout sebagai pembungkus
      meta: { requiresAuth: true },
      children: [
        {
          path: "home", // Path kosong sebagai default
          component: Home,
        },
        {
          path: "master",
          children: [
            {
              path: "akun", // Path untuk akun
              component: AkunIndex, // Komponen utama untuk `/akun`
              children: [
                {
                  path: "form", // Path relatif untuk form
                  component: AkunForm, // Komponen untuk form akun
                },
              ],
            },
            {
              path: "company",
              component: CompanyIndex,
            },
            {
              path: "company/:mode/:id?",
              component: CompanyForm,
              props: (route) => ({
                mode: route.params.mode,
              }),
            },
          ],
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      const token = Cookies.get("token");
      if (token) {
        next();
      } else {
        next("/");
      }
    } catch (error) {
      next("/");
    }
  } else {
    next();
  }
});

export default router;
