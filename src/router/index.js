import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Reports from '../views/Reports.vue'
import Alerts from '../views/Alerts.vue'
import DeviceDetails from '../views/devicedetails.vue'
import Notifications from '../views/notification.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: Alerts
  },
  {
    path: '/device/:id',
    name: 'DeviceDetails',
    component: DeviceDetails,
    beforeEnter: (to, from, next) => {
      // Debug route parameters
      console.log('🚀 Navigating to device route')
      console.log('📍 Route params:', to.params)
      console.log('🔢 Device ID:', to.params.id)

      // Validate device ID
      const deviceId = parseInt(to.params.id)
      if (isNaN(deviceId) || deviceId < 1 || deviceId > 12) {
        console.warn('⚠️ Invalid device ID, redirecting to dashboard')
        next('/dashboard')
      } else {
        console.log('✅ Valid device ID, proceeding to DeviceDetails')
        next()
      }
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications
  },
  {
    // Catch-all route for undefined paths
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard for debugging
router.beforeEach((to, from, next) => {
  console.log('🧭 Router navigation:')
  console.log('  From:', from.path)
  console.log('  To:', to.path)
  console.log('  Params:', to.params)
  next()
})

export default router
