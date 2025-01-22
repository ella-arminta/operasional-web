<template>
    <div class="app internal">
      <Alert />
      <MenuSidebar />
      <router-view /> <!-- Loads the child routes -->
    </div>
</template>
  
<script>
  import Alert from '../components/Alert.vue';
  import MenuSidebar from '../components/MenuSidebar.vue';
  export default {
    components: {
      MenuSidebar,
      Alert,
    },
  };

</script>
  
<style scoped>
</style>
  