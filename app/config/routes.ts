import HomePage from "@/components/pages/HomePage.vue";

declare var module: any;

if (module.hot) {
  // module.hot.accept()
}

const routes = [{
  path: '', name: 'Home', component: HomePage
}]

export default routes