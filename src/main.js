import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Storage from 'vue-ls'
import axios from 'axios'
import request from './utils/request'

Vue.config.productionTip = false

Vue.prototype.$axios = axios
Vue.prototype.$request = request

Vue.use(Storage)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
