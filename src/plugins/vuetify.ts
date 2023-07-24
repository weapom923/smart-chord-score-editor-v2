// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify, ThemeDefinition } from 'vuetify'

const smartChordScoreMakerTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#FFAAAA',
    secondary: '#BADFA0',
    error: '#A86464',
  },
};

export default createVuetify({
  theme: {
    defaultTheme: 'smartChordScoreMakerTheme',
    themes: {
      smartChordScoreMakerTheme
    },
  },
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
})
