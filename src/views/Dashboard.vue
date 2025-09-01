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

// Add checkStatus function
function checkStatus(value, parameter) {
  // Define thresholds for different parameters
  const thresholds = {
    pitch: { warning: 5, critical: 10 },
    roll: { warning: 5, critical: 10 },
    rms: { warning: 2.0, critical: 5.0 },
    peak: { warning: 10.0, critical: 20.0 },
    crest_factor: { warning: 3.0, critical: 5.0 },
    f_dom: { warning: 50, critical: 100 },
    temp: { warning: 40, critical: 60 },
    sw18010p: { warning: 80, critical: 90 },
    fsr_adc: { warning: 800, critical: 900 },
    fsr_force_N: { warning: 50, critical: 100 },
    fsr_pressure_Pa: { warning: 1000, critical: 2000 }
  };

  const threshold = thresholds[parameter];
  if (!threshold || value === undefined || value === null) return 'normal';
  
  if (value >= threshold.critical) return 'critical';
  if (value >= threshold.warning) return 'warning';
  return 'normal';
}

// Mock device data with Chennai coordinates and updated parameters
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
    lastUpdated: '2023-07-20T10:30:00',
    latestData: {
      pitch: 2.1,
      roll: 1.8,
      rms: 1.2,
      peak: 8.5,
      crest_factor: 2.1,
      f_dom: 25.3,
      temp: 28.5,
      sw18010p: 45.2,
      fsr_adc: 512,
      fsr_force_N: 15.8,
      fsr_pressure_Pa: 450.2
    }
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
    lastUpdated: '2023-07-20T11:15:00',
    latestData: {
      pitch: 6.2,
      roll: 4.1,
      rms: 2.8,
      peak: 12.1,
      crest_factor: 3.5,
      f_dom: 55.8,
      temp: 42.1,
      sw18010p: 82.3,
      fsr_adc: 720,
      fsr_force_N: 35.2,
      fsr_pressure_Pa: 950.7
    }
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
    lastUpdated: '2023-07-19T09:45:00',
    latestData: {
      pitch: 0.1,
      roll: 0.2,
      rms: 0.1,
      peak: 1.2,
      crest_factor: 1.1,
      f_dom: 5.2,
      temp: 25.1,
      sw18010p: 15.2,
      fsr_adc: 128,
      fsr_force_N: 2.1,
      fsr_pressure_Pa: 85.3
    }
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
    lastUpdated: '2023-07-20T12:05:00',
    latestData: {
      pitch: 3.2,
      roll: 2.8,
      rms: 1.8,
      peak: 9.2,
      crest_factor: 2.5,
      f_dom: 32.1,
      temp: 31.2,
      sw18010p: 58.7,
      fsr_adc: 645,
      fsr_force_N: 28.5,
      fsr_pressure_Pa: 720.8
    }
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
    lastUpdated: '2023-07-20T14:25:00',
    latestData: {
      pitch: 1.5,
      roll: 1.2,
      rms: 0.9,
      peak: 6.8,
      crest_factor: 1.8,
      f_dom: 18.5,
      temp: 27.8,
      sw18010p: 42.1,
      fsr_adc: 385,
      fsr_force_N: 12.3,
      fsr_pressure_Pa: 385.2
    }
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
    lastUpdated: '2023-07-20T13:15:00',
    latestData: {
      pitch: 4.1,
      roll: 3.8,
      rms: 2.2,
      peak: 11.5,
      crest_factor: 2.9,
      f_dom: 45.2,
      temp: 35.1,
      sw18010p: 68.9,
      fsr_adc: 758,
      fsr_force_N: 42.1,
      fsr_pressure_Pa: 1150.3
    }
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
    lastUpdated: '2023-07-20T09:45:00',
    latestData: {
      pitch: 7.8,
      roll: 6.5,
      rms: 3.2,
      peak: 15.8,
      crest_factor: 4.1,
      f_dom: 78.5,
      temp: 38.9,
      sw18010p: 85.2,
      fsr_adc: 825,
      fsr_force_N: 55.8,
      fsr_pressure_Pa: 1485.7
    }
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
    lastUpdated: '2023-07-20T11:35:00',
    latestData: {
      pitch: 2.8,
      roll: 2.1,
      rms: 1.5,
      peak: 7.2,
      crest_factor: 2.2,
      f_dom: 28.7,
      temp: 29.5,
      sw18010p: 52.1,
      fsr_adc: 485,
      fsr_force_N: 18.9,
      fsr_pressure_Pa: 520.8
    }
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
    lastUpdated: '2023-07-19T16:20:00',
    latestData: {
      pitch: 0.2,
      roll: 0.1,
      rms: 0.05,
      peak: 0.8,
      crest_factor: 1.05,
      f_dom: 2.1,
      temp: 24.5,
      sw18010p: 8.2,
      fsr_adc: 45,
      fsr_force_N: 0.8,
      fsr_pressure_Pa: 25.1
    }
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
    lastUpdated: '2023-07-20T15:10:00',
    latestData: {
      pitch: 1.2,
      roll: 0.9,
      rms: 0.7,
      peak: 4.5,
      crest_factor: 1.6,
      f_dom: 15.2,
      temp: 26.8,
      sw18010p: 38.5,
      fsr_adc: 295,
      fsr_force_N: 8.2,
      fsr_pressure_Pa: 285.5
    }
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
    lastUpdated: '2023-07-20T12:40:00',
    latestData: {
      pitch: 8.5,
      roll: 7.2,
      rms: 4.1,
      peak: 18.5,
      crest_factor: 4.8,
      f_dom: 95.2,
      temp: 45.8,
      sw18010p: 89.5,
      fsr_adc: 885,
      fsr_force_N: 68.2,
      fsr_pressure_Pa: 1785.9
    }
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
    lastUpdated: '2023-07-20T14:55:00',
    latestData: {
      pitch: 1.8,
      roll: 1.5,
      rms: 0.8,
      peak: 5.2,
      crest_factor: 1.9,
      f_dom: 22.1,
      temp: 28.2,
      sw18010p: 41.8,
      fsr_adc: 358,
      fsr_force_N: 11.5,
      fsr_pressure_Pa: 395.8
    }
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

