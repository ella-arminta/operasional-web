<template>
    <div class="menu" :class="{ 'small-menu': smallMenu }">
      <div class="logo">
        <img src="https://inspiraworld.com/favicon.png" alt="">
      </div>
      <MenuItem
        v-for="(item, index) in menuTree"
        :key="index"
        :data="item.children"
        :label="item.label"
        :path="item.path"
        :icon="item.icon"
        :depth="0"
        :smallMenu="smallMenu"
      />
      <i @click="smallMenu = !smallMenu" class="material-icons">menu</i>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import MenuItem from './MenuItem.vue';

// Reactive state variables
const smallMenu = ref(false);
const menuTree = ref([
  {
    label: "Home",
    icon: "home",
    path: "/home",
  },
  {
    label: "Master",
    icon: "dashboard",
    children: [
      {
        label: "Akun",
        path: "/master/akun"
      },
      {
        label: "Company",
        path: "/master/company"
      },
      {
        label: "level 2.3",
        path: "/dashboard/level-2-3"
      }
    ]
  },
  {
    label: "Settings",
    icon: "settings",
    path: "/settings"
  },
  {
    label: 'Logout',
    icon: 'logout',
    path: '/logout'
  }
]);
</script>



<style lang="scss" scoped>

.menu {
  position: relative;
  height: 100%;
  background-color: var(--bg-white);
  color: var(--pink-dark);
  width: 300px;
  padding: 0 20px;
  left: 0;
  top: 0;
  border-right: 1px solid #ececec;
  transition: all .3s ease;
  overflow: auto;
  padding-top: 20px;
  box-shadow: 0px 4px 35.2px 0px #0000001A;
  z-index: 99;
  i {
    position: absolute;
    left: 200px;
    font-size: 20px;
    top: 15px;
    user-select: none;
    cursor: pointer;
    transition: all .3s ease;
  }
  &.small-menu {
    overflow: inherit;
    width: 60px;
    padding: 0;
    padding-top: 50px;
    i {
      left: 20px;
    }
  }
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70px;
  padding-top: 20px;
  margin-bottom: 20px;
  img {
    width:auto;
    height: 100%;
    max-width: 80%;
  }
  &.small-menu{
    img {
      display: none;
    }
  }
}
</style>