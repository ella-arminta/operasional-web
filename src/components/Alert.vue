<template>
    <div v-if="alert.visible" class="alert" :class="alertType">
      <div class="alert-content">
        <p>{{ alert.message }}</p>
        <button @click="closeAlert">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex';
  
  export default {
    name: 'Alert',
    computed: {
      ...mapState(['alert']),
      alertType() {
        return `alert-${this.alert.type}`;
      },
    },
    methods: {
      closeAlert() {
        this.$store.commit('hideAlert');
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
  </style>  