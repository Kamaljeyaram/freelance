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
      <!-- Compact version of login left side -->
      <div class="login-left animate-element">
        <div class="brand-section">
          <h2 class="brand-name">StructureMonitor</h2>
          <p class="brand-tagline">Intelligent Infrastructure Monitoring</p>
        </div>

        <div class="welcome-message animate-element">
          <h3>{{ isLogin ? 'Welcome Back!' : 'Join Us Today!' }}</h3>
          <p>{{ isLogin 
            ? 'Access your monitoring dashboard.' 
            : 'Create an account to start monitoring.' }}
          </p>
        </div>

        <!-- Streamlined features list -->
        <div class="features-list">
          <div 
            v-for="(feature, index) in features" 
            :key="index" 
            class="feature-item animate-element"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <span>{{ feature.text }}</span>
          </div>
        </div>
        
        <!-- Simplified decoration -->
        <div class="decoration">
          <div class="circle circle-1"></div>
        </div>
      </div>
      
      <!-- Compact login card -->
      <div class="login-card animate-element">
        <div class="form-header">
          <h1>{{ isLogin ? 'Sign In' : 'Sign Up' }}</h1>
          <p class="subtitle">
            {{ isLogin ? 'Monitor with confidence' : 'Get started with monitoring' }}
          </p>
        </div>

        <AuthForm :is-login="isLogin" />
        
        <div class="toggle-section">
          <p>
            {{ isLogin ? "No account?" : "Have an account?" }}
            <button @click="toggleForm" class="toggle-btn">
              {{ isLogin ? 'Sign Up' : 'Sign In' }}
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
  padding: 1.5rem; /* Increased from 1rem */
  position: relative;
  overflow: hidden;
}

.login-content {
  display: flex;
  background: white;
  border-radius: 18px; /* Increased from 16px */
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12); /* Enhanced shadow */
  width: 100%;
  max-width: 950px; /* Increased from 900px */
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 2.5rem; /* Increased from 2rem */
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.brand-section {
  margin-bottom: 2rem; /* Increased from 1.5rem */
  position: relative;
  z-index: 2;
}

.brand-name {
  font-size: 2rem; /* Increased from 1.8rem */
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, white, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-tagline {
  font-size: 1rem; /* Increased from 0.9rem */
  opacity: 0.9;
}

.welcome-message {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.8rem; /* Increased from 1.5rem */
  border-radius: 14px; /* Increased from 12px */
  backdrop-filter: blur(10px);
  margin: 1.5rem 0; /* Increased from 1rem 0 */
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome-message h3 {
  font-size: 1.6rem; /* Increased from 1.4rem */
  margin-bottom: 0.7rem; /* Increased from 0.5rem */
  font-weight: 600;
}

.welcome-message p {
  line-height: 1.6; /* Increased from 1.5 */
  opacity: 0.9;
  font-size: 1rem; /* Increased from 0.9rem */
}

.features-list {
  display: grid;
  gap: 1.2rem; /* Increased from 1rem */
  position: relative;
  z-index: 2;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem; /* Increased from 0.8rem */
  font-size: 1rem; /* Increased from 0.9rem */
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

.feature-icon {
  font-size: 1.6rem; /* Increased from 1.4rem */
  background: rgba(255, 255, 255, 0.2);
  width: 2.8rem; /* Increased from 2.5rem */
  height: 2.8rem; /* Increased from 2.5rem */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px; /* Increased from 10px */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-card {
  flex: 1;
  padding: 2.5rem; /* Increased from 2rem */
  display: flex;
  flex-direction: column;
  position: relative;
  background: white;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem; /* Increased from 1.5rem */
}

.form-header h1 {
  font-size: 2.2rem; /* Increased from 2rem */
  margin-bottom: 0.6rem; /* Increased from 0.5rem */
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 3s ease infinite;
  background-size: 200% 100%;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem; /* Increased from 0.9rem */
}

.toggle-section {
  margin-top: 2rem; /* Increased from 1.5rem */
  text-align: center;
  padding-top: 1.8rem; /* Increased from 1.5rem */
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 1rem; /* Increased from 0.9rem */
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  padding: 0.6rem; /* Increased from 0.5rem */
  transition: all 0.3s ease;
  font-size: 1rem; /* Increased from 0.9rem */
  cursor: pointer;
}

/* Simplified decoration */
.decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 180px; /* Increased from 150px */
  height: 180px; /* Increased from 150px */
  bottom: -90px;
  right: -60px;
}

/* Animations */
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

/* Animate elements on page load */
.animate-element {
  opacity: 0;
  transform: translateY(20px); /* Reduced from 30px */
  transition: all 0.5s ease; /* Reduced from 0.6s */
}

.animate-element.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Media queries - updated for slightly larger display */
@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
    max-width: 450px; /* Increased from 400px */
  }

  .login-left {
    padding: 1.8rem; /* Increased from 1.5rem */
    min-height: 280px; /* Increased from 250px */
  }
}

@media (max-width: 480px) {
  .login-left {
    min-height: 220px; /* Increased from 200px */
  }
  
  .welcome-message {
    margin: 0.7rem 0; /* Increased from 0.5rem */
    padding: 1.2rem; /* Increased from 1rem */
  }
  
  .welcome-message h3 {
    font-size: 1.4rem; /* Increased from 1.2rem */
  }
  
  .form-header h1 {
    font-size: 1.8rem; /* Increased from 1.6rem */
  }
  
  .brand-name {
    font-size: 1.7rem; /* Increased from 1.5rem */
  }
  
  .login-card {
    padding: 1.5rem; /* Increased from 1.2rem */
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.3; }
}
</style>
