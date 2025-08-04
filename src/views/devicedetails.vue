<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

const route = useRoute();
const router = useRouter();
const deviceId = computed(() => parseInt(route.params.id));
const device = ref(null);
const isLoading = ref(true);
const timeRange = ref('24h');
const realtimeMode = ref(false);
const charts = ref({
  vibration: null,
  pressure: null,
  inclination: null
});
const realtimeUpdateInterval = ref(null);

// Monitoring data - this would come from API in real app
const monitoringData = {
  vibration: {
    '24h': generateTimeSeriesData(24, 0.2, 0.8),
    '7d': generateTimeSeriesData(7, 0.2, 0.8, 'days'),
    '30d': generateTimeSeriesData(30, 0.2, 0.8, 'days'),
    'realtime': generateTimeSeriesData(20, 0.2, 0.8, 'minutes')
  },
  pressure: {
    '24h': generateTimeSeriesData(24, 95, 100),
    '7d': generateTimeSeriesData(7, 95, 100, 'days'),
    '30d': generateTimeSeriesData(30, 95, 100, 'days'),
    'realtime': generateTimeSeriesData(20, 95, 100, 'minutes')
  },
  inclination: {
    '24h': generateTimeSeriesData(24, 0, 1),
    '7d': generateTimeSeriesData(7, 0, 1, 'days'),
    '30d': generateTimeSeriesData(30, 0, 1, 'days'),
    'realtime': generateTimeSeriesData(20, 0, 1, 'minutes')
  }
};

// Live readings with reactive data
const liveReadings = ref({
  vibration: 0.5,
  pressure: 98.2,
  inclination: 0.3,
  status: {
    vibration: 'normal',
    pressure: 'normal',
    inclination: 'normal'
  }
});

// Device information - this would come from API in real app
const mockDevices = [
  { 
    id: 1, 
    name: 'Anna Nagar Bridge Sensor', 
    type: 'Vibration Sensor',
    location: 'Anna Nagar Bridge',
    status: 'active',
    model: 'SM-VS2000',
    serialNumber: 'VS2000-12345',
    installDate: '2023-01-15',
    lastMaintenance: '2023-06-20',
    firmware: 'v2.1.4',
    lat: 13.0827, 
    lng: 80.2707, 
    vibration: 0.5, 
    pressure: 98.2, 
    inclination: 0.3,
    batteryLevel: 89,
    signalStrength: 95,
    thresholds: {
      vibration: { min: 0.1, max: 0.9, warning: 0.7 },
      pressure: { min: 95, max: 101, warning: 100 },
      inclination: { min: 0, max: 1.2, warning: 0.8 }
    },
    lastUpdated: '2023-07-20T10:30:00'
  },
  { 
    id: 2, 
    name: 'Building B Sensor 1', 
    type: 'Pressure Sensor',
    location: 'Building B',
    status: 'warning',
    model: 'SM-PS1500',
    serialNumber: 'PS1500-67890',
    installDate: '2023-02-20',
    lastMaintenance: '2023-06-15',
    firmware: 'v1.8.2',
    lat: 51.51, 
    lng: -0.1, 
    vibration: 0.3, 
    pressure: 99.1, 
    inclination: 0.1,
    batteryLevel: 45,
    signalStrength: 78,
    lastUpdated: '2023-07-20T11:15:00'
  },
  { 
    id: 3, 
    name: 'Building B Sensor 2', 
    type: 'Inclination Sensor',
    location: 'Building B',
    status: 'inactive',
    model: 'SM-IS1000',
    serialNumber: 'IS1000-54321',
    installDate: '2023-02-20',
    lastMaintenance: '2023-05-10',
    firmware: 'v1.4.6',
    lat: 51.509, 
    lng: -0.11, 
    vibration: 0.2, 
    pressure: 97.5, 
    inclination: 0.5,
    batteryLevel: 12,
    signalStrength: 32,
    lastUpdated: '2023-07-19T09:45:00'
  },
  { 
    id: 4, 
    name: 'Tower C Sensor', 
    type: 'Vibration Sensor',
    location: 'Tower C',
    status: 'active',
    model: 'SM-VS2000',
    serialNumber: 'VS2000-24680',
    installDate: '2023-03-05',
    lastMaintenance: '2023-06-25',
    firmware: 'v2.1.4',
    lat: 51.515, 
    lng: -0.08, 
    vibration: 0.6, 
    pressure: 96.8, 
    inclination: 0.2,
    batteryLevel: 76,
    signalStrength: 89,
    lastUpdated: '2023-07-20T12:05:00'
  },
];

