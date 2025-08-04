<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';

onMounted(() => {
  // Animate the 3D elements
  gsap.timeline()
    .from('.hero-content', { 
      duration: 1,
      y: 50,
      opacity: 0,
      ease: 'power3.out'
    })
    .from('.monitoring-cube', {
      duration: 0.8,
      scale: 0,
      rotation: 45,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    }, '-=0.5')
    .from('.data-point', {
      duration: 0.6,
      scale: 0,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.3');
});

// Add reactive data for stats
const stats = [
  { value: '1000+', label: 'Sensors Deployed' },
  { value: '99.99%', label: 'System Reliability' },
  { value: '< 0.1s', label: 'Response Time' }
];

const features = [
  {
    icon: 'fas fa-building',
    title: 'Infrastructure Health',
    desc: 'Monitor structural integrity with advanced IoT sensors and real-time analysis'
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Predictive Maintenance',
    desc: 'Prevent structural failures with AI-powered early warning system'
  },
  {
    icon: 'fas fa-chart-bar',
    title: 'Advanced Analytics',
    desc: 'Make data-driven decisions with comprehensive structural analysis'
  }
];

// Add testimonials data
const testimonials = [
  {
    text: "This monitoring system has revolutionized how we maintain our infrastructure. The predictive analytics are incredibly accurate.",
    author: "Sarah Chen",
    position: "Chief Engineer, MetroTech",
    image: "/avatars/sarah.jpg"
  },
  {
    text: "The real-time alerts and intuitive dashboard have helped us prevent several critical failures. Absolutely worth the investment.",
    author: "Michael Rodriguez",
    position: "Infrastructure Manager, BuildCorp",
    image: "/avatars/michael.jpg"
  },
  {
    text: "Outstanding system reliability and the support team is always there when we need them. Highly recommended!",
    author: "Emily Watson",
    position: "Operations Director, CityBridge",
    image: "/avatars/emily.jpg"
  }
];

const isLoadingTestimonials = ref(true);
const newsletterEmail = ref('');
const subscriptionStatus = ref('');

// Simulate testimonials loading
onMounted(() => {
  setTimeout(() => {
    isLoadingTestimonials.value = false;
  }, 1500);

  // Setup intersection observer for features
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('feature-visible');
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
  });
});

const handleNewsletterSubmit = async () => {
  try {
    subscriptionStatus.value = 'Subscribing...';
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    subscriptionStatus.value = 'Thank you for subscribing!';
    newsletterEmail.value = '';
  } catch (error) {
    subscriptionStatus.value = 'Failed to subscribe. Please try again.';
  }
};
</script>

<template>
  <div class="home">
    <div class="content-wrapper">
      <div class="hero">
        <div class="hero-content">
          <h1 class="animate-slide-down">
            StructureMonitor
          </h1>
          <p class="animate-fade-in">
            Protect your infrastructure with cutting-edge IoT sensors and AI-powered analytics. 
            Get real-time insights and predictive maintenance recommendations.
          </p>
          <div class="cta-buttons">
            <router-link to="/login" class="btn btn-primary">Login to Dashboard</router-link>
          </div>
          
          <div class="stats-preview">
            <div v-for="(stat, index) in stats" :key="index" class="stat">
              <h4>{{ stat.value }}</h4>
              <p>{{ stat.label }}</p>
            </div>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="isometric-grid">
            <!-- 3D Monitoring Elements -->
            <div class="monitoring-cube cube-1">
              <div class="cube-face front"></div>
              <div class="cube-face right"></div>
              <div class="cube-face top"></div>
              <div class="data-point">
                <span class="pulse"></span>
                <span class="value">98.5</span>
              </div>
            </div>
            
            <div class="monitoring-cube cube-2">
              <div class="cube-face front"></div>
              <div class="cube-face right"></div>
              <div class="cube-face top"></div>
              <div class="data-point">
                <span class="pulse"></span>
                <span class="value">0.3Hz</span>
              </div>
            </div>
            
            <div class="monitoring-cube cube-3">
              <div class="cube-face front"></div>
              <div class="cube-face right"></div>
              <div class="cube-face top"></div>
              <div class="graph-overlay">
                <div class="graph-bar"></div>
                <div class="graph-bar"></div>
                <div class="graph-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="features">
        <div v-for="(feature, index) in features" :key="index" class="feature-card">
          <i :class="feature.icon"></i>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>

      <!-- Add Testimonials Section -->
      <div class="testimonials">
        <h2>What Our Clients Say</h2>
        <div class="testimonials-grid">
          <template v-if="isLoadingTestimonials">
            <div v-for="n in 3" :key="n" class="testimonial-card loading">
              <div class="loading-avatar"></div>
              <div class="loading-text"></div>
              <div class="loading-text short"></div>
            </div>
          </template>
          <template v-else>
            <div v-for="(testimonial, index) in testimonials" 
                 :key="index" 
                 class="testimonial-card">
              <div class="quote-mark">"</div>
              <p class="testimonial-text">{{ testimonial.text }}</p>
              <div class="testimonial-author">
                <img :src="testimonial.image" :alt="testimonial.author">
                <div class="author-details">
                  <h4>{{ testimonial.author }}</h4>
                  <p>{{ testimonial.position }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Newsletter Section -->
      <div class="newsletter-section">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for the latest structural monitoring insights.</p>
        <form @submit.prevent="handleNewsletterSubmit" class="newsletter-form">
          <input 
            type="email" 
            v-model="newsletterEmail" 
            placeholder="Enter your email"
            required
          >
          <button type="submit" class="btn btn-primary">Subscribe</button>
        </form>
        <p v-if="subscriptionStatus" class="subscription-status">{{ subscriptionStatus }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 6rem 0 4rem; /* reduced padding */
  align-items: center;
}

.hero-content {
  max-width: 600px;
}

.stats-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;
  text-align: center;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  padding: 4rem 0; /* reduced padding */
  margin: 2rem auto; /* added margin */
}

