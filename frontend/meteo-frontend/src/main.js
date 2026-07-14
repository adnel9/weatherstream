import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

const app = createApp(App)

// Set base URL for all HTTP requests
const backendUrl = import.meta.env.VITE_FRONTEND_URL;

// This URL is the frontend itself since we
// are using a proxy tha will redirect the requests dedicated
// to the backend (/api)
// const backendUrl = 'http://FRONTEND_PUBLIC_IP';

axios.defaults.baseURL = backendUrl;

// Make axios available via this.$http in your components
app.config.globalProperties.$http = axios;

app.use(router)
app.mount('#app')
