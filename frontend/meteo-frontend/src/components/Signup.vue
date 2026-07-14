<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <button class="modal-close" @click="closeModal" aria-label="Close">✕</button>

      <div class="modal-header">
        <div class="modal-icon">🌤</div>
        <h2 class="modal-title">Create account</h2>
        <p class="modal-subtitle">Join WeatherStream today</p>
      </div>

      <p v-if="feedbackMessage" class="feedback" :class="{ 'feedback--error': isError, 'feedback--success': !isError }">
        {{ feedbackMessage }}
      </p>

      <form class="modal-form" @submit.prevent="handleSignup">
        <div class="field">
          <label class="field-label">Username</label>
          <input
            type="text"
            v-model="username"
            class="field-input"
            placeholder="Choose a username"
            autocomplete="username"
          />
        </div>
        <div class="field">
          <label class="field-label">Password</label>
          <input
            type="password"
            v-model="password"
            class="field-input"
            placeholder="Create a password"
            autocomplete="new-password"
          />
        </div>
        <div class="field">
          <label class="field-label">Confirm Password</label>
          <input
            type="password"
            v-model="confirmPassword"
            class="field-input"
            placeholder="Repeat your password"
            autocomplete="new-password"
          />
        </div>
        <button type="submit" class="submit-btn">Create account</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const feedbackMessage = ref('')
const isError = ref(false)

const emit = defineEmits()
const closeModal = () => {
  emit('close')
}

const handleSignup = async () => {
  feedbackMessage.value = ''
  isError.value = false

  if (!username.value || !password.value || !confirmPassword.value) {
    feedbackMessage.value = 'Please fill in all fields.'
    isError.value = true
    return
  }

  if (password.value !== confirmPassword.value) {
    feedbackMessage.value = 'Passwords do not match.'
    isError.value = true
    return
  }

  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    if (response.status === 201) {
      feedbackMessage.value = 'Account created! You can now sign in.'
      isError.value = false
      setTimeout(() => closeModal(), 1500)
    } else {
      const errorData = await response.json()
      feedbackMessage.value = errorData.message || 'An error occurred during registration.'
      isError.value = true
    }
  } catch (error) {
    console.error('Registration error:', error)
    feedbackMessage.value = 'An unexpected error occurred. Please try again.'
    isError.value = true
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 23, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease both;
}

.modal-card {
  position: relative;
  width: min(400px, calc(100vw - 2rem));
  background: rgba(10, 22, 40, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--r-lg);
  padding: 2.5rem 2rem 2rem;
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
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
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-1);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.modal-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-3);
}

.feedback {
  margin-bottom: 1rem;
  padding: 0.65rem 1rem;
  border-radius: var(--r-sm);
  font-size: 0.83rem;
  text-align: center;
}

.feedback--error {
  background: rgba(251, 113, 133, 0.08);
  border: 1px solid rgba(251, 113, 133, 0.2);
  color: #fda4af;
}

.feedback--success {
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: #6ee7b7;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-2);
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--r-sm);
  color: var(--text-1);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: all var(--transition-fast);
}

.field-input::placeholder {
  color: var(--text-3);
}

.field-input:focus {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
}

.submit-btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 11px;
  background: var(--accent);
  color: #020817;
  border: none;
  border-radius: var(--r-sm);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.submit-btn:hover {
  background: #7dd3fc;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>
