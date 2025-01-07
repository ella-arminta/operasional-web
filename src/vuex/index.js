import { createStore } from 'vuex';

export default createStore({
  state: {
    alert: {
      message: '',
      visible: false,
      type: 'info', // Can be 'info', 'success', 'error', or 'warning'
    },
  },
  mutations: {
    showAlert(state, { message, type }) {
      state.alert.message = message;
      state.alert.type = type;
      state.alert.visible = true;
    },
    hideAlert(state) {
      state.alert.visible = false;
    },
  },
  actions: {
    triggerAlert({ commit }, { message, type }) {
      commit('showAlert', { message, type });
      setTimeout(() => {
        commit('hideAlert');
      }, 5000); // Hide the alert after 5 seconds
    },
  },
  getters: {
    alert: (state) => state.alert,
  },
});
