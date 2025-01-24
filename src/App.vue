<script setup>
import Alert from './components/Alert.vue';

</script>

<template>
  <div class="app">
    <Alert />
    <router-view/>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

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
  --pink-orange: #C26872;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Lato', sans-serif;
}
body {
  background-color: var(--light);
}
.app {
  display: flex;
  width: 100%;
  position: relative;
  background-color: #F9F9F9;
  main {
    flex: 1 1 0;
    padding: 2rem;

    @media(max-width:768px) {
      padding-left: 6rem;
    }
  }
}
.content {
  width: 100%;
  padding: 30px 51px;
  z-index: 2;
}
.app.internal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 230px;
  background-image: url('assets/bg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
</style>