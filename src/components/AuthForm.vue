<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  isLogin: Boolean
});

const router = useRouter();
const form = ref({
  email: '',
  password: '',
  confirmPassword: ''
});

const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

async function handleSubmit() {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Mock authentication - in a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, allow any login
    console.log(`User ${props.isLogin ? 'logged in' : 'signed up'} with email: ${form.email}`);
    
    // Navigate to dashboard after successful login/signup
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error.message || 'Authentication failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

function socialLogin(provider) {
  isLoading.value = true;
  
  // Mock social login - in a real app, this would redirect to OAuth
  setTimeout(() => {
    console.log(`Logged in with ${provider}`);
    router.push('/dashboard');
  }, 1000);
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>
    
    <div class="form-group">
      <div class="input-icon-wrapper">
        <i class="fas fa-envelope"></i>
        <input 
          type="email" 
          v-model="form.email" 
          id="email"
          placeholder=" "
          class="form-input" 
          required
        >
        <label for="email" class="form-label">Email Address</label>
      </div>
    </div>
    
    <div class="form-group">
      <div class="input-icon-wrapper">
        <i class="fas fa-lock"></i>
        <input 
          type="password" 
          v-model="form.password" 
          id="password"
          placeholder=" "
          class="form-input" 
          required
        >
        <label for="password" class="form-label">Password</label>
      </div>
    </div>

    <div v-if="!isLogin" class="form-group">
      <div class="input-icon-wrapper">
        <i class="fas fa-lock"></i>
        <input 
          type="password"
          v-model="form.confirmPassword" 
          id="confirmPassword"
          placeholder=" "
          class="form-input" 
          required
        >
        <label for="confirmPassword" class="form-label">Confirm Password</label>
      </div>
    </div>

    <div class="form-options" v-if="isLogin">
      <label class="remember-me">
        <input type="checkbox" v-model="rememberMe">
        <span>Remember me</span>
      </label>
      <a href="#" class="forgot-password">Forgot?</a>
    </div>

    <button type="submit" class="btn-submit" :disabled="isLoading">
      <span v-if="isLoading" class="loading-spinner"></span>
      <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
    </button>

    <div class="divider">
      <span>or</span>
    </div>

    <div class="social-logins">
      <button 
        type="button" 
        class="btn-social google" 
        @click="socialLogin('Google')"
      >
        <i class="fab fa-google"></i>
      </button>
      <button 
        type="button" 
        class="btn-social microsoft" 
        @click="socialLogin('Microsoft')"
      >
        <i class="fab fa-microsoft"></i>
      </button>
      <button 
        type="button" 
        class="btn-social apple" 
        @click="socialLogin('Apple')"
      >
        <i class="fab fa-apple"></i>
      </button>
    </div>
  </form>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Reduced from 1.5rem */
  width: 100%;
}

.form-group {
  position: relative;
}

.input-icon-wrapper {
  position: relative;
}

.input-icon-wrapper i {
  position: absolute;
  left: 0.8rem; /* Reduced from 1rem */
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  z-index: 1;
  transition: color 0.3s;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.3rem; /* Reduced padding */
  font-size: 0.9rem; /* Reduced from 1rem */
  border: 1px solid var(--border-color); /* Reduced from 2px */
  border-radius: 8px; /* Reduced from 12px */
  transition: all 0.3s ease;
  background-color: white;
  height: 42px; /* Reduced from 48px */
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1); /* Reduced from 4px */
  outline: none;
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  transform: translateY(-1.9rem) translateX(-0.75rem) scale(0.8);
  color: var(--primary-color);
  background: white;
  padding: 0 0.5rem;
}

.form-input:focus ~ i {
  color: var(--primary-color);
}

.form-label {
  position: absolute;
  left: 2.3rem; /* Adjusted based on reduced padding */
  top: 0.8rem; /* Adjusted for smaller input */
  font-size: 0.9rem; /* Reduced from 1rem */
  color: var(--text-secondary);
  transition: all 0.3s ease;
  pointer-events: none;
  transform-origin: left top;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem; /* Reduced from 0.9rem */
  margin: 0.3rem 0;
  width: 100%;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.4rem; /* Reduced from 0.5rem */
  cursor: pointer;
  color: var(--text-secondary);
  user-select: none;
}

.remember-me input {
  accent-color: var(--primary-color);
  margin: 0;
  height: 14px; /* Reduced from 16px */
  width: 14px; /* Reduced from 16px */
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  margin-left: auto;
}

.btn-submit {
  width: 100%;
  padding: 0.8rem; /* Reduced from 1rem */
  border-radius: 8px; /* Reduced from 12px */
  border: none;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-weight: 600;
  font-size: 0.95rem; /* Reduced from 1.1rem */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15); /* Reduced shadow */
  margin: 0.3rem 0;
  position: relative;
}

.loading-spinner {
  display: inline-block;
  width: 16px; /* Reduced from 20px */
  height: 16px; /* Reduced from 20px */
  border: 2px solid rgba(255, 255, 255, 0.3); /* Reduced from 3px */
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
  position: relative;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  padding: 0.6rem; /* Reduced from 0.75rem */
  border-radius: 6px; /* Reduced from 8px */
  display: flex;
  align-items: center;
  gap: 0.4rem; /* Reduced from 0.5rem */
  font-size: 0.8rem; /* Reduced from 0.9rem */
  margin-bottom: 0.8rem; /* Reduced from 1rem */
}

.divider {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.8rem; /* Reduced from 0.9rem */
  margin: 0.8rem 0; /* Reduced from 1rem */
  width: 100%;
  text-align: center;
}

.divider:before,
.divider:after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 1rem; /* Reduced from 1.5rem */
  white-space: nowrap;
}

.social-logins {
  display: flex;
  justify-content: center;
  gap: 1rem; /* Reduced from 1.5rem */
  width: 100%;
  margin: 0.3rem 0; /* Reduced from 0.5rem */
}

.btn-social {
  width: 38px; /* Reduced from 48px */
  height: 38px; /* Reduced from 48px */
  border-radius: 8px; /* Reduced from 12px */
  border: 1px solid var(--border-color);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem; /* Reduced from 1.25rem */
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.google {
  color: #EA4335;
}

.microsoft {
  color: #00A4EF;
}

.apple {
  color: #555;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Adjusted media queries for smaller forms */
@media (max-width: 768px) {
  .form-options {
    justify-content: space-between;
  }
}
</style>
