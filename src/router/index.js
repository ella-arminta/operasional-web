import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InternalLayout from '../layouts/InternalLayout.vue'
import Logout from '../components/Logout.vue'
import Cookies from 'js-cookie'
import AkunIndex from '../views/akun/AkunIndex.vue'
import AkunForm from '../views/akun/AkunForm.vue'
import JurnalIndex from '../views/jurnal/JurnalIndex.vue'
import JurnalDetail from '../views/jurnal/JurnalDetail.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			component: Login,
		},
		{
			path: '/logout',
			component: Logout,
		},
		{
			path: '/about',
			component: () => import('../views/About.vue'),
		},
		{
			path: '/',
			component: InternalLayout, // Tetap menggunakan InternalLayout sebagai pembungkus
			meta: { requiresAuth: true },
			children: [
				{
					path: 'home', // Path kosong sebagai default
					component: Home,
				},
				{
					path: 'master',
					children: [
						// Path for company
						{
							path: 'company',
							component: () =>
								import('../views/company/CompanyIndex.vue'),
						},
						{
							path: 'company/:mode/:id?',
							component: () =>
								import('../views/company/CompanyForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for store
						{
							path: 'store',
							component: () =>
								import('../views/store/StoreIndex.vue'),
						},
						{
							path: 'store/:mode/:id?',
							component: () =>
								import('../views/store/StoreForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for Employee
						{
							path: 'employee',
							component: () =>
								import('../views/employee/EmployeeIndex.vue'),
						},
						{
							path: 'employee/:mode/:id?',
							component: () =>
								import('../views/employee/EmployeeForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for akun
						{
							path: 'akun',
							component: AkunIndex,
						},
						{
							path: 'akun/:mode/:id?',
							component: AkunForm,
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
					],
				},
				{
					path: 'finance',
					children: [
						// Path for jurnal
						{
							path: 'jurnal',
							component: JurnalIndex,
						},
						{
							path: 'jurnal/view/:id?',
							component: JurnalDetail,
						},
					],
				},
			],
		},
	],
})

router.beforeEach(async (to, from, next) => {
	if (to.matched.some((record) => record.meta.requiresAuth)) {
		try {
			const token = Cookies.get('token')
			if (token) {
				next()
			} else {
				next('/')
			}
		} catch (error) {
			next('/')
		}
	} else {
		next()
	}
})

export default router
