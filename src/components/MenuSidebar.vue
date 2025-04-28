<template>
	<div>

		<div v-if="isMobile" @click="toggleMobileMenu" class="mobile-menu-toggle" :class="{ 'active': showMobileMenu }">
			<i class="material-icons">{{ showMobileMenu ? 'close' : 'menu' }}</i>
		</div>


		<div v-if="isMobile && showMobileMenu" class="mobile-overlay" @click="toggleMobileMenu"></div>


		<div class="menu" :class="{
			'small-menu': smallMenu && !isMobile,
			'mobile-menu': isMobile,
			'mobile-expanded': isMobile && showMobileMenu
		}">

			<div class="store-header" :class="{ 'store-header-small': smallMenu && !isMobile }">

				<div class="store-info">
					<div class="text-xl uppercase text-pinkDark font-bold text-center">
						{{ dataStore?.code }}
					</div>
					<div class="text-sm text-gray-800 text-center italic" :class="{ 'hidden': smallMenu && !isMobile }">
						{{ dataStore?.name }}
					</div>
				</div>


				<router-link :to="'/settings/change-store'" class="material-icons text-md change-store-icon">
					change_circle
				</router-link>
			</div>


			<div v-if="!isMobile" class="toggle-button" :class="{ 'collapsed': smallMenu }" @click="toggleMenu">
				<i class="material-icons">{{ smallMenu ? 'chevron_right' : 'chevron_left' }}</i>
			</div>


			<MenuItem v-for="(item, index) in menuTree" :key="index" :data="item.children" :label="item.label"
				:path="item.path" :icon="item.icon" :depth="0" :is-mobile="isMobile" :small-menu="smallMenu" />
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import MenuItem from './MenuItem.vue'
import { useStore } from 'vuex'
import { useAuthStore } from '../vuex/auth'
import { useRoute } from 'vue-router'
import axiosInstance from '../axios'
import { decryptData } from '../utils/crypto'
import Cookies from 'js-cookie'


const emit = defineEmits(['sidebar-toggle'])

const store = useStore()
const authStore = useAuthStore()
const route = useRoute()
const smallMenu = computed(() => store.getters.smallMenu)
const isMobile = ref(false)
const showMobileMenu = ref(false)
const savedSmallMenuState = ref(false)


const initSidebarState = () => {
	const savedState = localStorage.getItem('smallMenu')
	if (savedState !== null) {
		store.commit('SET_SMALL_MENU', savedState === 'true')
	}
}

