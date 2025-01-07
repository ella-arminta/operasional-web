<script setup>
</script>

<template>
  <div class="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
:root {
  --primary: #42b983;
  --secondary: #35495e;
  --tertiary: #41b883;
  --grey: #64748b;
  --dark: #1e293b;
  --white: #fff;
  --sidebar-width: 300px;
  --light: #f5f5f5;
  --pink-dark: #C58189;
  --pink-med:#D19499;
  --pink-light: #F0BAB3;
  --bg-white: #F9F9F9;
  --pink-gray: #FAF1EC;
  
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}
body {
  background-color: var(--light);
}
.app {
  display: flex;
  main {
    flex: 1 1 0;
    padding: 2rem;

    @media(max-width:768px) {
      padding-left: 6rem;
    }
  }
}
</style>