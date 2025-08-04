<script setup>
import { onMounted, ref, computed, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const router = useRouter();
const viewMode = ref('map');
const searchQuery = ref('');
const statusFilter = ref('all');
const isLoading = ref(true);

// Mock device data with Chennai coordinates
const devices = ref([
  { 
    id: 1, 
    name: 'Anna Nagar Bridge Sensor', 
    type: 'Vibration Sensor',
    location: 'Anna Nagar Bridge',
    status: 'active',
    lat: 13.0827, 
    lng: 80.2707, 
    vibration: 0.5, 
    pressure: 98.2, 
    inclination: 0.3,
    batteryLevel: 89,
    lastUpdated: '2023-07-20T10:30:00'
  },
  { 
    id: 2, 
    name: 'T Nagar Building Sensor', 
    type: 'Pressure Sensor',
    location: 'T Nagar Complex',
    status: 'warning',
    lat: 13.0418, 
    lng: 80.2341, 
    vibration: 0.3, 
    pressure: 99.1, 
    inclination: 0.1,
    batteryLevel: 45,
    lastUpdated: '2023-07-20T11:15:00'
  },
  { 
    id: 3, 
    name: 'Marina Beach Sensor', 
    type: 'Inclination Sensor',
    location: 'Marina Beach Tower',
    status: 'inactive',
    lat: 13.0500, 
    lng: 80.2824, 
    vibration: 0.2, 
    pressure: 97.5, 
    inclination: 0.5,
    batteryLevel: 12,
    lastUpdated: '2023-07-19T09:45:00'
  },
  { 
    id: 4, 
    name: 'Chennai Port Sensor', 
    type: 'Vibration Sensor',
    location: 'Chennai Port',
    status: 'active',
    lat: 13.1056, 
    lng: 80.2931, 
    vibration: 0.6, 
    pressure: 96.8, 
    inclination: 0.2,
    batteryLevel: 76,
    lastUpdated: '2023-07-20T12:05:00'
  },
  { 
    id: 5, 
    name: 'Velachery Bridge Sensor', 
    type: 'Vibration Sensor',
    location: 'Velachery Bridge',
    status: 'active',
    lat: 12.9816, 
    lng: 80.2181, 
    vibration: 0.4, 
    pressure: 97.9, 
    inclination: 0.2,
    batteryLevel: 92,
    lastUpdated: '2023-07-20T14:25:00'
  },
  { 
    id: 6, 
    name: 'Chennai Central Station', 
    type: 'Pressure Sensor',
    location: 'Central Railway Station',
    status: 'active',
    lat: 13.0827, 
    lng: 80.2755, 
    vibration: 0.7, 
    pressure: 98.5, 
    inclination: 0.1,
    batteryLevel: 85,
    lastUpdated: '2023-07-20T13:15:00'
  },
  { 
    id: 7, 
    name: 'Adyar River Bridge', 
    type: 'Inclination Sensor',
    location: 'Adyar River Crossing',
    status: 'warning',
    lat: 13.0136, 
    lng: 80.2629, 
    vibration: 0.6, 
    pressure: 97.2, 
    inclination: 0.8,
    batteryLevel: 38,
    lastUpdated: '2023-07-20T09:45:00'
  },
  { 
    id: 8, 
    name: 'Guindy Flyover Sensor', 
    type: 'Vibration Sensor',
    location: 'Guindy Flyover',
    status: 'active',
    lat: 13.0067, 
    lng: 80.2206, 
    vibration: 0.3, 
    pressure: 98.1, 
    inclination: 0.2,
    batteryLevel: 67,
    lastUpdated: '2023-07-20T11:35:00'
  },
  { 
    id: 9, 
    name: 'Santhome Bridge', 
    type: 'Pressure Sensor',
    location: 'Santhome High Road',
    status: 'inactive',
    lat: 13.0336, 
    lng: 80.2770, 
    vibration: 0.1, 
    pressure: 96.5, 
    inclination: 0.4,
    batteryLevel: 5,
    lastUpdated: '2023-07-19T16:20:00'
  },
  { 
    id: 10, 
    name: 'IIT Madras Structure', 
    type: 'Inclination Sensor',
    location: 'IIT Campus',
    status: 'active',
    lat: 12.9941, 
    lng: 80.2359, 
    vibration: 0.2, 
    pressure: 98.8, 
    inclination: 0.1,
    batteryLevel: 91,
    lastUpdated: '2023-07-20T15:10:00'
  },
  { 
    id: 11, 
    name: 'Koyambedu Market Tower', 
    type: 'Vibration Sensor',
    location: 'Koyambedu Market Complex',
    status: 'warning',
    lat: 13.0723, 
    lng: 80.1942, 
    vibration: 0.9, 
    pressure: 97.8, 
    inclination: 0.3,
    batteryLevel: 42,
    lastUpdated: '2023-07-20T12:40:00'
  },
  { 
    id: 12, 
    name: 'Mylapore Temple Structure', 
    type: 'Inclination Sensor',
    location: 'Mylapore Temple',
    status: 'active',
    lat: 13.0369, 
    lng: 80.2676, 
    vibration: 0.1, 
    pressure: 98.3, 
    inclination: 0.2,
    batteryLevel: 83,
    lastUpdated: '2023-07-20T14:55:00'
  }
]);

let map = null;
let markers = {};

// Filtered devices based on search and filter
const filteredDevices = computed(() => {
  return devices.value.filter(device => {
    // Apply status filter
    if (statusFilter.value !== 'all' && device.status !== statusFilter.value) {
      return false;
    }
    
    // Apply search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return device.name.toLowerCase().includes(query) || 
             device.location.toLowerCase().includes(query) ||
             device.type.toLowerCase().includes(query);
    }
    
    return true;
  });
});

