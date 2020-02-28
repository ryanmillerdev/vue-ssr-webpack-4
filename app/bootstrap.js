import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import App from "@/App.vue";
import routes from '@/config/routes'
import store from '@/store'

Vue.use(VueRouter)

export const createApp = () => {
  const router = new VueRouter({
    mode: 'history',
    routes
  })

  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })

  return { app, router, store }
}
