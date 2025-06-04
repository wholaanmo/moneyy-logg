import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import axios from 'axios';
import Notifications from '@kyvg/vue3-notification'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const app = createApp(App)

app.config.globalProperties.$axios = axios

app.use(router)
app.use(store)
app.use(Notifications) 

router.isReady().then(() => {
  app.mount('#app')
  })

