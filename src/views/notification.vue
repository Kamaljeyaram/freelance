<script setup>
import { ref, computed, onMounted } from 'vue';

const notifications = ref([]);
const isLoading = ref(true);
const selectedTab = ref('all');
const searchQuery = ref('');
const notificationCount = ref({
  all: 0,
  unread: 0,
  critical: 0
});

// Mock data - in real app this would come from API
const mockNotifications = [
  {
    id: 1,
    type: 'warning',
    title: 'High Vibration Detected',
    message: 'Bridge A Sensor detected unusual vibration patterns exceeding normal thresholds.',
    device: 'Bridge A Sensor',
    deviceId: 1,
    timestamp: '2023-07-21T10:30:00',
    read: false,
    critical: true
  },
  {
    id: 2,
    type: 'danger',
    title: 'Critical Pressure Levels',
    message: 'Building B Sensor 1 reported pressure readings outside of acceptable range.',
    device: 'Building B Sensor 1',
    deviceId: 2,
    timestamp: '2023-07-21T09:15:00',
    read: false,
    critical: true
  },
  {
    id: 3,
    type: 'info',
    title: 'Device Maintenance Required',
    message: 'Building B Sensor 2 battery level is below 15%. Please schedule maintenance.',
    device: 'Building B Sensor 2',
    deviceId: 3,
    timestamp: '2023-07-20T16:45:00',
    read: true,
    critical: false
  },
  {
    id: 4,
    type: 'success',
    title: 'Device Back Online',
    message: 'Tower C Sensor is now back online after connectivity issues.',
    device: 'Tower C Sensor',
    deviceId: 4,
    timestamp: '2023-07-20T14:20:00',
    read: true,
    critical: false
  },
  {
    id: 5,
    type: 'warning',
    title: 'Inclination Change Detected',
    message: 'Building B Sensor 2 reported a significant change in inclination readings.',
    device: 'Building B Sensor 2',
    deviceId: 3,
    timestamp: '2023-07-20T11:10:00',
    read: false,
    critical: false
  },
  {
    id: 6,
    type: 'info',
    title: 'Firmware Update Available',
    message: 'A new firmware update (v2.2.0) is available for Bridge A Sensor.',
    device: 'Bridge A Sensor',
    deviceId: 1,
    timestamp: '2023-07-19T15:30:00',
    read: true,
    critical: false
  },
  {
    id: 7,
    type: 'info',
    title: 'Weekly Report Generated',
    message: 'Weekly monitoring report for all devices is now available.',
    device: 'System',
    deviceId: null,
    timestamp: '2023-07-19T09:00:00',
    read: true,
    critical: false
  },
];

// Filtered notifications based on tab and search
const filteredNotifications = computed(() => {
  return notifications.value.filter(notification => {
    // Filter by tab
    if (selectedTab.value === 'unread' && notification.read) return false;
    if (selectedTab.value === 'critical' && !notification.critical) return false;
    
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return notification.title.toLowerCase().includes(query) || 
             notification.message.toLowerCase().includes(query) ||
             notification.device.toLowerCase().includes(query);
    }
    
    return true;
  });
});

// Load notifications
onMounted(async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Set notifications
  notifications.value = mockNotifications;
  
  // Count by category
  notificationCount.value.all = notifications.value.length;
  notificationCount.value.unread = notifications.value.filter(n => !n.read).length;
  notificationCount.value.critical = notifications.value.filter(n => n.critical).length;
  
  isLoading.value = false;
});

// Mark notification as read
function markAsRead(id) {
  const notification = notifications.value.find(n => n.id === id);
  if (notification && !notification.read) {
    notification.read = true;
    notificationCount.value.unread--;
  }
}

// Mark all as read
function markAllAsRead() {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
  notificationCount.value.unread = 0;
}

// Format timestamp to relative time
function formatRelativeTime(timestamp) {
  const now = new Date();
  const notificationDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationDate) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return notificationDate.toLocaleDateString();
}
</script>

