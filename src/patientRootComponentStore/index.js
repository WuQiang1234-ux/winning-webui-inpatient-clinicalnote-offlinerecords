import Vue from 'vue'
import Vuex from 'vuex'
import './mixin'
import multi_clinicalnote_board_state from './multi_clinicalnote_board_state'
import emr from './emr'
let state = function () {
  return {
    eventHub: new Vue(),
    currentPatientInfo: { encounterId: '' },
  }
}
let mutations = function () {
  return {
    setCurrentPatientInfo(store, payload) {
      store.currentPatientInfo = payload
    },
  }
}
export default function () {
  return new Vuex.Store({
    state: state(),
    mutations: mutations(),
    actions: {},
    modules: {
      multi_clinicalnote_board_state: multi_clinicalnote_board_state(),
      emr: emr(),
    },
  })
}
