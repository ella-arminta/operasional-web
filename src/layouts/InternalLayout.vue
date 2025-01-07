<template>
    <div class="app">
      <MenuSidebar />
      <router-view /> <!-- Loads the child routes -->
    </div>
</template>
  
<script>
  import MenuSidebar from '../components/MenuSidebar.vue';
  export default {
    components: {
      MenuSidebar,
    },
  };

</script>
  
<style scoped>
</style>
  