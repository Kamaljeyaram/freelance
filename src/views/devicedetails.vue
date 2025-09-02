<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Chart from 'chart.js/auto';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const route = useRoute();
const router = useRouter();
const deviceId = computed(() => parseInt(route.params.id));
const device = ref(null);
const isLoading = ref(true);
const timeRange = ref('24h');
const realtimeMode = ref(false);
const charts = ref({
  rms: null,
  fsr_pressure_Pa: null,
  pitch: null,
  activeTab: 'all'
});
const realtimeUpdateInterval = ref(null);
const map = ref(null);

// API Base URL
const API_BASE_URL = 'https://structure-monitor-server-xpyz.onrender.com';

// Monitoring data - will be populated from API
const monitoringData = ref({
  rms: {
    '24h': [],
    '7d': [],
    '30d': [],
    'realtime': []
  },
  fsr_pressure_Pa: {
    '24h': [],
    '7d': [],
    '30d': [],
    'realtime': []
  },
  pitch: {
    '24h': [],
    '7d': [],
    '30d': [],
    'realtime': []
  }
});

// Live readings with reactive data
const liveReadings = ref({
  pitch: 0,
  roll: 0,
  rms: 0,
  peak: 0,
  crest_factor: 0,
  f_dom: 0,
  temp: 0,
  sw18010p: 0,
  fsr_adc: 0,
  fsr_force_N: 0,
  fsr_pressure_Pa: 0,
  status: {
    pitch: 'normal',
    roll: 'normal',
    rms: 'normal',
    peak: 'normal',
    crest_factor: 'normal',
    f_dom: 'normal',
    temp: 'normal',
    sw18010p: 'normal',
    fsr_adc: 'normal',
    fsr_force_N: 'normal',
    fsr_pressure_Pa: 'normal'
  }
});

