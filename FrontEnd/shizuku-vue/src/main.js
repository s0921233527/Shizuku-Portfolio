import './assets/main.css'
import 'primeicons/primeicons.css'; //引入PrimeVue的css


import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Aura from '@primevue/themes/aura'

import App from './App.vue'
import router from './router'
import ToastService from 'primevue/toastservice'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ToastService)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
})

app.component('Button', Button)

app.mount('#app')
