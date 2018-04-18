import HomePage from '@/components/pages/HomePage.vue'
import NamePage from '@/components/pages/NamePage.vue'
import NumberPage from '@/components/pages/NumberPage.vue'

const routes = [{
  path: '/', name: 'Home', component: HomePage,
}, {
  path: '/name/:name', name: 'Name', component: NamePage
}, {
  path: '/number/:number', name: 'Number', component: NumberPage
}]

export default routes