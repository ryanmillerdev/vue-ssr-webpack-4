import Vue from 'vue'
import VueRouter from "vue-router"

import App from "@/App.vue";
import routes from '@/config/routes'

Vue.use(VueRouter)

export const createApp = (context?) => {

  const router = new VueRouter({ routes })

  const app = new Vue({
    router,
    render: h => h(App)
  })

  return { app, router }
}