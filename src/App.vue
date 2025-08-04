<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="app-wrapper">
    <Navbar />
    <router-view></router-view>
  </div>
</template>

<style>
.app-wrapper {
  min-height: 100vh;
  background-color: var(--background-light);
}
</style>
