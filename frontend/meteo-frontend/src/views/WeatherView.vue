<template>
  <!-- Loading skeleton -->
  <div v-if="!weatherData" class="weather-card weather-card--loading">
    <div class="skeleton skeleton--city"></div>
    <div class="skeleton skeleton--temp"></div>
    <div class="skeleton skeleton--desc"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton--stat" v-for="i in 4" :key="i"></div>
    </div>
  </div>

  <!-- Weather card -->
  <div v-else-if="weatherData.success" class="weather-card">
    <div class="card-top">
      <div class="card-city">{{ weatherData.data.city }}</div>
      <div class="card-temp">{{ weatherData.data.temperature }}</div>
      <div class="card-desc-row">
        <img
          class="card-icon"
          :src="getWeatherIcon(weatherData.data.icon)"
          :alt="weatherData.data.description"
        />
        <span class="card-desc">{{ weatherData.data.description }}</span>
      </div>
    </div>

    <div class="card-divider"></div>

    <div class="card-stats">
      <div class="stat-item">
        <span class="stat-icon">💧</span>
        <span class="stat-value">{{ weatherData.data.humidity }}</span>
        <span class="stat-label">Humidity</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <span class="stat-value">{{ weatherData.data.pressure }}</span>
        <span class="stat-label">Pressure</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">💨</span>
        <span class="stat-value">{{ weatherData.data.wind_speed }}</span>
        <span class="stat-label">Wind</span>
      </div>
    </div>
  </div>

  <!-- Error state -->
  <div v-else class="weather-card weather-card--error">
    <span class="error-icon">⚠</span>
    <p class="error-text">{{ weatherData.message }}</p>
  </div>
</template>

<script>
export default {
  props: {
    city: String
  },
  data() {
    return {
      weatherData: null,
    };
  },
  methods: {
    async getWeather() {
      try {
        const response = await this.$http.post('/api/weather', { city: this.city });
        this.weatherData = response.data;
      } catch (error) {
        console.error('There was an error:', error);
        this.weatherData = { success: false, message: 'Failed to retrieve data' };
      }
    },
    getWeatherIcon(icon) {
      return `https://openweathermap.org/img/wn/${icon}@2x.png`;
    },
  },
  watch: {
    city(newCity) {
      this.weatherData = null;
      if (newCity) {
        this.getWeather();
      }
    }
  },
  mounted() {
    if (this.city) {
      this.getWeather();
    }
  }
};
</script>

<style scoped>
.weather-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--r-lg);
  padding: 2rem 1.75rem 1.5rem;
  animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
  box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* ── Top section ── */
.card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
}

.card-city {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.9;
}

.card-temp {
  font-size: clamp(3.5rem, 12vw, 5.5rem);
  font-weight: 300;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--text-1);
  margin: 0.25rem 0;
}

.card-desc-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-icon {
  width: 44px;
  height: 44px;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.35));
}

.card-desc {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-2);
  text-transform: capitalize;
}

/* ── Divider ── */
.card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
  margin: 1.5rem 0 1.25rem;
}

/* ── Stats ── */
.card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0.75rem 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--r-md);
  transition: background var(--transition-fast);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.stat-icon {
  font-size: 1rem;
  line-height: 1;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-1);
}

.stat-label {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-3);
}

/* ── Loading skeleton ── */
.weather-card--loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.05) 0%,
    rgba(255,255,255,0.12) 50%,
    rgba(255,255,255,0.05) 100%
  );
  background-size: 400px 100%;
  border-radius: 8px;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton--city  { width: 80px;  height: 14px; }
.skeleton--temp  { width: 140px; height: 72px; border-radius: 12px; }
.skeleton--desc  { width: 120px; height: 14px; }

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
}

.skeleton--stat {
  height: 72px;
  border-radius: var(--r-md);
}

/* ── Error ── */
.weather-card--error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1.75rem;
  border-color: rgba(251, 113, 133, 0.15);
  background: rgba(251, 113, 133, 0.05);
}

.error-icon {
  font-size: 1.8rem;
  opacity: 0.7;
}

.error-text {
  font-size: 0.9rem;
  color: #fda4af;
  text-align: center;
}
</style>