const menuTree = ref([
	{
		label: 'Home',
		icon: 'home',
		path: '/home',
	},
	{
		label: 'Master',
		icon: 'dashboard',
		children: [
			{
				label: 'Business',
				children: [
					{
						label: 'Account',
						path: '/master/account',
					},
					{
						label: 'Account Setting',
						path: '/master/page-account-setting',
					},
					{
						label: 'Company',
						path: '/master/company',
					},
					{
						label: 'Store',
						path: '/master/store',
					},
					{
						label: 'Employee',
						path: '/master/employee',
					},
				],
			},
			{
				label: 'Products',
				children: [
					{
						label: 'Category',
						path: '/master/category',
					},
					{
						label: 'Price',
						path: '/master/price',
					},
				],
			},
		],
	},
	{
		label: 'Inventory',
		icon: 'inventory',
		children: [
			{
				label: 'Product',
				path: '/inventory/product',
			},
			{
				label: 'Stock Out',
				path: '/inventory/stock-out',
			},
			{
				label: 'Stock Opname',
				path: '/inventory/stock-opname',
			},
			{
				label: 'Operation',
				path: '/inventory/operation',
			},
			{
				label: 'Check Product',
				path: '/inventory/check-product',
			},
		],
	},
	{
		label: 'Money',
		icon: 'payments',
		children: [
			{
				label: 'Miscellaneous Expenses',
				path: '/finance/mexpenses',
			},
			{
				label: 'Miscellaneous Incomes',
				path: '/finance/mincomes',
			},
			{
				label: 'Cashier Closing',
				path: '/finance/cashier-closing',
			},
			{
				label: 'Recurring Income/Expense',
				path: '/finance/recurring',
			},
			{
				label: 'Receivables & Payables',
				path: '/finance/receivable-payable',
			}
		],
	},
	{
		label: 'Transaction',
		icon: 'shopping_cart',
		children: [
			{
				label: 'Sales',
				path: '/transaction/sales',
			},
			{
				label: 'Purchase',
				path: '/transaction/purchase',
			},
			{
				label: 'Trade',
				path: '/transaction/trade',
			},
		],
	},
	{
		label: 'Report',
		icon: 'analytics',
		children: [
			{
				label: 'Finance',
				children: [
					{
						label: 'Journal',
						path: '/finance/journal',
					},
					{
						label: 'Trial Balance',
						path: '/finance/trial-balance',
					},
					{
						label: 'General Ledger',
						path: '/finance/general-ledger/detail',
					},
					{
						label: 'Profit & Loss',
						path: '/finance/profit-loss',
					},
				],
			},
			{
				label: 'Stock',
				children: [
					{
						label: 'Stock Card',
						path: '/finance/stock-card',
					},
					{
						label: 'Stock Mutation',
						path: '/finance/stock-mutation',
					},
				],
			},
		],
	},
	{
		label: 'Marketplace',
		icon: 'storefront',
		children: [
			{
				label: 'Dashboard',
				path: '/marketplace/dashboard',
			},
			{
				label: 'Voucher',
				path: '/marketplace/voucher',
			},
			{
				label: 'Bank Account',
				path: '/marketplace/bank_account',
			},
			{
				label: 'Balance',
				path: '/marketplace/balance',
			},
		],
	},
	{
		label: 'Settings',
		icon: 'settings',
		children: [
			{
				label: 'Change Password',
				path: '/settings/password-change',
			},
			{
				label: 'Change Active Store',
				path: '/settings/change-store',
			},
			{
				label: 'Role Access',
				children: [
					{
						label: 'Role',
						path: '/settings/role',
					},
					{
						label: 'User Role',
						path: '/settings/user-role',
					},
				],
			},
		],
	},
	{
		label: 'FAQ',
		icon: 'help_outline',
		path: '/faq',
	},
	{
		label: 'Logout',
		icon: 'logout',
		path: '/logout',
	},
])
const explorePath = async () => {
	const data = authStore.allowedPaths
	const paths = data.map((item) => {
		return item.path
	})
	paths.push('/home')
	paths.push('/logout')
	paths.push('/faq')
	paths.push('/marketplace/dashboard')

	menuTree.value = await filterMenu(menuTree.value, new Set(paths))
}
const dataStore = ref(null)
const getStore = async () => {
	const data = decryptData(Cookies.get('userdata'))
	try {
		await axiosInstance.get('master/store/' + data.store_id).then((res) => {
			dataStore.value = {
				code: res.data.data.code,
				name: res.data.data.name,
			}
		})
	} catch (error) {
		return null
	}
}

const filterMenu = async (menu, allowedPaths, depth = 0) => {

	const filteredItems = await Promise.all(
		menu.map(async (item) => {
			if (item.path) {
				const allowed = allowedPaths.has(item.path)
				return allowed ? item : null
			} else if (item.children) {
				const filteredChildren = await filterMenu(
					item.children,
					allowedPaths,
					depth + 1
				)

				if (filteredChildren.length > 0) {
					return { ...item, children: filteredChildren }
				} else {
					return null
				}
			}
			return null
		})
	)


	return filteredItems.filter(Boolean)
}

const toggleMenu = () => {
	store.dispatch('toggleSmallMenu')

	localStorage.setItem('smallMenu', !smallMenu.value)

	emit('sidebar-toggle', !smallMenu.value)
}

const toggleMobileMenu = () => {
	showMobileMenu.value = !showMobileMenu.value

	document.body.style.overflow = showMobileMenu.value ? 'hidden' : ''
}

