import { createStore } from "vuex";

export default createStore({
  state: {
    alert: {
      message: "",
      visible: false,
      type: "info", // Can be 'info', 'success', 'error', or 'warning'
      actions: [], // [{ label: 'Close', type: 'secondary', handler: () => {} }]
    },
  },
  mutations: {
    showAlert(state, payload) {
      // state.alert.message = message;
      // state.alert.type = type;
      // state.alert.visible = true;

      state.alert = { ...payload, visible: true };
    },
    hideAlert(state) {
      state.alert.visible = false;
    },
  },
  actions: {
    triggerAlert({ commit }, payload) {
      commit("showAlert", payload);
      if (payload.actions == null || payload.actions.length == 0) {
        setTimeout(() => {
          commit("hideAlert");
        }, 5000); // Hide the alert after 5 seconds
      }
    },
    hideAlert({ commit }) {
      commit("hideAlert");
    },
  },
  getters: {
    alert: (state) => state.alert,
  },
});
