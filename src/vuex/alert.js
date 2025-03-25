import { createStore } from 'vuex'

export default createStore({
	state: {
		alert: {
			message: '',
			visible: false,
			type: 'info', // Can be 'info', 'success', 'error', or 'warning'
			actions: [], // [{ label: 'Close', type: 'secondary', handler: () => {} }]
			inputs: [], // Array untuk menyimpan input yang dibutuhkan
		},
		smallMenu: false,
	},
	mutations: {
		showAlert(state, payload) {
			state.alert = { ...payload, visible: true }
		},
		hideAlert(state) {
			state.alert.visible = false
		},
		toggleSmallMenu(state) {
			state.smallMenu = !state.smallMenu // Toggle the state
		},
	},
	actions: {
		triggerAlert({ commit }, payload) {
			commit('showAlert', payload)
			if (payload.actions == null || payload.actions.length == 0) {
				setTimeout(() => {
					commit('hideAlert')
				}, 5000) // Hide the alert after 5 seconds
			}
		},
		// Function to trigger a Yes/No confirmation and return the result
		triggerConfirm({ commit }, payload) {
			return new Promise((resolve) => {
				commit('showAlert', {
					...payload,
					type: 'question',
					actions: [
						{
							label: 'Yes',
							type: 'primary',
							handler: () => {
								resolve(true)
								commit('hideAlert')
							},
						},
						{
							label: 'No',
							type: 'secondary',
							handler: () => {
								resolve(false)
								commit('hideAlert')
							},
						},
					],
					resolve,
				})
			})
		},
		hideAlert({ commit }) {
			commit('hideAlert')
		},
		toggleSmallMenu({ commit }) {
			commit('toggleSmallMenu') // Commit the toggle mutation
		},
	},
	getters: {
		alert: (state) => state.alert,
		smallMenu(state) {
			return state.smallMenu // Getter for smallMenu state
		},
	},
})
