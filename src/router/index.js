import { createRouter, createWebHistory } from 'vue-router'
// import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import InternalLayout from '../layouts/InternalLayout.vue'
import Logout from '../components/Logout.vue'
import Cookies from 'js-cookie'
import { decryptData } from '../utils/crypto'
import { useAuthStore } from '../vuex/auth'
import store from '../vuex/alert'
import OnboardingLayout from '../layouts/onboardingLayout.vue'

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
			path: '/',
			component: InternalLayout,
			children: [
				{
					path: '/faq',
					component: () => import('../views/faq/FAQIndex.vue'),
				},
			],
		},
		{
			path: '/onboarding',
			component: OnboardingLayout,
			children: [
				{
					path: 'company',
					component: () => import('../views/onboarding/company.vue'),
				},
				{
					path: 'store',
					component: () => import('../views/onboarding/store.vue'),
				},
				{
					path: 'employee',
					component: () => import('../views/onboarding/employee.vue'),
				},
			],
		},
		{
			path: '/',
			component: InternalLayout, // Tetap menggunakan InternalLayout sebagai pembungkus
			meta: { requiresAuth: true },
			children: [
				{
					path: 'home', // Path kosong sebagai default
					component: import('../views/Home.vue'),
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
						// Path for Account Setting
						{
							path: 'page-account-setting',
							component: () =>
								import('../views/account/AccountSetting.vue'),
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
						// Path for Check Product
						{
							path: 'check-product',
							component: () =>
								import('../views/product/CheckProduct.vue'),
						},
						// Path for Stock-Out
						{
							path: 'stock-out',
							component: () =>
								import('../views/stock-out/StockOutIndex.vue'),
						},
						{
							path: 'stock-out/:mode/:id?',
							component: () =>
								import('../views/stock-out/StockOutForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						// Path for Stock Opname
						{
							path: 'stock-opname',
							component: () =>
								import(
									'../views/stock-opname/StockOpnameIndex.vue'
								),
						},
						{
							path: 'stock-opname/:mode/:id?',
							component: () =>
								import(
									'../views/stock-opname/StockOpnameForm.vue'
								),
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
							path: 'journal/detail/:id?',
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
							path: 'trial-balance',
							component: () =>
								import('../views/report/TrialBalance.vue'),
						},
						{
							path: 'general-ledger/detail/:id?',
							component: () =>
								import('../views/report/LedgerDetail.vue'),
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
						{
							path: 'purchase',
							component: () =>
								import('../views/purchase/PurchaseIndex.vue'),
						},
						{
							path: 'purchase/:mode/:id?',
							component: () =>
								import('../views/purchase/PurchaseForm.vue'),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						{
							path: 'trade',
							component: () =>
								import('../views/trade/TradeIndex.vue'),
						},
						{
							path: 'trade/:mode/:id?',
							component: () =>
								import('../views/trade/TradeForm.vue'),
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
							path: 'dashboard',
							component: () =>
								import(
									'../views/marketplace-dashboard/Dashboard.vue'
								),
						},
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
						{
							path: 'bank_account',
							component: () =>
								import(
									'../views/bank-account/BankAccountIndex.vue'
								),
						},
						{
							path: 'bank_account/:mode/:id?',
							component: () =>
								import(
									'../views/bank-account/BankAccountForm.vue'
								),
							props: (route) => ({
								mode: route.params.mode,
							}),
						},
						{
							path: 'balance',
							component: () =>
								import('../views/balance/Balance.vue'),
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

const loa = ['add', 'edit', 'delete', 'detail', 'approve', 'disapprove']

router.beforeEach(async (to, from, next) => {
	const userdata = await decryptData(Cookies.get('userdata'))
	// For Onboarding State Owner
	if (
		!['/', '/onboarding/company', '/logout'].includes(to.path) &&
		userdata.company_id == null &&
		userdata.is_owner
	) {
		next('/onboarding/company')
		return
	}

	// For Onboarding State Employee wait to be assigned
	if (
		!['/', '/onboarding/employee', '/logout'].includes(to.path) &&
		userdata.company_id == null &&
		userdata.store_id == null &&
		!userdata.is_owner
	) {
		next('/onboarding/employee')
		return
	}

	if (to.path === '/') {
		// If navigating to login, allow directly
		next()
		return
	}

	if (to.path === '/faq') {
		next()
		return
	}
	if (!to.matched.some((record) => record.meta.requiresAuth)) {
		next()
		return
	}

	try {
		// Decrypt token
		const token = await decryptData(Cookies.get('token'))
		if (!token) throw new Error('Invalid token')

		// If navigating to home or logout, allow directly
		if (
			to.path === '/home' ||
			to.path === '/logout' ||
			to.path === '/marketplace/dashboard'
		) {
			next()
			return
		}

		// Fetch stored permissions
		const authStore = useAuthStore()
		const auth = authStore.allowedPaths || []

		// Extract base path and action
		const paths = to.path.split('/')
		const actionIndex = paths.findIndex((item) => loa.includes(item))
		const action = (
			actionIndex >= 0 ? paths[actionIndex] : 'open'
		).toLowerCase()
		const basePath = (
			actionIndex > 0 ? paths.slice(0, actionIndex).join('/') : to.path
		).toLowerCase()
		console.log('BasePath and Action', basePath, action)

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
			console.log('BasePath and Action', basePath, action)
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