// Function to get parameter status class
function getParameterStatusClass(device, parameter) {
  const status = checkStatus(device.latestData[parameter], parameter);
  switch (status) {
    case 'critical': return 'status-inactive';
    case 'warning': return 'status-warning';
    case 'normal': return 'status-active';
    default: return '';
  }
}

// Function to update map markers based on filtered devices
function updateMapMarkers() {
  try {
    // Clear existing markers
    Object.values(markers).forEach(marker => {
      marker.remove();
    });
    markers = {};
    
    // Define global function to handle navigation from popup buttons BEFORE creating markers
    window.goToDeviceDetails = (deviceId) => {
      console.log('Navigating to device:', deviceId); // Debug log
      router.push(`/device/${deviceId}`);
    };
    
    // Add markers for filtered devices
    filteredDevices.value.forEach(device => {
      const markerIcon = L.divIcon({
        html: `<div class="marker-icon ${getStatusClass(device.status)}"><i class="fas ${getStatusIcon(device.status)}"></i></div>`,
        className: 'custom-marker',
        iconSize: [30, 30]
      });
      
      // Create a marker with a modern popup design
      const marker = L.marker([device.lat, device.lng], { icon: markerIcon });
      
      // Add popup content
      const popupContent = `
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
              <div class="mini-metric ${getParameterStatusClass(device, 'pitch')}">
                <span class="mini-metric-value">${device.latestData.pitch.toFixed(1)}</span>
                <span class="mini-metric-label">Pitch</span>
              </div>
              <div class="mini-metric ${getParameterStatusClass(device, 'roll')}">
                <span class="mini-metric-value">${device.latestData.roll.toFixed(1)}</span>
                <span class="mini-metric-label">Roll</span>
              </div>
              <div class="mini-metric ${getParameterStatusClass(device, 'temp')}">
                <span class="mini-metric-value">${device.latestData.temp.toFixed(1)}</span>
                <span class="mini-metric-label">Temp</span>
              </div>
            </div>
            <div class="popup-additional-metrics">
              <div class="additional-metric">
                <span class="additional-metric-label">RMS:</span>
                <span class="additional-metric-value ${getParameterStatusClass(device, 'rms')}">${device.latestData.rms.toFixed(2)}</span>
              </div>
              <div class="additional-metric">
                <span class="additional-metric-label">Peak:</span>
                <span class="additional-metric-value ${getParameterStatusClass(device, 'peak')}">${device.latestData.peak.toFixed(1)}</span>
              </div>
              <div class="additional-metric">
                <span class="additional-metric-label">F Dom:</span>
                <span class="additional-metric-value ${getParameterStatusClass(device, 'f_dom')}">${device.latestData.f_dom.toFixed(1)} Hz</span>
              </div>
            </div>
          </div>
          <div class="popup-footer">
            <button class="popup-btn" data-device-id="${device.id}">
              <span>View Details</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
      
      // Bind popup with content
      marker.bindPopup(popupContent, { 
        maxWidth: 320,
        className: 'custom-popup'
      });
      
      // Add click event to marker for direct navigation (double-click)
      marker.on('dblclick', function(e) {
        console.log('Double-clicked marker for device:', device.id);
        router.push(`/device/${device.id}`);
      });
      
      // Add popup open event to setup button click handler
      marker.on('popupopen', function(e) {
        // Wait a bit for the DOM to be ready
        setTimeout(() => {
          const popupBtn = document.querySelector('.popup-btn[data-device-id="' + device.id + '"]');
          if (popupBtn) {
            popupBtn.addEventListener('click', function(event) {
              event.preventDefault();
              event.stopPropagation();
              console.log('Popup button clicked for device:', device.id);
              router.push(`/device/${device.id}`);
            });
          }
        }, 100);
      });
      
      // Add the marker to the map
      marker.addTo(map);
      
      // Store the marker for future reference
      markers[device.id] = marker;
    });
    
  } catch (error) {
    console.error("Error updating map markers:", error);
  }
}

// Clean up the global function when component is unmounted
import { onUnmounted } from 'vue';

onUnmounted(() => {
  if (typeof window.goToDeviceDetails === 'function') {
    delete window.goToDeviceDetails;
  }
});

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
                <span class="metric-label">Pitch</span>
                <span :class="['metric-value', getParameterStatusClass(device, 'pitch')]">{{ device.latestData.pitch.toFixed(1) }}°</span>
              </div>
              <div class="metric">
                <span class="metric-label">Roll</span>
                <span :class="['metric-value', getParameterStatusClass(device, 'roll')]">{{ device.latestData.roll.toFixed(1) }}°</span>
              </div>
              <div class="metric">
                <span class="metric-label">Temperature</span>
                <span :class="['metric-value', getParameterStatusClass(device, 'temp')]">{{ device.latestData.temp.toFixed(1) }}°C</span>
              </div>
            </div>
            
            <div class="device-additional-metrics">
              <div class="additional-metrics-grid">
                <div class="additional-metric-item">
                  <span class="additional-metric-label">RMS:</span>
                  <span :class="['additional-metric-value', getParameterStatusClass(device, 'rms')]">{{ device.latestData.rms.toFixed(2) }}</span>
                </div>
                <div class="additional-metric-item">
                  <span class="additional-metric-label">Peak:</span>
                  <span :class="['additional-metric-value', getParameterStatusClass(device, 'peak')]">{{ device.latestData.peak.toFixed(1) }}</span>
                </div>
                <div class="additional-metric-item">
                  <span class="additional-metric-label">Crest:</span>
                  <span :class="['additional-metric-value', getParameterStatusClass(device, 'crest_factor')]">{{ device.latestData.crest_factor.toFixed(1) }}</span>
                </div>
                <div class="additional-metric-item">
                  <span class="additional-metric-label">F Dom:</span>
                  <span :class="['additional-metric-value', getParameterStatusClass(device, 'f_dom')]">{{ device.latestData.f_dom.toFixed(1) }} Hz</span>
                </div>
                <div class="additional-metric-item">
                  <span class="additional-metric-label">FSR Force:</span>
                  <span :class="['additional-metric-value', getParameterStatusClass(device, 'fsr_force_N')]">{{ device.latestData.fsr_force_N.toFixed(1) }} N</span>
                </div>
                <div class="additional-metric-item">
                  <span class="additional-metric-label">FSR Pressure:</span>
                  <span :class="['additional-metric-value', getParameterStatusClass(device, 'fsr_pressure_Pa')]">{{ device.latestData.fsr_pressure_Pa.toFixed(0) }} Pa</span>
                </div>
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
  width: 100% !important;
  padding: 10px !important;
  border: none !important;
  background: #2563eb !important;
  color: white !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  transition: all 0.2s !important;
  text-align: center !important;
}

:global(.popup-btn:hover) {
  background: #1d4ed8 !important;
  transform: translateY(-1px) !important;
}

:global(.popup-btn:active) {
  transform: translateY(0) !important;
}

:global(.popup-btn i) {
  font-size: 12px !important;
}

/* Ensure popup content is clickable */
:global(.leaflet-popup-content) {
  pointer-events: auto !important;
}

:global(.leaflet-popup-content-wrapper) {
  pointer-events: auto !important;
}

/* Enhanced mini-metric status colors */
:global(.mini-metric.status-active) {
  background: rgba(16, 185, 129, 0.1) !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
}

:global(.mini-metric.status-warning) {
  background: rgba(245, 158, 11, 0.1) !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
}

:global(.mini-metric.status-inactive) {
  background: rgba(239, 68, 68, 0.1) !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
}

:global(.mini-metric.status-active .mini-metric-value) {
  color: #059669 !important;
}

:global(.mini-metric.status-warning .mini-metric-value) {
  color: #d97706 !important;
}

:global(.mini-metric.status-inactive .mini-metric-value) {
  color: #dc2626 !important;
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
