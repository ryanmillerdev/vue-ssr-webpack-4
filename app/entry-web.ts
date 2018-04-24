import { createApp } from "@/bootstrap";

const { app, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

if (module.hot) module.hot.accept()

app.$mount('#app')
