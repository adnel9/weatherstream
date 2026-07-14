<template>
  <div class="panel-overlay" @click.self="closeColumn">
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title-row">
          <span class="panel-icon">🌧</span>
          <h2 class="panel-title">Rain Alerts</h2>
        </div>
        <button class="panel-close" @click="closeColumn" aria-label="Close">✕</button>
      </div>

      <div class="alert-list">
        <div v-if="alerts.length === 0" class="alert-empty">
          <span class="alert-empty-icon">☀️</span>
          <p class="alert-empty-title">No rain alerts</p>
          <p class="alert-empty-sub">All your favorite cities are clear</p>
        </div>

        <div
          v-for="alert in alerts"
          :key="alert._id"
          class="alert-item"
        >
          <div class="alert-top">
            <div class="alert-city">{{ alert.city_name }}</div>
            <div class="alert-badge">Rain</div>
          </div>
          <div class="alert-detail">
            <span class="alert-detail-icon">💧</span>
            <span class="alert-detail-text">{{ alert.rain_alert.rain_volume }} mm</span>
          </div>
          <div class="alert-detail">
            <span class="alert-detail-icon">🕐</span>
            <span class="alert-detail-text">{{ formatDate(alert.rain_alert.start_time) }}</span>
          </div>
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
    closeColumn: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const alerts = ref([]);

    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await axios.get('/api/users/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 200) {
          const favorites = response.data.favorites;
          alerts.value = favorites.filter(city => city.rain_alert !== null);
        } else {
          console.error('Failed to fetch alerts');
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString.replace(' ', 'T'));
      return date.toLocaleDateString('en-US', options);
    };

    onMounted(() => {
      fetchAlerts();
    });

    return { alerts, formatDate };
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
  width: min(360px, 100vw);
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

.panel-icon { font-size: 1rem; }

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

/* ── Alert list ── */
.alert-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  padding: 3rem 0;
  text-align: center;
  opacity: 0.6;
}

.alert-empty-icon { font-size: 2.5rem; }

.alert-empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-2);
}

.alert-empty-sub {
  font-size: 0.82rem;
  color: var(--text-3);
}

.alert-item {
  padding: 1rem;
  background: rgba(56, 189, 248, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: var(--r-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: slideUp 0.25s ease both;
  transition: background var(--transition-fast);
}

.alert-item:hover {
  background: rgba(56, 189, 248, 0.08);
}

.alert-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert-city {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-1);
}

.alert-badge {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 20px;
  padding: 2px 8px;
}

.alert-detail {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-detail-icon { font-size: 0.85rem; opacity: 0.7; }

.alert-detail-text {
  font-size: 0.82rem;
  color: var(--text-2);
}
</style>