.feature-card {
  background: white;
  border: 1px solid var(--border-color);
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(148, 163, 184, 0.2);
  border-color: var(--primary-color);
}

.feature-card i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.hero-visual {
  position: relative;
}

.isometric-grid {
  position: relative;
  transform: rotateX(45deg) rotateZ(45deg);
  transform-style: preserve-3d;
  perspective: 1000px;
  height: 400px;
  width: 400px;
  margin: 2rem auto;
}

.monitoring-cube {
  position: absolute;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  animation: rotate 15s infinite linear;
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(67, 97, 238, 0.1);
  border: 2px solid var(--primary-color);
  transition: all 0.3s ease;
}

.front { transform: translateZ(50px); }
.right { transform: rotateY(90deg) translateZ(50px); }
.top { transform: rotateX(-90deg) translateZ(50px); }

.cube-1 {
  top: 20%;
  left: 20%;
}

.cube-2 {
  top: 40%;
  left: 50%;
}

.cube-3 {
  top: 60%;
  left: 30%;
}

.data-point {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 2;
}

.pulse {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 2s infinite;
}

.graph-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 10px;
}

.graph-bar {
  width: 20%;
  background: var(--primary-color);
  animation: graphBounce 2s infinite;
}

.graph-bar:nth-child(1) { height: 60%; animation-delay: 0s; }
.graph-bar:nth-child(2) { height: 80%; animation-delay: 0.2s; }
.graph-bar:nth-child(3) { height: 40%; animation-delay: 0.4s; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes graphBounce {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.8); }
}

/* Remove floating cards styles */
.floating-cards {
  display: none;
}

.hero-image {
  display: none;
}

.badge {
  background: var(--accent-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: inline-block;
}

.testimonials {
  padding: 4rem 0; /* reduced padding */
  margin: 2rem 0; /* added margin */
}

.testimonials h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(to right, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  margin-top: 4rem;
}

.testimonial-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(148, 163, 184, 0.2);
}

.quote-mark {
  position: absolute;
  top: -20px;
  left: 20px;
  font-size: 4rem;
  color: var(--primary-color);
  opacity: 0.2;
  font-family: serif;
}

.testimonial-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-author img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.author-details p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Remove trust section styles */
.trust-section,
.trust-grid,
.trust-item {
  display: none;
}

/* Add infinite rotation animation for cubes */
.monitoring-cube {
  animation: rotate 15s infinite linear;
}

@keyframes rotate {
  from { transform: rotate3d(1, 1, 1, 0deg); }
  to { transform: rotate3d(1, 1, 1, 360deg); }
}

/* Feature animation styles */
.feature-card {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.feature-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Loading states for testimonials */
.testimonial-card.loading {
  min-height: 250px;
}

.loading-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.loading-text {
  height: 20px;
  margin: 10px 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.loading-text.short {
  width: 60%;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Newsletter section styles */
.newsletter-section {
  background: white;
  border-radius: 24px;
  box-shadow: var(--box-shadow);
  padding: 4rem 2rem;
  margin: 4rem auto;
  max-width: 800px;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 2rem auto;
}

.newsletter-form input {
  padding: 1rem 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
}

.newsletter-form input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

.subscription-status {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--primary-color);
}

/* Update responsive styles */
@media (max-width: 1200px) {
  .features,
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 1rem;
  }

  .hero {
    padding: 3rem 0; /* reduced padding for mobile */
  }

  .features,
  .testimonials,
  .newsletter-section {
    padding: 3rem 0; /* consistent padding for mobile */
    margin: 1rem 0; /* reduced margin for mobile */
  }
  
  .features,
  .testimonials-grid,
  .trust-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .isometric-grid {
    margin: 0 auto;
  }

  .newsletter-form {
    flex-direction: column;
    padding: 0 1rem;
  }

  .cta-buttons {
    justify-content: center;
  }
}
</style>

