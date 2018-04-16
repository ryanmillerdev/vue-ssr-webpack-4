import Vue from 'vue'
import Vuex from 'vuex'
import fetch from 'isomorphic-fetch'

Vue.use(Vuex)

export default new Vuex.Store({
  actions: {
    async queryFact({ commit }, { number }) {
      const response = await fetch(`http://numbersapi.com/${number}/math`) 

      const fact = await response.text()

      commit('SET_FACT', { fact, number })

      return fact
    }
  },
  mutations: {
    SET_FACT(state, { fact, number }) {
      Vue.set(state.facts, number, fact) 
    }
  },
  state: {
    facts: {}
  }
})

