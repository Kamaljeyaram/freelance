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
    component: DeviceDetails
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