const checkMobile = () => {
	const wasMobile = isMobile.value
	isMobile.value = window.innerWidth < 768


	if (!wasMobile && isMobile.value) {

		savedSmallMenuState.value = smallMenu.value
	}


	if (wasMobile && !isMobile.value) {

		if (smallMenu.value !== savedSmallMenuState.value) {
			store.commit('SET_SMALL_MENU', savedSmallMenuState.value)
		}


		if (showMobileMenu.value) {
			showMobileMenu.value = false
			document.body.style.overflow = ''
		}
	}
}


watch(route, () => {
	if (isMobile.value && showMobileMenu.value) {
		showMobileMenu.value = false
		document.body.style.overflow = ''
	}
})

watch(
	() => authStore.allowedPaths,
	() => {
		explorePath()
	}
)

onMounted(() => {
	explorePath()
	getStore()
	initSidebarState()


	checkMobile()


	window.addEventListener('resize', checkMobile)


	emit('sidebar-toggle', smallMenu.value)
})


watch(smallMenu, (newValue) => {
	emit('sidebar-toggle', newValue)
})

onBeforeUnmount(() => {

	window.removeEventListener('resize', checkMobile)

	document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
:root {
	--sidebar-width: 280px;
	--sidebar-collapsed-width: 70px;
	--transition-speed: 0.3s;
	--pink-dark: #d23f57;
}


.store-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 8px;
	margin-bottom: 20px;
	width: 100%;


	.store-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 8px;
	}


	.change-store-icon {
		color: var(--pink-dark);
		font-size: 20px;
		margin-top: 5px;
	}


	&.store-header-small {
		padding: 0 5px;
		margin-top: 5px;

		.store-info {
			margin-bottom: 5px;
		}
	}
}


.mobile-menu-toggle {
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 56px;
	height: 56px;
	border-radius: 50%;
	background-color: var(--pink-dark);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
	z-index: 1000;
	cursor: pointer;
	transition: all 0.3s ease;

	&.active {
		transform: rotate(180deg);
	}

	i {
		font-size: 24px;
	}
}


.mobile-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 90;

}


.toggle-button {
	position: absolute;
	right: 10px;
	top: 15px;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background-color: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
	z-index: 2;

	&.collapsed {
		right: 20px;

	}

	&:hover {
		background-color: #e0e0e0;
	}

	i {
		font-size: 20px;
		color: var(--pink-dark);
	}
}


.menu {
	position: fixed;

	height: 100vh;
	background-color: var(--bg-white);
	color: var(--pink-dark);
	width: var(--sidebar-width, 280px);
	padding: 0 20px;
	left: 0;
	top: 0;
	border-right: 1px solid #ececec;
	transition: all var(--transition-speed, 0.3s) ease;
	overflow-y: auto;
	overflow-x: hidden;
	padding-top: 20px;
	box-shadow: 0px 4px 35.2px 0px #0000001a;
	z-index: 100;


	&.small-menu {
		width: var(--sidebar-collapsed-width, 70px);
		min-width: var(--sidebar-collapsed-width, 70px);
		padding: 0;
		padding-top: 50px;
	}


	&.mobile-menu {
		transform: translateX(-100%);
		width: var(--sidebar-width, 280px) !important;

		padding: 0 20px;

		&.mobile-expanded {
			transform: translateX(0);
		}
	}
}


@media (max-width: 1024px) {
	.menu {
		--sidebar-width: 250px;
	}
}

@media (max-width: 768px) {
	.menu {
		width: var(--sidebar-width, 280px);
		min-width: var(--sidebar-width, 280px);
	}


	.store-header .store-info div:nth-child(2) {
		display: block !important;
	}
}

.logo {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 70px;
	padding-top: 20px;
	margin-bottom: 20px;

	img {
		width: auto;
		height: 100%;
		max-width: 80%;
	}

	&.small-menu {
		img {
			display: none;
		}
	}
}
</style>