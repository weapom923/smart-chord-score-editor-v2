import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import router from './router'
import { i18n } from './plugins/vuei18n'

loadFonts()


createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(i18n)
  .mount('#app')