// Helper function to generate time series data
function generateTimeSeriesData(count, min, max, unit = 'hours') {
  const data = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    if (unit === 'hours') {
      date.setHours(date.getHours() - i);
    } else if (unit === 'days') {
      date.setDate(date.getDate() - i);
    } else if (unit === 'minutes') {
      date.setMinutes(date.getMinutes() - i);
    }
    
    const value = min + Math.random() * (max - min);
    data.push({
      time: date.toISOString(),
      value: parseFloat(value.toFixed(2))
    });
  }
  
  return data;
}

// Format time label based on time range
function formatTimeLabel(timeString, range) {
  const date = new Date(timeString);
  
  if (range === '24h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (range === '7d' || range === '30d') {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else if (range === 'realtime') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  
  return timeString;
}

// Generate a new data point within a reasonable range of the last value
function generateNewDataPoint(lastValue, min, max, variability = 0.2) {
  // Calculate range for the new value to stay within bounds
  const range = (max - min) * variability;
  
  // Calculate random change within the variability range
  const change = (Math.random() * range * 2) - range;
  
  // Calculate new value and ensure it stays within bounds
  let newValue = lastValue + change;
  newValue = Math.max(min, Math.min(max, newValue));
  
  return parseFloat(newValue.toFixed(2));
}

// Check if value exceeds warning threshold
function checkStatus(value, type) {
  if (!device.value || !device.value.thresholds) return 'normal';
  
  const threshold = device.value.thresholds[type];
  if (!threshold) return 'normal';
  
  if (value > threshold.warning) return 'warning';
  if (value < threshold.min || value > threshold.max) return 'danger';
  return 'normal';
}

// Add a new data point to realtime series
function addRealtimeDataPoint() {
  const now = new Date();
  
  // Update vibration data
  const lastVibration = monitoringData.vibration.realtime[monitoringData.vibration.realtime.length - 1].value;
  const newVibration = generateNewDataPoint(lastVibration, 0.2, 0.8);
  monitoringData.vibration.realtime.shift();
  monitoringData.vibration.realtime.push({ time: now.toISOString(), value: newVibration });
  
  // Update pressure data
  const lastPressure = monitoringData.pressure.realtime[monitoringData.pressure.realtime.length - 1].value;
  const newPressure = generateNewDataPoint(lastPressure, 95, 100);
  monitoringData.pressure.realtime.shift();
  monitoringData.pressure.realtime.push({ time: now.toISOString(), value: newPressure });
  
  // Update inclination data
  const lastInclination = monitoringData.inclination.realtime[monitoringData.inclination.realtime.length - 1].value;
  const newInclination = generateNewDataPoint(lastInclination, 0, 1);
  monitoringData.inclination.realtime.shift();
  monitoringData.inclination.realtime.push({ time: now.toISOString(), value: newInclination });
  
  // Update live readings
  liveReadings.value = {
    vibration: newVibration,
    pressure: newPressure,
    inclination: newInclination,
    status: {
      vibration: checkStatus(newVibration, 'vibration'),
      pressure: checkStatus(newPressure, 'pressure'),
      inclination: checkStatus(newInclination, 'inclination')
    }
  };
  
  // Update charts if in realtime mode
  if (realtimeMode.value && charts.value.vibration) {
    updateCharts('realtime');
  }
}

// Load device data
onMounted(async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find device by ID
    const foundDevice = mockDevices.find(d => d.id === deviceId.value);
    
    if (!foundDevice) {
      router.push('/dashboard');
      return;
    }
    
    device.value = foundDevice;
    isLoading.value = false;
    
    // Initialize charts after device data is loaded
    nextTick(() => {
      initCharts();
      
      // Start generating real-time data for live readings
      setInterval(() => {
        addRealtimeDataPoint();
      }, 2000);
    });
  } catch (error) {
    console.error('Failed to load device data:', error);
    isLoading.value = false;
  }
});

