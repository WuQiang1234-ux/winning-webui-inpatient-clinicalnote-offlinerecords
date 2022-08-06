import Vue from 'vue'
import Vuex from 'vuex'
import patientInfo from './modules/patientInfo'
import components from './modules/components'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    patientInfo, components
  }
})
