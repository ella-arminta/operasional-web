import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InternalLayout from '../layouts/InternalLayout.vue'
import Logout from '../components/Logout.vue'
import Cookies from 'js-cookie'
import { decryptData } from '../utils/crypto'
import { useAuthStore } from '../vuex/auth'
import store from '../vuex/alert'

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
					component: () =>
						import('../views/customer/CustomerForm.vue'),
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
							path: 'recurring',
							component: () =>
								import('../views/recurring/RecurringIndex.vue'),
						},
						{
							path: 'recurring/:mode/:id?',
							component: () =>
								import('../views/recurring/RecurringForm.vue'),
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
						{
							path: 'general-ledger',
							component: () =>
								import(
									'../views/general-ledger/GeneralLedgerIndex.vue'
								),
						},
						{
							path: 'general-ledger/view/:id',
							component: () =>
								import(
									'../views/general-ledger/LedgerDetail.vue'
								),
						},
						{
							path: 'profit-loss',
							component: () =>
								import(
									'../views/profit-loss/ProfitLossIndex.vue'
								),
						},
					],
				},
				{
					path: 'transaction',
					children: [
						{
							path: 'sales',
							component: () =>
								import('../views/sales/SalesIndex.vue'),
						},
						{
							path: 'sales/:mode/:id?',
							component: () =>
								import('../views/sales/SalesForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
					],
				},
				{
					path: 'marketplace',
					children: [
						{
							path: 'voucher',
							component: () =>
								import('../views/marketplace/VoucherIndex.vue'),
						},
						{
							path: 'voucher/:mode/:id?',
							component: () =>
								import('../views/marketplace/VoucherForm.vue'),
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
							path: 'password-change',
							component: () =>
								import('../views/settings/ChangePassword.vue'),
						},
						{
							path: 'change-store',
							component: () =>
								import('../views/settings/ChangeStore.vue'),
						},
						{
							path: 'role',
							component: () =>
								import('../views/role/RoleIndex.vue'),
						},
						{
							path: 'role/:mode/:id?',
							component: () =>
								import('../views/role/RoleForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						{
							path: 'user-role',
							component: () =>
								import('../views/role/UserRole.vue'),
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

const loa = ['add', 'edit', 'delete', 'detail']

router.beforeEach(async (to, from, next) => {
	if (!to.matched.some((record) => record.meta.requiresAuth)) {
		next()
		return
	}

	try {
		// Decrypt token
		const token = await decryptData(Cookies.get('token'))
		if (!token) throw new Error('Invalid token')

		// If navigating to home or logout, allow directly
		if (to.path === '/home' || to.path === '/logout') {
			next()
			return
		}

		// Fetch stored permissions
		const authStore = useAuthStore()
		const auth = authStore.allowedPaths || []

		// Extract base path and action
		const paths = to.path.split('/')
		const actionIndex = paths.findIndex((item) => loa.includes(item))
		const action = actionIndex >= 0 ? paths[actionIndex] : 'open'
		const basePath =
			actionIndex > 0 ? paths.slice(0, actionIndex).join('/') : to.path
		console.log(basePath, action)

		// Check if user has permission
		const allowed = auth.some((item) => {
			return (
				item.path === basePath &&
				(item.action.includes(action) || item.action.includes('all'))
			)
		})
		if (allowed) {
			next()
			return
		} else {
			store.dispatch('triggerAlert', {
				message: 'You are not allowed to access this page',
				type: 'error',
				title: 'Access Denied',
			})
			next('/home')
			return
		}
	} catch (error) {
		// Cleanup expired/invalid session
		Cookies.remove('token')
		Cookies.remove('userdata')
		next('/')
		return
	}
})

export default router
