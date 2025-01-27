import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InternalLayout from '../layouts/InternalLayout.vue'
import Logout from '../components/Logout.vue'
import Cookies from 'js-cookie'
import AccountIndex from '../views/account/AccountIndex.vue'
import AccountForm from '../views/account/AccountForm.vue'
import CompanyIndex from '../views/company/CompanyIndex.vue'
import CompanyForm from '../views/company/CompanyForm.vue'
import StoreIndex from '../views/store/StoreIndex.vue'
import StoreForm from '../views/store/StoreForm.vue'
import EmployeeIndex from '../views/employee/EmployeeIndex.vue'
import EmployeeForm from '../views/employee/EmployeeForm.vue'
import JournalDetail from '../views/journal/JournalDetail.vue'
import JournalIndex from '../views/Journal/JournalIndex.vue'
import MExpensesIndex from '../views/mexpenses/MExpensesIndex.vue'
import MExpensesForm from '../views/mexpenses/MExpensesForm.vue'

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
							component: CompanyIndex,
						},
						{
							path: 'company/:mode/:id?',
							component: CompanyForm,
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for store
						{
							path: 'store',
							component: StoreIndex,
						},
						{
							path: 'store/:mode/:id?',
							component: StoreForm,
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for Employee
						{
							path: 'employee',
							component: EmployeeIndex,
						},
						{
							path: 'employee/:mode/:id?',
							component: EmployeeForm,
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for Account
						{
							path: 'account',
							component: AccountIndex,
						},
						{
							path: 'account/:mode/:id?',
							component: AccountForm,
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
					],
				},
				{
					path: 'finance',
					children: [
						// Path for journal
						{
							path: 'journal',
							component: JournalIndex,
						},
						{
							path: 'journal/view/:id?',
							component: JournalDetail,
						},
						{
							path: 'mexpenses',
							component: MExpensesIndex
						},
						{
							path: 'mexpenses/:mode/:id?',
							component: MExpensesForm,
							props: (route) => ({
								mode: route.params.mode,
							}),
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
