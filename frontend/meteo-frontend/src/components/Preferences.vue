<template>
  <div v-if="showFavorites" class="panel-overlay" @click.self="closeModal">
    <div class="panel" @click.stop>
      <div class="panel-header">
        <div class="panel-title-row">
          <span class="panel-icon">★</span>
          <h2 class="panel-title">Favorite Cities</h2>
        </div>
        <button class="panel-close" @click="closeModal" aria-label="Close">✕</button>
      </div>

      <!-- City list -->
      <div class="city-list">
        <div v-if="preferredCities.length === 0" class="city-empty">
          <span class="city-empty-icon">🌍</span>
          <p class="city-empty-text">No favorite cities yet</p>
        </div>
        <div
          v-for="city in preferredCities"
          :key="city._id"
          class="city-item"
        >
          <div class="city-item-info">
            <span class="city-dot"></span>
            <span class="city-name">{{ city.city_name }}</span>
          </div>
          <button class="city-remove" @click="removeCity(city.city_name)" title="Remove">✕</button>
        </div>
      </div>

      <!-- Add city input -->
      <div class="add-section">
        <div class="add-input-row">
          <input
            v-model="newCity"
            class="add-input"
            placeholder="Add a city…"
            autocomplete="off"
            @keydown.enter="addCity"
          />
          <button class="add-btn" @click="addCity" :disabled="!newCity.trim()">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  props: {
    showFavorites: {
      type: Boolean,
      required: true
    },
    closeModal: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const preferredCities = ref([]);
    const newCity = ref('');

    const fetchFavoriteCities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await axios.get('/api/users/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          preferredCities.value = response.data.favorites;
        } else {
          console.error('Failed to fetch favorite cities');
        }
      } catch (error) {
        console.error('Error fetching favorite cities:', error);
      }
    };

    const addCity = async () => {
      try {
        const cityName = newCity.value.trim();
        if (!cityName) {
          console.error('City name cannot be empty');
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        await axios.post('/api/users/favorites', { city_name: cityName }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        preferredCities.value.push({ city_name: cityName });
        newCity.value = '';
      } catch (error) {
        console.error('Error adding city:', error);
      }
    };

    const removeCity = async (cityName) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        await axios.delete('/api/users/favorites', {
          data: { city_name: cityName },
          headers: { 'Authorization': `Bearer ${token}` },
        });

        preferredCities.value = preferredCities.value.filter(city => city.city_name !== cityName);
      } catch (error) {
        console.error('Error removing city:', error);
      }
    };

    onMounted(() => {
      fetchFavoriteCities();
    });

    return { preferredCities, newCity, addCity, removeCity };
  }
};
</script>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 23, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease both;
}

.panel {
  width: min(380px, 100vw);
  height: 100%;
  background: rgba(10, 22, 40, 0.95);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
}

/* ── Header ── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon {
  font-size: 1rem;
  color: var(--accent);
  opacity: 0.8;
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.01em;
}

.panel-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  color: var(--text-3);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.panel-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-1);
}

/* ── City list ── */
.city-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.city-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  padding: 3rem 0;
  opacity: 0.5;
}

.city-empty-icon { font-size: 2rem; }

.city-empty-text {
  font-size: 0.85rem;
  color: var(--text-3);
}

.city-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--r-md);
  transition: background var(--transition-fast);
  animation: slideUp 0.2s ease both;
}

.city-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.city-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.city-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.7;
  flex-shrink: 0;
}

.city-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-1);
}

.city-remove {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-3);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.city-remove:hover {
  background: rgba(251, 113, 133, 0.1);
  border-color: rgba(251, 113, 133, 0.2);
  color: #fda4af;
}

/* ── Add section ── */
.add-section {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.add-input-row {
  display: flex;
  gap: 8px;
}

.add-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--r-sm);
  color: var(--text-1);
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: all var(--transition-fast);
  min-width: 0;
}

.add-input::placeholder { color: var(--text-3); }

.add-input:focus {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
}

.add-btn {
  padding: 10px 18px;
  background: var(--accent);
  color: #020817;
  border: none;
  border-radius: var(--r-sm);
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.add-btn:hover:not(:disabled) {
  background: #7dd3fc;
}

.add-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
