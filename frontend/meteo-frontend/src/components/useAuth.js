import { ref } from 'vue'

const isAuthenticated = ref(false)
const user = ref(null)

export const useAuth = () => {
  const login = (userData) => {
    isAuthenticated.value = true
    user.value = userData
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('token')
  }

  return { isAuthenticated, user, login, logout }
}
