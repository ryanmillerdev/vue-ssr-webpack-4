import HomePage from "@/components/pages/HomePage.vue";
import NamePage from "@/components/pages/NamePage.vue";

const routes = [{
  path: '/', name: 'Home', component: HomePage,
}, {
  path: '/name/:name', name: 'Name', component: NamePage
}]

export default routes