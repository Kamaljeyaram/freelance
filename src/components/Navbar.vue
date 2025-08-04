<script setup>
import { ref } from 'vue';
const isLoggedIn = ref(false); // This should be managed by your auth state

function logout() {
  // Implement logout logic
}
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="brand">StructureMonitor</router-link>
      <div class="nav-links">
        <router-link to="/" exact>Home</router-link>
        <template v-if="isLoggedIn">
          <router-link to="/dashboard">Dashboard</router-link>
          <router-link to="/alerts">Alerts</router-link>
          <router-link to="/reports">Reports</router-link>
          <button @click="logout" class="btn-logout">Logout</button>
        </template>
        <router-link v-else to="/login">Login</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: var(--text-primary);
  text-decoration: none;
}

.btn-logout {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
}
</style>
