<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const dateRange = ref('week');
const selectedLocation = ref('all');

const mockData = {
  vibration: [0.3, 0.4, 0.5, 0.3, 0.6, 0.4, 0.3],
  pressure: [98, 97, 99, 98, 97, 96, 98],
  force: [100, 110, 95, 105, 115, 108, 102]
};

onMounted(() => {
  const ctx = document.getElementById('trendsChart');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Vibration (Hz)',
          data: mockData.vibration,
          borderColor: '#4361ee',
          tension: 0.4
        },
        {
          label: 'Pressure (kPa)',
          data: mockData.pressure,
          borderColor: '#4cc9f0',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
});

function exportData() {
  // Implement export functionality
  console.log('Exporting data...');
}
</script>

<template>
  <div class="reports">
    <div class="container">
      <div class="reports-header">
        <h1>Reports & Analytics</h1>
        <button @click="exportData" class="btn-export">Export Data</button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Date Range</label>
          <select v-model="dateRange">
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Location</label>
          <select v-model="selectedLocation">
            <option value="all">All Locations</option>
            <option value="bridge-a">Bridge A</option>
            <option value="building-b">Building B</option>
          </select>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="trendsChart"></canvas>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Average Vibration</h3>
          <p class="stat-value">0.42 Hz</p>
        </div>
        <div class="stat-card">
          <h3>Average Pressure</h3>
          <p class="stat-value">97.5 kPa</p>
        </div>
        <div class="stat-card">
          <h3>Peak Force</h3>
          <p class="stat-value">115 N</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports {
  padding: 2rem 0;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-width: 150px;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-top: 0.5rem;
}

.btn-export {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
</style>
