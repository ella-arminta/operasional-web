import { defineStore } from 'pinia'
import { decryptData } from '../utils/crypto'
import Cookies from 'js-cookie'
import axiosInstance from '../axios'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		allowedPaths: [], // Stores [{ path, action }]
	}),
	getters: {
		getActionForPath: (state) => (path) => {
			const found = state.allowedPaths.filter(
				(item) => item.path === path
			)
			return found.map((item) => item.action)
		},
		canAccess: (state) => (path, requiredPermission) => {
			const action =
				state.allowedPaths.find((item) => item.path === path)?.action ||
				[]
			return action.includes(requiredPermission)
		},
	},
	actions: {
		async fetchPermissions() {
			const user = decryptData(Cookies.get('userdata'))

			const res = await axiosInstance.get('/auth/pages-available', {
				params: {
					company_id: user.company_id,
					store_id: user.store_id,
				},
			})

			// Merge actions if there are duplicate paths
			const mergedPermissions = res.data.data.reduce((acc, item) => {
				const existing = acc.find((p) => p.path === `/${item.path}`)
				if (existing) {
					existing.action = [
						...new Set([...existing.action, item.action]),
					]
				} else {
					acc.push({ path: `/${item.path}`, action: [item.action] })
				}
				return acc
			}, [])

			this.allowedPaths = mergedPermissions
		},

		reset() {
			this.allowedPaths = []
		},
	},
	persist: {
		enabled: true, // Enables persistence
		strategies: [
			{
				key: 'auth', // LocalStorage key
				storage: localStorage, // You can use sessionStorage if needed
			},
		],
	},
})