function getStatusClass(status) {
  switch (status) {
    case 'active': return 'status-active';
    case 'warning': return 'status-warning';
    case 'inactive': return 'status-inactive';
    default: return '';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'active': return 'fa-check-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'inactive': return 'fa-times-circle';
    default: return 'fa-question-circle';
  }
}

function viewDeviceDetails(deviceId) {
  router.push(`/device/${deviceId}`);
}

function formatLastUpdated(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Initialize map
onMounted(async () => {
  try {
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000));
    isLoading.value = false;
    
    // Initialize map if in map view
    if (viewMode.value === 'map') {
      setTimeout(() => {
        initMap();
      }, 100);
    }
  } catch (error) {
    console.error("Error initializing map:", error);
    isLoading.value = false;
  }
});

// Watch for view mode changes to initialize map when needed
watch(viewMode, (newValue) => {
  if (newValue === 'map' && !isLoading.value) {
    // Use nextTick to ensure DOM is updated before initializing map
    nextTick(() => {
      initMap();
    });
  }
});

// Watch for search query and status filter changes to update map markers
watch([searchQuery, statusFilter], () => {
  if (viewMode.value === 'map' && map) {
    updateMapMarkers();
  }
});

// Function to update map markers based on filtered devices
function updateMapMarkers() {
  try {
    // Clear existing markers
    Object.values(markers).forEach(marker => {
      marker.remove();
    });
    markers = {};
    
    // Add markers for filtered devices
    filteredDevices.value.forEach(device => {
      const markerIcon = L.divIcon({
        html: `<div class="marker-icon ${getStatusClass(device.status)}"><i class="fas ${getStatusIcon(device.status)}"></i></div>`,
        className: 'custom-marker',
        iconSize: [30, 30]
      });
      
      // Create a marker with a modern popup design
      const marker = L.marker([device.lat, device.lng], { icon: markerIcon })
        .bindPopup(`
          <div class="modern-popup">
            <div class="popup-header ${getStatusClass(device.status)}">
              <h3>${device.name}</h3>
              <span class="popup-badge">${device.status}</span>
            </div>
            <div class="popup-body">
              <div class="popup-info">
                <div class="info-row">
                  <i class="fas ${device.type.includes('Vibration') ? 'fa-wave-square' : 
                    device.type.includes('Pressure') ? 'fa-tachometer-alt' : 'fa-ruler-vertical'}"></i>
                  <span>${device.type}</span>
                </div>
                <div class="info-row">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${device.location}</span>
                </div>
                <div class="info-row">
                  <i class="fas fa-battery-${device.batteryLevel > 75 ? 'full' : 
                    device.batteryLevel > 50 ? 'three-quarters' : 
                    device.batteryLevel > 25 ? 'half' : 'quarter'}"></i>
                  <span>${device.batteryLevel}% Battery</span>
                </div>
              </div>
              <div class="popup-metrics">
                <div class="mini-metric">
                  <span class="mini-metric-value">${device.vibration}</span>
                  <span class="mini-metric-label">Hz</span>
                </div>
                <div class="mini-metric">
                  <span class="mini-metric-value">${device.pressure}</span>
                  <span class="mini-metric-label">kPa</span>
                </div>
                <div class="mini-metric">
                  <span class="mini-metric-value">${device.inclination}</span>
                  <span class="mini-metric-label">°</span>
                </div>
              </div>
            </div>
            <div class="popup-footer">
              <button id="device-btn-${device.id}" class="popup-btn">
                <span>View Details</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        `, { 
          maxWidth: 300,
          className: 'custom-popup'
        });
      
      // Add the marker to the map
      marker.addTo(map);
      
      // Store the marker for future reference
      markers[device.id] = marker;
      
      // Add event listener to the popup after it opens
      marker.on('popupopen', () => {
        setTimeout(() => {
          const button = document.getElementById(`device-btn-${device.id}`);
          if (button) {
            button.addEventListener('click', () => {
              viewDeviceDetails(device.id);
            });
          }
        }, 100);
      });
    });
  } catch (error) {
    console.error("Error updating map markers:", error);
  }
}

