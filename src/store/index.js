import Vue from 'vue'
import Vuex from 'vuex'
import patientInfo from './modules/patientInfo'
import components from './modules/components'
import { getOrgInfo, getUserInfo } from '@/utils'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    orgInfo: getOrgInfo(), //机构信息
    userInfo: getUserInfo(), //用户信息
  },
  mutations: {},
  actions: {},
  modules: {
    patientInfo,
    components,
  },
})
