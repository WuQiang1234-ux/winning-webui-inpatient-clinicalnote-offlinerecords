import Vue from 'vue'
import Vuex from 'vuex'
import patientInfo from './modules/patientInfo'
import components from './modules/components'
import { getOrgInfo } from '@/utils'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    orgInfo: getOrgInfo(),
  },
  mutations: {},
  actions: {},
  modules: {
    patientInfo,
    components,
  },
})
