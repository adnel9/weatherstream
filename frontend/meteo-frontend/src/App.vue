<script setup>
import { ref, onMounted } from 'vue'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'
import WeatherView from './views/WeatherView.vue'
import NotificationColumn from './components/NotificationBar.vue'
import { useAuth } from './components/useAuth'
import Preferences from './components/Preferences.vue'

const showLoginModal = ref(false)
const showSignupModal = ref(false)
const showFavorites = ref(false)
const showNotifications = ref(false)

const city = ref('')
const selectedCity = ref('')
const showWeather = ref(false)
const isSearching = ref(false)

const { isAuthenticated, login, logout } = useAuth()

const getWeather = () => {
  if (city.value.trim()) {
    selectedCity.value = city.value.trim()
    showWeather.value = true
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') getWeather()
}

const checkToken = () => {
  const token = localStorage.getItem('token')
  if (token) {
    login({ token })
  }
}

const closeModal = () => {
  showLoginModal.value = false
  showSignupModal.value = false
  showFavorites.value = false
}

const closeFavoritesModal = () => {
  showFavorites.value = false
}

const closeNotifications = () => {
  showNotifications.value = false
}

onMounted(() => {
  checkToken()
})
</script>

<template>
  <!-- Animated background -->
  <div class="app-bg"></div>

  <div class="app-shell">
    <!-- Top navigation bar -->
    <header class="top-nav">
      <div class="nav-brand">
        <span class="brand-icon">⛅</span>
        <span class="brand-name">WeatherStream</span>
      </div>

      <nav class="nav-actions">
        <template v-if="isAuthenticated">
          <button
            class="nav-btn"
            :class="{ active: showNotifications }"
            @click="showNotifications = !showNotifications"
            title="Rain alerts"
          >
            <span class="nav-btn-icon">🌧</span>
            <span class="nav-btn-label">Alerts</span>
          </button>
          <button
            class="nav-btn"
            :class="{ active: showFavorites }"
            @click="showFavorites = true"
            title="Favorite cities"
          >
            <span class="nav-btn-icon">★</span>
            <span class="nav-btn-label">Favorites</span>
          </button>
          <button class="nav-btn nav-btn--logout" @click="logout" title="Sign out">
            <span class="nav-btn-icon">↩</span>
            <span class="nav-btn-label">Sign out</span>
          </button>
        </template>
        <template v-else>
          <button class="nav-btn" @click="showLoginModal = true">Sign in</button>
          <button class="nav-btn nav-btn--accent" @click="showSignupModal = true">Sign up</button>
        </template>
      </nav>
    </header>

    <!-- Main content -->
    <main class="main-content">
      <!-- Hero search area -->
      <section class="hero-section">
        <div class="hero-eyebrow">Weather, anywhere.</div>
        <h1 class="hero-title">What's the weather in</h1>

        <div class="search-container">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input
              v-model="city"
              type="text"
              class="search-input"
              placeholder="Search a city…"
              @keydown="handleKeydown"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              class="search-btn"
              @click="getWeather"
              :disabled="!city.trim()"
            >
              <span>Go</span>
              <span class="search-btn-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Weather result -->
      <Transition name="weather-appear">
        <section v-if="showWeather" class="weather-section">
          <WeatherView :city="selectedCity" />
        </section>
      </Transition>

      <!-- Empty state hint -->
      <Transition name="fade">
        <div v-if="!showWeather" class="empty-hint">
          <div class="empty-hint-grid">
            <div class="hint-city" @click="city = 'Paris'; getWeather()">Paris</div>
            <div class="hint-city" @click="city = 'Tokyo'; getWeather()">Tokyo</div>
            <div class="hint-city" @click="city = 'New York'; getWeather()">New York</div>
            <div class="hint-city" @click="city = 'London'; getWeather()">London</div>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Overlays -->
    <NotificationColumn v-if="showNotifications" :closeColumn="closeNotifications" />
    <Login v-if="showLoginModal" @close="closeModal" />
    <Signup v-if="showSignupModal" @close="closeModal" />
    <Preferences
      v-if="isAuthenticated && showFavorites"
      :closeModal="closeFavoritesModal"
      :showFavorites="showFavorites"
    />
  </div>
</template>

<style scoped>
/* ── Shell ── */
.app-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Navigation ── */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
  height: 60px;
  background: rgba(2, 8, 23, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  animation: slideDown 0.4s ease both;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.brand-name {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.9);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.65);
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.15);
}

.nav-btn.active {
  background: var(--accent-dim);
  border-color: rgba(56, 189, 248, 0.3);
  color: var(--accent);
}

.nav-btn--accent {
  background: var(--accent-dim);
  border-color: rgba(56, 189, 248, 0.25);
  color: var(--accent);
}
.nav-btn--accent:hover {
  background: rgba(56, 189, 248, 0.22);
  border-color: rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
}

.nav-btn--logout:hover {
  background: rgba(251, 113, 133, 0.1);
  border-color: rgba(251, 113, 133, 0.2);
  color: #fda4af;
}

.nav-btn-icon { font-size: 0.9em; }

/* ── Main content ── */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(2rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem);
  gap: 2rem;
}

/* ── Hero ── */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.hero-eyebrow {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.8;
}

.hero-title {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.1;
}

/* ── Search ── */
.search-container {
  width: 100%;
  max-width: 520px;
  margin-top: 0.5rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--r-xl);
  padding: 6px 6px 6px 20px;
  transition: all var(--transition-base);
}

.search-bar:focus-within {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08), var(--shadow-md);
}

.search-icon {
  font-size: 1rem;
  opacity: 0.5;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-1);
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  padding: 8px 12px;
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-3);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  background: var(--accent);
  color: #020817;
  border: none;
  border-radius: 22px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.search-btn:hover:not(:disabled) {
  background: #7dd3fc;
  transform: scale(1.03);
}

.search-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.search-btn-arrow {
  transition: transform var(--transition-fast);
}

.search-btn:hover:not(:disabled) .search-btn-arrow {
  transform: translateX(3px);
}

/* ── Weather section ── */
.weather-section {
  width: 100%;
  max-width: 480px;
}

/* ── Empty hint ── */
.empty-hint {
  margin-top: 1rem;
  animation: fadeIn 1s ease 0.5s both;
}

.empty-hint-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.hint-city {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  font-size: 0.82rem;
  color: var(--text-3);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hint-city:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-2);
  border-color: rgba(255, 255, 255, 0.14);
}

/* ── Transitions ── */
.weather-appear-enter-active {
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.weather-appear-leave-active {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse both;
}

.fade-enter-active { animation: fadeIn 0.4s ease both; }
.fade-leave-active { animation: fadeIn 0.2s ease reverse both; }

/* ── Responsive ── */
@media (max-width: 480px) {
  .nav-btn-label { display: none; }
  .nav-btn { padding: 6px 10px; }
  .brand-name { display: none; }
}
</style>
