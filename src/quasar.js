import Vue from 'vue'

import './styles/quasar.scss'
import '@quasar/extras/material-icons/material-icons.css'
import { Quasar, Notify, AppFullscreen } from 'quasar'

Vue.use(Quasar, {
  config: {
  },
  components: { /* not needed if importStrategy is not 'manual' */ },
  directives: { /* not needed if importStrategy is not 'manual' */ },
  plugins: {
    Notify,
    AppFullscreen
  }
 })