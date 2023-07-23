import { createApp } from 'vue'
import Index from './Index.vue'
import store from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import router from './router'
import { i18n } from './plugins/vuei18n'

loadFonts()


createApp(Index)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(i18n)
  .mount('#app')
