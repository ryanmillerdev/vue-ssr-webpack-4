<template>
  <div class="container">
    <h1>Fact about the number: {{ $route.params.number }}</h1>
    <p v-if="fact">{{ fact }}</p>
    <p v-if="!fact">Loading fact...</p>
    <router-link :to="{ name: 'Number', params: { number: Math.floor(Math.random()* 100) } }">
      How about another?
    </router-link>
    <div>
      <router-link :to="{ name: 'Home' }">Go home...</router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  async asyncData({ store, route }) {
    await store.dispatch('queryFact', { number: route.params.number })
  },
  computed: mapState({
    fact(state) {
      return state.facts[this.$route.params.number]
    }
  }),
  async beforeRouteUpdate(to, from, next) {
    this.$options.asyncData({ store: this.$store, route: to })
    next()
  },
  async mounted() {
    if (!this.fact){
      await this.$options.asyncData({ store: this.$store, route: this.$route })
    }
  }
}
</script>