// Device information - updated to include ALL devices from Dashboard
const mockDevices = [
  { 
    id: 1, 
    name: 'Anna Nagar Bridge Sensor', 
    type: 'Vibration Sensor',
    location: 'Anna Nagar Bridge',
    status: 'active',
    model: 'SM-MULTI2000',
    serialNumber: 'MULTI2000-12345',
    installDate: '2023-01-15',
    lastMaintenance: '2023-06-20',
    firmware: 'v2.1.4',
    lat: 13.0827, 
    lng: 80.2707,
    batteryLevel: 89,
    signalStrength: 95,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'T Nagar Building Sensor', 
    type: 'Pressure Sensor',
    location: 'T Nagar Complex',
    status: 'warning',
    model: 'SM-PS1500',
    serialNumber: 'PS1500-67890',
    installDate: '2023-02-20',
    lastMaintenance: '2023-06-15',
    firmware: 'v1.8.2',
    lat: 13.0418, 
    lng: 80.2341, 
    batteryLevel: 45,
    signalStrength: 78,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T11:15:00'
  },
  { 
    id: 3, 
    name: 'Marina Beach Sensor', 
    type: 'Inclination Sensor',
    location: 'Marina Beach Tower',
    status: 'inactive',
    model: 'SM-IS1000',
    serialNumber: 'IS1000-54321',
    installDate: '2023-02-20',
    lastMaintenance: '2023-05-10',
    firmware: 'v1.4.6',
    lat: 13.0500, 
    lng: 80.2824, 
    batteryLevel: 12,
    signalStrength: 32,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-19T09:45:00'
  },
  { 
    id: 4, 
    name: 'Chennai Port Sensor', 
    type: 'Vibration Sensor',
    location: 'Chennai Port',
    status: 'active',
    model: 'SM-VS2000',
    serialNumber: 'VS2000-24680',
    installDate: '2023-03-05',
    lastMaintenance: '2023-06-25',
    firmware: 'v2.1.4',
    lat: 13.1056, 
    lng: 80.2931, 
    batteryLevel: 76,
    signalStrength: 89,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T12:05:00'
  },
  { 
    id: 5, 
    name: 'Velachery Bridge Sensor', 
    type: 'Vibration Sensor',
    location: 'Velachery Bridge',
    status: 'active',
    model: 'SM-VS2100',
    serialNumber: 'VS2100-13579',
    installDate: '2023-03-10',
    lastMaintenance: '2023-06-28',
    firmware: 'v2.1.4',
    lat: 12.9816, 
    lng: 80.2181, 
    batteryLevel: 92,
    signalStrength: 94,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T14:25:00'
  },
  { 
    id: 6, 
    name: 'Chennai Central Station', 
    type: 'Pressure Sensor',
    location: 'Central Railway Station',
    status: 'active',
    model: 'SM-PS1600',
    serialNumber: 'PS1600-97531',
    installDate: '2023-03-15',
    lastMaintenance: '2023-06-30',
    firmware: 'v1.9.1',
    lat: 13.0827, 
    lng: 80.2755, 
    batteryLevel: 85,
    signalStrength: 91,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T13:15:00'
  },
  { 
    id: 7, 
    name: 'Adyar River Bridge', 
    type: 'Inclination Sensor',
    location: 'Adyar River Crossing',
    status: 'warning',
    model: 'SM-IS1100',
    serialNumber: 'IS1100-86420',
    installDate: '2023-03-20',
    lastMaintenance: '2023-06-05',
    firmware: 'v1.5.2',
    lat: 13.0136, 
    lng: 80.2629, 
    batteryLevel: 38,
    signalStrength: 65,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T09:45:00'
  },
  { 
    id: 8, 
    name: 'Guindy Flyover Sensor', 
    type: 'Vibration Sensor',
    location: 'Guindy Flyover',
    status: 'active',
    model: 'SM-VS2200',
    serialNumber: 'VS2200-75319',
    installDate: '2023-03-25',
    lastMaintenance: '2023-07-02',
    firmware: 'v2.1.4',
    lat: 13.0067, 
    lng: 80.2206, 
    batteryLevel: 67,
    signalStrength: 82,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T11:35:00'
  },
  { 
    id: 9, 
    name: 'Santhome Bridge', 
    type: 'Pressure Sensor',
    location: 'Santhome High Road',
    status: 'inactive',
    model: 'SM-PS1700',
    serialNumber: 'PS1700-64208',
    installDate: '2023-04-01',
    lastMaintenance: '2023-05-15',
    firmware: 'v1.7.8',
    lat: 13.0336, 
    lng: 80.2770, 
    batteryLevel: 5,
    signalStrength: 12,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-19T16:20:00'
  },
  { 
    id: 10, 
    name: 'IIT Madras Structure', 
    type: 'Inclination Sensor',
    location: 'IIT Campus',
    status: 'active',
    model: 'SM-IS1200',
    serialNumber: 'IS1200-53197',
    installDate: '2023-04-05',
    lastMaintenance: '2023-07-05',
    firmware: 'v1.6.3',
    lat: 12.9941, 
    lng: 80.2359, 
    batteryLevel: 91,
    signalStrength: 96,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T15:10:00'
  },
  { 
    id: 11, 
    name: 'Koyambedu Market Tower', 
    type: 'Vibration Sensor',
    location: 'Koyambedu Market Complex',
    status: 'warning',
    model: 'SM-VS2300',
    serialNumber: 'VS2300-42086',
    installDate: '2023-04-10',
    lastMaintenance: '2023-06-18',
    firmware: 'v2.0.9',
    lat: 13.0723, 
    lng: 80.1942, 
    batteryLevel: 42,
    signalStrength: 71,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T12:40:00'
  },
  { 
    id: 12, 
    name: 'Mylapore Temple Structure', 
    type: 'Inclination Sensor',
    location: 'Mylapore Temple',
    status: 'active',
    model: 'SM-IS1300',
    serialNumber: 'IS1300-31975',
    installDate: '2023-04-15',
    lastMaintenance: '2023-07-08',
    firmware: 'v1.6.3',
    lat: 13.0369, 
    lng: 80.2676, 
    batteryLevel: 83,
    signalStrength: 88,
    thresholds: {
      pitch: { min: 0, max: 1.2, warning: 0.8 },
      roll: { min: 0, max: 1.2, warning: 0.8 },
      rms: { min: 0.1, max: 0.9, warning: 0.7 },
      peak: { min: 0.1, max: 1.0, warning: 0.8 },
      crest_factor: { min: 1.0, max: 2.0, warning: 1.5 },
      f_dom: { min: 40, max: 60, warning: 55 },
      temp: { min: 20, max: 30, warning: 28 },
      sw18010p: { min: 0.5, max: 1.0, warning: 0.9 },
      fsr_adc: { min: 400, max: 600, warning: 550 },
      fsr_force_N: { min: 5, max: 15, warning: 12 },
      fsr_pressure_Pa: { min: 95, max: 101, warning: 100 }
    },
    lastUpdated: '2023-07-20T14:55:00'
  }
];