// Initialize charts
function initCharts() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    animation: {
      duration: realtimeMode.value ? 0 : 1000,
    }
  };

  // Vibration Chart
  const vibrationData = monitoringData.vibration[timeRange.value];
  charts.value.vibration = new Chart(document.getElementById('vibrationChart'), {
    type: 'line',
    data: {
      labels: vibrationData.map(d => formatTimeLabel(d.time, timeRange.value)),
      datasets: [{
        label: 'Vibration (Hz)',
        data: vibrationData.map(d => d.value),
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options
  });
  
  // Pressure Chart
  const pressureData = monitoringData.pressure[timeRange.value];
  charts.value.pressure = new Chart(document.getElementById('pressureChart'), {
    type: 'line',
    data: {
      labels: pressureData.map(d => formatTimeLabel(d.time, timeRange.value)),
      datasets: [{
        label: 'Pressure (kPa)',
        data: pressureData.map(d => d.value),
        borderColor: '#4cc9f0',
        backgroundColor: 'rgba(76, 201, 240, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options
  });
  
  // Inclination Chart
  const inclinationData = monitoringData.inclination[timeRange.value];
  charts.value.inclination = new Chart(document.getElementById('inclinationChart'), {
    type: 'line',
    data: {
      labels: inclinationData.map(d => formatTimeLabel(d.time, timeRange.value)),
      datasets: [{
        label: 'Inclination (°)',
        data: inclinationData.map(d => d.value),
        borderColor: '#f72585',
        backgroundColor: 'rgba(247, 37, 133, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options
  });
}

// Update charts when time range changes
function updateCharts(range) {
  if (!charts.value.vibration) return;
  
  const vibrationData = monitoringData.vibration[range];
  charts.value.vibration.data.labels = vibrationData.map(d => formatTimeLabel(d.time, range));
  charts.value.vibration.data.datasets[0].data = vibrationData.map(d => d.value);
  charts.value.vibration.update();
  
  const pressureData = monitoringData.pressure[range];
  charts.value.pressure.data.labels = pressureData.map(d => formatTimeLabel(d.time, range));
  charts.value.pressure.data.datasets[0].data = pressureData.map(d => d.value);
  charts.value.pressure.update();
  
  const inclinationData = monitoringData.inclination[range];
  charts.value.inclination.data.labels = inclinationData.map(d => formatTimeLabel(d.time, range));
  charts.value.inclination.data.datasets[0].data = inclinationData.map(d => d.value);
  charts.value.inclination.update();
}

// Update time range and update charts
function updateTimeRange(range) {
  timeRange.value = range;
  realtimeMode.value = (range === 'realtime');
  
  // Update animation duration based on mode
  if (charts.value.vibration) {
    charts.value.vibration.options.animation.duration = realtimeMode.value ? 0 : 1000;
    charts.value.pressure.options.animation.duration = realtimeMode.value ? 0 : 1000;
    charts.value.inclination.options.animation.duration = realtimeMode.value ? 0 : 1000;
  }
  
  updateCharts(range);
}

function getStatusClass(status) {
  switch (status) {
    case 'active': return 'status-active';
    case 'warning': return 'status-warning';
    case 'inactive': return 'status-inactive';
    case 'normal': return 'status-active';
    case 'danger': return 'status-inactive';
    default: return '';
  }
}

function formatLastUpdated(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Navigate back to dashboard
function goBack() {
  router.push('/dashboard');
}

// Clean up interval on component unmount
onUnmounted(() => {
  if (realtimeUpdateInterval.value) {
    clearInterval(realtimeUpdateInterval.value);
  }
});
</script>

<template>
  <div class="device-details">
    <div class="container">
      <div class="loading-container" v-if="isLoading">
        <div class="loader"></div>
        <p>Loading device data...</p>
      </div>

      <div v-else class="details-content">
        <!-- Device Header -->
        <div class="details-header">
          <div class="back-button" @click="goBack">
            <i class="fas fa-arrow-left"></i>
          </div>
          
          <div class="device-title">
            <h1>{{ device.name }}</h1>
            <div class="device-meta">
              <span class="location"><i class="fas fa-map-marker-alt"></i> {{ device.location }}</span>
              <span class="device-type"><i class="fas fa-microchip"></i> {{ device.type }}</span>
              <div :class="['device-status', getStatusClass(device.status)]">
                <i class="fas fa-circle"></i>
                <span>{{ device.status }}</span>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <button class="btn btn-outline">
              <i class="fas fa-cog"></i> Configure
            </button>
          </div>
        </div>

        <!-- Live Readings Section -->
        <div class="section">
          <h2 class="section-title">Live Readings</h2>
          <div class="live-readings">
            <div class="reading-card">
              <div class="reading-icon vibration">
                <i class="fas fa-wave-square"></i>
              </div>
              <div class="reading-details">
                <h3>Vibration</h3>
                <div class="reading-value">{{ liveReadings.vibration }} <span>Hz</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.vibration)]">
                  {{ liveReadings.status.vibration }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon pressure">
                <i class="fas fa-tachometer-alt"></i>
              </div>
              <div class="reading-details">
                <h3>Pressure</h3>
                <div class="reading-value">{{ liveReadings.pressure }} <span>kPa</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.pressure)]">
                  {{ liveReadings.status.pressure }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon inclination">
                <i class="fas fa-ruler-vertical"></i>
              </div>
              <div class="reading-details">
                <h3>Inclination</h3>
                <div class="reading-value">{{ liveReadings.inclination }} <span>°</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.inclination)]">
                  {{ liveReadings.status.inclination }}
                </div>
              </div>
            </div>
            
            <div class="reading-card status-card">
              <div class="device-info">
                <div class="info-item">
                  <i class="fas fa-battery-three-quarters"></i>
                  <span>Battery: {{ device.batteryLevel }}%</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-signal"></i>
                  <span>Signal: {{ device.signalStrength }}%</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-clock"></i>
                  <span>Last Update: {{ new Date().toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Series Data Section -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Historical Data</h2>
            <div class="time-range-selector">
              <button :class="{ active: timeRange === 'realtime' }" @click="updateTimeRange('realtime')">Live</button>
              <button :class="{ active: timeRange === '24h' }" @click="updateTimeRange('24h')">24h</button>
              <button :class="{ active: timeRange === '7d' }" @click="updateTimeRange('7d')">7d</button>
              <button :class="{ active: timeRange === '30d' }" @click="updateTimeRange('30d')">30d</button>
            </div>
          </div>
          
          <div class="chart-wrapper">
            <div class="chart-tabs">
              <div class="chart-tab" :class="{ active: charts.activeTab === 'all' }" @click="charts.activeTab = 'all'">All Data</div>
              <div class="chart-tab" :class="{ active: charts.activeTab === 'vibration' }" @click="charts.activeTab = 'vibration'">Vibration</div>
              <div class="chart-tab" :class="{ active: charts.activeTab === 'pressure' }" @click="charts.activeTab = 'pressure'">Pressure</div>
              <div class="chart-tab" :class="{ active: charts.activeTab === 'inclination' }" @click="charts.activeTab = 'inclination'">Inclination</div>
            </div>
            
            <div class="charts-grid" :class="{ 'realtime': realtimeMode }">
              <div class="chart-card" :class="{ 'full-width': charts.activeTab === 'vibration' || charts.activeTab === 'all' }">
                <div class="chart-header">
                  <h3>Vibration Over Time</h3>
                  <div class="pulse-indicator" v-if="realtimeMode"></div>
                </div>
                <div class="chart-container">
                  <canvas id="vibrationChart"></canvas>
                </div>
              </div>
              
              <div class="chart-card" :class="{ 'full-width': charts.activeTab === 'pressure' || charts.activeTab === 'all' }">
                <div class="chart-header">
                  <h3>Pressure Over Time</h3>
                  <div class="pulse-indicator" v-if="realtimeMode"></div>
                </div>
                <div class="chart-container">
                  <canvas id="pressureChart"></canvas>
                </div>
              </div>
              
              <div class="chart-card" :class="{ 'full-width': charts.activeTab === 'inclination' || charts.activeTab === 'all' }">
                <div class="chart-header">
                  <h3>Inclination Over Time</h3>
                  <div class="pulse-indicator" v-if="realtimeMode"></div>
                </div>
                <div class="chart-container">
                  <canvas id="inclinationChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Information Section -->
        <div class="section">
          <h2 class="section-title">Device Information</h2>
          <div class="device-info-grid">
            <div class="info-group">
              <h3>Hardware Details</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Model</span>
                  <span class="info-value">{{ device.model }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Serial Number</span>
                  <span class="info-value">{{ device.serialNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Firmware</span>
                  <span class="info-value">{{ device.firmware }}</span>
                </div>
              </div>
            </div>
            
            <div class="info-group">
              <h3>Installation</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Installation Date</span>
                  <span class="info-value">{{ device.installDate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Maintenance</span>
                  <span class="info-value">{{ device.lastMaintenance }}</span>
                </div>
              </div>
            </div>
            
            <div class="info-group">
              <h3>Location</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Latitude</span>
                  <span class="info-value">{{ device.lat }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Longitude</span>
                  <span class="info-value">{{ device.lng }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-details {
  padding: 2rem 0;
  background-color: var(--background-dark);
  min-height: 100vh;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.details-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--box-shadow);
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: var(--primary-color);
  color: white;
}

.device-title {
  flex: 1;
}

.device-title h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.device-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.device-meta i {
  margin-right: 0.5rem;
}

.device-status {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 30px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.header-actions {
  margin-left: auto;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--box-shadow);
}

.section-title {
  margin-top: 0;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.live-readings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.reading-card {
  background: var(--background-dark);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
}

.reading-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.vibration {
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.pressure {
  background: rgba(76, 201, 240, 0.1);
  color: #4cc9f0;
}

.inclination {
  background: rgba(247, 37, 133, 0.1);
  color: #f72585;
}

.reading-details {
  flex: 1;
}

.reading-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--text-secondary);
}

.reading-value {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  animation: pulse-text 2s infinite;
}

@keyframes pulse-text {
  0% { opacity: 1; }
  50% { opacity: 0.85; }
  100% { opacity: 1; }
}

.reading-value span {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.reading-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.reading-status.normal {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.reading-status.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.reading-status.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.status-card {
  grid-column: span 3;
}

.device-info {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.info-item i {
  margin-right: 0.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.time-range-selector {
  display: flex;
  background: var(--background-dark);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-range-selector button {
  border: none;
  background: transparent;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.time-range-selector button.active {
  background: var(--primary-color);
  color: white;
}

.time-range-selector button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background-color: white;
  border-radius: 3px;
}

.time-range-selector button:first-child {
  color: #f72585;
  font-weight: 600;
}

.time-range-selector button:first-child.active {
  background: #f72585;
  color: white;
}

.chart-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1.5rem;
}

.chart-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.chart-tab {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  color: var(--text-secondary);
}

.chart-tab.active {
  color: var(--primary-color);
}

.chart-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

.charts-grid.realtime .chart-card {
  border: 2px solid #f72585;
  box-shadow: 0 0 15px rgba(247, 37, 133, 0.2);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.pulse-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #f72585;
  position: relative;
}

.pulse-indicator::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f72585;
  opacity: 0.7;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.device-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-group h3 {
  margin-top: 0;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  font-weight: 500;
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-card:nth-child(3) {
    grid-column: span 2;
  }
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .chart-card:nth-child(3) {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
  
  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .status-card {
    grid-column: span 1;
  }
  
  .device-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