function initMap() {
  try {
    if (document.getElementById('map')) {
      // Clear existing map if it exists
      if (map) {
        map.remove();
        markers = {};
      }
      
      // Create map centered on Chennai
      map = L.map('map').setView([13.0827, 80.2707], 12);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add markers for filtered devices
      updateMapMarkers();
      
      // Force a resize event to make sure the map renders correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  } catch (error) {
    console.error("Error in initMap:", error);
  }
}
</script>

<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1>Device Monitoring</h1>
          <p class="subtitle">View and manage your deployed sensors</p>
        </div>
        <div class="action-buttons">
          <router-link to="/notifications" class="btn btn-secondary">
            <i class="fas fa-bell"></i> Notifications
          </router-link>
        </div>
      </div>

      <div class="control-panel">
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search devices..." 
            class="search-input"
          >
        </div>
        
        <div class="filter-container">
          <label for="status-filter">Status:</label>
          <select id="status-filter" v-model="statusFilter">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="warning">Warning</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div class="view-toggle">
          <button 
            :class="{ active: viewMode === 'map' }" 
            @click="viewMode = 'map'"
          >
            <i class="fas fa-map-marked-alt"></i> Map
          </button>
          <button 
            :class="{ active: viewMode === 'list' }" 
            @click="viewMode = 'list'"
          >
            <i class="fas fa-list"></i> List
          </button>
        </div>
      </div>

      <div class="loading-container" v-if="isLoading">
        <div class="loader"></div>
        <p>Loading devices...</p>
      </div>

      <div v-else>
        <div v-if="filteredDevices.length === 0" class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No devices found</h3>
          <p>Try adjusting your search or filters</p>
        </div>

        <div v-else-if="viewMode === 'map'" class="map-view">
          <div id="map"></div>
        </div>

        <div v-else class="list-view">
          <div 
            v-for="device in filteredDevices" 
            :key="device.id" 
            class="device-card"
            @click="viewDeviceDetails(device.id)"
          >
            <div class="device-header">
              <div class="device-icon">
                <i :class="`fas ${device.type.includes('Vibration') ? 'fa-wave-square' : 
                           device.type.includes('Pressure') ? 'fa-tachometer-alt' : 'fa-ruler-vertical'}`"></i>
              </div>
              <div class="device-title">
                <h3>{{ device.name }}</h3>
                <p>{{ device.location }} | {{ device.type }}</p>
              </div>
              <div :class="['device-status', getStatusClass(device.status)]">
                <i :class="`fas ${getStatusIcon(device.status)}`"></i>
                <span>{{ device.status }}</span>
              </div>
            </div>
            
            <div class="device-metrics">
              <div class="metric">
                <span class="metric-label">Vibration</span>
                <span class="metric-value">{{ device.vibration }} Hz</span>
              </div>
              <div class="metric">
                <span class="metric-label">Pressure</span>
                <span class="metric-value">{{ device.pressure }} kPa</span>
              </div>
              <div class="metric">
                <span class="metric-label">Inclination</span>
                <span class="metric-value">{{ device.inclination }}°</span>
              </div>
            </div>
            
            <div class="device-footer">
              <div class="battery-level">
                <i :class="`fas fa-battery-${device.batteryLevel > 75 ? 'full' : 
                         device.batteryLevel > 50 ? 'three-quarters' : 
                         device.batteryLevel > 25 ? 'half' : 'quarter'}`"></i>
                <span>{{ device.batteryLevel }}%</span>
              </div>
              <div class="last-updated">
                <i class="far fa-clock"></i>
                <span>{{ formatLastUpdated(device.lastUpdated) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem 0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.control-panel {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.view-toggle button {
  padding: 0.75rem 1.5rem;
  background: white;
  border: none;
  border-right: 1px solid var(--border-color);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle button:last-child {
  border-right: none;
}

.view-toggle button.active {
  background: var(--primary-color);
  color: white;
}

#map {
  height: 600px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow);
  z-index: 1;
}

.list-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.device-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.device-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  border-color: var(--primary-color);
}

.device-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.device-icon {
  background: rgba(37, 99, 235, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1.25rem;
  margin-right: 1rem;
}

.device-title {
  flex: 1;
}

.device-title h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
}

.device-title p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.device-status {
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
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

.device-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--background-dark);
  padding: 0.75rem;
  border-radius: 8px;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.metric-value {
  font-weight: 600;
  color: var(--text-primary);
}

.device-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.battery-level, .last-updated {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  background-color: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  font-weight: 500;
}

.btn-secondary:hover {
  background-color: var(--background-dark);
}

/* Custom map marker styles */
:global(.custom-marker) {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
}

:global(.marker-icon) {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  font-size: 14px;
}

:global(.marker-icon.status-active) {
  background-color: #10b981 !important; /* Use the success color directly */
  color: white;
}

:global(.marker-icon.status-warning) {
  background-color: #f59e0b !important; /* Use the warning color directly */
  color: white;
}

:global(.marker-icon.status-inactive) {
  background-color: #ef4444 !important; /* Use the danger color directly */
  color: white;
}

:global(.popup-content) {
  text-align: center;
  padding: 0.5rem;
}

:global(.popup-content h3) {
  margin-top: 0;
  font-size: 1rem;
}

:global(.popup-btn) {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

/* Updated modern popup styles */
:global(.custom-popup .leaflet-popup-content-wrapper) {
  padding: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

:global(.custom-popup .leaflet-popup-content) {
  margin: 0;
  width: 280px !important;
}

:global(.custom-popup .leaflet-popup-tip) {
  background: white;
}

:global(.modern-popup) {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

:global(.popup-header) {
  padding: 15px;
  position: relative;
  color: white;
}

:global(.popup-header.status-active) {
  background: linear-gradient(135deg, #10b981, #059669);
}

:global(.popup-header.status-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

:global(.popup-header.status-inactive) {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

:global(.popup-header h3) {
  margin: 0 0 3px 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.popup-badge) {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 11px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  font-weight: 500;
}

:global(.popup-body) {
  background: white;
  padding: 15px;
}

:global(.popup-info) {
  margin-bottom: 12px;
}

:global(.info-row) {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #64748b;
}

:global(.info-row i) {
  width: 16px;
  margin-right: 8px;
  color: #475569;
}

:global(.popup-metrics) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

:global(.mini-metric) {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
}

:global(.mini-metric-value) {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

:global(.mini-metric-label) {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}

:global(.popup-footer) {
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

:global(.popup-btn) {
  width: 100%;
  padding: 10px;
  border: none;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

:global(.popup-btn:hover) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

:global(.popup-btn i) {
  font-size: 12px;
}

@media (max-width: 768px) {
  .control-panel {
    grid-template-columns: 1fr;
  }
  
  .list-view {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  #map {
    height: 400px;
  }
}
</style>
