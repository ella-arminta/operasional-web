<script setup lang="ts">
import { useStore } from 'vuex';
import PageTitle from '../components/PageTitle.vue';
import { computed } from 'vue';

const store = useStore();
const smallMenu = computed(() => store.getters.smallMenu);
</script>

<template>
  <div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
    <PageTitle />
  </div>
</template>

<style>
</style>
