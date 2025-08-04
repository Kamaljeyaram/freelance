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
      <a href="#" class="forgot-password">Forgot password?</a>
    </div>

    <button type="submit" class="btn-submit" :disabled="isLoading">
      <span v-if="isLoading" class="loading-spinner"></span>
      <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
    </button>

    <div class="divider">
      <span>or continue with</span>
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
  gap: 1.5rem;
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
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  z-index: 1;
  transition: color 0.3s;
}

.form-input {
  width: 100%;
  padding: 0.9rem 2.5rem 0.9rem 2.75rem;
  font-size: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: white;
  height: 48px;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
  outline: none;
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  transform: translateY(-2.25rem) translateX(-0.75rem) scale(0.8);
  color: var(--primary-color);
  background: white;
  padding: 0 0.5rem;
}

.form-input:focus ~ i {
  color: var(--primary-color);
}

.form-label {
  position: absolute;
  left: 2.75rem;
  top: 1rem;
  font-size: 1rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  pointer-events: none;
  transform-origin: left top;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  width: 100%;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  user-select: none;
}

.remember-me input {
  accent-color: var(--primary-color);
  margin: 0;
  height: 16px;
  width: 16px;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  margin-left: auto;
}

.forgot-password:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  margin: 0.5rem 0;
  position: relative;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
  position: relative;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 1rem 0;
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
  padding: 0 1.5rem;
  white-space: nowrap;
}

.social-logins {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  margin: 0.5rem 0;
}

.btn-social {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.btn-social:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
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

@media (max-width: 768px) {
  .form-options {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
  }
  
  .forgot-password {
    margin-left: 0;
  }
  
  .social-logins {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .social-logins {
    justify-content: space-around;
  }
}
</style>
