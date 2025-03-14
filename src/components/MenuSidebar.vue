<template>
	<div class="menu" :class="{ 'small-menu': smallMenu }">
		<div class="flex items-center gap-3 px-4">
			<div class="flex flex-col items-start mt-8 mb-10">
				<div
					class="text-xl uppercase text-pinkDark font-bold text-start flex items-center"
					:class="{ hidden: smallMenu }"
				>
					{{ dataStore?.code }}
				</div>
				<div
					class="text-sm text-gray-800 text-start italic"
					:class="{ hidden: smallMenu }"
				>
					{{ dataStore?.name }}
				</div>
			</div>
			<router-link
				:to="'/settings/change-store'"
				class="material-icons text-md"
				>change_circle</router-link
			>
		</div>
		<MenuItem
			v-for="(item, index) in menuTree"
			:key="index"
			:data="item.children"
			:label="item.label"
			:path="item.path"
			:icon="item.icon"
			:depth="0"
		/>
		<i @click="store.dispatch('toggleSmallMenu')" class="material-icons"
			>menu</i
		>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MenuItem from './MenuItem.vue'
import { useStore } from 'vuex'
import { useAuthStore } from '../vuex/auth'
import axiosInstance from '../axios'
import { decryptData } from '../utils/crypto'
import Cookies from 'js-cookie'

const store = useStore()
const authStore = useAuthStore()
const smallMenu = computed(() => store.getters.smallMenu)

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
						path: '/master/account-setting',
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
				label: 'Operation',
				path: '/inventory/operation',
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
	// reduce data
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
	// Process all items asynchronously
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

	// ✅ Now filter out null values AFTER awaiting all Promises
	return filteredItems.filter(Boolean)
}

watch(
	() => authStore.allowedPaths,
	() => {
		explorePath()
	}
)

onMounted(() => {
	explorePath()
	getStore()
})
</script>

<style lang="scss" scoped>
.menu {
	position: relative;
	height: 100%;
	background-color: var(--bg-white);
	color: var(--pink-dark);
	min-width: 15%;
	// width: 15%;
	padding: 0 20px;
	left: 0;
	top: 0;
	border-right: 1px solid #ececec;
	transition: all 0.3s ease;
	overflow: auto;
	padding-top: 20px;
	box-shadow: 0px 4px 35.2px 0px #0000001a;
	z-index: 99;

	i {
		position: absolute;
		left: 80%;
		font-size: 20px;
		top: 15px;
		user-select: none;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	&.small-menu {
		overflow: inherit;
		min-width: 60px;
		width: 60px;
		padding: 0;
		padding-top: 50px;

		i {
			left: 20px;
		}
	}
}

// Small devices
@media (max-width: 47rem) {
	.menu {
		position: fixed;
		width: 60%;

		&.small-menu {
			position: relative;
		}
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
