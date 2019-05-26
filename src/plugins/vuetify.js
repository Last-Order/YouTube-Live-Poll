import 'material-design-icons-iconfont/dist/material-design-icons.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
// Load language files
import zh from '../locale/zh';
import ja from '../locale/ja';
import en from '../locale/en';

Vue.use(Vuetify, {
  iconfont: 'md',
  lang: {
    locales: { zh, ja, en },
    current: navigator.language.slice(0, 2)
  }
})