<template>
  <div class="notifications">
    <div class="container">
      <div class="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p class="subtitle">Stay informed about your infrastructure</p>
        </div>
        <button v-if="notificationCount.unread > 0" @click="markAllAsRead" class="btn-mark-all">
          Mark All as Read
        </button>
      </div>

      <div class="notification-tabs">
        <button 
          :class="{ active: selectedTab === 'all' }" 
          @click="selectedTab = 'all'"
        >
          All
          <span class="badge">{{ notificationCount.all }}</span>
        </button>
        <button 
          :class="{ active: selectedTab === 'unread' }" 
          @click="selectedTab = 'unread'"
        >
          Unread
          <span class="badge">{{ notificationCount.unread }}</span>
        </button>
        <button 
          :class="{ active: selectedTab === 'critical' }" 
          @click="selectedTab = 'critical'"
        >
          Critical
          <span class="badge">{{ notificationCount.critical }}</span>
        </button>
      </div>

      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search notifications..." 
          class="search-input"
        >
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="loader"></div>
        <p>Loading notifications...</p>
      </div>

      <div v-else>
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <i class="fas fa-bell-slash"></i>
          <h3>No notifications found</h3>
          <p>{{ searchQuery ? 'Try adjusting your search' : 'You\'re all caught up!' }}</p>
        </div>

        <div v-else class="notifications-list">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id" 
            :class="['notification-card', notification.type, { 'unread': !notification.read }]"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon">
              <i :class="`fas ${
                notification.type === 'warning' ? 'fa-exclamation-triangle' :
                notification.type === 'danger' ? 'fa-exclamation-circle' :
                notification.type === 'info' ? 'fa-info-circle' : 'fa-check-circle'
              }`"></i>
            </div>
            
            <div class="notification-content">
              <div class="notification-header">
                <h3>{{ notification.title }}</h3>
                <span class="notification-time">{{ formatRelativeTime(notification.timestamp) }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-device">
                <i class="fas fa-microchip"></i>
                <span>{{ notification.device }}</span>
              </div>
              
              <div class="notification-actions">
                <router-link 
                  v-if="notification.deviceId" 
                  :to="`/device/${notification.deviceId}`" 
                  class="btn-action"
                >
                  View Device
                </router-link>
                <button class="btn-action">Dismiss</button>
              </div>
            </div>
            
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications {
  padding: 2rem 0;
  min-height: 100vh;
  background-color: var(--background-dark);
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.notification-tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--box-shadow);
}

.notification-tabs button {
  flex: 1;
  background: none;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.notification-tabs button.active {
  background: var(--primary-color);
  color: white;
}

.badge {
  background: var(--background-dark);
  color: var(--text-secondary);
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.notification-tabs button.active .badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.search-container {
  position: relative;
  margin-bottom: 2rem;
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
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  box-shadow: var(--box-shadow);
}

.btn-mark-all {
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-mark-all:hover {
  background: var(--primary-color);
  color: white;
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
  background: white;
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  display: flex;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  border-left: 4px solid var(--primary-color);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.notification-card.info .notification-icon {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
}

.notification-card.warning .notification-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.notification-card.danger .notification-icon {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.notification-card.success .notification-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  align-items: flex-start;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.notification-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-left: 1rem;
}

.notification-message {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.notification-device {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.notification-actions {
  display: flex;
  gap: 1rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: var(--text-primary);
  display: inline-block;
}

.btn-action:first-child {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-action:first-child:hover {
  background: var(--primary-color);
  color: white;
}

.unread-indicator {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
}

@media (max-width: 768px) {
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn-mark-all {
    align-self: flex-start;
  }
  
  .notification-tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding: 0.5rem;
    display: flex;
    width: 100%;
  }
  
  .notification-tabs button {
    min-width: 100px;
    flex: none;
  }
  
  .notification-card {
    flex-direction: column;
  }
  
  .notification-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .notification-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .notification-time {
    margin-left: 0;
  }
  
  .notification-actions {
    flex-wrap: wrap;
  }
}
</style>
