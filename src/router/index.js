import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InternalLayout from '../layouts/InternalLayout.vue'
import Logout from '../components/Logout.vue'
import Cookies from 'js-cookie'

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
					path: '/faq',
					component: () => import('../views/faq/FAQIndex.vue'),
				},
				{
					path: '/customer',
					component: () => import('../views/customer/CustomerForm.vue'),
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
						// Path for Account
						{
							path: 'account',
							component: () =>
								import('../views/account/AccountIndex.vue'),
						},
						{
							path: 'account/:mode/:id?',
							component: () =>
								import('../views/account/AccountForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for Category
						{
							path: 'category',
							component: () =>
								import('../views/category/CategoryIndex.vue'),
						},
						{
							path: 'category/:mode/:id?',
							component: () =>
								import('../views/category/CategoryForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for Price
						{
							path: 'price',
							component: () =>
								import('../views/price/PriceIndex.vue'),
						},
						{
							path: 'price/:mode/:id?',
							component: () =>
								import('../views/price/PriceForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
					],
				},
				{
					path: 'inventory',
					children: [
						// Path for product
						{
							path: 'product',
							component: () =>
								import('../views/product/ProductIndex.vue'),
						},
						{
							path: 'product/:mode/:id?',
							component: () =>
								import('../views/product/ProductForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for Operation
						{
							path: 'operation',
							component: () =>
								import('../views/operation/OperationIndex.vue'),
						},
						{
							path: 'operation/:mode/:id?',
							component: () =>
								import('../views/operation/OperationForm.vue'),
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
							component: () =>
								import('../views/journal/JournalIndex.vue'),
						},
						{
							path: 'journal/view/:id?',
							component: () =>
								import('../views/journal/JournalDetail.vue'),
						},
						{
							path: 'mexpenses',
							component: () =>
								import(
									'../views/miscellaneous/MExpensesIndex.vue'
								),
						},
						{
							path: 'mexpenses/:mode/:id?',
							component: () =>
								import(
									'../views/miscellaneous/MExpensesForm.vue'
								),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						{
							path: 'mincomes',
							component: () =>
								import(
									'../views/miscellaneous/MIncomesIndex.vue'
								),
						},
						{
							path: 'mincomes/:mode/:id?',
							component: () =>
								import(
									'../views/miscellaneous/MIncomesForm.vue'
								),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						{
							path: 'cashier-closing',
							component: () =>
								import(
									'../views/cashier-closing/CashierClosingIndex.vue'
								),
						},
						{
							path: 'cashier-closing/:mode/:id?',
							component: () =>
								import(
									'../views/cashier-closing/CashierClosingForm.vue'
								),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						{
							path: 'stock-card',
							component: () =>
								import('../views/stock/StockCardIndex.vue'),
						},
						{
							path: 'stock-mutation',
							component: () =>
								import('../views/stock/StockMutationIndex.vue'),
						},
					],
				},
				{
					path: 'marketplace',
					children: [
						{
							path: 'voucher',
							component: () => import('../views/marketplace/VoucherIndex.vue'),
						},
						{
							path: 'voucher/:mode/:id?',
							component: () => import('../views/marketplace/VoucherForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
					],
				},
				{
					path: 'settings',
					children: [
						{
							path: 'password/change',
							component: () =>
								import('../views/settings/ChangePassword.vue'),
						},
					],
				},
			],
		},
		{
			path: '/:pathMatch(.*)*',
			component: () => import('../views/error/NotFound.vue'),
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
