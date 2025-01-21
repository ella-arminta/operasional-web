<template>
    <div>
      <p>Logging you out...</p>
    </div>
  </template>
  
  <script>
  import Cookies from 'js-cookie';
  
  export default {
    name: 'Logout',
    mounted() {
      Cookies.remove('userdata');
      Cookies.remove('token');
      this.$router.push('/');
    }
  }
  </script>
  