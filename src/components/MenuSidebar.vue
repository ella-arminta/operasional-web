<template>
	<div class="menu" :class="{ 'small-menu': smallMenu }">
		<div class="logo">
			<img src="https://inspiraworld.com/favicon.png" alt="" />
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
import { computed, ref } from 'vue'
import MenuItem from './MenuItem.vue'
import { useStore } from 'vuex'

const store = useStore()
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
						label:'General Ledger',
						path:'/finance/general-ledger'
					}
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
		],
	},
	{
		label: 'Settings',
		icon: 'settings',
		children: [
			{
				label: 'Change Password',
				path: '/settings/password/change',
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