// API Functions
async function fetchSensorData(limit = 100) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sensor-data?limit=${limit}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error('Failed to fetch sensor data');
    }
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return [];
  }
}

async function fetchLatestSensorData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sensor-data/latest`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error('No latest data available');
    }
  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    return null;
  }
}

// Process API data for time series
function processApiDataForTimeRange(apiData, range) {
  if (!apiData || apiData.length === 0) return [];
  
  const now = new Date();
  let cutoffDate;
  
  switch (range) {
    case '24h':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'realtime':
      cutoffDate = new Date(now.getTime() - 20 * 60 * 1000); // Last 20 minutes
      break;
    default:
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  // Filter data based on timestamp
  const filteredData = apiData.filter(item => {
    const itemDate = new Date(item.timestamp);
    return itemDate >= cutoffDate;
  });
  
  // Sort by timestamp (oldest first)
  return filteredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Convert API data to chart format
function convertApiDataToChartFormat(apiData, field) {
  return apiData.map(item => ({
    time: item.timestamp,
    value: parseFloat(item[field]) || 0
  }));
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

// Check if value exceeds warning threshold
function checkStatus(value, type) {
  if (!device.value || !device.value.thresholds) return 'normal';
  
  const threshold = device.value.thresholds[type];
  if (!threshold) return 'normal';
  
  if (value > threshold.warning) return 'warning';
  if (value < threshold.min || value > threshold.max) return 'danger';
  return 'normal';
}

// Load monitoring data from API
async function loadMonitoringData() {
  try {
    const apiData = await fetchSensorData(1000); // Fetch more data for different time ranges
    
    // Process data for different time ranges
    const ranges = ['24h', '7d', '30d', 'realtime'];
    
    ranges.forEach(range => {
      const rangeData = processApiDataForTimeRange(apiData, range);
      
      monitoringData.value.rms[range] = convertApiDataToChartFormat(rangeData, 'rms');
      monitoringData.value.fsr_pressure_Pa[range] = convertApiDataToChartFormat(rangeData, 'fsr_pressure_Pa');
      monitoringData.value.pitch[range] = convertApiDataToChartFormat(rangeData, 'pitch');
    });
    
  } catch (error) {
    console.error('Error loading monitoring data:', error);
  }
}

// Update live readings from API
async function updateLiveReadings() {
  try {
    const latestData = await fetchLatestSensorData();
    
    if (latestData) {
      liveReadings.value = {
        pitch: parseFloat(latestData.pitch) || 0,
        roll: parseFloat(latestData.roll) || 0,
        rms: parseFloat(latestData.rms) || 0,
        peak: parseFloat(latestData.peak) || 0,
        crest_factor: parseFloat(latestData.crest_factor) || 0,
        f_dom: parseFloat(latestData.f_dom) || 0,
        temp: parseFloat(latestData.temp) || 0,
        sw18010p: parseFloat(latestData.sw18010p) || 0,
        fsr_adc: parseFloat(latestData.fsr_adc) || 0,
        fsr_force_N: parseFloat(latestData.fsr_force_N) || 0,
        fsr_pressure_Pa: parseFloat(latestData.fsr_pressure_Pa) || 0,
        status: {
          pitch: checkStatus(latestData.pitch, 'pitch'),
          roll: checkStatus(latestData.roll, 'roll'),
          rms: checkStatus(latestData.rms, 'rms'),
          peak: checkStatus(latestData.peak, 'peak'),
          crest_factor: checkStatus(latestData.crest_factor, 'crest_factor'),
          f_dom: checkStatus(latestData.f_dom, 'f_dom'),
          temp: checkStatus(latestData.temp, 'temp'),
          sw18010p: checkStatus(latestData.sw18010p, 'sw18010p'),
          fsr_adc: checkStatus(latestData.fsr_adc, 'fsr_adc'),
          fsr_force_N: checkStatus(latestData.fsr_force_N, 'fsr_force_N'),
          fsr_pressure_Pa: checkStatus(latestData.fsr_pressure_Pa, 'fsr_pressure_Pa')
        }
      };
      
      // Update device last updated time
      if (device.value) {
        device.value.lastUpdated = latestData.timestamp;
      }
    }
  } catch (error) {
    console.error('Error updating live readings:', error);
  }
}

// Initialize map with device location
function initMap() {
  // If map container is not rendered yet, skip
  const mapContainer = document.getElementById('location-map');
  if (!mapContainer || !device.value) return;
  
  // Create map instance
  map.value = L.map('location-map').setView([device.value.lat, device.value.lng], 13);
  
  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map.value);
  
  // Add marker for device location
  const deviceMarker = L.marker([device.value.lat, device.value.lng]).addTo(map.value);
  
  // Add popup with device info
  deviceMarker.bindPopup(`
    <strong>${device.value.name}</strong><br>
    ${device.value.location}<br>
    <span class="${getStatusClass(device.value.status)}">${device.value.status}</span>
  `).openPopup();
}

// Load device data
onMounted(async () => {
  try {
    isLoading.value = true;
    
    console.log('🔍 Looking for device with ID:', deviceId.value);
    console.log('📋 Available device IDs:', mockDevices.map(d => d.id));
    
    // Find device by ID
    const foundDevice = mockDevices.find(d => d.id === deviceId.value);
    
    console.log('🎯 Device found:', foundDevice ? foundDevice.name : 'NOT FOUND');
    
    if (!foundDevice) {
      console.error('❌ Device not found, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
    
    device.value = foundDevice;
    console.log('✅ Device loaded successfully:', device.value.name);
    
    // Load monitoring data from API
    await loadMonitoringData();
    
    // Update live readings
    await updateLiveReadings();
    
    isLoading.value = false;
    
    // Initialize charts and map after device data is loaded
    nextTick(() => {
      initCharts();
      initMap();
      
      // Start real-time updates every 5 seconds
      realtimeUpdateInterval.value = setInterval(async () => {
        await updateLiveReadings();
        
        if (realtimeMode.value) {
          // Reload realtime data and update charts
          const realtimeApiData = await fetchSensorData(20);
          const realtimeData = processApiDataForTimeRange(realtimeApiData, 'realtime');
          
          monitoringData.value.rms.realtime = convertApiDataToChartFormat(realtimeData, 'rms');
          monitoringData.value.fsr_pressure_Pa.realtime = convertApiDataToChartFormat(realtimeData, 'fsr_pressure_Pa');
          monitoringData.value.pitch.realtime = convertApiDataToChartFormat(realtimeData, 'pitch');
          
          updateCharts('realtime');
        }
      }, 5000);
    });
  } catch (error) {
    console.error('❌ Failed to load device data:', error);
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

  // RMS Chart
  const rmsData = monitoringData.value.rms[timeRange.value];
  charts.value.rms = new Chart(document.getElementById('rmsChart'), {
    type: 'line',
    data: {
      labels: rmsData.map(d => formatTimeLabel(d.time, timeRange.value)),
      datasets: [{
        label: 'RMS',
        data: rmsData.map(d => d.value),
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
  
  // FSR Pressure Chart
  const fsrPressureData = monitoringData.value.fsr_pressure_Pa[timeRange.value];
  charts.value.fsr_pressure_Pa = new Chart(document.getElementById('fsrPressureChart'), {
    type: 'line',
    data: {
      labels: fsrPressureData.map(d => formatTimeLabel(d.time, timeRange.value)),
      datasets: [{
        label: 'FSR Pressure (Pa)',
        data: fsrPressureData.map(d => d.value),
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
  
  // Pitch Chart
  const pitchData = monitoringData.value.pitch[timeRange.value];
  charts.value.pitch = new Chart(document.getElementById('pitchChart'), {
    type: 'line',
    data: {
      labels: pitchData.map(d => formatTimeLabel(d.time, timeRange.value)),
      datasets: [{
        label: 'Pitch (°)',
        data: pitchData.map(d => d.value),
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
  if (!charts.value.rms) return;
  
  const rmsData = monitoringData.value.rms[range];
  charts.value.rms.data.labels = rmsData.map(d => formatTimeLabel(d.time, range));
  charts.value.rms.data.datasets[0].data = rmsData.map(d => d.value);
  charts.value.rms.update();
  
  const fsrPressureData = monitoringData.value.fsr_pressure_Pa[range];
  charts.value.fsr_pressure_Pa.data.labels = fsrPressureData.map(d => formatTimeLabel(d.time, range));
  charts.value.fsr_pressure_Pa.data.datasets[0].data = fsrPressureData.map(d => d.value);
  charts.value.fsr_pressure_Pa.update();
  
  const pitchData = monitoringData.value.pitch[range];
  charts.value.pitch.data.labels = pitchData.map(d => formatTimeLabel(d.time, range));
  charts.value.pitch.data.datasets[0].data = pitchData.map(d => d.value);
  charts.value.pitch.update();
}

// Update time range and update charts
async function updateTimeRange(range) {
  timeRange.value = range;
  realtimeMode.value = (range === 'realtime');
  
  // Update animation duration based on mode
  if (charts.value.rms) {
    charts.value.rms.options.animation.duration = realtimeMode.value ? 0 : 1000;
    charts.value.fsr_pressure_Pa.options.animation.duration = realtimeMode.value ? 0 : 1000;
    charts.value.pitch.options.animation.duration = realtimeMode.value ? 0 : 1000;
  }
  
  // If switching to realtime mode, reload data
  if (realtimeMode.value) {
    const realtimeApiData = await fetchSensorData(20);
    const realtimeData = processApiDataForTimeRange(realtimeApiData, 'realtime');
    
    monitoringData.value.rms.realtime = convertApiDataToChartFormat(realtimeData, 'rms');
    monitoringData.value.fsr_pressure_Pa.realtime = convertApiDataToChartFormat(realtimeData, 'fsr_pressure_Pa');
    monitoringData.value.pitch.realtime = convertApiDataToChartFormat(realtimeData, 'pitch');
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
  
  // Clean up map instance
  if (map.value) {
    map.value.remove();
    map.value = null;
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
              <div class="reading-icon pitch">
                <i class="fas fa-ruler-vertical"></i>
              </div>
              <div class="reading-details">
                <h3>Pitch</h3>
                <div class="reading-value">{{ liveReadings.pitch }} <span>°</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.pitch)]">
                  {{ liveReadings.status.pitch }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon roll">
                <i class="fas fa-ruler-vertical"></i>
              </div>
              <div class="reading-details">
                <h3>Roll</h3>
                <div class="reading-value">{{ liveReadings.roll }} <span>°</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.roll)]">
                  {{ liveReadings.status.roll }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon rms">
                <i class="fas fa-wave-square"></i>
              </div>
              <div class="reading-details">
                <h3>RMS</h3>
                <div class="reading-value">{{ liveReadings.rms }}</div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.rms)]">
                  {{ liveReadings.status.rms }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon peak">
                <i class="fas fa-wave-square"></i>
              </div>
              <div class="reading-details">
                <h3>Peak</h3>
                <div class="reading-value">{{ liveReadings.peak }}</div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.peak)]">
                  {{ liveReadings.status.peak }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon crest_factor">
                <i class="fas fa-wave-square"></i>
              </div>
              <div class="reading-details">
                <h3>Crest Factor</h3>
                <div class="reading-value">{{ liveReadings.crest_factor }}</div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.crest_factor)]">
                  {{ liveReadings.status.crest_factor }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon f_dom">
                <i class="fas fa-wave-square"></i>
              </div>
              <div class="reading-details">
                <h3>F Dom</h3>
                <div class="reading-value">{{ liveReadings.f_dom }} <span>Hz</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.f_dom)]">
                  {{ liveReadings.status.f_dom }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon temp">
                <i class="fas fa-thermometer-half"></i>
              </div>
              <div class="reading-details">
                <h3>Temperature</h3>
                <div class="reading-value">{{ liveReadings.temp }} <span>°C</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.temp)]">
                  {{ liveReadings.status.temp }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon sw18010p">
                <i class="fas fa-microchip"></i>
              </div>
              <div class="reading-details">
                <h3>SW18010P</h3>
                <div class="reading-value">{{ liveReadings.sw18010p }}</div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.sw18010p)]">
                  {{ liveReadings.status.sw18010p }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon fsr_adc">
                <i class="fas fa-tachometer-alt"></i>
              </div>
              <div class="reading-details">
                <h3>FSR ADC</h3>
                <div class="reading-value">{{ liveReadings.fsr_adc }}</div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.fsr_adc)]">
                  {{ liveReadings.status.fsr_adc }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon fsr_force_N">
                <i class="fas fa-tachometer-alt"></i>
              </div>
              <div class="reading-details">
                <h3>FSR Force (N)</h3>
                <div class="reading-value">{{ liveReadings.fsr_force_N }} <span>N</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.fsr_force_N)]">
                  {{ liveReadings.status.fsr_force_N }}
                </div>
              </div>
            </div>
            
            <div class="reading-card">
              <div class="reading-icon fsr_pressure_Pa">
                <i class="fas fa-tachometer-alt"></i>
              </div>
              <div class="reading-details">
                <h3>FSR Pressure (Pa)</h3>
                <div class="reading-value">{{ liveReadings.fsr_pressure_Pa }} <span>Pa</span></div>
                <div :class="['reading-status', getStatusClass(liveReadings.status.fsr_pressure_Pa)]">
                  {{ liveReadings.status.fsr_pressure_Pa }}
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
              <div class="chart-tab" :class="{ active: charts.activeTab === 'rms' }" @click="charts.activeTab = 'rms'">RMS</div>
              <div class="chart-tab" :class="{ active: charts.activeTab === 'fsr_pressure_Pa' }" @click="charts.activeTab = 'fsr_pressure_Pa'">FSR Pressure</div>
              <div class="chart-tab" :class="{ active: charts.activeTab === 'pitch' }" @click="charts.activeTab = 'pitch'">Pitch</div>
            </div>
            
            <div class="charts-grid" :class="{ 'realtime': realtimeMode }">
              <div class="chart-card" :class="{ 'full-width': charts.activeTab === 'rms', 'hidden': charts.activeTab !== 'rms' && charts.activeTab !== 'all' }">
                <div class="chart-header">
                  <h3>RMS Over Time</h3>
                  <div class="pulse-indicator" v-if="realtimeMode"></div>
                </div>
                <div class="chart-container">
                  <canvas id="rmsChart"></canvas>
                </div>
              </div>
              
              <div class="chart-card" :class="{ 'full-width': charts.activeTab === 'fsr_pressure_Pa', 'hidden': charts.activeTab !== 'fsr_pressure_Pa' && charts.activeTab !== 'all' }">
                <div class="chart-header">
                  <h3>FSR Pressure Over Time</h3>
                  <div class="pulse-indicator" v-if="realtimeMode"></div>
                </div>
                <div class="chart-container">
                  <canvas id="fsrPressureChart"></canvas>
                </div>
              </div>
              
              <div class="chart-card" :class="{ 'full-width': charts.activeTab === 'pitch', 'hidden': charts.activeTab !== 'pitch' && charts.activeTab !== 'all' }">
                <div class="chart-header">
                  <h3>Pitch Over Time</h3>
                  <div class="pulse-indicator" v-if="realtimeMode"></div>
                </div>
                <div class="chart-container">
                  <canvas id="pitchChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Information Section -->
        <div class="section">
          <h2 class="section-title">Device Information</h2>
          <div class="device-info-grid">
            <div class="info-group hardware-info">
              <div class="info-group-header">
                <i class="fas fa-microchip"></i>
                <h3>Hardware Details</h3>
              </div>
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
                <div class="info-item">
                  <span class="info-label">Type</span>
                  <span class="info-value">{{ device.type }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status</span>
                  <span class="info-value">
                    <span :class="['status-indicator', getStatusClass(device.status)]"></span>
                    {{ device.status }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="info-group installation-info">
              <div class="info-group-header">
                <i class="fas fa-tools"></i>
                <h3>Installation & Maintenance</h3>
              </div>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Installation Date</span>
                  <span class="info-value">{{ device.installDate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Maintenance</span>
                  <span class="info-value">{{ device.lastMaintenance }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Update</span>
                  <span class="info-value">{{ formatLastUpdated(device.lastUpdated) }}</span>
                </div>
              </div>
            </div>
            
            <div class="info-group location-info">
              <div class="info-group-header">
                <i class="fas fa-map-marker-alt"></i>
                <h3>Location Details</h3>
              </div>
              <!-- Map is now placed before the info list for more prominence -->
              <div class="location-map" id="location-map"></div>
              <div class="location-info-details">
                <div class="info-item">
                  <span class="info-label">Location Name</span>
                  <span class="info-value">{{ device.location }}</span>
                </div>
                <div class="coordinates">
                  <div class="coordinate-item">
                    <i class="fas fa-location-arrow"></i>
                    <div>
                      <div class="coordinate-label">Latitude</div>
                      <div class="coordinate-value">{{ device.lat }}</div>
                    </div>
                  </div>
                  <div class="coordinate-item">
                    <i class="fas fa-location-arrow fa-flip-horizontal"></i>
                    <div>
                      <div class="coordinate-label">Longitude</div>
                      <div class="coordinate-value">{{ device.lng }}</div>
                    </div>
                  </div>
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

.pitch {
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.roll {
  background: rgba(247, 37, 133, 0.1);
  color: #f72585;
}

.rms {
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.peak {
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.crest_factor {
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.f_dom {
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.temp {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.sw18010p {
  background: rgba(76, 201, 240, 0.1);
  color: #4cc9f0;
}

.fsr_adc {
  background: rgba(76, 201, 240, 0.1);
  color: #4cc9f0;
}

.fsr_force_N {
  background: rgba(76, 201, 240, 0.1);
  color: #4cc9f0;
}

.fsr_pressure_Pa {
  background: rgba(76, 201, 240, 0.1);
  color: #4cc9f0;
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

.chart-card {
  background: var(--background-dark);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-card.hidden {
  display: none;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.info-group {
  background: var(--background-dark);
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
  transition: all 0.3s ease;
}

.info-group:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.info-group-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.info-group-header i {
  font-size: 1.25rem;
  margin-right: 0.75rem;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.info-group h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
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
  border-bottom: 1px dashed rgba(203, 213, 225, 0.4);
  align-items: center;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-value {
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.hardware-info .info-group-header i {
  color: #4361ee;
}

.installation-info .info-group-header i {
  color: #3a0ca3;
}

.location-info .info-group-header i {
  color: #4cc9f0;
}

.thresholds-info .info-group-header i {
  color: #f72585;
}

.location-info {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
}

.location-map {
  height: 300px;
  border-radius: 8px;
  margin: 0.5rem 0 1.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  z-index: 1;
  flex-grow: 1;
}

.location-info-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coordinates {
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
}

.coordinate-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.coordinate-item i {
  font-size: 1.25rem;
  color: var(--primary-color);
  width: 32px;
  height: 32px;
  background: rgba(67, 97, 238, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coordinate-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.coordinate-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .coordinates {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
