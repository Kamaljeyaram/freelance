<script setup>
import { ref } from 'vue';

const alerts = ref([
  { id: 1, type: 'warning', message: 'High vibration detected on Bridge A', timestamp: '2023-07-20 10:30' },
  { id: 2, type: 'danger', message: 'Critical pressure levels at Building B', timestamp: '2023-07-20 09:15' },
]);
</script>

<template>
  <div class="alerts">
    <div class="container">
      <h1>Alert Notifications</h1>
      
      <div class="alerts-list">
        <div v-for="alert in alerts" :key="alert.id" 
             :class="['alert-card', alert.type]">
          <div class="alert-content">
            <h3>{{ alert.message }}</h3>
            <span class="timestamp">{{ alert.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerts {
  padding: 2rem 0;
}

.alert-card {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid;
}

.alert-card.warning {
  background: #fff7ed;
  border-left-color: var(--warning-color);
}

.alert-card.danger {
  background: #fef2f2;
  border-left-color: var(--danger-color);
}

.timestamp {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
