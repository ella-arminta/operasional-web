<template>
  <div v-if="alert.visible" class="fixed inset-0 flex items-center justify-center bg-slate-400/5 z-index">
    <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <!-- Alert Icon -->
      <div class="flex items-center mb-4">
        <div
          class="flex items-center justify-center w-12 h-12 rounded-full"
          :class="iconBackground"
        >
          <i class="text-2xl" :class="iconClass"></i>
        </div>
        <h3 class="text-lg font-semibold ml-4">{{ alert.title }}</h3>
        <button
          @click="closeAlert"
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✖
        </button>
      </div>

      <!-- Alert Message -->
      <p class="text-sm text-gray-500 mb-4">{{ alert.message }}</p>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3">
        <button
          v-for="(action, index) in alert.actions"
          :key="index"
          :class="['px-4 py-2 rounded-lg text-sm', buttonClass(action.type)]"
          @click="action.handler"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

  
  <script>
  import { mapState } from 'vuex';
  
  export default {
    name: 'Alert',
    computed: {
      ...mapState(['alert']),
      iconBackground() {
        switch (this.alert.type) {
          case "warning":
            return "bg-yellow-100 text-yellow-600";
          case "error":
            return "bg-red-100 text-red-600";
          case "success":
            return "bg-green-100 text-green-600";
          case "info":
            return "bg-blue-100 text-blue-600";
          default:
            return "bg-gray-100 text-gray-600";
        }
      },
      iconClass() {
        switch (this.alert.type) {
          case "warning":
            return "fas fa-exclamation-triangle";
          case "error":
            return "fas fa-times-circle";
          case "success":
            return "fas fa-check-circle";
          case "info":
            return "fas fa-info-circle";
          default:
            return "fas fa-bell";
        }
      },
    },
    watch: {
      alert(newAlert) {
        console.log('alert changed:', newAlert); // Memverifikasi perubahan state
      }
    },
    methods: {
      closeAlert() {
        this.$store.commit('hideAlert');
      },
      buttonClass(type) {
        switch (type) {
          case "primary":
            return "bg-green-600 text-white hover:bg-green-500";
          case "secondary":
            return "bg-gray-200 text-gray-700 hover:bg-gray-300";
          case "danger":
            return "bg-red-600 text-white hover:bg-red-500";
          default:
            return "bg-gray-200 text-gray-700 hover:bg-gray-300";
        }
      },
    },
  };
  </script>
  
  <style scoped>
.alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  border-radius: 5px;
  z-index: 999;
  min-width: 200px;
  text-align: center;
  transition: opacity 0.5s;
  border: 2px solid red; /* Tambahkan border untuk memverifikasi posisi alert */
}
  
  .alert-info {
    background-color: #d9edf7;
    color: #31708f;
  }
  
  .alert-success {
    background-color: #dff0d8;
    color: #3c763d;
  }
  
  .alert-error {
    background-color: #f2dede;
    color: #a94442;
  }
  
  .alert-warning {
    background-color: #fcf8e3;
    color: #8a6d3b;
  }
  
  .alert-content button {
    background-color: transparent;
    border: none;
    color: inherit;
    font-size: 16px;
    cursor: pointer;
  }
  .z-index {
    z-index: 9999;
  }
  </style>  