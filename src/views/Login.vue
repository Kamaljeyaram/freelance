<script setup>
import { ref, onMounted } from 'vue';
import AuthForm from '../components/AuthForm.vue';

const isLogin = ref(true);
const isLoading = ref(false);
const features = [
  { icon: '🔒', text: 'Enhanced Security' },
  { icon: '📊', text: 'Real-time Dashboard' },
  { icon: '🔔', text: 'Instant Notifications' },
  { icon: '📱', text: 'Mobile Access' }
];

function toggleForm() {
  isLogin.value = !isLogin.value;
}

onMounted(() => {
  // Animation for login page elements
  const elements = document.querySelectorAll('.animate-element');
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 100 * index);
  });
});
</script>

<template>
  <div class="login-container" :class="{ 'loading': isLoading }">
    <div class="login-content">
      <div class="login-left animate-element">
        <div class="brand-section">
          <h2 class="brand-name">StructureMonitor</h2>
          <p class="brand-tagline">Intelligent Infrastructure Monitoring</p>
        </div>

        <div class="welcome-message animate-element">
          <h3>{{ isLogin ? 'Welcome Back!' : 'Join Us Today!' }}</h3>
          <p>{{ isLogin 
            ? 'Access your monitoring dashboard and stay informed about your infrastructure.' 
            : 'Create an account to start monitoring your infrastructure with our advanced tools.' }}
          </p>
        </div>

        <div class="features-list">
          <div 
            v-for="(feature, index) in features" 
            :key="index" 
            class="feature-item animate-element"
            :style="{animationDelay: `${index * 0.1 + 0.3}s`}"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <span>{{ feature.text }}</span>
          </div>
        </div>
        
        <div class="decoration">
          <div class="cube cube-1"></div>
          <div class="cube cube-2"></div>
          <div class="cube cube-3"></div>
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
        </div>
      </div>
      
      <div class="login-card animate-element">
        <div class="form-header">
          <h1>{{ isLogin ? 'Sign In' : 'Create Account' }}</h1>
          <p class="subtitle">
            {{ isLogin ? 'Monitor your infrastructure with confidence' : 'Join us to get started with smart monitoring' }}
          </p>
        </div>

        <AuthForm :is-login="isLogin" />
        
        <div class="toggle-section">
          <p>
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <button @click="toggleForm" class="toggle-btn">
              {{ isLogin ? 'Sign Up' : 'Login' }}
            </button>
          </p>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader"></div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.login-content {
  display: flex;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1100px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 3rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.brand-section {
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.brand-name {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, white, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-tagline {
  font-size: 1.1rem;
  opacity: 0.9;
}

.welcome-message {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  margin: 2rem 0;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome-message h3 {
  font-size: 1.7rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.welcome-message p {
  line-height: 1.6;
  opacity: 0.9;
  font-size: 1.1rem;
}

.features-list {
  display: grid;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

.feature-icon {
  font-size: 1.8rem;
  background: rgba(255, 255, 255, 0.2);
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-card {
  flex: 1;
  padding: 3.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-header h1 {
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 3s ease infinite;
  background-size: 200% 100%;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.toggle-section {
  margin-top: 2rem;
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  cursor: pointer;
}

.toggle-btn:hover {
  color: var(--secondary-color);
  transform: translateY(-2px);
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

/* Decoration elements */
.decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.cube {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  animation: float 10s infinite ease-in-out;
}

.cube-1 {
  width: 60px;
  height: 60px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.cube-2 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 5%;
  animation-delay: 2s;
}

.cube-3 {
  width: 40px;
  height: 40px;
  bottom: 30%;
  right: 20%;
  animation-delay: 4s;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: pulse 8s infinite ease-in-out;
}

.circle-1 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: -50px;
  left: 30%;
  animation-delay: 3s;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

/* Animate elements on page load */
.animate-element {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.animate-element.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .login-card {
    padding: 2.5rem;
  }
  
  .login-left {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
    max-width: 500px;
  }

  .login-left {
    padding: 2.5rem 2rem;
    min-height: 300px;
  }

  .login-card {
    padding: 2rem;
  }

  .welcome-message {
    margin: 1.5rem 0;
    padding: 1.5rem;
  }
  
  .feature-item {
    font-size: 1rem;
  }
  
  .feature-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }

  .form-header h1 {
    font-size: 2.2rem;
  }
  
  .login-container {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .features-list {
    display: none;
  }
  
  .login-left {
    min-height: 220px;
  }
  
  .welcome-message h3 {
    font-size: 1.4rem;
  }
  
  .welcome-message p {
    font-size: 1rem;
  }
  
  .form-header h1 {
    font-size: 1.8rem;
  }
  
  .brand-name {
    font-size: 1.8rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
}
</style>
